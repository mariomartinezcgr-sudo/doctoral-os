const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(ROOT, "data");
const SQLITE_PATH = path.join(DATA_DIR, "doctoralos.sqlite");
const LEGACY_DB_PATH = path.join(DATA_DIR, "db.json");
const MAX_BODY = 2 * 1024 * 1024;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

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
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && pathname === "/api/health") {
    sendJson(res, 200, { ok: true, storage: "sqlite" });
    return;
  }

  if (req.method === "POST" && pathname === "/api/register") {
    const body = await readJson(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const name = String(body.name || "").trim() || email.split("@")[0];

    if (!isValidEmail(email) || password.length < 8) {
      sendJson(res, 400, { error: "Usa un email valido y una contrasena de al menos 8 caracteres." });
      return;
    }

    if (findUserByEmail(email)) {
      sendJson(res, 409, { error: "Ya existe una cuenta con ese email." });
      return;
    }

    const user = createUser(email, password, name);
    const session = createSession(user.id);
    insertUser(user);
    insertSession(session);
    saveUserState(user.id, {});

    sendJson(res, 201, { ...publicSessionPayload(user, session.token), state: {}, isNewUser: true });
    return;
  }

  if (req.method === "POST" && pathname === "/api/login") {
    const body = await readJson(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const user = findUserByEmail(email);

    if (!user || !verifyPassword(password, user.password_hash)) {
      sendJson(res, 401, { error: "Email o contrasena incorrectos." });
      return;
    }

    const session = createSession(user.id);
    insertSession(session);
    pruneSessions();
    sendJson(res, 200, { ...publicSessionPayload(user, session.token), state: getUserState(user.id) });
    return;
  }

  if (req.method === "POST" && pathname === "/api/logout") {
    const token = getBearerToken(req);
    if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && pathname === "/api/me") {
    const auth = requireUser(req, res);
    if (!auth) return;
    sendJson(res, 200, { ...publicSessionPayload(auth.user, auth.token), state: getUserState(auth.user.id) });
    return;
  }

  if (req.method === "PUT" && pathname === "/api/state") {
    const auth = requireUser(req, res);
    if (!auth) return;
    const body = await readJson(req);
    const savedAt = saveUserState(auth.user.id, sanitizeState(body.state));
    updateUserTimestamp(auth.user.id, savedAt);
    sendJson(res, 200, { ok: true, savedAt });
    return;
  }

  if (req.method === "GET" && pathname === "/api/backup") {
    const auth = requireUser(req, res);
    if (!auth) return;
    const payload = JSON.stringify({ user: publicUser(auth.user), state: getUserState(auth.user.id), exportedAt: new Date().toISOString() }, null, 2);
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"doctoral-os-backup.json\""
    });
    res.end(payload);
    return;
  }

  if (req.method === "POST" && pathname === "/api/change-password") {
    const auth = requireUser(req, res);
    if (!auth) return;
    const body = await readJson(req);
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!verifyPassword(currentPassword, auth.user.password_hash)) {
      sendJson(res, 403, { error: "La contrasena actual no es correcta." });
      return;
    }
    if (newPassword.length < 8) {
      sendJson(res, 400, { error: "La nueva contrasena debe tener al menos 8 caracteres." });
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
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const routeMap = {
    "/": "/landing.html",
    "/app": "/index.html",
    "/app/": "/index.html"
  };
  const requested = routeMap[pathname] || decodeURIComponent(pathname);
  const filePath = path.normalize(path.join(ROOT, requested));

  if (!filePath.startsWith(ROOT) || filePath.includes(`${path.sep}data${path.sep}`)) {
    res.writeHead(403, securityHeaders());
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, securityHeaders());
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      ...securityHeaders(),
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(content);
  });
}

function requireUser(req, res) {
  const token = getBearerToken(req);
  if (!token) {
    sendJson(res, 401, { error: "Sesion requerida." });
    return null;
  }

  const session = db.prepare("SELECT * FROM sessions WHERE token = ? AND expires_at > ?").get(token, new Date().toISOString());
  if (!session) {
    sendJson(res, 401, { error: "Sesion caducada." });
    return null;
  }

  const user = findUserById(session.user_id);
  if (!user) {
    sendJson(res, 401, { error: "Usuario no encontrado." });
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

function sendJson(res, status, payload) {
  res.writeHead(status, { ...securityHeaders(), "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function securityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
  };
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

function publicSessionPayload(user, token) {
  return { token, user: publicUser(user) };
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
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) return {};
  return state;
}
