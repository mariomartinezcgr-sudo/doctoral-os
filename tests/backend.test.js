const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const BASE_PORT = 4297;

async function main() {
  await withServer(BASE_PORT, {}, async ({ request }) => {
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

    const logout = await request("/api/logout", {
      method: "POST",
      cookie: relogin.cookie
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
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  const setCookie = response.headers.get("set-cookie") || "";
  return {
    status: response.status,
    body: text ? JSON.parse(text) : {},
    setCookie,
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
