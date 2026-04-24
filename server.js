const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(ROOT, "data");
const SQLITE_PATH = path.join(DATA_DIR, "doctoralos.sqlite");
const LEGACY_DB_PATH = path.join(DATA_DIR, "db.json");
const MAX_BODY = 2 * 1024 * 1024;
const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";
const ASSISTANT_THREAD_LIMIT = 16;
const SESSION_COOKIE = "doctoral_os_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const rateLimitStore = new Map();
const CLOSED_BETA = /^(1|true|yes)$/i.test(String(process.env.CLOSED_BETA || (process.env.NODE_ENV === "production" ? "1" : "0")));
const BETA_INVITE_CODE = String(process.env.BETA_INVITE_CODE || "").trim();
const BETA_ALLOWED_EMAILS = new Set(String(process.env.BETA_ALLOWED_EMAILS || "").split(",").map((email) => normalizeEmail(email)).filter(Boolean));
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "mario.martinez.cgr@gmail.com";
const PASSWORD_RESET_TTL_SECONDS = 60 * 60;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

const PUBLIC_FILES = new Set([
  "/landing.html",
  "/index.html",
  "/pricing.html",
  "/help.html",
  "/privacy.html",
  "/terms.html",
  "/security.html",
  "/styles.css",
  "/app.js"
]);

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = openDatabase();

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/")) {
      await handleApi(req, res);
      return;
    }
    serveStatic(req, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Error interno del servidor" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`DoctoralOS disponible en http://${HOST}:${PORT}`);
});

function openDatabase() {
  const database = new DatabaseSync(SQLITE_PATH);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS states (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      state_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT
    );
  `);
  migrateLegacyJson(database);
  return database;
}

function migrateLegacyJson(database) {
  const count = database.prepare("SELECT COUNT(*) AS total FROM users").get().total;
  if (count || !fs.existsSync(LEGACY_DB_PATH)) return;

  try {
    const legacy = JSON.parse(fs.readFileSync(LEGACY_DB_PATH, "utf8"));
    const insertUser = database.prepare("INSERT INTO users (id, email, name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
    const insertState = database.prepare("INSERT INTO states (user_id, state_json, updated_at) VALUES (?, ?, ?)");

    database.exec("BEGIN");
    for (const user of legacy.users || []) {
      insertUser.run(user.id, user.email, user.name, user.password, user.createdAt, user.updatedAt || user.createdAt);
      insertState.run(user.id, JSON.stringify(legacy.states?.[user.id] || {}), user.updatedAt || user.createdAt);
    }
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    console.error("No se pudo migrar data/db.json", error);
  }
}

async function handleApi(req, res) {
  const { pathname } = new URL(req.url, "http://" + (req.headers.host || "localhost"));

  if (!assertTrustedOrigin(req, res)) return;

  if (req.method === "GET" && pathname === "/api/health") {
    sendJson(res, 200, { ok: true, storage: "sqlite" });
    return;
  }

  if (req.method === "POST" && pathname === "/api/register") {
    if (!enforceRateLimit(req, res, "register", 8)) return;
    const body = await readJson(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const inviteCode = String(body.inviteCode || "").trim();
    const name = String(body.name || "").trim() || email.split("@")[0];

    if (!isValidEmail(email) || password.length < 8) {
      sendJson(res, 400, { error: "Usa un email válido y una contraseña de al menos 8 caracteres." });
      return;
    }

    if (findUserByEmail(email)) {
      sendJson(res, 409, { error: "Ya existe una cuenta con ese email." });
      return;
    }

    const betaAccess = betaAccessStatus(email, inviteCode);
    if (!betaAccess.allowed) {
      sendJson(res, 403, { error: betaAccess.message, code: "beta_closed" });
      return;
    }

    const user = createUser(email, password, name);
    const session = createSession(user.id);
    insertUser(user);
    insertSession(session);
    saveUserState(user.id, {});

    sendJson(res, 201, { ...publicSessionPayload(user), state: {}, isNewUser: true }, {
      "Set-Cookie": buildSessionCookie(req, session.token, session.expires_at)
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/login") {
    if (!enforceRateLimit(req, res, "login", 12)) return;
    const body = await readJson(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const user = findUserByEmail(email);

    if (!user || !verifyPassword(password, user.password_hash)) {
      sendJson(res, 401, { error: "Email o contraseña incorrectos." });
      return;
    }

    const session = createSession(user.id);
    insertSession(session);
    pruneSessions();
    sendJson(res, 200, { ...publicSessionPayload(user), state: getUserState(user.id) }, {
      "Set-Cookie": buildSessionCookie(req, session.token, session.expires_at)
    });
    return;
  }

  
  if (req.method === "POST" && pathname === "/api/password-reset/request") {
    if (!enforceRateLimit(req, res, "password-reset-request", 6)) return;
    const body = await readJson(req);
    const email = normalizeEmail(body.email);

    if (!isValidEmail(email)) {
      sendJson(res, 400, { error: "Escribe un email válido para preparar la recuperación." });
      return;
    }

    prunePasswordResetTokens();
    const user = findUserByEmail(email);
    let previewUrl = "";
    if (user) {
      db.prepare("DELETE FROM password_reset_tokens WHERE user_id = ?").run(user.id);
      const resetToken = createPasswordResetToken(user.id);
      insertPasswordResetToken(resetToken);
      const recoveryLink = buildPasswordResetLink(req, resetToken.token);
      console.info("[DoctoralOS] Password reset for " + email + ": " + recoveryLink);
      if (process.env.NODE_ENV !== "production") {
        previewUrl = recoveryLink;
      }
    }

    if (previewUrl) {
      sendJson(res, 200, {
        ok: true,
        delivery: "preview",
        supportEmail: SUPPORT_EMAIL,
        previewUrl,
        message: "Hemos preparado un enlace de recuperación para esta cuenta de prueba."
      });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      delivery: "assisted",
      supportEmail: SUPPORT_EMAIL,
      message: "Si la cuenta existe, ya hemos preparado un enlace seguro de recuperación. Durante la beta, la entrega se gestiona de forma asistida."
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/password-reset/confirm") {
    if (!enforceRateLimit(req, res, "password-reset-confirm", 10)) return;
    const body = await readJson(req);
    const token = String(body.token || "").trim();
    const newPassword = String(body.newPassword || "");

    if (!token) {
      sendJson(res, 400, { error: "El enlace de recuperación no es válido." });
      return;
    }
    if (newPassword.length < 8) {
      sendJson(res, 400, { error: "La nueva contraseña debe tener al menos 8 caracteres." });
      return;
    }

    prunePasswordResetTokens();
    const resetToken = findPasswordResetToken(token);
    if (!resetToken) {
      sendJson(res, 400, { error: "Este enlace de recuperación ya no es válido o ha caducado." });
      return;
    }

    const user = findUserById(resetToken.user_id);
    if (!user) {
      sendJson(res, 400, { error: "No se ha encontrado la cuenta asociada a este enlace." });
      return;
    }

    const now = new Date().toISOString();
    const session = createSession(user.id);
    db.exec("BEGIN");
    try {
      db.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(hashPassword(newPassword), now, user.id);
      db.prepare("UPDATE password_reset_tokens SET used_at = ? WHERE user_id = ? AND used_at IS NULL").run(now, user.id);
      db.prepare("DELETE FROM sessions WHERE user_id = ?").run(user.id);
      insertSession(session);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }

    sendJson(res, 200, { ...publicSessionPayload(findUserById(user.id)), state: getUserState(user.id), recovered: true }, {
      "Set-Cookie": buildSessionCookie(req, session.token, session.expires_at)
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/logout") {
    const token = getSessionToken(req);
    if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    sendJson(res, 200, { ok: true }, { "Set-Cookie": clearSessionCookie(req) });
    return;
  }

  if (req.method === "GET" && pathname === "/api/me") {
    const auth = requireUser(req, res);
    if (!auth) return;
    sendJson(res, 200, { ...publicSessionPayload(auth.user), state: getUserState(auth.user.id) });
    return;
  }

  if (req.method === "PUT" && pathname === "/api/state") {
    if (!enforceRateLimit(req, res, "state", 240)) return;
    const auth = requireUser(req, res);
    if (!auth) return;
    const body = await readJson(req);
    const savedAt = saveUserState(auth.user.id, sanitizeState(body.state));
    updateUserTimestamp(auth.user.id, savedAt);
    sendJson(res, 200, { ok: true, savedAt });
    return;
  }

  if (req.method === "POST" && pathname === "/api/assistant") {
    if (!enforceRateLimit(req, res, "assistant", 60)) return;
    const auth = requireUser(req, res);
    if (!auth) return;
    const body = await readJson(req);
    const message = String(body.message || "").trim();
    if (!message) {
      sendJson(res, 400, { error: "Escribe un mensaje para el asistente." });
      return;
    }
    if (!process.env.OPENAI_API_KEY) {
      sendJson(res, 503, { error: "El asistente IA todavía no está configurado en el servidor." });
      return;
    }

    try {
      const baseState = body.state && typeof body.state === "object" ? body.state : getUserState(auth.user.id);
      const assistantState = normalizeAssistantState(cloneJson(baseState || {}));
      const result = await runAssistantWithOpenAI(auth.user, assistantState, message);
      const savedAt = saveUserState(auth.user.id, result.state);
      updateUserTimestamp(auth.user.id, savedAt);
      sendJson(res, 200, { ok: true, reply: result.reply, state: result.state, savedAt, model: result.model, mode: "openai" });
    } catch (error) {
      console.error("Assistant error", error);
      sendJson(res, 502, { error: "El asistente IA no pudo responder ahora mismo." });
    }
    return;
  }

  if (req.method === "GET" && pathname === "/api/backup") {
    const auth = requireUser(req, res);
    if (!auth) return;
    const payload = JSON.stringify({ user: publicUser(auth.user), state: getUserState(auth.user.id), exportedAt: new Date().toISOString() }, null, 2);
    res.writeHead(200, {
      ...securityHeaders(req),
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"doctoral-os-backup.json\"",
      "Cache-Control": "no-store"
    });
    res.end(payload);
    return;
  }

  if (req.method === "POST" && pathname === "/api/change-password") {
    if (!enforceRateLimit(req, res, "change-password", 10)) return;
    const auth = requireUser(req, res);
    if (!auth) return;
    const body = await readJson(req);
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!verifyPassword(currentPassword, auth.user.password_hash)) {
      sendJson(res, 403, { error: "La contraseña actual no es correcta." });
      return;
    }
    if (newPassword.length < 8) {
      sendJson(res, 400, { error: "La nueva contraseña debe tener al menos 8 caracteres." });
      return;
    }

    const now = new Date().toISOString();
    db.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(hashPassword(newPassword), now, auth.user.id);
    db.prepare("DELETE FROM sessions WHERE user_id = ? AND token <> ?").run(auth.user.id, auth.token);
    sendJson(res, 200, { ok: true });
    return;
  }

  sendJson(res, 404, { error: "Ruta no encontrada" });
}

function serveStatic(req, res) {
  const { pathname } = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405, {
      ...securityHeaders(req),
      "Allow": "GET, HEAD",
      "Content-Type": "text/plain; charset=utf-8"
    });
    res.end("Method Not Allowed");
    return;
  }

  const routeMap = {
    "/": "/landing.html",
    "/app": "/index.html",
    "/app/": "/index.html",
    "/pricing": "/pricing.html",
    "/help": "/help.html",
    "/privacy": "/privacy.html",
    "/terms": "/terms.html",
    "/security": "/security.html"
  };
  const requested = routeMap[pathname] || decodeURIComponent(pathname);

  if (!PUBLIC_FILES.has(requested)) {
    res.writeHead(404, securityHeaders(req));
    res.end("Not found");
    return;
  }

  const filePath = path.normalize(path.join(ROOT, requested));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, securityHeaders(req));
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, securityHeaders(req));
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      ...securityHeaders(req),
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.end(content);
  });
}

function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket.remoteAddress || "local";
}

function cleanupRateLimitStore(now = Date.now()) {
  if (rateLimitStore.size < 500) return;
  for (const [key, value] of rateLimitStore.entries()) {
    if (!value || value.resetAt <= now) rateLimitStore.delete(key);
  }
}

function enforceRateLimit(req, res, scope, limit, windowMs = RATE_LIMIT_WINDOW_MS) {
  cleanupRateLimitStore();
  const now = Date.now();
  const key = scope + ":" + clientIp(req);
  const current = rateLimitStore.get(key);
  const bucket = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : current;

  bucket.count += 1;
  rateLimitStore.set(key, bucket);

  if (bucket.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    sendJson(res, 429, { error: "Demasiadas solicitudes. Espera un momento antes de volver a intentarlo." }, {
      "Retry-After": String(retryAfter)
    });
    return false;
  }

  return true;
}

function isSecureRequest(req) {
  const forwarded = String(req && req.headers && req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  return Boolean(req && req.socket && req.socket.encrypted) || forwarded === "https";
}

function assertTrustedOrigin(req, res) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return true;
  const origin = String(req.headers.origin || "").trim();
  if (!origin) return true;

  const forwardedHost = String(req.headers["x-forwarded-host"] || "").split(",")[0].trim();
  const host = forwardedHost || String(req.headers.host || "").trim();
  if (!host) return true;

  const expected = (isSecureRequest(req) ? "https" : "http") + "://" + host;
  if (origin !== expected) {
    sendJson(res, 403, { error: "Origen no permitido." });
    return false;
  }

  return true;
}

function parseCookies(req) {
  const raw = String(req.headers.cookie || "");
  return raw.split(";").reduce((acc, part) => {
    const [name, ...rest] = part.trim().split("=");
    if (!name) return acc;
    acc[name] = decodeURIComponent(rest.join("=") || "");
    return acc;
  }, {});
}

function buildSessionCookie(req, token, expiresAt) {
  const cookie = [
    SESSION_COOKIE + "=" + encodeURIComponent(token),
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=" + SESSION_TTL_SECONDS
  ];
  if (expiresAt) cookie.push("Expires=" + new Date(expiresAt).toUTCString());
  if (isSecureRequest(req)) cookie.push("Secure");
  return cookie.join("; ");
}

function clearSessionCookie(req) {
  const cookie = [
    SESSION_COOKIE + "=",
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  ];
  if (isSecureRequest(req)) cookie.push("Secure");
  return cookie.join("; ");
}

function getSessionToken(req) {
  const cookies = parseCookies(req);
  return cookies[SESSION_COOKIE] || getBearerToken(req);
}

function requireUser(req, res) {
  const token = getSessionToken(req);
  if (!token) {
    sendJson(res, 401, { error: "Sesión requerida." }, { "Set-Cookie": clearSessionCookie(req) });
    return null;
  }

  const session = db.prepare("SELECT * FROM sessions WHERE token = ? AND expires_at > ?").get(token, new Date().toISOString());
  if (!session) {
    sendJson(res, 401, { error: "Sesión caducada." }, { "Set-Cookie": clearSessionCookie(req) });
    return null;
  }

  const user = findUserById(session.user_id);
  if (!user) {
    sendJson(res, 401, { error: "Usuario no encontrado." }, { "Set-Cookie": clearSessionCookie(req) });
    return null;
  }

  db.prepare("UPDATE sessions SET last_seen_at = ? WHERE token = ?").run(new Date().toISOString(), token);
  return { user, token };
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > MAX_BODY) {
        reject(new Error("Body demasiado grande"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function sendJson(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    ...securityHeaders(res.req),
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders
  });
  res.end(JSON.stringify(payload));
}

function securityHeaders(req) {
  const headers = {
    "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "X-Frame-Options": "DENY",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin"
  };
  if (isSecureRequest(req)) {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  }
  return headers;
}

function createUser(email, password, name) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    email,
    name,
    password_hash: hashPassword(password),
    created_at: now,
    updated_at: now
  };
}

function insertUser(user) {
  db.prepare("INSERT INTO users (id, email, name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(user.id, user.email, user.name, user.password_hash, user.created_at, user.updated_at);
}

function findUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
}

function findUserById(id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

function updateUserTimestamp(userId, updatedAt) {
  db.prepare("UPDATE users SET updated_at = ? WHERE id = ?").run(updatedAt, userId);
}

function getUserState(userId) {
  const row = db.prepare("SELECT state_json FROM states WHERE user_id = ?").get(userId);
  if (!row?.state_json) return {};
  try {
    return JSON.parse(row.state_json);
  } catch (error) {
    return {};
  }
}

function saveUserState(userId, state) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO states (user_id, state_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at
  `).run(userId, JSON.stringify(state), now);
  return now;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

function createSession(userId) {
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(now.getDate() + 30);
  return {
    token: crypto.randomBytes(32).toString("hex"),
    user_id: userId,
    created_at: now.toISOString(),
    last_seen_at: now.toISOString(),
    expires_at: expires.toISOString()
  };
}

function insertSession(session) {
  db.prepare("INSERT INTO sessions (token, user_id, created_at, last_seen_at, expires_at) VALUES (?, ?, ?, ?, ?)")
    .run(session.token, session.user_id, session.created_at, session.last_seen_at, session.expires_at);
}

function pruneSessions() {
  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(new Date().toISOString());
}

function hashPasswordResetToken(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}

function createPasswordResetToken(userId) {
  const now = new Date();
  const expires = new Date(now.getTime() + PASSWORD_RESET_TTL_SECONDS * 1000);
  const token = crypto.randomBytes(32).toString("base64url");
  return {
    token,
    token_hash: hashPasswordResetToken(token),
    user_id: userId,
    created_at: now.toISOString(),
    expires_at: expires.toISOString()
  };
}

function insertPasswordResetToken(record) {
  db.prepare("INSERT INTO password_reset_tokens (token_hash, user_id, created_at, expires_at, used_at) VALUES (?, ?, ?, ?, NULL)")
    .run(record.token_hash, record.user_id, record.created_at, record.expires_at);
}

function prunePasswordResetTokens() {
  const now = new Date().toISOString();
  db.prepare("DELETE FROM password_reset_tokens WHERE expires_at <= ? OR used_at IS NOT NULL").run(now);
}

function findPasswordResetToken(token) {
  const tokenHash = hashPasswordResetToken(token);
  return db.prepare("SELECT * FROM password_reset_tokens WHERE token_hash = ? AND expires_at > ? AND used_at IS NULL")
    .get(tokenHash, new Date().toISOString());
}

function buildAppBaseUrl(req) {
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const forwardedHost = String(req.headers["x-forwarded-host"] || "").split(",")[0].trim();
  const host = forwardedHost || String(req.headers.host || "").trim() || (HOST + ":" + PORT);
  const protocol = forwardedProto || (isSecureRequest(req) ? "https" : "http");
  return protocol + "://" + host;
}

function buildPasswordResetLink(req, token) {
  const url = new URL("/app", buildAppBaseUrl(req));
  url.searchParams.set("reset", token);
  return url.toString();
}

function publicSessionPayload(user) {
  return { user: publicUser(user) };
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    updatedAt: user.updated_at
  };
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearers+(.+)$/i);
  return match ? match[1] : "";
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function betaAccessStatus(email, inviteCode) {
  const betaEnabled = CLOSED_BETA || Boolean(BETA_INVITE_CODE) || BETA_ALLOWED_EMAILS.size > 0;
  if (!betaEnabled) return { allowed: true };
  if (BETA_ALLOWED_EMAILS.has(email)) return { allowed: true };
  if (BETA_INVITE_CODE && inviteCode && safeSecretEqual(inviteCode, BETA_INVITE_CODE)) {
    return { allowed: true };
  }
  return {
    allowed: false,
    message: BETA_INVITE_CODE
      ? "El acceso a esta beta está cerrado. Usa un correo invitado o un código de invitación válido."
      : "El acceso a esta beta está cerrado. Escríbenos para solicitar acceso."
  };
}

function safeSecretEqual(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function sanitizeState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) return {};
  return state;
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function normalizeAssistantState(state) {
  const next = sanitizeState(state);
  next.project = next.project && typeof next.project === "object" ? next.project : {};
  next.chapters = Array.isArray(next.chapters) ? next.chapters : [];
  next.readings = Array.isArray(next.readings) ? next.readings : [];
  next.tasks = Array.isArray(next.tasks) ? next.tasks : [];
  next.meetings = Array.isArray(next.meetings) ? next.meetings : [];
  next.reviewComments = Array.isArray(next.reviewComments) ? next.reviewComments : [];
  next.writingLog = Array.isArray(next.writingLog) ? next.writingLog : [];
  next.assistantThread = Array.isArray(next.assistantThread) ? next.assistantThread : [];
  return next;
}

async function runAssistantWithOpenAI(user, state, message) {
  const assistantState = normalizeAssistantState(state);
  const conversation = buildAssistantConversationInput(assistantState.assistantThread);
  const lastMessage = conversation[conversation.length - 1];
  if (!lastMessage || lastMessage.role !== "user" || String(lastMessage.content || "").trim() !== message) {
    conversation.push({ role: "user", content: message });
  }
  const requestInput = [
    { role: "developer", content: buildAssistantPrompt(user, assistantState) },
    ...conversation
  ];

  let response = await openAIResponsesCreate({
    model: OPENAI_MODEL,
    input: requestInput,
    tools: assistantTools(),
    tool_choice: "auto",
    reasoning: { effort: "low" }
  });

  for (let step = 0; step < 4; step += 1) {
    const calls = extractFunctionCalls(response);
    if (!calls.length) {
      const reply = extractAssistantText(response) || "Puedo ayudarte mejor si me pides una acción concreta o una duda de tesis.";
      assistantState.assistantThread.push(createAssistantMessage("assistant", reply));
      assistantState.assistantThread = trimAssistantThread(assistantState.assistantThread);
      return { reply, state: assistantState, model: response.model || OPENAI_MODEL };
    }

    const outputs = calls.map((call) => ({
      type: "function_call_output",
      call_id: call.call_id,
      output: JSON.stringify(executeAssistantTool(assistantState, call))
    }));

    response = await openAIResponsesCreate({
      model: OPENAI_MODEL,
      previous_response_id: response.id,
      input: outputs
    });
  }

  const fallbackReply = "He intentado procesarlo, pero necesito que reformules la petición en una sola acción concreta.";
  assistantState.assistantThread.push(createAssistantMessage("assistant", fallbackReply));
  assistantState.assistantThread = trimAssistantThread(assistantState.assistantThread);
  return { reply: fallbackReply, state: assistantState, model: OPENAI_MODEL };
}

async function openAIResponsesCreate(payload) {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPENAI_API_KEY
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data && data.error && data.error.message ? data.error.message : "OpenAI devolvió " + response.status;
    throw new Error(message);
  }
  return data;
}

function buildAssistantPrompt(user, state) {
  const context = buildAssistantContext(state);
  return [
    "Eres el asistente de DoctoralOS, una app SaaS para doctorandos individuales.",
    "Responde siempre en español, con tono claro, práctico y breve.",
    "Tu trabajo es ayudar a terminar la tesis con menos caos.",
    "Si el usuario pide crear una tarea o agendar una reunión dentro de la app, usa las herramientas disponibles.",
    "No inventes fechas, horas ni datos que no aparezcan o no se deduzcan claramente.",
    "Si falta un dato minimo para ejecutar una accion, pide solo ese dato.",
    "Si no hace falta herramienta, responde con consejo accionable y concreto.",
    "Usuario actual: " + user.name + " (" + user.email + ")",
    "Contexto de tesis actual: " + JSON.stringify(context)
  ].join("\n\n");
}

function buildAssistantConversationInput(thread) {
  return (Array.isArray(thread) ? thread : [])
    .slice(-ASSISTANT_THREAD_LIMIT)
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: String(message.text || "")
    }));
}

function buildAssistantContext(state) {
  return {
    project: {
      name: state.project && state.project.name || "",
      candidate: state.project && state.project.candidate || "",
      question: state.project && state.project.question || "",
      contribution: state.project && state.project.contribution || "",
      mode: state.project && state.project.mode || "",
      phase: state.project && state.project.phase || "",
      writingTarget: Number(state.project && state.project.writingTarget || 0)
    },
    chapters: state.chapters.slice(0, 8).map((chapter) => ({
      title: chapter.title || "",
      status: chapter.status || "",
      progress: Number(chapter.progress || 0),
      due: chapter.due || "",
      words: Number(chapter.words || 0),
      target: Number(chapter.target || 0),
      sections: Array.isArray(chapter.sections) ? chapter.sections.length : 0,
      checklistOpen: Array.isArray(chapter.checklist) ? chapter.checklist.filter((item) => !item.done).length : 0
    })),
    tasks: state.tasks.slice(0, 12).map((task) => ({
      title: task.title || "",
      area: task.area || "",
      status: task.status || "",
      due: task.due || "",
      effort: task.effort || "",
      impact: task.impact || ""
    })),
    meetings: state.meetings.slice(0, 8).map((meeting) => ({
      date: meeting.date || "",
      time: meeting.time || "",
      type: meeting.type || "",
      attendees: meeting.attendees || "",
      agenda: meeting.agenda || ""
    })),
    reviewComments: state.reviewComments.slice(0, 10).map((comment) => ({
      chapter: comment.chapter || "",
      source: comment.source || "",
      status: comment.status || "",
      priority: comment.priority || "",
      due: comment.due || ""
    })),
    writing: {
      last7DaysWords: wordsWrittenLastDays(state.writingLog, 7),
      sessionsLast7Days: sessionsLastDays(state.writingLog, 7)
    }
  };
}

function assistantTools() {
  return [
    {
      type: "function",
      name: "create_task",
      description: "Crea una tarea dentro del tablero semanal de DoctoralOS.",
      strict: true,
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string", description: "Título claro de la tarea." },
          due: { type: "string", description: "Fecha limite en formato YYYY-MM-DD o cadena vacia si no hay fecha." },
          area: { type: "string", description: "Área de trabajo, por ejemplo Capítulos, Revisión, Lecturas, Reuniones o General." },
          status: { type: "string", enum: ["today", "week", "later"], description: "Columna del tablero." },
          effort: { type: "string", description: "Esfuerzo estimado, por ejemplo 45 min o 2 h." },
          impact: { type: "string", enum: ["Bajo", "Medio", "Alto"], description: "Impacto esperado." }
        },
        required: ["title", "due", "area", "status", "effort", "impact"]
      }
    },
    {
      type: "function",
      name: "create_meeting",
      description: "Agenda una reunión dentro de DoctoralOS.",
      strict: true,
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          date: { type: "string", description: "Fecha de la reunión en formato YYYY-MM-DD." },
          time: { type: "string", description: "Hora de la reunión en formato HH:MM de 24 horas." },
          type: { type: "string", description: "Tipo de reunión, por ejemplo Dirección, Comité, Grupo o Revisión interna." },
          attendees: { type: "string", description: "Personas asistentes." },
          agenda: { type: "string", description: "Tema o agenda principal." }
        },
        required: ["date", "time", "type", "attendees", "agenda"]
      }
    },
    {
      type: "function",
      name: "create_review_comment",
      description: "Registra un comentario de revisión dentro de DoctoralOS.",
      strict: true,
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          chapter: { type: "string", description: "Título del capítulo o 'Sin capítulo'." },
          source: { type: "string", description: "Origen del comentario, por ejemplo Dirección o Comité." },
          comment: { type: "string", description: "Comentario a registrar." },
          response: { type: "string", description: "Respuesta o plan de respuesta inicial." },
          status: { type: "string", description: "Estado del comentario, por ejemplo Pendiente o En proceso." },
          priority: { type: "string", enum: ["Alta", "Media", "Baja"], description: "Prioridad del comentario." },
          due: { type: "string", description: "Fecha objetivo en formato YYYY-MM-DD o cadena vacia." }
        },
        required: ["chapter", "source", "comment", "response", "status", "priority", "due"]
      }
    },
    {
      type: "function",
      name: "create_chapter_note",
      description: "Guarda una nota interna asociada a un capítulo existente de DoctoralOS.",
      strict: true,
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          chapter: { type: "string", description: "Título del capítulo donde guardar la nota." },
          title: { type: "string", description: "Título corto de la nota." },
          type: { type: "string", description: "Tipo de nota, por ejemplo Idea, Decisión, Riesgo o Fuente." },
          date: { type: "string", description: "Fecha de la nota en formato YYYY-MM-DD o cadena vacia." },
          text: { type: "string", description: "Contenido de la nota." }
        },
        required: ["chapter", "title", "type", "date", "text"]
      }
    }
  ];
}

function extractFunctionCalls(response) {
  return (Array.isArray(response && response.output) ? response.output : [])
    .filter((item) => item.type === "function_call")
    .map((item) => ({
      name: item.name,
      arguments: item.arguments,
      call_id: item.call_id || item.id
    }))
    .filter((item) => item.name && item.call_id);
}

function extractAssistantText(response) {
  if (typeof (response && response.output_text) === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const chunks = [];
  for (const item of Array.isArray(response && response.output) ? response.output : []) {
    if (item.type !== "message") continue;
    for (const content of Array.isArray(item.content) ? item.content : []) {
      if (typeof content.text === "string" && content.text.trim()) chunks.push(content.text.trim());
    }
  }
  return chunks.join("\n\n").trim();
}

function executeAssistantTool(state, call) {
  const args = parseJsonObject(call.arguments);

  if (call.name === "create_task") {
    const title = String(args.title || "").trim();
    const due = normalizeIsoDate(args.due);
    if (!title) return { ok: false, error: "La tarea necesita un título." };
    if (args.due && !due) return { ok: false, error: "La fecha de la tarea debe ir en formato YYYY-MM-DD." };

    const task = {
      id: createEntityId("tk"),
      title,
      area: String(args.area || "General").trim() || "General",
      status: ["today", "week", "later"].includes(args.status) ? args.status : inferTaskStatusFromDue(due),
      due,
      effort: String(args.effort || "45 min").trim() || "45 min",
      impact: ["Bajo", "Medio", "Alto"].includes(args.impact) ? args.impact : "Medio"
    };
    state.tasks.unshift(task);
    return { ok: true, task };
  }

  if (call.name === "create_meeting") {
    const date = normalizeIsoDate(args.date);
    const time = normalizeTime(args.time);
    if (!date) return { ok: false, error: "La reunión necesita una fecha válida YYYY-MM-DD." };
    if (!time) return { ok: false, error: "La reunión necesita una hora válida HH:MM." };

    const meeting = {
      id: createEntityId("mt"),
      date,
      time,
      type: String(args.type || "Dirección").trim() || "Dirección",
      attendees: String(args.attendees || "").trim(),
      agenda: String(args.agenda || "Seguimiento de tesis").trim() || "Seguimiento de tesis",
      decisions: "",
      tasks: "",
      next: ""
    };
    state.meetings.unshift(meeting);
    return { ok: true, meeting };
  }

  if (call.name === "create_review_comment") {
    const due = normalizeIsoDate(args.due);
    const reviewComment = {
      id: createEntityId("rv"),
      chapter: String(args.chapter || "Sin capítulo").trim() || "Sin capítulo",
      source: String(args.source || "Dirección").trim() || "Dirección",
      comment: String(args.comment || "").trim(),
      response: String(args.response || "Definir respuesta y criterio de cierre.").trim() || "Definir respuesta y criterio de cierre.",
      status: String(args.status || "Pendiente").trim() || "Pendiente",
      priority: ["Alta", "Media", "Baja"].includes(args.priority) ? args.priority : "Media",
      due
    };
    if (!reviewComment.comment) return { ok: false, error: "El comentario necesita texto." };
    state.reviewComments.unshift(reviewComment);
    return { ok: true, reviewComment };
  }

  if (call.name === "create_chapter_note") {
    const chapter = findChapterByTitle(state.chapters, args.chapter);
    if (!chapter) return { ok: false, error: "No he encontrado ese capítulo para guardar la nota." };
    const date = normalizeIsoDate(args.date) || new Date().toISOString().slice(0, 10);
    const note = {
      id: createEntityId("nt"),
      title: String(args.title || "Nota").trim() || "Nota",
      type: String(args.type || "Idea").trim() || "Idea",
      date,
      text: String(args.text || "").trim()
    };
    if (!note.text) return { ok: false, error: "La nota necesita contenido." };
    chapter.notes = Array.isArray(chapter.notes) ? chapter.notes : [];
    chapter.notes.unshift(note);
    chapter.editorUpdatedAt = new Date().toISOString();
    return { ok: true, note, chapter: chapter.title };
  }

  return { ok: false, error: "Herramienta desconocida: " + call.name };
}

function parseJsonObject(value) {
  try {
    const parsed = JSON.parse(String(value || "{}"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    return {};
  }
}

function normalizeIsoDate(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function normalizeTime(value) {
  const text = String(value || "").trim();
  if (!/^\d{2}:\d{2}$/.test(text)) return "";
  const parts = text.split(":").map(Number);
  if (parts[0] > 23 || parts[1] > 59) return "";
  return text;
}

function inferTaskStatusFromDue(due) {
  if (!due) return "week";
  const diff = dayDistance(due);
  if (diff <= 1) return "today";
  if (diff <= 7) return "week";
  return "later";
}

function dayDistance(date) {
  const target = new Date(date + "T00:00:00Z");
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

function wordsWrittenLastDays(log, days) {
  const cutoff = Date.now() - days * 86400000;
  return (Array.isArray(log) ? log : []).reduce((sum, entry) => {
    const stamp = new Date(String(entry.date || "") + "T00:00:00").getTime();
    if (!Number.isFinite(stamp) || stamp < cutoff) return sum;
    return sum + Number(entry.words || 0);
  }, 0);
}

function sessionsLastDays(log, days) {
  const cutoff = Date.now() - days * 86400000;
  return (Array.isArray(log) ? log : []).filter((entry) => {
    const stamp = new Date(String(entry.date || "") + "T00:00:00").getTime();
    return Number.isFinite(stamp) && stamp >= cutoff;
  }).length;
}

function createAssistantMessage(role, text) {
  return {
    id: createEntityId("msg"),
    role,
    text,
    createdAt: new Date().toISOString()
  };
}

function trimAssistantThread(thread) {
  if (!Array.isArray(thread) || thread.length <= 28) return Array.isArray(thread) ? thread : [];
  const first = thread[0];
  return [first, ...thread.slice(-27)];
}

function createEntityId(prefix) {
  return prefix + "-" + crypto.randomUUID();
}

function findChapterByTitle(chapters, title) {
  const target = normalizeChapterTitle(title);
  return (Array.isArray(chapters) ? chapters : []).find((chapter) => normalizeChapterTitle(chapter.title) === target) || null;
}

function normalizeChapterTitle(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}
