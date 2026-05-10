const assert = require("assert");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const BASE_PORT = 4297;

async function main() {
  await withServer(BASE_PORT, { NODE_ENV: "test" }, async ({ request }) => {
    const email = `test-${Date.now()}@example.com`;
    const register = await request("/api/register", {
      method: "POST",
      body: { email, password: "password123", name: "Test Doctorando" }
    });
    assert.equal(register.status, 201);
    assert.equal(register.body.isNewUser, true);
    assert.ok(register.cookie);
    assert.ok(register.setCookie.includes("HttpOnly"));
    assert.ok(register.setCookie.includes("SameSite=Lax"));

    const duplicate = await request("/api/register", {
      method: "POST",
      body: { email, password: "password123", name: "Duplicado" }
    });
    assert.equal(duplicate.status, 409);

    const state = {
      project: { name: "Tesis test", candidate: "Test Doctorando" },
      chapters: [{ id: "ch-test", title: "Introducción", words: 1000, target: 5000 }]
    };
    const saved = await request("/api/state", {
      method: "PUT",
      cookie: register.cookie,
      body: { state }
    });
    assert.equal(saved.status, 200);
    assert.equal(saved.body.ok, true);

    const me = await request("/api/me", {
      method: "GET",
      cookie: register.cookie
    });
    assert.equal(me.status, 200);
    assert.equal(me.body.user.email, email);

    const login = await request("/api/login", {
      method: "POST",
      body: { email, password: "password123" }
    });
    assert.equal(login.status, 200);
    assert.equal(login.body.state.project.name, "Tesis test");
    assert.ok(login.cookie);

    const backup = await request("/api/backup", {
      method: "GET",
      cookie: login.cookie
    });
    assert.equal(backup.status, 200);
    assert.equal(backup.body.state.project.name, "Tesis test");

    const assistant = await request("/api/assistant", {
      method: "POST",
      cookie: login.cookie,
      body: { message: "Resúmeme el progreso actual", state }
    });
    assert.equal(assistant.status, 503);

    const changed = await request("/api/change-password", {
      method: "POST",
      cookie: login.cookie,
      body: { currentPassword: "password123", newPassword: "password456" }
    });
    assert.equal(changed.status, 200);

    const relogin = await request("/api/login", {
      method: "POST",
      body: { email, password: "password456" }
    });
    assert.equal(relogin.status, 200);

    const resetRequest = await request("/api/password-reset/request", {
      method: "POST",
      body: { email }
    });
    assert.equal(resetRequest.status, 200);
    assert.equal(resetRequest.body.delivery, "preview");
    assert.ok(resetRequest.body.previewUrl);
    const resetToken = new URL(resetRequest.body.previewUrl).searchParams.get("reset");
    assert.ok(resetToken);

    const resetConfirm = await request("/api/password-reset/confirm", {
      method: "POST",
      body: { token: resetToken, newPassword: "password789" }
    });
    assert.equal(resetConfirm.status, 200);
    assert.ok(resetConfirm.cookie);

    const reusedReset = await request("/api/password-reset/confirm", {
      method: "POST",
      body: { token: resetToken, newPassword: "password999" }
    });
    assert.equal(reusedReset.status, 400);

    const resetLogin = await request("/api/login", {
      method: "POST",
      body: { email, password: "password789" }
    });
    assert.equal(resetLogin.status, 200);

    const logout = await request("/api/logout", {
      method: "POST",
      cookie: resetLogin.cookie
    });
    assert.equal(logout.status, 200);
    assert.ok(logout.setCookie.includes("Max-Age=0"));
  });

  await withServer(BASE_PORT + 1, { NODE_ENV: "production", CLOSED_BETA: "1", BETA_INVITE_CODE: "doctoralos-beta" }, async ({ request }) => {
    const blocked = await request("/api/register", {
      method: "POST",
      body: { email: `blocked-${Date.now()}@example.com`, password: "password123", name: "Blocked User" }
    });
    assert.equal(blocked.status, 403);
    assert.equal(blocked.body.code, "beta_closed");

    const invited = await request("/api/register", {
      method: "POST",
      body: { email: `invited-${Date.now()}@example.com`, password: "password123", name: "Invited User", inviteCode: "doctoralos-beta" }
    });
    assert.equal(invited.status, 201);

    const assistedReset = await request("/api/password-reset/request", {
      method: "POST",
      body: { email: invited.body.user.email }
    });
    assert.equal(assistedReset.status, 200);
    assert.equal(assistedReset.body.delivery, "assisted");
    assert.ok(assistedReset.body.message.includes("correo no llega") || assistedReset.body.message.includes("beta asistida"));
  });

  await withServer(BASE_PORT + 2, { NODE_ENV: "test", PUBLIC_HOLD_PAGE: "1", SUPPORT_EMAIL: "owner@example.com" }, async ({ request }) => {
    const publicHome = await request("/", { method: "GET" });
    assert.equal(publicHome.status, 200);
    assert.ok(String(publicHome.body).includes("Estamos trabajando en ello"));

    const publicLanding = await request("/landing.html", { method: "GET" });
    assert.equal(publicLanding.status, 200);
    assert.ok(String(publicLanding.body).includes("Estamos trabajando en ello"));

    const demoBlocked = await request("/app?demo=1", { method: "GET" });
    assert.equal(demoBlocked.status, 200);
    assert.ok(String(demoBlocked.body).includes("Estamos trabajando en ello"));

    const appShellHidden = await request("/app", { method: "GET" });
    assert.equal(appShellHidden.status, 200);
    assert.ok(String(appShellHidden.body).includes("Estamos trabajando en ello"));

    const privatePreviewShortcut = await request("/acceso-privado", { method: "GET", redirect: "manual" });
    assert.equal(privatePreviewShortcut.status, 302);
    assert.equal(privatePreviewShortcut.location, "/app?auth=login&next=%2Fpreview");

    const privateAppShortcut = await request("/mi-espacio", { method: "GET", redirect: "manual" });
    assert.equal(privateAppShortcut.status, 302);
    assert.equal(privateAppShortcut.location, "/app?auth=login&next=%2Fapp");

    const ownerRegister = await request("/api/register", {
      method: "POST",
      body: { email: "owner@example.com", password: "password123", name: "Owner" }
    });
    assert.equal(ownerRegister.status, 201);
    assert.equal(ownerRegister.body.user.privateSiteAccess, true);

    const outsiderRegister = await request("/api/register", {
      method: "POST",
      body: { email: `outsider-${Date.now()}@example.com`, password: "password123", name: "Outsider" }
    });
    assert.equal(outsiderRegister.status, 201);
    assert.equal(outsiderRegister.body.user.privateSiteAccess, false);

    const outsiderMe = await request("/api/me", {
      method: "GET",
      cookie: outsiderRegister.cookie
    });
    assert.equal(outsiderMe.status, 200);
    assert.equal(outsiderMe.body.user.privateSiteAccess, false);

    const ownerHome = await request("/", {
      method: "GET",
      cookie: ownerRegister.cookie,
      redirect: "manual"
    });
    assert.equal(ownerHome.status, 302);
    assert.equal(ownerHome.location, "/preview");

    const ownerPreview = await request("/preview", {
      method: "GET",
      cookie: ownerRegister.cookie
    });
    assert.equal(ownerPreview.status, 200);
    assert.ok(String(ownerPreview.body).includes("El sistema de trabajo para terminar la tesis"));

    const ownerPreviewShortcut = await request("/acceso-privado", {
      method: "GET",
      cookie: ownerRegister.cookie,
      redirect: "manual"
    });
    assert.equal(ownerPreviewShortcut.status, 302);
    assert.equal(ownerPreviewShortcut.location, "/preview");

    const ownerAppShortcut = await request("/mi-espacio", {
      method: "GET",
      cookie: ownerRegister.cookie,
      redirect: "manual"
    });
    assert.equal(ownerAppShortcut.status, 302);
    assert.equal(ownerAppShortcut.location, "/app");

    const ownerApp = await request("/app", {
      method: "GET",
      cookie: ownerRegister.cookie
    });
    assert.equal(ownerApp.status, 200);
    assert.ok(String(ownerApp.body).includes("Sistema doctoral"));
  });

  await withMockGoogleCalendar(BASE_PORT + 10, async (googleConfig) => {
    const appPort = BASE_PORT + 4;
    await withServer(appPort, {
      NODE_ENV: "test",
      GOOGLE_CLIENT_ID: "google-client-test",
      GOOGLE_CLIENT_SECRET: "google-secret-test",
      GOOGLE_OAUTH_REDIRECT_URI: `http://127.0.0.1:${appPort}/api/integrations/google-calendar/callback`,
      GOOGLE_TOKEN_ENCRYPTION_KEY: "google-token-encryption-test",
      GOOGLE_AUTH_URL: googleConfig.authUrl,
      GOOGLE_TOKEN_URL: googleConfig.tokenUrl,
      GOOGLE_CALENDAR_BASE_URL: googleConfig.calendarBaseUrl
    }, async ({ request }) => {
      const email = `calendar-${Date.now()}@example.com`;
      const register = await request("/api/register", {
        method: "POST",
        body: { email, password: "password123", name: "Calendar Owner" }
      });
      assert.equal(register.status, 201);

      const statusBefore = await request("/api/integrations/google-calendar/status", {
        method: "GET",
        cookie: register.cookie
      });
      assert.equal(statusBefore.status, 200);
      assert.equal(statusBefore.body.configured, true);
      assert.equal(statusBefore.body.connected, false);

      const connect = await request("/api/integrations/google-calendar/connect", {
        method: "GET",
        cookie: register.cookie,
        redirect: "manual"
      });
      assert.equal(connect.status, 302);
      assert.ok(connect.location.startsWith(googleConfig.authUrl));

      const authRedirect = await fetch(connect.location, { redirect: "manual" });
      assert.equal(authRedirect.status, 302);
      const callbackLocation = authRedirect.headers.get("location") || "";
      assert.ok(callbackLocation.includes("/api/integrations/google-calendar/callback"));
      const callbackUrl = new URL(callbackLocation);
      const callback = await request(callbackUrl.pathname + callbackUrl.search, {
        method: "GET",
        redirect: "manual"
      });
      assert.equal(callback.status, 302);
      assert.equal(callback.location, "/app?google_calendar=connected");

      const statusAfter = await request("/api/integrations/google-calendar/status", {
        method: "GET",
        cookie: register.cookie
      });
      assert.equal(statusAfter.status, 200);
      assert.equal(statusAfter.body.connected, true);
      assert.equal(statusAfter.body.googleEmail, "meet-owner@example.com");

      const imported = await request("/api/integrations/google-calendar/import", {
        method: "POST",
        cookie: register.cookie,
        body: { daysAhead: 21 }
      });
      assert.equal(imported.status, 200);
      assert.equal(imported.body.importedCount, 1);
      assert.equal(imported.body.updatedCount, 0);
      assert.equal(Array.isArray(imported.body.state.meetings), true);
      assert.equal(imported.body.state.meetings.length, 1);
      assert.equal(imported.body.state.meetings[0].provider, "google_meet");
      assert.ok(String(imported.body.state.meetings[0].meetLink).includes("meet.google.com"));

      const importedAgain = await request("/api/integrations/google-calendar/import", {
        method: "POST",
        cookie: register.cookie,
        body: { daysAhead: 21 }
      });
      assert.equal(importedAgain.status, 200);
      assert.equal(importedAgain.body.importedCount, 0);
      assert.equal(importedAgain.body.updatedCount, 1);
      assert.equal(importedAgain.body.state.meetings.length, 1);

      const disconnected = await request("/api/integrations/google-calendar/disconnect", {
        method: "POST",
        cookie: register.cookie
      });
      assert.equal(disconnected.status, 200);
      assert.equal(disconnected.body.status.connected, false);
    });
  });

  await withMockOpenAI(BASE_PORT + 20, async (openAIUrl) => {
    await withServer(BASE_PORT + 3, { NODE_ENV: "test", OPENAI_API_KEY: "test-key", OPENAI_API_URL: openAIUrl }, async ({ request }) => {
      const email = `assistant-${Date.now()}@example.com`;
      const register = await request("/api/register", {
        method: "POST",
        body: { email, password: "password123", name: "Assistant Preview" }
      });
      assert.equal(register.status, 201);

      const assistantState = {
        project: { name: "Tesis IA", candidate: "Assistant Preview" },
        tasks: [],
        chapters: [{ id: "ch-1", title: "Introducción", status: "Borrador", progress: 35, due: "", words: 1200, target: 5000, sections: [], checklist: [] }]
      };

      const assistant = await request("/api/assistant", {
        method: "POST",
        cookie: register.cookie,
        body: { message: "Crear tarea enviar borrador del capítulo 1 para mañana", state: assistantState }
      });
      assert.equal(assistant.status, 200);
      assert.equal(assistant.body.mode, "openai");
      assert.ok(assistant.body.pendingAction);
      assert.equal(Array.isArray(assistant.body.pendingAction.actions), true);
      assert.equal(assistant.body.pendingAction.actions[0].type, "create_task");
      assert.equal(Array.isArray(assistant.body.state.tasks), true);
      assert.equal(assistant.body.state.tasks.length, 0);
      assert.ok(String(assistant.body.reply).toLowerCase().includes("vista previa"));

      const me = await request("/api/me", {
        method: "GET",
        cookie: register.cookie
      });
      assert.equal(me.status, 200);
      assert.equal(Array.isArray(me.body.state.tasks), true);
      assert.equal(me.body.state.tasks.length, 0);
      assert.ok(Array.isArray(me.body.state.assistantThread));
      assert.ok(me.body.state.assistantThread.some((message) => String(message.text || "").toLowerCase().includes("vista previa")));

      const closureState = {
        project: { name: "Tesis IA", candidate: "Assistant Preview" },
        meetings: [
          {
            id: "mt-1",
            date: "2026-05-11",
            time: "10:30",
            type: "Dirección",
            attendees: "Directora",
            agenda: "Reunion doctorado",
            summary: "",
            decisions: "",
            tasks: "",
            notes: "Revisar muestra y justificar mejor los criterios.\nDecisión: cerrar una versión más explícita del apartado 2.2.\nTareas: reescribir 2.2 y enviar borrador el 2026-05-13.",
            next: ""
          }
        ]
      };

      const meetingClosure = await request("/api/assistant", {
        method: "POST",
        cookie: register.cookie,
        body: { message: "Cierra la reunión del 2026-05-11 a las 10:30 y deja resumen, decisiones y tareas", state: closureState }
      });
      assert.equal(meetingClosure.status, 200);
      assert.equal(meetingClosure.body.mode, "openai");
      assert.ok(meetingClosure.body.pendingAction);
      assert.equal(meetingClosure.body.pendingAction.actions[0].type, "update_meeting_closure");
      assert.equal(meetingClosure.body.state.meetings[0].summary, "");
      assert.ok(String(meetingClosure.body.reply).toLowerCase().includes("vista previa"));
    });
  });

  console.log("backend tests passed");
}

async function withServer(port, envOverrides, run) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "doctoralos-test-"));
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ["server.js"], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port), HOST: "127.0.0.1", DATA_DIR: dataDir, NODE_NO_WARNINGS: "1", ...envOverrides },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stderr = "";
  server.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForHealth(baseUrl, () => stderr);
    await run({ request: (pathname, options) => request(baseUrl, pathname, options) });
  } finally {
    server.kill();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
}

async function waitForHealth(baseUrl, getStderr) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch (error) {
      await delay(120);
    }
  }
  throw new Error(`Server did not start. stderr: ${getStderr()}`);
}

async function request(baseUrl, pathname, options) {
  const headers = {};
  if (options.body) headers["Content-Type"] = "application/json";
  if (options.cookie) headers.Cookie = options.cookie;

  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    redirect: options.redirect || "follow"
  });
  const text = await response.text();
  const setCookie = response.headers.get("set-cookie") || "";
  const contentType = response.headers.get("content-type") || "";
  return {
    status: response.status,
    body: contentType.includes("application/json")
      ? (text ? JSON.parse(text) : {})
      : text,
    setCookie,
    location: response.headers.get("location") || "",
    cookie: setCookie ? setCookie.split(";")[0] : ""
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withMockGoogleCalendar(port, run) {
  const idToken = createFakeJwt({ email: "meet-owner@example.com" });
  const server = http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url, `http://127.0.0.1:${port}`);

    if (req.method === "GET" && requestUrl.pathname === "/o/oauth2/v2/auth") {
      const redirectUri = requestUrl.searchParams.get("redirect_uri");
      const state = requestUrl.searchParams.get("state");
      const location = `${redirectUri}?code=google-auth-code&state=${encodeURIComponent(state || "")}`;
      res.writeHead(302, { Location: location });
      res.end();
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/token") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const params = new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
      const grantType = params.get("grant_type");
      const payload = grantType === "refresh_token"
        ? {
            access_token: "google-access-token-refreshed",
            token_type: "Bearer",
            expires_in: 3600,
            scope: "openid email https://www.googleapis.com/auth/calendar.readonly"
          }
        : {
            access_token: "google-access-token",
            refresh_token: "google-refresh-token",
            token_type: "Bearer",
            expires_in: 3600,
            scope: "openid email https://www.googleapis.com/auth/calendar.readonly",
            id_token: idToken
          };
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(payload));
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/calendar/v3/calendars/primary/events") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        items: [
          {
            id: "event-meet-1",
            summary: "Seguimiento con directora",
            description: "Revisar metodología y cerrar próximos pasos.",
            hangoutLink: "https://meet.google.com/abc-defg-hij",
            organizer: { email: "meet-owner@example.com", displayName: "Mario" },
            attendees: [
              { email: "director@example.com", displayName: "Directora" },
              { email: "meet-owner@example.com", displayName: "Mario" }
            ],
            start: { dateTime: "2026-05-20T16:00:00+02:00" }
          }
        ]
      }));
      return;
    }

    res.writeHead(404);
    res.end("not found");
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });

  try {
    await run({
      authUrl: `http://127.0.0.1:${port}/o/oauth2/v2/auth`,
      tokenUrl: `http://127.0.0.1:${port}/token`,
      calendarBaseUrl: `http://127.0.0.1:${port}/calendar/v3`
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function createFakeJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.signature`;
}

async function withMockOpenAI(port, run) {
  const requests = [];
  const server = http.createServer(async (req, res) => {
    if (req.method !== "POST" || req.url !== "/v1/responses") {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    requests.push(body);
    const isToolReturn = Boolean(body.previous_response_id);
    const lastInput = Array.isArray(body.input) ? body.input[body.input.length - 1] : null;
    const messageText = typeof lastInput?.content === "string"
      ? lastInput.content
      : Array.isArray(lastInput?.content)
        ? lastInput.content.map((item) => String(item?.text || item || "")).join(" ")
        : "";
    const normalizedMessage = String(messageText || "").toLowerCase();
    const payload = isToolReturn
      ? {
          id: "resp-2",
          model: "gpt-5.4-mini",
          output_text: normalizedMessage.includes("cierra la reunión") || normalizedMessage.includes("cierra la reunion")
            ? "Te dejo una vista previa para cerrar la reunión y que la confirmes."
            : "Te dejo una vista previa para crear la tarea y que la confirmes.",
          output: []
        }
      : {
          id: "resp-1",
          model: "gpt-5.4-mini",
          output: normalizedMessage.includes("cierra la reunión") || normalizedMessage.includes("cierra la reunion")
            ? [
                {
                  type: "function_call",
                  id: "call-1",
                  call_id: "call-1",
                  name: "update_meeting_closure",
                  arguments: JSON.stringify({
                    date: "2026-05-11",
                    time: "10:30",
                    summary: "Se cerró una versión más clara del foco metodológico y quedó definido el siguiente entregable.",
                    decisions: "Justificar mejor los criterios de muestra.\nCerrar una versión más explícita del apartado 2.2.",
                    tasks: "Reescribir 2.2.\nEnviar borrador el 2026-05-13.",
                    next: "2026-05-13"
                  })
                }
              ]
            : [
                {
                  type: "function_call",
                  id: "call-1",
                  call_id: "call-1",
                  name: "create_task",
                  arguments: JSON.stringify({
                    title: "Enviar borrador del capítulo 1",
                    due: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
                    area: "Capítulos",
                    status: "week",
                    effort: "45 min",
                    impact: "Alto"
                  })
                }
              ]
        };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });

  try {
    await run(`http://127.0.0.1:${port}/v1/responses`, requests);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
