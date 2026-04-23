const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const PORT = 4297;
const DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "doctoralos-test-"));
const BASE_URL = `http://127.0.0.1:${PORT}`;

const server = spawn(process.execPath, ["server.js"], {
  cwd: ROOT,
  env: { ...process.env, PORT: String(PORT), HOST: "127.0.0.1", DATA_DIR, NODE_NO_WARNINGS: "1" },
  stdio: ["ignore", "pipe", "pipe"]
});

let stderr = "";
server.stderr.on("data", (chunk) => {
  stderr += chunk.toString();
});

async function main() {
  await waitForHealth();

  const email = `test-${Date.now()}@example.com`;
  const register = await request("/api/register", {
    method: "POST",
    body: { email, password: "password123", name: "Test Doctorando" }
  });
  assert.equal(register.status, 201);
  assert.equal(register.body.isNewUser, true);
  assert.ok(register.body.token);

  const duplicate = await request("/api/register", {
    method: "POST",
    body: { email, password: "password123", name: "Duplicado" }
  });
  assert.equal(duplicate.status, 409);

  const state = {
    project: { name: "Tesis test", candidate: "Test Doctorando" },
    chapters: [{ id: "ch-test", title: "Introduccion", words: 1000, target: 5000 }]
  };
  const saved = await request("/api/state", {
    method: "PUT",
    token: register.body.token,
    body: { state }
  });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.ok, true);

  const login = await request("/api/login", {
    method: "POST",
    body: { email, password: "password123" }
  });
  assert.equal(login.status, 200);
  assert.equal(login.body.state.project.name, "Tesis test");

  const backup = await request("/api/backup", {
    method: "GET",
    token: login.body.token
  });
  assert.equal(backup.status, 200);
  assert.equal(backup.body.state.project.name, "Tesis test");

  const assistant = await request("/api/assistant", {
    method: "POST",
    token: login.body.token,
    body: { message: "Resumeme el progreso actual", state }
  });
  assert.equal(assistant.status, 503);

  const changed = await request("/api/change-password", {
    method: "POST",
    token: login.body.token,
    body: { currentPassword: "password123", newPassword: "password456" }
  });
  assert.equal(changed.status, 200);

  const relogin = await request("/api/login", {
    method: "POST",
    body: { email, password: "password456" }
  });
  assert.equal(relogin.status, 200);

  console.log("backend tests passed");
}

async function waitForHealth() {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) return;
    } catch (error) {
      await delay(120);
    }
  }
  throw new Error(`Server did not start. stderr: ${stderr}`);
}

async function request(pathname, options) {
  const headers = {};
  if (options.body) headers["Content-Type"] = "application/json";
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await fetch(`${BASE_URL}${pathname}`, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  return {
    status: response.status,
    body: text ? JSON.parse(text) : {}
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    server.kill();
    fs.rmSync(DATA_DIR, { recursive: true, force: true });
  });
