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
const OPENAI_API_URL = process.env.OPENAI_API_URL || "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";
const RESEND_API_URL = "https://api.resend.com/emails";
const ASSISTANT_THREAD_LIMIT = 16;
const SESSION_COOKIE = "doctoral_os_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const PRIVATE_PREVIEW_SHORTCUT = "/acceso-privado";
const PRIVATE_APP_SHORTCUT = "/mi-espacio";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const rateLimitStore = new Map();
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "mario.martinez.cgr@gmail.com";
const PUBLIC_HOLD_PAGE = /^(1|true|yes)$/i.test(String(process.env.PUBLIC_HOLD_PAGE || (process.env.NODE_ENV === "test" ? "0" : "1")));
const PRIVATE_SITE_ALLOWED_EMAILS = new Set(String(process.env.PRIVATE_SITE_ALLOWED_EMAILS || SUPPORT_EMAIL).split(",").map((email) => normalizeEmail(email)).filter(Boolean));
const CLOSED_BETA = /^(1|true|yes)$/i.test(String(process.env.CLOSED_BETA || (process.env.NODE_ENV === "production" ? "1" : "0")));
const BETA_INVITE_CODE = String(process.env.BETA_INVITE_CODE || "").trim();
const BETA_ALLOWED_EMAILS = new Set(String(process.env.BETA_ALLOWED_EMAILS || "").split(",").map((email) => normalizeEmail(email)).filter(Boolean));
const PASSWORD_RESET_TTL_SECONDS = 60 * 60;
const PASSWORD_RESET_DELIVERY = String(process.env.PASSWORD_RESET_DELIVERY || "").trim().toLowerCase();
const RESEND_API_KEY = String(process.env.RESEND_API_KEY || "").trim();
const EMAIL_FROM = String(process.env.EMAIL_FROM || "").trim();
const EMAIL_REPLY_TO = String(process.env.EMAIL_REPLY_TO || SUPPORT_EMAIL).trim();
const EMAIL_SENDER_NAME = String(process.env.EMAIL_SENDER_NAME || "DoctoralOS").trim();
const GOOGLE_CLIENT_ID = String(process.env.GOOGLE_CLIENT_ID || "").trim();
const GOOGLE_CLIENT_SECRET = String(process.env.GOOGLE_CLIENT_SECRET || "").trim();
const GOOGLE_OAUTH_REDIRECT_URI = String(process.env.GOOGLE_OAUTH_REDIRECT_URI || "").trim();
const GOOGLE_TOKEN_ENCRYPTION_KEY = String(process.env.GOOGLE_TOKEN_ENCRYPTION_KEY || "").trim();
const GOOGLE_AUTH_URL = String(process.env.GOOGLE_AUTH_URL || "https://accounts.google.com/o/oauth2/v2/auth").trim();
const GOOGLE_TOKEN_URL = String(process.env.GOOGLE_TOKEN_URL || "https://oauth2.googleapis.com/token").trim();
const GOOGLE_CALENDAR_BASE_URL = String(process.env.GOOGLE_CALENDAR_BASE_URL || "https://www.googleapis.com/calendar/v3").replace(/\/+$/, "");
const GOOGLE_OAUTH_STATE_TTL_SECONDS = 60 * 10;
const GOOGLE_CALENDAR_DEFAULT_DAYS_AHEAD = 30;
const GOOGLE_CALENDAR_MAX_RESULTS = 25;
const GOOGLE_CALENDAR_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.readonly"
];

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif"
};

const PUBLIC_FILES = new Set([
  "/holding.html",
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

const PUBLIC_PATH_PREFIXES = ["/assets/"];

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

    CREATE TABLE IF NOT EXISTS google_calendar_connections (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      google_email TEXT NOT NULL,
      calendar_id TEXT NOT NULL,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      token_type TEXT NOT NULL,
      scope TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS oauth_states (
      state TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      redirect_path TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
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
    let delivery = passwordResetDeliveryMode();
    if (user) {
      db.prepare("DELETE FROM password_reset_tokens WHERE user_id = ?").run(user.id);
      const resetToken = createPasswordResetToken(user.id);
      insertPasswordResetToken(resetToken);
      const recoveryLink = buildPasswordResetLink(req, resetToken.token);
      console.info("[DoctoralOS] Password reset prepared for " + email);
      if (delivery === "preview") {
        console.info("[DoctoralOS] Preview reset link: " + recoveryLink);
        previewUrl = recoveryLink;
      } else if (delivery === "email") {
        try {
          await sendPasswordResetEmail({ user, recoveryLink });
        } catch (error) {
          console.error("[DoctoralOS] Password reset email failed", error);
          delivery = "assisted";
        }
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

    if (delivery === "email") {
      sendJson(res, 200, {
        ok: true,
        delivery: "email",
        supportEmail: SUPPORT_EMAIL,
        message: "Si la cuenta existe, te hemos enviado un enlace seguro para restablecer la contraseña."
      });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      delivery: "assisted",
      supportEmail: SUPPORT_EMAIL,
      message: "Si la cuenta existe, ya hemos preparado un enlace seguro de recuperación. Si el correo no llega o seguimos en una beta asistida, escríbenos y te ayudamos."
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

  if (req.method === "GET" && pathname === "/api/integrations/google-calendar/status") {
    const auth = requireUser(req, res);
    if (!auth) return;
    sendJson(res, 200, googleCalendarStatusPayload(auth.user.id));
    return;
  }

  if (req.method === "GET" && pathname === "/api/integrations/google-calendar/connect") {
    const auth = requireUser(req, res);
    if (!auth) return;
    const availability = googleCalendarAvailability();
    if (!availability.available) {
      redirect(req, res, "/app?google_calendar=unavailable");
      return;
    }

    pruneOauthStates("google_calendar");
    const oauthState = createOauthState(auth.user.id, "google_calendar", "/app?google_calendar=connected");
    insertOauthState(oauthState);
    redirect(req, res, buildGoogleCalendarAuthUrl(oauthState.state));
    return;
  }

  if (req.method === "GET" && pathname === "/api/integrations/google-calendar/callback") {
    const availability = googleCalendarAvailability();
    if (!availability.available) {
      redirect(req, res, "/app?google_calendar=unavailable");
      return;
    }

    pruneOauthStates("google_calendar");
    const requestUrl = new URL(req.url, buildAppBaseUrl(req));
    const authError = String(requestUrl.searchParams.get("error") || "").trim();
    const stateToken = String(requestUrl.searchParams.get("state") || "").trim();
    const code = String(requestUrl.searchParams.get("code") || "").trim();

    if (authError) {
      redirect(req, res, "/app?google_calendar=denied");
      return;
    }
    if (!stateToken || !code) {
      redirect(req, res, "/app?google_calendar=error");
      return;
    }

    const oauthState = consumeOauthState(stateToken, "google_calendar");
    if (!oauthState) {
      redirect(req, res, "/app?google_calendar=expired");
      return;
    }

    try {
      await connectGoogleCalendarFromCallback(code, oauthState.user_id);
      redirect(req, res, oauthState.redirect_path || "/app?google_calendar=connected");
    } catch (error) {
      console.error("Google Calendar connect failed", error);
      redirect(req, res, "/app?google_calendar=error");
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/integrations/google-calendar/disconnect") {
    const auth = requireUser(req, res);
    if (!auth) return;
    deleteGoogleCalendarConnection(auth.user.id);
    sendJson(res, 200, { ok: true, status: googleCalendarStatusPayload(auth.user.id) });
    return;
  }

  if (req.method === "POST" && pathname === "/api/integrations/google-calendar/import") {
    if (!enforceRateLimit(req, res, "google-calendar-import", 30)) return;
    const auth = requireUser(req, res);
    if (!auth) return;
    const availability = googleCalendarAvailability();
    if (!availability.available) {
      sendJson(res, 503, { error: availability.message });
      return;
    }

    try {
      const body = await readJson(req);
      const result = await importGoogleCalendarMeetings(auth.user.id, body);
      sendJson(res, 200, {
        ok: true,
        importedCount: result.importedCount,
        updatedCount: result.updatedCount,
        state: result.state,
        savedAt: result.savedAt,
        status: googleCalendarStatusPayload(auth.user.id)
      });
    } catch (error) {
      if (error && error.code === "google_calendar_not_connected") {
        sendJson(res, 409, { error: "Conecta Google Calendar antes de importar reuniones." });
        return;
      }
      console.error("Google Calendar import failed", error);
      sendJson(res, 502, { error: "No se pudieron importar las reuniones de Google Meet ahora mismo." });
    }
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
      sendJson(res, 400, { error: "Escribe un mensaje para TeDoc." });
      return;
    }
    if (!process.env.OPENAI_API_KEY) {
      sendJson(res, 503, { error: "TeDoc con IA todavía no está configurado en el servidor." });
      return;
    }

    try {
      const baseState = body.state && typeof body.state === "object" ? body.state : getUserState(auth.user.id);
      const assistantState = normalizeAssistantState(cloneJson(baseState || {}));
      const clientMeta = sanitizeAssistantClientMeta(body.clientMeta);
      const result = await runAssistantWithOpenAI(auth.user, assistantState, message, clientMeta);
      const savedAt = saveUserState(auth.user.id, result.state);
      updateUserTimestamp(auth.user.id, savedAt);
      sendJson(res, 200, { ok: true, reply: result.reply, state: result.state, savedAt, model: result.model, mode: "openai", pendingAction: result.pendingAction || null });
    } catch (error) {
      console.error("Assistant error", error);
      sendJson(res, 502, { error: "TeDoc con IA no pudo responder ahora mismo." });
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
  const requestUrl = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  const { pathname, searchParams } = requestUrl;
  const currentUser = getAuthenticatedUser(req);
  const hasPrivateSiteAccess = canUserAccessPrivateSite(currentUser);
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405, {
      ...securityHeaders(req),
      "Allow": "GET, HEAD",
      "Content-Type": "text/plain; charset=utf-8"
    });
    res.end("Method Not Allowed");
    return;
  }

  if (pathname === PRIVATE_PREVIEW_SHORTCUT) {
    if (hasPrivateSiteAccess) {
      redirect(req, res, "/preview");
      return;
    }
    redirect(req, res, currentUser ? "/" : "/app?auth=login&next=%2Fpreview");
    return;
  }

  if (pathname === PRIVATE_APP_SHORTCUT) {
    redirect(req, res, hasPrivateSiteAccess ? "/app" : "/app?auth=login&next=%2Fapp");
    return;
  }

  if (PUBLIC_HOLD_PAGE && pathname === "/" && hasPrivateSiteAccess) {
    redirect(req, res, "/preview");
    return;
  }

  const routeMap = {
    "/": PUBLIC_HOLD_PAGE ? "/holding.html" : "/landing.html",
    "/preview": "/landing.html",
    "/app": "/index.html",
    "/app/": "/index.html",
    "/pricing": "/pricing.html",
    "/help": "/help.html",
    "/privacy": "/privacy.html",
    "/terms": "/terms.html",
    "/security": "/security.html"
  };

  if (pathname === "/robots.txt") {
    const body = "User-agent: *\nDisallow: /\n";
    res.writeHead(200, {
      ...securityHeaders(req),
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.end(body);
    return;
  }
  const requested = routeMap[pathname] || decodeURIComponent(pathname);

  if (PUBLIC_HOLD_PAGE) {
    const protectedMarketingFiles = new Set([
      "/landing.html",
      "/pricing.html",
      "/help.html",
      "/privacy.html",
      "/terms.html",
      "/security.html"
    ]);
    const wantsPreview = pathname === "/preview";
    const wantsPrivateApp = (pathname === "/app" || pathname === "/app/") && searchParams.get("demo") !== "1" && !searchParams.get("auth") && !searchParams.get("reset");
    const wantsPublicDemo = (pathname === "/app" || pathname === "/app/") && searchParams.get("demo") === "1";
    const isProtectedMarketingAsset = requested.startsWith("/assets/marketing/");
    const requiresPrivateAccess = wantsPreview || wantsPrivateApp || wantsPublicDemo || protectedMarketingFiles.has(requested) || isProtectedMarketingAsset;

    if (requiresPrivateAccess && !hasPrivateSiteAccess) {
      if (wantsPreview) {
        redirect(req, res, "/app?auth=login&next=%2Fpreview");
        return;
      }
      serveFile(req, res, path.join(ROOT, "holding.html"));
      return;
    }
  }

  const isPublicPath = PUBLIC_FILES.has(requested) || PUBLIC_PATH_PREFIXES.some((prefix) => requested.startsWith(prefix));

  if (!isPublicPath) {
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

  serveFile(req, res, filePath);
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

function getAuthenticatedUser(req) {
  const token = getSessionToken(req);
  if (!token) return null;

  const session = db.prepare("SELECT * FROM sessions WHERE token = ? AND expires_at > ?").get(token, new Date().toISOString());
  if (!session) return null;

  const user = findUserById(session.user_id);
  if (!user) return null;

  db.prepare("UPDATE sessions SET last_seen_at = ? WHERE token = ?").run(new Date().toISOString(), token);
  return user;
}

function canAccessPrivateSite(req) {
  if (!PUBLIC_HOLD_PAGE) return true;
  const user = getAuthenticatedUser(req);
  if (!user) return false;
  return canUserAccessPrivateSite(user);
}

function canUserAccessPrivateSite(user) {
  if (!PUBLIC_HOLD_PAGE) return true;
  if (!user) return false;
  if (!PRIVATE_SITE_ALLOWED_EMAILS.size) return true;
  return PRIVATE_SITE_ALLOWED_EMAILS.has(normalizeEmail(user.email));
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

function redirect(req, res, location) {
  res.writeHead(302, {
    ...securityHeaders(req),
    "Location": location,
    "Cache-Control": "no-store"
  });
  res.end();
}

function serveFile(req, res, filePath) {
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

function securityHeaders(req) {
  const headers = {
    "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    "X-Frame-Options": "DENY",
    "X-Robots-Tag": "noindex, nofollow, noarchive, noimageindex, nosnippet",
    "X-Permitted-Cross-Domain-Policies": "none",
    "Origin-Agent-Cluster": "?1",
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

function passwordResetDeliveryMode() {
  if (PASSWORD_RESET_DELIVERY === "preview") return "preview";
  if (PASSWORD_RESET_DELIVERY === "email") return passwordResetEmailConfigured() ? "email" : "assisted";
  if (process.env.NODE_ENV !== "production") return "preview";
  return passwordResetEmailConfigured() ? "email" : "assisted";
}

function passwordResetEmailConfigured() {
  return Boolean(RESEND_API_KEY && EMAIL_FROM);
}

async function sendPasswordResetEmail({ user, recoveryLink }) {
  if (!passwordResetEmailConfigured()) {
    throw new Error("Password reset email is not configured");
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + RESEND_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: formatEmailFrom(),
      to: [user.email],
      reply_to: EMAIL_REPLY_TO,
      subject: "Restablece tu contraseña de DoctoralOS",
      text: buildPasswordResetEmailText(user, recoveryLink),
      html: buildPasswordResetEmailHtml(user, recoveryLink)
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data && data.message ? data.message : data && data.error && data.error.message ? data.error.message : "No se pudo enviar el correo de recuperación";
    throw new Error(message);
  }

  return data;
}

function formatEmailFrom() {
  if (!EMAIL_FROM) return SUPPORT_EMAIL;
  return EMAIL_FROM.includes("<") ? EMAIL_FROM : `${EMAIL_SENDER_NAME} <${EMAIL_FROM}>`;
}

function buildPasswordResetEmailText(user, recoveryLink) {
  return [
    `Hola ${user.name || "doctorando/a"},`,
    "",
    "Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de DoctoralOS.",
    "Usa este enlace para elegir una nueva contraseña:",
    recoveryLink,
    "",
    "El enlace caduca en 60 minutos.",
    "",
    "Si no has pedido este cambio, puedes ignorar este mensaje.",
    "",
    `Si necesitas ayuda, escríbenos a ${SUPPORT_EMAIL}.`,
    "",
    "Equipo DoctoralOS"
  ].join("\n");
}

function buildPasswordResetEmailHtml(user, recoveryLink) {
  const safeName = escapeHtml(user.name || "doctorando/a");
  const safeLink = escapeAttribute(recoveryLink);
  const safeSupport = escapeHtml(SUPPORT_EMAIL);
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Inter,Arial,sans-serif;color:#192124;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;background:#f4f6f8;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #d7e1e5;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 8px;">
                <div style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#5f6f76;font-weight:700;">DoctoralOS</div>
                <h1 style="margin:12px 0 10px;font-size:30px;line-height:1.1;color:#182225;">Restablece tu contraseña</h1>
                <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#41545c;">Hola ${safeName}, hemos recibido una solicitud para cambiar la contraseña de tu cuenta.</p>
                <p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#41545c;">Haz clic en el botón de abajo para crear una nueva contraseña. El enlace caduca en 60 minutos.</p>
                <a href="${safeLink}" style="display:inline-block;padding:14px 20px;border-radius:12px;background:#2f7d74;color:#ffffff;text-decoration:none;font-weight:700;">Elegir nueva contraseña</a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 8px;">
                <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#5f6f76;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#2f7d74;word-break:break-all;">${escapeHtml(recoveryLink)}</p>
                <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#5f6f76;">Si no has pedido este cambio, puedes ignorar este mensaje.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 28px;border-top:1px solid #e5ecef;font-size:13px;line-height:1.6;color:#6a7b81;">
                Si necesitas ayuda, escríbenos a ${safeSupport}.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function googleCalendarAvailability() {
  const missing = [];
  if (!GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID");
  if (!GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET");
  if (!GOOGLE_OAUTH_REDIRECT_URI) missing.push("GOOGLE_OAUTH_REDIRECT_URI");
  if (!GOOGLE_TOKEN_ENCRYPTION_KEY) missing.push("GOOGLE_TOKEN_ENCRYPTION_KEY");
  return {
    available: missing.length === 0,
    missing,
    message: missing.length
      ? "Falta configurar Google Calendar en el servidor: " + missing.join(", ")
      : "Google Calendar disponible."
  };
}

function buildGoogleCalendarAuthUrl(stateToken) {
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", GOOGLE_OAUTH_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("scope", GOOGLE_CALENDAR_SCOPES.join(" "));
  url.searchParams.set("state", stateToken);
  return url.toString();
}

function createOauthState(userId, provider, redirectPath) {
  const now = new Date();
  const expires = new Date(now.getTime() + GOOGLE_OAUTH_STATE_TTL_SECONDS * 1000);
  return {
    state: crypto.randomBytes(24).toString("base64url"),
    user_id: userId,
    provider,
    redirect_path: sanitizeOauthRedirectPath(redirectPath),
    created_at: now.toISOString(),
    expires_at: expires.toISOString()
  };
}

function sanitizeOauthRedirectPath(value) {
  const redirectPath = String(value || "").trim();
  if (!redirectPath.startsWith("/") || redirectPath.startsWith("//")) return "/app";
  return redirectPath;
}

function insertOauthState(record) {
  db.prepare("INSERT INTO oauth_states (state, user_id, provider, redirect_path, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(record.state, record.user_id, record.provider, record.redirect_path, record.created_at, record.expires_at);
}

function consumeOauthState(stateToken, provider) {
  const row = db.prepare("SELECT * FROM oauth_states WHERE state = ? AND provider = ? AND expires_at > ?")
    .get(stateToken, provider, new Date().toISOString());
  db.prepare("DELETE FROM oauth_states WHERE state = ?").run(stateToken);
  return row || null;
}

function pruneOauthStates(_provider = "") {
  db.prepare("DELETE FROM oauth_states WHERE expires_at <= ?").run(new Date().toISOString());
}

function integrationCipherKey() {
  if (!GOOGLE_TOKEN_ENCRYPTION_KEY) return null;
  return crypto.createHash("sha256").update(GOOGLE_TOKEN_ENCRYPTION_KEY).digest();
}

function encryptStoredSecret(value) {
  if (!value) return "";
  const key = integrationCipherKey();
  if (!key) throw new Error("Missing integration encryption key");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

function decryptStoredSecret(value) {
  const raw = String(value || "");
  if (!raw) return "";
  if (!raw.startsWith("v1.")) return raw;
  const [, ivValue, tagValue, encryptedValue] = raw.split(".");
  const key = integrationCipherKey();
  if (!key || !ivValue || !tagValue || !encryptedValue) throw new Error("Invalid encrypted secret");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
}

function findGoogleCalendarConnectionRow(userId) {
  return db.prepare("SELECT * FROM google_calendar_connections WHERE user_id = ?").get(userId) || null;
}

function getGoogleCalendarConnection(userId) {
  const row = findGoogleCalendarConnectionRow(userId);
  if (!row) return null;
  return {
    ...row,
    access_token: decryptStoredSecret(row.access_token),
    refresh_token: row.refresh_token ? decryptStoredSecret(row.refresh_token) : ""
  };
}

function upsertGoogleCalendarConnection(record) {
  const now = new Date().toISOString();
  const createdAt = record.created_at || findGoogleCalendarConnectionRow(record.user_id)?.created_at || now;
  db.prepare(`
    INSERT INTO google_calendar_connections (
      user_id, google_email, calendar_id, access_token, refresh_token, token_type, scope, expires_at, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      google_email = excluded.google_email,
      calendar_id = excluded.calendar_id,
      access_token = excluded.access_token,
      refresh_token = excluded.refresh_token,
      token_type = excluded.token_type,
      scope = excluded.scope,
      expires_at = excluded.expires_at,
      updated_at = excluded.updated_at
  `).run(
    record.user_id,
    record.google_email,
    record.calendar_id || "primary",
    encryptStoredSecret(record.access_token),
    record.refresh_token ? encryptStoredSecret(record.refresh_token) : "",
    record.token_type || "Bearer",
    record.scope || GOOGLE_CALENDAR_SCOPES.join(" "),
    record.expires_at,
    createdAt,
    record.updated_at || now
  );
}

function deleteGoogleCalendarConnection(userId) {
  db.prepare("DELETE FROM google_calendar_connections WHERE user_id = ?").run(userId);
}

function googleCalendarStatusPayload(userId) {
  const availability = googleCalendarAvailability();
  const connection = findGoogleCalendarConnectionRow(userId);
  return {
    provider: "google_calendar",
    configured: availability.available,
    connected: Boolean(connection),
    googleEmail: connection?.google_email || "",
    calendarId: connection?.calendar_id || "",
    updatedAt: connection?.updated_at || "",
    message: availability.available
      ? (connection
        ? "Google Calendar conectado. Ya puedes importar reuniones de Meet."
        : "Conecta Google Calendar para traer tus reuniones de Google Meet.")
      : availability.message
  };
}

async function connectGoogleCalendarFromCallback(code, userId) {
  const existing = getGoogleCalendarConnection(userId);
  const tokenData = await exchangeGoogleToken({
    code,
    grant_type: "authorization_code",
    redirect_uri: GOOGLE_OAUTH_REDIRECT_URI
  });
  const user = findUserById(userId);
  const googleEmail = parseGoogleIdTokenEmail(tokenData.id_token) || existing?.google_email || normalizeEmail(user?.email);
  if (!tokenData.access_token) throw new Error("Google token response missing access token");

  const now = new Date();
  const expiresAt = new Date(now.getTime() + Math.max(60, Number(tokenData.expires_in || 3600)) * 1000);
  upsertGoogleCalendarConnection({
    user_id: userId,
    google_email: googleEmail,
    calendar_id: "primary",
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || existing?.refresh_token || "",
    token_type: tokenData.token_type || existing?.token_type || "Bearer",
    scope: tokenData.scope || existing?.scope || GOOGLE_CALENDAR_SCOPES.join(" "),
    expires_at: expiresAt.toISOString(),
    created_at: existing?.created_at || now.toISOString(),
    updated_at: now.toISOString()
  });
}

async function exchangeGoogleToken(params) {
  const availability = googleCalendarAvailability();
  if (!availability.available) throw new Error(availability.message);
  const body = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    ...params
  });
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error_description || data.error || "Google token exchange failed";
    throw new Error(message);
  }
  return data;
}

function parseGoogleIdTokenEmail(idToken) {
  const token = String(idToken || "").trim();
  if (!token) return "";
  const [, payload] = token.split(".");
  if (!payload) return "";
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return normalizeEmail(decoded.email);
  } catch (error) {
    return "";
  }
}

function googleTokenExpired(expiresAt) {
  const timestamp = new Date(expiresAt || "").getTime();
  if (!Number.isFinite(timestamp)) return true;
  return timestamp <= Date.now() + 60 * 1000;
}

async function refreshGoogleCalendarAccessToken(connection) {
  if (!connection?.refresh_token) throw new Error("Google Calendar refresh token missing");
  const tokenData = await exchangeGoogleToken({
    grant_type: "refresh_token",
    refresh_token: connection.refresh_token
  });
  const now = new Date();
  const expiresAt = new Date(now.getTime() + Math.max(60, Number(tokenData.expires_in || 3600)) * 1000);
  upsertGoogleCalendarConnection({
    user_id: connection.user_id,
    google_email: connection.google_email,
    calendar_id: connection.calendar_id || "primary",
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || connection.refresh_token,
    token_type: tokenData.token_type || connection.token_type || "Bearer",
    scope: tokenData.scope || connection.scope || GOOGLE_CALENDAR_SCOPES.join(" "),
    expires_at: expiresAt.toISOString(),
    created_at: connection.created_at,
    updated_at: now.toISOString()
  });
  return getGoogleCalendarConnection(connection.user_id);
}

async function getUsableGoogleCalendarConnection(userId) {
  const availability = googleCalendarAvailability();
  if (!availability.available) throw new Error(availability.message);
  const connection = getGoogleCalendarConnection(userId);
  if (!connection) {
    const error = new Error("Google Calendar not connected");
    error.code = "google_calendar_not_connected";
    throw error;
  }
  if (googleTokenExpired(connection.expires_at)) {
    return await refreshGoogleCalendarAccessToken(connection);
  }
  return connection;
}

async function listGoogleCalendarMeetEvents(userId, options = {}) {
  let connection = await getUsableGoogleCalendarConnection(userId);
  const daysAhead = clampNumber(options.daysAhead, 1, 90, GOOGLE_CALENDAR_DEFAULT_DAYS_AHEAD);
  const timeMin = new Date();
  const timeMax = new Date(timeMin.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const url = new URL(`${GOOGLE_CALENDAR_BASE_URL}/calendars/${encodeURIComponent(connection.calendar_id || "primary")}/events`);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("timeMin", timeMin.toISOString());
  url.searchParams.set("timeMax", timeMax.toISOString());
  url.searchParams.set("maxResults", String(GOOGLE_CALENDAR_MAX_RESULTS));

  let response = await fetch(url, {
    headers: { Authorization: `Bearer ${connection.access_token}` }
  });

  if (response.status === 401 && connection.refresh_token) {
    connection = await refreshGoogleCalendarAccessToken(connection);
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${connection.access_token}` }
    });
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || "Google Calendar API returned " + response.status;
    throw new Error(message);
  }

  return Array.isArray(data.items) ? data.items.map(mapGoogleCalendarEventToMeeting).filter(Boolean) : [];
}

async function importGoogleCalendarMeetings(userId, options = {}) {
  const imported = await listGoogleCalendarMeetEvents(userId, options);
  const baseState = normalizeAssistantState(cloneJson(getUserState(userId) || {}));
  const merged = mergeGoogleCalendarMeetings(baseState.meetings, imported);
  baseState.meetings = merged.meetings;
  const savedAt = saveUserState(userId, sanitizeState(baseState));
  updateUserTimestamp(userId, savedAt);
  return {
    importedCount: merged.importedCount,
    updatedCount: merged.updatedCount,
    state: baseState,
    savedAt
  };
}

function mergeGoogleCalendarMeetings(existingMeetings, importedMeetings) {
  const meetings = Array.isArray(existingMeetings) ? cloneJson(existingMeetings) : [];
  const byExternalId = new Map(meetings.map((meeting, index) => [String(meeting.externalId || ""), index]).filter(([key]) => key));
  let importedCount = 0;
  let updatedCount = 0;

  for (const imported of importedMeetings) {
    const key = String(imported.externalId || "");
    if (!key) continue;
    const existingIndex = byExternalId.get(key);
    if (existingIndex === undefined) {
      meetings.push(imported);
      byExternalId.set(key, meetings.length - 1);
      importedCount += 1;
      continue;
    }
    const current = meetings[existingIndex] || {};
    meetings[existingIndex] = {
      ...current,
      ...imported,
      id: current.id || imported.id,
      decisions: current.decisions || "",
      tasks: current.tasks || "",
      next: current.next || ""
    };
    updatedCount += 1;
  }

  meetings.sort(compareMeetingsBySchedule);
  return { meetings, importedCount, updatedCount };
}

function compareMeetingsBySchedule(left, right) {
  return meetingScheduleKey(left).localeCompare(meetingScheduleKey(right));
}

function meetingScheduleKey(meeting) {
  const date = String(meeting?.date || "").trim();
  const time = String(meeting?.time || "").trim();
  return `${date || "9999-12-31"}T${time || "23:59"}:${String(meeting?.id || "")}`;
}

function mapGoogleCalendarEventToMeeting(event) {
  const meetLink = extractGoogleMeetLink(event);
  const startDateTime = String(event?.start?.dateTime || "").trim();
  if (!meetLink || !startDateTime || startDateTime.length < 16) return null;
  const agenda = buildGoogleMeetingAgenda(event);
  const attendees = buildGoogleMeetingAttendees(event);
  return {
    id: "mt-google-" + sanitizeExternalId(event.id),
    externalId: "google_calendar:" + String(event.id || ""),
    provider: "google_meet",
    calendarEventId: String(event.id || ""),
    meetLink,
    organizerEmail: normalizeEmail(event?.organizer?.email || ""),
    syncedAt: new Date().toISOString(),
    date: startDateTime.slice(0, 10),
    time: startDateTime.slice(11, 16),
    type: inferServerMeetingType(attendees, agenda),
    attendees,
    agenda,
    decisions: "",
    tasks: "",
    next: ""
  };
}

function sanitizeExternalId(value) {
  return String(value || "").replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 80) || crypto.randomUUID();
}

function extractGoogleMeetLink(event) {
  const directLink = String(event?.hangoutLink || "").trim();
  if (directLink.includes("meet.google.com")) return directLink;
  const entryPoint = Array.isArray(event?.conferenceData?.entryPoints)
    ? event.conferenceData.entryPoints.find((item) => String(item?.uri || "").includes("meet.google.com"))
    : null;
  return String(entryPoint?.uri || "").trim();
}

function buildGoogleMeetingAttendees(event) {
  const names = [];
  const seen = new Set();
  const attendees = Array.isArray(event?.attendees) ? event.attendees : [];
  for (const attendee of attendees) {
    if (attendee?.resource) continue;
    const label = String(attendee.displayName || attendee.email || "").trim();
    const key = normalizeEmail(attendee.email || label);
    if (!label || seen.has(key)) continue;
    seen.add(key);
    names.push(label);
  }
  const organizer = String(event?.organizer?.displayName || event?.organizer?.email || "").trim();
  const organizerKey = normalizeEmail(event?.organizer?.email || organizer);
  if (organizer && !seen.has(organizerKey)) names.unshift(organizer);
  return names.join(", ");
}

function buildGoogleMeetingAgenda(event) {
  const summary = String(event?.summary || "").trim();
  const description = compactText(event?.description || "");
  if (summary && description && normalizeSimple(summary) !== normalizeSimple(description)) {
    return `${summary}\n${description.slice(0, 260)}`;
  }
  return summary || description || "Reunión importada desde Google Meet";
}

function inferServerMeetingType(attendees, agenda) {
  const text = normalizeSimple(`${attendees} ${agenda}`);
  if (text.includes("comite")) return "Comité";
  if (text.includes("grupo")) return "Grupo";
  if (text.includes("revision interna") || text.includes("revision")) return "Revisión interna";
  return "Dirección";
}

function compactText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSimple(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function publicSessionPayload(user) {
  return { user: publicUser(user) };
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    updatedAt: user.updated_at,
    privateSiteAccess: canUserAccessPrivateSite(user)
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("\n", " ");
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
  next.assistantStyleMemory = next.assistantStyleMemory && typeof next.assistantStyleMemory === "object" ? next.assistantStyleMemory : {};
  return next;
}

async function runAssistantWithOpenAI(user, state, message, clientMeta = {}) {
  const baseState = normalizeAssistantState(cloneJson(state));
  const workingState = normalizeAssistantState(cloneJson(baseState));
  const pendingActions = [];
  const conversation = buildAssistantConversationInput(workingState.assistantThread);
  const lastMessage = conversation[conversation.length - 1];
  if (!lastMessage || lastMessage.role !== "user" || String(lastMessage.content || "").trim() !== message) {
    conversation.push({ role: "user", content: message });
  }
  const requestInput = [
    { role: "developer", content: buildAssistantPrompt(user, workingState, clientMeta) },
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
      workingState.assistantThread.push(createAssistantMessage("assistant", reply));
      workingState.assistantThread = trimAssistantThread(workingState.assistantThread);
      const stateForClient = cloneJson(baseState);
      stateForClient.assistantThread = workingState.assistantThread;
      stateForClient.assistantStyleMemory = workingState.assistantStyleMemory;
      return {
        reply,
        state: normalizeAssistantState(stateForClient),
        model: response.model || OPENAI_MODEL,
        pendingAction: createAssistantPendingAction(pendingActions)
      };
    }

    const outputs = calls.map((call) => ({
      type: "function_call_output",
      call_id: call.call_id,
      output: JSON.stringify(executeAssistantTool(workingState, call, pendingActions))
    }));

    response = await openAIResponsesCreate({
      model: OPENAI_MODEL,
      previous_response_id: response.id,
      input: outputs
    });
  }

  const fallbackReply = "He intentado procesarlo, pero necesito que reformules la petición en una sola acción concreta.";
  workingState.assistantThread.push(createAssistantMessage("assistant", fallbackReply));
  workingState.assistantThread = trimAssistantThread(workingState.assistantThread);
  const stateForClient = cloneJson(baseState);
  stateForClient.assistantThread = workingState.assistantThread;
  stateForClient.assistantStyleMemory = workingState.assistantStyleMemory;
  return {
    reply: fallbackReply,
    state: normalizeAssistantState(stateForClient),
    model: OPENAI_MODEL,
    pendingAction: createAssistantPendingAction(pendingActions)
  };
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

function buildAssistantPrompt(user, state, clientMeta = {}) {
  const context = buildAssistantContext(state);
  const operations = buildAssistantOperationsSnapshot(state);
  return [
    "Eres TeDoc, el asistente de DoctoralOS, una app SaaS para doctorandos individuales.",
    "Hoy es " + assistantTodayIso() + ".",
    "Responde siempre en español, con tono claro, práctico y breve.",
    "Tu trabajo es ayudar a terminar la tesis con menos caos.",
    "Cuando el usuario pida diagnóstico, prioridad o riesgo, responde en bloques cortos: Lectura rápida, Siguiente paso, Riesgo visible y Cierre.",
    "Cuando el usuario pida un plan, conviértelo en pasos cerrables de 20 a 45 minutos.",
    "Si el usuario pide crear una tarea o agendar una reunión dentro de la app, usa las herramientas disponibles.",
    "Si el usuario te pide preparar una reunión, guarda una agenda útil dentro de la reunión adecuada.",
    "Si el usuario te pide responder a un comentario, guarda una respuesta de trabajo dentro del comentario correspondiente.",
    "Si el usuario trabaja un capítulo concreto, puedes detectar la sección más floja, convertir un comentario en checklist de reescritura, proponer estructura de un apartado y preparar la siguiente sesión.",
    "Si el usuario te pide plan semanal, puedes crear hasta tres tareas concretas usando varias llamadas de herramienta.",
    "Si el usuario pide convertir un comentario en tarea, usa la herramienta disponible.",
    "Si usas herramientas, estás preparando una vista previa para confirmar en cliente. No digas que ya está guardado o aplicado: di que dejas la propuesta lista para confirmar.",
    "No inventes fechas, horas ni datos que no aparezcan o no se deduzcan claramente.",
    "Si falta un dato minimo para ejecutar una accion, pide solo ese dato.",
    "Ajusta el tono, el número de frentes, la profundidad del plan y la preparación de reuniones según la memoria de estilo del usuario, salvo que el usuario pida otra cosa en este mensaje.",
    "Si no hace falta herramienta, responde con consejo accionable y concreto.",
    "Usuario actual: " + user.name + " (" + user.email + ")",
    "Resumen operativo actual: " + JSON.stringify(operations),
    "Contexto de seguridad del cliente: " + JSON.stringify(clientMeta),
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
      id: chapter.id || "",
      title: chapter.title || "",
      status: chapter.status || "",
      progress: Number(chapter.progress || 0),
      due: chapter.due || "",
      words: Number(chapter.words || 0),
      target: Number(chapter.target || 0),
      sections: Array.isArray(chapter.sections) ? chapter.sections.length : 0,
      checklistOpen: Array.isArray(chapter.checklist) ? chapter.checklist.filter((item) => !item.done).length : 0,
      rewriteChecklistOpen: Array.isArray(chapter.rewriteChecklist) ? chapter.rewriteChecklist.filter((item) => !item.done).length : 0,
      sectionDetails: Array.isArray(chapter.sections) ? chapter.sections.slice(0, 6).map((section) => ({
        id: section.id || "",
        title: section.title || "",
        status: section.status || "",
        words: Number(section.words || 0),
        goal: section.goal || ""
      })) : []
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
      id: comment.id || "",
      chapter: comment.chapter || "",
      source: comment.source || "",
      comment: comment.comment || "",
      response: comment.response || "",
      status: comment.status || "",
      priority: comment.priority || "",
      due: comment.due || ""
    })),
    writing: {
      last7DaysWords: wordsWrittenLastDays(state.writingLog, 7),
      sessionsLast7Days: sessionsLastDays(state.writingLog, 7)
    },
    analytics: buildAssistantAnalytics(state),
    activeChapterTitle: (Array.isArray(state.chapters) ? state.chapters : []).find((chapter) => chapter.id === state.editorChapterId)?.title || "",
    styleMemory: {
      summary: state.assistantStyleMemory && state.assistantStyleMemory.summary || "",
      explicit: state.assistantStyleMemory && state.assistantStyleMemory.explicit || {},
      feedback: state.assistantStyleMemory && state.assistantStyleMemory.feedback || {},
      learned: state.assistantStyleMemory && state.assistantStyleMemory.learned || {}
    }
  };
}

function sanitizeAssistantClientMeta(value) {
  const input = value && typeof value === "object" ? value : {};
  return {
    authStatus: String(input.authStatus || "").trim(),
    lastLocalSaveAt: String(input.lastLocalSaveAt || "").trim(),
    lastRemoteSaveAt: String(input.lastRemoteSaveAt || "").trim(),
    lastSnapshotAt: String(input.lastSnapshotAt || "").trim(),
    lastExportedAt: String(input.lastExportedAt || "").trim(),
    lastRestoredAt: String(input.lastRestoredAt || "").trim(),
    snapshotCount: Number.isFinite(Number(input.snapshotCount)) ? Number(input.snapshotCount) : 0,
    styleSummary: String(input.styleSummary || "").trim(),
    demoMode: Boolean(input.demoMode)
  };
}

function buildAssistantOperationsSnapshot(state) {
  const nextTask = (Array.isArray(state.tasks) ? [...state.tasks] : [])
    .filter((task) => !task.done)
    .sort((a, b) => String(a.due || "9999-12-31").localeCompare(String(b.due || "9999-12-31")))[0] || null;
  const nextMeeting = (Array.isArray(state.meetings) ? [...state.meetings] : [])
    .filter((meeting) => meeting.date && meeting.date >= assistantTodayIso())
    .sort((a, b) => `${a.date}T${a.time || "23:59"}`.localeCompare(`${b.date}T${b.time || "23:59"}`))[0] || null;
  const urgentComment = (Array.isArray(state.reviewComments) ? [...state.reviewComments] : [])
    .filter((comment) => normalizeReviewStatusName(comment.status) !== "Resueltos")
    .sort((a, b) => String(a.due || "9999-12-31").localeCompare(String(b.due || "9999-12-31")))[0] || null;
  const focusChapter = assistantStalledChapter(state.chapters);

  return {
    nextTask: nextTask ? {
      title: nextTask.title || "",
      due: nextTask.due || "",
      area: nextTask.area || "",
      impact: nextTask.impact || ""
    } : null,
    nextMeeting: nextMeeting ? {
      date: nextMeeting.date || "",
      time: nextMeeting.time || "",
      type: nextMeeting.type || "",
      attendees: nextMeeting.attendees || ""
    } : null,
    urgentComment: urgentComment ? {
      chapter: urgentComment.chapter || "",
      due: urgentComment.due || "",
      priority: urgentComment.priority || ""
    } : null,
    focusChapter: focusChapter ? {
      title: focusChapter.title || "",
      progress: Number(focusChapter.progress || 0),
      due: focusChapter.due || ""
    } : null
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
    },
    {
      type: "function",
      name: "update_meeting_brief",
      description: "Guarda o actualiza la agenda y tareas de una reunión ya existente.",
      strict: true,
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          date: { type: "string", description: "Fecha de la reunión YYYY-MM-DD o cadena vacía para usar la próxima reunión." },
          time: { type: "string", description: "Hora HH:MM o cadena vacía si no hace falta distinguirla." },
          agenda: { type: "string", description: "Agenda concreta a guardar." },
          tasks: { type: "string", description: "Lista corta de tareas o seguimiento a guardar." },
          next: { type: "string", description: "Siguiente hito o fecha siguiente en formato YYYY-MM-DD o cadena vacía." }
        },
        required: ["date", "time", "agenda", "tasks", "next"]
      }
    },
    {
      type: "function",
      name: "update_review_comment_response",
      description: "Guarda una respuesta de trabajo dentro de un comentario de revisión abierto.",
      strict: true,
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          chapter: { type: "string", description: "Capítulo del comentario o cadena vacía para usar el comentario más urgente." },
          response: { type: "string", description: "Respuesta o plan de respuesta a guardar." },
          status: { type: "string", description: "Estado nuevo, por ejemplo En proceso o Resuelto." }
        },
        required: ["chapter", "response", "status"]
      }
    },
    {
      type: "function",
      name: "convert_review_comment_to_task",
      description: "Convierte un comentario de revisión abierto en una tarea dentro del plan semanal.",
      strict: true,
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          chapter: { type: "string", description: "Capítulo del comentario que se quiere convertir en tarea." },
          title: { type: "string", description: "Título de la tarea a crear." },
          due: { type: "string", description: "Fecha límite YYYY-MM-DD o cadena vacía para usar la del comentario." },
          effort: { type: "string", description: "Esfuerzo estimado, por ejemplo 45 min o 90 min." },
          impact: { type: "string", enum: ["Bajo", "Medio", "Alto"], description: "Impacto esperado de cerrar esa tarea." }
        },
        required: ["chapter", "title", "due", "effort", "impact"]
      }
    },
    {
      type: "function",
      name: "set_chapter_rewrite_checklist",
      description: "Guarda un checklist de reescritura dentro de un capítulo existente a partir de comentarios o debilidades detectadas.",
      strict: true,
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          chapter: { type: "string", description: "Título del capítulo donde se guarda el checklist." },
          sourceComment: { type: "string", description: "Comentario que origina el checklist o cadena vacía." },
          items: {
            type: "array",
            description: "Pasos concretos de reescritura.",
            items: { type: "string" }
          }
        },
        required: ["chapter", "sourceComment", "items"]
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

function createAssistantPendingAction(actions) {
  if (!Array.isArray(actions) || !actions.length) return null;
  return {
    id: createEntityId("ap"),
    actions
  };
}

function pushPendingAssistantAction(pendingActions, action) {
  if (!action || typeof action !== "object") return;
  pendingActions.push(action);
}

function executeAssistantTool(state, call, pendingActions = []) {
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
    pushPendingAssistantAction(pendingActions, { type: "create_task", task });
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
    pushPendingAssistantAction(pendingActions, { type: "create_meeting", meeting });
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
    pushPendingAssistantAction(pendingActions, { type: "create_review_comment", reviewComment });
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
    pushPendingAssistantAction(pendingActions, { type: "create_chapter_note", chapterId: chapter.id || "", chapterTitle: chapter.title || "", note });
    return { ok: true, note, chapter: chapter.title };
  }

  if (call.name === "update_meeting_brief") {
    const date = normalizeIsoDate(args.date);
    const time = normalizeTime(args.time);
    const meeting = findAssistantMeeting(state.meetings, date, time);
    if (!meeting) return { ok: false, error: "No he encontrado la reunión que quieres preparar." };

    const agenda = String(args.agenda || "").trim();
    const tasks = String(args.tasks || "").trim();
    if (!agenda) return { ok: false, error: "La agenda no puede quedar vacía." };
    meeting.agenda = agenda;
    meeting.tasks = tasks;
    meeting.next = normalizeIsoDate(args.next) || "";
    pushPendingAssistantAction(pendingActions, {
      type: "update_meeting_brief",
      meetingId: meeting.id || "",
      meetingLabel: [meeting.date, meeting.time, meeting.type].filter(Boolean).join(" · "),
      date: meeting.date || "",
      time: meeting.time || "",
      agenda: meeting.agenda || "",
      tasks: meeting.tasks || "",
      next: meeting.next || ""
    });
    return {
      ok: true,
      meeting: {
        date: meeting.date || "",
        time: meeting.time || "",
        type: meeting.type || "",
        agenda: meeting.agenda || "",
        tasks: meeting.tasks || "",
        next: meeting.next || ""
      }
    };
  }

  if (call.name === "update_review_comment_response") {
    const comment = findAssistantReviewComment(state.reviewComments, args.chapter);
    if (!comment) return { ok: false, error: "No he encontrado un comentario abierto donde guardar la respuesta." };
    const response = String(args.response || "").trim();
    if (!response) return { ok: false, error: "La respuesta del comentario no puede quedar vacía." };
    comment.response = response;
    comment.status = String(args.status || comment.status || "En proceso").trim() || "En proceso";
    pushPendingAssistantAction(pendingActions, {
      type: "update_review_comment_response",
      commentId: comment.id || "",
      chapterTitle: comment.chapter || "",
      response: comment.response || "",
      status: comment.status || "En proceso"
    });
    return {
      ok: true,
      reviewComment: {
        chapter: comment.chapter || "",
        status: comment.status || "",
        due: comment.due || "",
        response: comment.response || ""
      }
    };
  }

  if (call.name === "convert_review_comment_to_task") {
    const chapterTitle = String(args.chapter || "").trim();
    const comment = (Array.isArray(state.reviewComments) ? state.reviewComments : [])
      .find((item) => normalizeReviewStatusName(item.status) !== "Resueltos" && normalizeChapterTitle(item.chapter) === normalizeChapterTitle(chapterTitle));
    if (!comment) return { ok: false, error: "No he encontrado un comentario abierto de ese capítulo." };

    const due = normalizeIsoDate(args.due) || normalizeIsoDate(comment.due);
    const title = String(args.title || `Resolver comentario: ${comment.chapter}`).trim() || `Resolver comentario: ${comment.chapter}`;
    const task = {
      id: createEntityId("tk"),
      title,
      area: "Revisión",
      status: inferTaskStatusFromDue(due),
      due,
      effort: String(args.effort || (comment.priority === "Alta" ? "90 min" : "45 min")).trim() || "45 min",
      impact: ["Bajo", "Medio", "Alto"].includes(args.impact) ? args.impact : (comment.priority === "Alta" ? "Alto" : "Medio")
    };
    state.tasks.unshift(task);
    if (normalizeReviewStatusName(comment.status) === "Pendientes") comment.status = "En proceso";
    pushPendingAssistantAction(pendingActions, {
      type: "convert_review_comment_to_task",
      commentId: comment.id || "",
      chapterTitle: comment.chapter || "",
      status: comment.status || "En proceso",
      task
    });
    return { ok: true, task, comment: { chapter: comment.chapter, due: comment.due || "" } };
  }

  if (call.name === "set_chapter_rewrite_checklist") {
    const chapter = findChapterByTitle(state.chapters, args.chapter);
    if (!chapter) return { ok: false, error: "No he encontrado ese capítulo para guardar el checklist." };
    const items = Array.isArray(args.items)
      ? args.items.map((item) => String(item || "").trim()).filter(Boolean)
      : [];
    if (!items.length) return { ok: false, error: "El checklist necesita al menos un paso concreto." };
    const sourceComment = String(args.sourceComment || "").trim();
    chapter.rewriteChecklist = items.map((label) => ({
      id: createEntityId("rw"),
      label,
      done: false,
      sourceCommentId: "",
      sourceCommentText: sourceComment
    }));
    chapter.editorUpdatedAt = new Date().toISOString();
    pushPendingAssistantAction(pendingActions, {
      type: "set_chapter_rewrite_checklist",
      chapterId: chapter.id || "",
      chapterTitle: chapter.title || "",
      sourceCommentText: sourceComment,
      items: chapter.rewriteChecklist
    });
    return { ok: true, chapter: chapter.title || "", items: chapter.rewriteChecklist };
  }

  return { ok: false, error: "Herramienta desconocida: " + call.name };
}

function findAssistantMeeting(meetings, date, time) {
  const items = Array.isArray(meetings) ? [...meetings] : [];
  if (date) {
    return items
      .sort((a, b) => `${a.date || ""} ${a.time || "23:59"}`.localeCompare(`${b.date || ""} ${b.time || "23:59"}`))
      .find((meeting) => meeting.date === date && (!time || meeting.time === time)) || null;
  }
  const today = assistantTodayIso();
  return items
    .filter((meeting) => meeting.date && meeting.date >= today)
    .sort((a, b) => `${a.date || ""} ${a.time || "23:59"}`.localeCompare(`${b.date || ""} ${b.time || "23:59"}`))[0] || null;
}

function findAssistantReviewComment(reviewComments, chapter) {
  const items = (Array.isArray(reviewComments) ? reviewComments : [])
    .filter((item) => normalizeReviewStatusName(item.status) !== "Resueltos");
  const chapterTitle = String(chapter || "").trim();
  if (!chapterTitle) {
    return [...items]
      .sort((a, b) => String(a.due || "9999-12-31").localeCompare(String(b.due || "9999-12-31")))[0] || null;
  }
  return items.find((item) => normalizeChapterTitle(item.chapter) === normalizeChapterTitle(chapterTitle)) || null;
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

function buildAssistantAnalytics(state) {
  const wordsLast7Days = wordsWrittenLastDays(state.writingLog, 7);
  const wordsPrevious7Days = wordsWrittenRange(state.writingLog, 7, 13);
  const reviewOpen = (Array.isArray(state.reviewComments) ? state.reviewComments : []).filter((comment) => normalizeReviewStatusName(comment.status) !== "Resueltos").length;
  const tasksOverdue = (Array.isArray(state.tasks) ? state.tasks : []).filter((task) => task.due && task.due < assistantTodayIso() && task.status !== "later").length;
  const readingsByStatus = readingStatusSummary(state.readings);
  const stalledChapter = assistantStalledChapter(state.chapters);
  return {
    wordsLast7Days,
    wordsPrevious7Days,
    writingTrend: buildAssistantWritingTrend(wordsLast7Days, wordsPrevious7Days),
    reviewOpen,
    tasksOverdue,
    activeChapters: (Array.isArray(state.chapters) ? state.chapters : []).filter((chapter) => Number(chapter.progress || 0) > 0).length,
    readingsByStatus,
    stalledChapter: stalledChapter ? {
      title: stalledChapter.title || "",
      progress: Number(stalledChapter.progress || 0),
      due: stalledChapter.due || ""
    } : null
  };
}

function wordsWrittenRange(log, startDaysAgo, endDaysAgo) {
  const now = Date.now();
  const endCutoff = now - startDaysAgo * 86400000;
  const startCutoff = now - (endDaysAgo + 1) * 86400000;
  return (Array.isArray(log) ? log : []).reduce((sum, entry) => {
    const stamp = new Date(String(entry.date || "") + "T00:00:00").getTime();
    if (!Number.isFinite(stamp) || stamp < startCutoff || stamp >= endCutoff) return sum;
    return sum + Number(entry.words || 0);
  }, 0);
}

function readingStatusSummary(readings) {
  const counts = { Pendientes: 0, Leyendo: 0, "Leídas": 0, Clave: 0 };
  (Array.isArray(readings) ? readings : []).forEach((reading) => {
    counts[normalizeReadingStatusName(reading.status)] += 1;
  });
  return counts;
}

function normalizeReviewStatusName(status) {
  const normalized = normalizeChapterTitle(status);
  if (normalized.includes("resuelto")) return "Resueltos";
  if (normalized.includes("proceso") || normalized.includes("curso") || normalized.includes("revision")) return "En proceso";
  return "Pendientes";
}

function normalizeReadingStatusName(status) {
  const normalized = normalizeChapterTitle(status);
  if (normalized.includes("clave")) return "Clave";
  if (normalized.includes("leyendo")) return "Leyendo";
  if (normalized.includes("leido")) return "Leídas";
  return "Pendientes";
}

function assistantStalledChapter(chapters) {
  return (Array.isArray(chapters) ? chapters : [])
    .filter((chapter) => normalizeChapterTitle(chapter.status) !== "aprobado")
    .sort((a, b) => String(a.due || "9999-12-31").localeCompare(String(b.due || "9999-12-31")) || Number(a.progress || 0) - Number(b.progress || 0))[0] || null;
}

function buildAssistantWritingTrend(wordsLast7Days, wordsPrevious7Days) {
  if (!wordsLast7Days && !wordsPrevious7Days) return "Sin escritura reciente";
  if (!wordsPrevious7Days && wordsLast7Days) return "Arranque frente a la semana previa";
  if (wordsLast7Days === wordsPrevious7Days) return "Ritmo igual que la semana previa";
  const diff = Math.abs(wordsLast7Days - wordsPrevious7Days);
  return wordsLast7Days > wordsPrevious7Days ? `+${diff} palabras frente a la semana previa` : `-${diff} palabras frente a la semana previa`;
}

function assistantTodayIso() {
  return new Date().toISOString().slice(0, 10);
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
