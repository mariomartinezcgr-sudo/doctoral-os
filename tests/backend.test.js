const assert = require("assert");
const fs = require("fs");
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

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
