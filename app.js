const STORAGE_KEY = "doctoral-os-state-v1";
const TOKEN_KEY = "doctoral-os-token-v1";
const API_ENABLED = window.location.protocol === "http:" || window.location.protocol === "https:";
const DEFAULT_CHECKLIST_ITEMS = [
  "Objetivo del capitulo explicito",
  "Argumento central defendible",
  "Secciones ordenadas de forma logica",
  "Cada afirmacion fuerte tiene fuente o apoyo",
  "Conceptos clave definidos antes de usarse",
  "Transiciones entre secciones claras",
  "Conclusion responde al objetivo",
  "Pendientes convertidos en tareas"
];
const V1_VIEWS = ["dashboard", "chapters", "literature", "planner", "reviews", "writing"];

const icons = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 13h6V4H4v9Z"/><path d="M14 20h6V4h-6v16Z"/><path d="M4 20h6v-3H4v3Z"/></svg>',
  chapters: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M6 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M8 8h8"/><path d="M8 12h6"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"/><path d="M4 5.5A2.5 2.5 0 0 0 6.5 8H20"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M7 3v4"/><path d="M17 3v4"/><path d="M4 8h16"/><path d="M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"/></svg>',
  meeting: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M7 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M17 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M2 21a5 5 0 0 1 10 0"/><path d="M14 21a4 4 0 0 1 8 0"/></svg>',
  review: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M5 4h11l3 3v13H5V4Z"/><path d="M16 4v4h4"/><path d="M8 12h8"/><path d="M8 16h5"/><path d="m14 19 2 2 4-5"/></svg>',
  writing: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 20h16"/><path d="M6 16 17.5 4.5a2.1 2.1 0 0 1 3 3L9 19l-4 1 1-4Z"/></svg>',
  print: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M7 8V3h10v5"/><path d="M7 17H5a2 2 0 0 1-2-2v-5h18v5a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7v-7Z"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 21h16"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M4 3h16"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M5 3h12l2 2v16H5V3Z"/><path d="M8 3v6h8"/><path d="M8 21v-7h8v7"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="m5 13 4 4L19 7"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 14h10l1-14"/><path d="M9 7V4h6v3"/></svg>'
};

const viewTitles = {
  dashboard: "Panel",
  chapters: "Capitulos",
  literature: "Lecturas",
  planner: "Plan semanal",
  reviews: "Reuniones y revision",
  writing: "Escritura",
};

const defaultState = {
  activeView: "dashboard",
  editorChapterId: "",
  literatureFilter: "",
  project: {
    name: "Mi tesis doctoral",
    candidate: "Doctorando/a",
    program: "",
    university: "",
    mode: "Monografica",
    phase: "Organizando el trabajo",
    writingTarget: 65000,
    question: "",
    contribution: "",
    scope: ""
  },
  chapters: [],
  readings: [],
  tasks: [],
  meetings: [],
  reviewComments: [],
  writingLog: []
};

let state = loadState();
let auth = {
  token: localStorage.getItem(TOKEN_KEY) || "",
  user: null,
  status: API_ENABLED ? "local" : "file",
  lastSync: ""
};
let syncTimer = null;

const screen = document.querySelector("#screen");
const viewTitle = document.querySelector("#viewTitle");
const sidebarProgress = document.querySelector("#sidebarProgress");
const sidebarDue = document.querySelector("#sidebarDue");
const toast = document.querySelector("#toast");
const syncStatus = document.querySelector("#syncStatus");
const authButton = document.querySelector("#authButton");
const authLabel = document.querySelector("#authLabel");
const logoutButton = document.querySelector("#logoutButton");
const authModal = document.querySelector("#authModal");

init();

function init() {
  hydrateIcons();
  document.querySelector("#mainNav").addEventListener("click", handleNavigation);
  document.querySelector(".topbar-actions").addEventListener("click", handleTopbarAction);
  document.querySelector("#importFile").addEventListener("change", importData);
  authModal.addEventListener("click", handleAuthModalClick);
  authModal.addEventListener("submit", handleAuthSubmit);
  screen.addEventListener("click", handleScreenClick);
  screen.addEventListener("submit", handleFormSubmit);
  screen.addEventListener("input", handleScreenInput);
  render();
  updateAuthUI();
  restoreSession();
}

function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((node) => {
    const iconName = node.dataset.icon;
    if (icons[iconName]) node.innerHTML = icons[iconName];
  });
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ensureStateShape(structuredClone(defaultState));
    return ensureStateShape(deepMerge(structuredClone(defaultState), JSON.parse(raw)));
  } catch (error) {
    console.warn("No se pudo cargar el estado", error);
    return ensureStateShape(structuredClone(defaultState));
  }
}

function ensureStateShape(target) {
  target.chapters = Array.isArray(target.chapters) ? target.chapters : [];
  target.readings = Array.isArray(target.readings) ? target.readings : [];
  target.tasks = Array.isArray(target.tasks) ? target.tasks : [];
  target.meetings = Array.isArray(target.meetings) ? target.meetings : [];
  target.reviewComments = Array.isArray(target.reviewComments) ? target.reviewComments : [];
  target.writingLog = Array.isArray(target.writingLog) ? target.writingLog : [];
  delete target.phases;
  delete target.risks;
  delete target.evidence;
  delete target.aiLog;
  delete target.defenseMinutes;
  if (target.project) {
    delete target.project.defenseDate;
    delete target.project.ethics;
  }

  target.chapters.forEach((chapter) => normalizeChapter(chapter));

  if (!target.editorChapterId || !target.chapters.some((chapter) => chapter.id === target.editorChapterId)) {
    target.editorChapterId = target.chapters[0]?.id || "";
  }

  if (!V1_VIEWS.includes(target.activeView)) {
    target.activeView = "dashboard";
  }

  return target;
}

function createFreshState(user = {}) {
  const name = user.name || "Doctorando/a";
  return ensureStateShape({
    activeView: "dashboard",
    editorChapterId: "",
    literatureFilter: "",
    project: {
      name: "Mi tesis doctoral",
      candidate: name,
      program: "",
      university: "",
      mode: "Monografica",
      phase: "Organizando el trabajo",
      writingTarget: 65000,
      question: "",
      contribution: "",
      scope: ""
    },
    chapters: [],
    readings: [],
    tasks: [],
    meetings: [],
    reviewComments: [],
    writingLog: []
  });
}

function normalizeChapter(chapter) {
  chapter.sections = Array.isArray(chapter.sections) && chapter.sections.length
    ? chapter.sections
    : [createSectionFromChapter(chapter)];
  chapter.notes = Array.isArray(chapter.notes) ? chapter.notes : [];
  chapter.checklist = Array.isArray(chapter.checklist) && chapter.checklist.length
    ? chapter.checklist
    : createDefaultChecklist(chapter.progress);
  chapter.editorUpdatedAt = chapter.editorUpdatedAt || new Date().toISOString();
  return chapter;
}

function createSectionFromChapter(chapter) {
  return {
    id: createId("sec"),
    title: "Texto base",
    goal: chapter.goal || "Objetivo de la seccion pendiente.",
    status: chapter.status || "Borrador",
    words: Number(chapter.words || 0),
    content: ""
  };
}

function createDefaultChecklist(progress = 0) {
  const doneUntil = Math.round((Number(progress || 0) / 100) * DEFAULT_CHECKLIST_ITEMS.length);
  return DEFAULT_CHECKLIST_ITEMS.map((label, index) => ({
    id: createId("qc"),
    label,
    done: index < doneUntil
  }));
}

function createChapterScaffold(data) {
  const title = data.title || "Nuevo capitulo";
  return normalizeChapter({
    id: createId("ch"),
    title,
    goal: data.goal || "Definir objetivo del capitulo.",
    argument: data.argument || "Argumento pendiente de precisar.",
    status: data.status || "Esquema",
    progress: Number(data.progress || 0),
    words: Number(data.words || 0),
    target: Number(data.target || 8000),
    due: data.due || "",
    tasks: splitLines(data.tasks),
    sections: [
      {
        id: createId("sec"),
        title: "1. Planteamiento",
        goal: data.goal || "Situar el objetivo del capitulo.",
        status: data.status || "Esquema",
        words: Number(data.words || 0),
        content: ""
      }
    ],
    notes: [],
    checklist: createDefaultChecklist(Number(data.progress || 0))
  });
}

function deepMerge(base, saved) {
  Object.keys(saved || {}).forEach((key) => {
    if (Array.isArray(saved[key])) {
      base[key] = saved[key];
    } else if (saved[key] && typeof saved[key] === "object" && base[key]) {
      base[key] = deepMerge(base[key], saved[key]);
    } else {
      base[key] = saved[key];
    }
  });
  return base;
}

function saveState(message = "Guardado", options = {}) {
  ensureStateShape(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateSidebar();
  if (!options.skipSync) scheduleSync();
  if (message) showToast(message);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function updateAuthUI() {
  if (!syncStatus || !authButton) return;

  if (!API_ENABLED) {
    syncStatus.textContent = "Archivo local";
    syncStatus.title = "Abre la app desde el servidor local para usar cuentas y sincronizacion.";
    authLabel.textContent = "Sin backend";
    logoutButton.hidden = true;
    return;
  }

  if (auth.user) {
    const label = auth.status === "synced" && auth.lastSync ? `Sync ${auth.lastSync}` : auth.statusLabel || "Sincronizando";
    syncStatus.textContent = label;
    syncStatus.title = "Pulsa para sincronizar ahora.";
    authLabel.textContent = auth.user.name || auth.user.email;
    logoutButton.hidden = false;
    return;
  }

  syncStatus.textContent = auth.status === "offline" ? "Backend offline" : "Local";
  syncStatus.title = "Inicia sesion para sincronizar entre dispositivos.";
  authLabel.textContent = "Cuenta";
  logoutButton.hidden = true;
}

function openAuthModal() {
  if (!API_ENABLED) {
    showToast("Abre la app desde http://localhost para usar cuentas");
    return;
  }
  authModal.hidden = false;
  hydrateIcons(authModal);
  authModal.querySelector("input")?.focus();
}

function closeAuthModal() {
  authModal.hidden = true;
}

function handleAuthModalClick(event) {
  if (event.target === authModal || event.target.closest("[data-action='auth-close']")) {
    closeAuthModal();
  }
}

async function handleAuthSubmit(event) {
  const form = event.target;
  if (!form.matches("[data-auth-form]")) return;
  event.preventDefault();

  const mode = form.dataset.authForm;
  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    setAuthStatus("Conectando");
    const response = await fetch(`/api/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo iniciar sesion");

    applySession(result);
    if (result.state && Object.keys(result.state).length) {
      state = ensureStateShape(deepMerge(structuredClone(defaultState), result.state));
      saveState("", { skipSync: true });
    } else if (mode === "register" || result.isNewUser) {
      state = createFreshState(result.user);
      saveState("", { skipSync: true });
      await syncNow(false);
    } else {
      state = createFreshState(result.user);
      saveState("", { skipSync: true });
      await syncNow(false);
    }

    closeAuthModal();
    form.reset();
    showToast("Cuenta sincronizada");
    render();
  } catch (error) {
    setAuthStatus("Error");
    showToast(error.message || "No se pudo conectar");
  }
}

async function restoreSession() {
  if (!API_ENABLED || !auth.token) {
    updateAuthUI();
    return;
  }

  try {
    setAuthStatus("Comprobando");
    const response = await fetch("/api/me", {
      headers: authHeaders()
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Sesion no valida");

    applySession(result);
    if (result.state && Object.keys(result.state).length) {
      state = ensureStateShape(deepMerge(structuredClone(defaultState), result.state));
      saveState("", { skipSync: true });
      render();
    } else {
      state = createFreshState(result.user);
      saveState("", { skipSync: true });
      await syncNow(false);
      render();
    }
  } catch (error) {
    localStorage.removeItem(TOKEN_KEY);
    auth = { ...auth, token: "", user: null, status: "offline", statusLabel: "Backend offline" };
    updateAuthUI();
  }
}

function applySession(result) {
  auth.token = result.token || auth.token;
  auth.user = result.user || null;
  auth.status = "synced";
  auth.lastSync = shortTime();
  auth.statusLabel = "Sincronizado";
  if (auth.token) localStorage.setItem(TOKEN_KEY, auth.token);
  updateAuthUI();
}

async function logout() {
  if (auth.token && API_ENABLED) {
    try {
      await fetch("/api/logout", { method: "POST", headers: authHeaders() });
    } catch (error) {
      // La sesion local se cierra igualmente.
    }
  }
  localStorage.removeItem(TOKEN_KEY);
  auth = { token: "", user: null, status: "local", lastSync: "" };
  updateAuthUI();
  showToast("Sesion cerrada");
}

function scheduleSync() {
  if (!API_ENABLED || !auth.token || !auth.user) {
    updateAuthUI();
    return;
  }

  auth.status = "pending";
  auth.statusLabel = "Pendiente";
  updateAuthUI();
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => syncNow(false), 700);
}

async function syncNow(showMessage = true) {
  if (!API_ENABLED) {
    showToast("Sin backend: abre la app desde el servidor local");
    return;
  }

  if (!auth.token || !auth.user) {
    openAuthModal();
    return;
  }

  try {
    setAuthStatus("Guardando");
    const response = await fetch("/api/state", {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ state })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo sincronizar");

    auth.status = "synced";
    auth.lastSync = shortTime();
    auth.statusLabel = "Sincronizado";
    updateAuthUI();
    if (showMessage) showToast("Sincronizado");
  } catch (error) {
    auth.status = "offline";
    auth.statusLabel = "Error sync";
    updateAuthUI();
    if (showMessage) showToast(error.message || "Sincronizacion fallida");
  }
}

function setAuthStatus(label) {
  auth.statusLabel = label;
  updateAuthUI();
}

function authHeaders() {
  return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
}

function shortTime() {
  return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function handleNavigation(event) {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  state.activeView = button.dataset.view;
  saveState("");
  render();
}

function handleTopbarAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "print") window.print();
  if (action === "export") exportData();
  if (action === "auth-open") openAuthModal();
  if (action === "logout") logout();
  if (action === "sync-now") syncNow(true);
}

function handleScreenClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  const id = target.dataset.id;

  if (action === "go") {
    state.activeView = target.dataset.view;
    saveState("");
    render();
    return;
  }

  if (action === "chapter-status") {
    updateChapterStatus(id, target.dataset.value);
  }

  if (action === "delete-chapter") {
    state.chapters = state.chapters.filter((chapter) => chapter.id !== id);
    if (state.editorChapterId === id) state.editorChapterId = state.chapters[0]?.id || "";
    saveState("Capitulo eliminado");
    render();
  }

  if (action === "select-chapter") {
    state.editorChapterId = id;
    saveState("");
    render();
  }

  if (action === "add-section") {
    const chapter = state.chapters.find((item) => item.id === id);
    if (chapter) {
      chapter.sections.push({
        id: createId("sec"),
        title: `Seccion ${chapter.sections.length + 1}`,
        goal: "Definir funcion de esta seccion.",
        status: "Esquema",
        words: 0,
        content: ""
      });
      chapter.editorUpdatedAt = new Date().toISOString();
    }
    saveState("Seccion anadida");
    render();
  }

  if (action === "delete-section") {
    const chapter = state.chapters.find((item) => item.id === target.dataset.chapterId);
    if (chapter && chapter.sections.length > 1) {
      chapter.sections = chapter.sections.filter((section) => section.id !== id);
      recalcChapterWords(chapter);
      chapter.editorUpdatedAt = new Date().toISOString();
    }
    saveState("Seccion eliminada");
    render();
  }

  if (action === "toggle-check") {
    const chapter = state.chapters.find((item) => item.id === target.dataset.chapterId);
    const check = chapter?.checklist.find((item) => item.id === id);
    if (check) {
      check.done = target.checked;
      chapter.progress = qualityProgress(chapter);
      chapter.editorUpdatedAt = new Date().toISOString();
    }
    saveState("Checklist actualizado");
    render();
  }

  if (action === "delete-note") {
    const chapter = state.chapters.find((item) => item.id === target.dataset.chapterId);
    if (chapter) {
      chapter.notes = chapter.notes.filter((note) => note.id !== id);
      chapter.editorUpdatedAt = new Date().toISOString();
    }
    saveState("Nota eliminada");
    render();
  }

  if (action === "delete-reading") {
    state.readings = state.readings.filter((reading) => reading.id !== id);
    saveState("Lectura eliminada");
    render();
  }

  if (action === "task-status") {
    const task = state.tasks.find((item) => item.id === id);
    if (task) task.status = target.dataset.value;
    saveState("Tarea actualizada");
    render();
  }

  if (action === "delete-task") {
    state.tasks = state.tasks.filter((task) => task.id !== id);
    saveState("Tarea eliminada");
    render();
  }

  if (action === "delete-meeting") {
    state.meetings = state.meetings.filter((meeting) => meeting.id !== id);
    saveState("Reunion eliminada");
    render();
  }

  if (action === "comment-status") {
    const comment = state.reviewComments.find((item) => item.id === id);
    if (comment) comment.status = target.dataset.value;
    saveState("Comentario actualizado");
    render();
  }

  if (action === "comment-to-task") {
    const comment = state.reviewComments.find((item) => item.id === id);
    if (comment) {
      state.tasks.push({
        id: createId("tk"),
        title: `Resolver comentario: ${comment.chapter}`,
        area: "Revision",
        status: "week",
        due: comment.due || "",
        effort: comment.priority === "Alta" ? "90 min" : "45 min",
        impact: comment.priority === "Alta" ? "Alto" : "Medio"
      });
    }
    saveState("Comentario convertido en tarea");
    render();
  }

  if (action === "delete-comment") {
    state.reviewComments = state.reviewComments.filter((comment) => comment.id !== id);
    saveState("Comentario eliminado");
    render();
  }

  if (action === "delete-writing") {
    state.writingLog = state.writingLog.filter((entry) => entry.id !== id);
    saveState("Sesion eliminada");
    render();
  }
}

function handleFormSubmit(event) {
  const form = event.target;
  if (!form.matches("form[data-form]")) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const formType = form.dataset.form;

  if (formType === "project") {
    state.project = { ...state.project, ...data };
    state.project.writingTarget = Number(data.writingTarget || state.project.writingTarget);
    saveState("Proyecto actualizado");
    render();
  }

  if (formType === "chapter") {
    const chapter = createChapterScaffold(data);
    state.chapters.push(chapter);
    state.editorChapterId = chapter.id;
    saveState("Capitulo creado");
    form.reset();
    render();
  }

  if (formType === "chapter-editor") {
    const chapter = state.chapters.find((item) => item.id === form.dataset.chapterId);
    if (chapter) {
      chapter.title = data.title || chapter.title;
      chapter.goal = data.goal || "";
      chapter.argument = data.argument || "";
      chapter.status = data.status || "Borrador";
      chapter.target = Number(data.target || 0);
      chapter.due = data.due || "";
      chapter.tasks = splitLines(data.tasks);
      chapter.sections = [...form.querySelectorAll("[data-section-id]")].map((sectionNode) => {
        const sectionId = sectionNode.dataset.sectionId;
        return {
          id: sectionId,
          title: sectionNode.querySelector(`[name="sectionTitle-${sectionId}"]`)?.value || "Seccion",
          goal: sectionNode.querySelector(`[name="sectionGoal-${sectionId}"]`)?.value || "",
          status: sectionNode.querySelector(`[name="sectionStatus-${sectionId}"]`)?.value || "Borrador",
          words: Number(sectionNode.querySelector(`[name="sectionWords-${sectionId}"]`)?.value || 0),
          content: sectionNode.querySelector(`[name="sectionContent-${sectionId}"]`)?.value || ""
        };
      });
      recalcChapterWords(chapter);
      chapter.progress = qualityProgress(chapter);
      chapter.editorUpdatedAt = new Date().toISOString();
    }
    saveState("Capitulo guardado");
    render();
  }

  if (formType === "chapter-note") {
    const chapter = state.chapters.find((item) => item.id === form.dataset.chapterId);
    if (chapter) {
      chapter.notes.unshift({
        id: createId("nt"),
        title: data.title || "Nota",
        type: data.type || "Idea",
        date: data.date || todayISO(),
        text: data.text || ""
      });
      chapter.editorUpdatedAt = new Date().toISOString();
    }
    saveState("Nota anadida");
    form.reset();
    render();
  }

  if (formType === "reading") {
    state.readings.push({
      id: createId("rd"),
      title: data.title || "Lectura sin titulo",
      authors: data.authors || "Autor pendiente",
      year: data.year || "",
      type: data.type || "Articulo",
      status: data.status || "Pendiente",
      chapter: data.chapter || "Sin capitulo",
      use: data.use || "",
      doi: data.doi || ""
    });
    saveState("Lectura anadida");
    form.reset();
    render();
  }

  if (formType === "task") {
    state.tasks.push({
      id: createId("tk"),
      title: data.title || "Nueva tarea",
      area: data.area || "General",
      status: data.status || "week",
      due: data.due || "",
      effort: data.effort || "30 min",
      impact: data.impact || "Medio"
    });
    saveState("Tarea creada");
    form.reset();
    render();
  }

  if (formType === "meeting") {
    state.meetings.unshift({
      id: createId("mt"),
      date: data.date || new Date().toISOString().slice(0, 10),
      type: data.type || "Direccion",
      attendees: data.attendees || "",
      agenda: data.agenda || "",
      decisions: data.decisions || "",
      tasks: data.tasks || "",
      next: data.next || ""
    });
    saveState("Reunion guardada");
    form.reset();
    render();
  }

  if (formType === "comment") {
    state.reviewComments.unshift({
      id: createId("rv"),
      chapter: data.chapter || "Sin capitulo",
      source: data.source || "Direccion",
      comment: data.comment || "Comentario pendiente de concretar.",
      response: data.response || "Definir respuesta y criterio de cierre.",
      status: data.status || "Pendiente",
      priority: data.priority || "Media",
      due: data.due || ""
    });
    saveState("Comentario registrado");
    form.reset();
    render();
  }

  if (formType === "writing") {
    const words = Number(data.words || 0);
    state.writingLog.unshift({
      id: createId("wl"),
      date: data.date || todayISO(),
      chapter: data.chapter || "Sin capitulo",
      words,
      minutes: Number(data.minutes || 0),
      mood: data.mood || "Neutral",
      note: data.note || ""
    });
    const chapter = state.chapters.find((item) => item.title === data.chapter);
    if (chapter) chapter.words = Number(chapter.words || 0) + words;
    saveState("Sesion de escritura guardada");
    form.reset();
    render();
  }
}

function handleScreenInput(event) {
  if (event.target.matches("[data-literature-filter]")) {
    const cursor = event.target.selectionStart;
    state.literatureFilter = event.target.value;
    renderLiterature();
    const restored = screen.querySelector("[data-literature-filter]");
    if (restored) {
      restored.focus();
      restored.setSelectionRange(cursor, cursor);
    }
  }

}

function render() {
  if (!V1_VIEWS.includes(state.activeView)) {
    state.activeView = "dashboard";
  }
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === state.activeView);
  });
  viewTitle.textContent = viewTitles[state.activeView] || "Panel";
  updateSidebar();

  const renderers = {
    dashboard: renderDashboard,
    chapters: renderChapters,
    literature: renderLiterature,
    planner: renderPlanner,
    reviews: renderReviews,
    writing: renderWriting
  };

  (renderers[state.activeView] || renderers.dashboard)();
  hydrateIcons(screen);
  screen.focus({ preventScroll: true });
}

function updateSidebar() {
  sidebarProgress.textContent = `${overallProgress()}%`;
  sidebarDue.textContent = nextDueLabel();
}

function renderDashboard() {
  const totalWords = state.chapters.reduce((sum, chapter) => sum + Number(chapter.words || 0), 0);
  const targetWords = Number(state.project.writingTarget || 0);
  const nextTask = [...state.tasks].sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"))[0];
  const readingLinked = state.readings.filter((item) => item.chapter && item.chapter !== "Sin capitulo").length;
  const pendingComments = state.reviewComments.filter((item) => item.status !== "Resuelto").length;
  const wordsThisWeek = writingWordsLastDays(7);
  const hasStarted = state.chapters.length || state.tasks.length || state.meetings.length || state.reviewComments.length;

  screen.innerHTML = `
    <section class="hero-panel">
      <div class="panel project-summary">
        <div>
          <p class="eyebrow">V1 comercial minima &middot; foco en terminar</p>
          <h2>${escapeHtml(state.project.name)}</h2>
          <p>${escapeHtml(state.project.question || "Convierte la tesis en capitulos, tareas semanales, reuniones utiles y sesiones de escritura medibles.")}</p>
          <div class="badge-row">
            <span class="badge teal">${escapeHtml(state.project.phase || "Organizando el trabajo")}</span>
            <span class="badge violet">${escapeHtml(state.project.mode)}</span>
            <span class="badge gold">Respaldo exportable</span>
          </div>
          <div class="summary-actions">
            <button class="button" data-action="go" data-view="chapters" type="button"><span data-icon="chapters"></span>Escribir capitulo</button>
            <button class="ghost-button" data-action="go" data-view="planner" type="button"><span data-icon="calendar"></span>Planificar semana</button>
            <button class="ghost-button" data-action="go" data-view="reviews" type="button"><span data-icon="review"></span>Resolver comentarios</button>
          </div>
        </div>
        <div class="progress-orbit" style="--value: ${overallProgress()}%">
          <div>
            <strong>${overallProgress()}%</strong>
            <span>global</span>
          </div>
        </div>
      </div>

      <div class="panel">
        <p class="card-kicker">Siguiente accion</p>
        <h2>${nextTask ? escapeHtml(nextTask.title) : hasStarted ? "Elige una tarea para esta semana" : "Crea tu primer capitulo"}</h2>
        <p>${nextTask ? `Vence: ${formatDate(nextTask.due)}. Impacto: ${escapeHtml(nextTask.impact)}.` : "La v1 funciona con una regla simple: capitulo activo, plan semanal y comentarios cerrados."}</p>
        <button class="ghost-button" data-action="go" data-view="${nextTask ? "planner" : "chapters"}" type="button"><span data-icon="arrow"></span>Continuar</button>
      </div>
    </section>

    <section class="metrics-grid" aria-label="Indicadores principales">
      ${metric("Palabras", `${formatNumber(totalWords)}`, `${Math.round((totalWords / targetWords) * 100) || 0}% del objetivo`)}
      ${metric("Capitulos", state.chapters.length, "estructurados en el editor")}
      ${metric("Plan", state.tasks.filter((task) => task.status !== "later").length, "tareas activas")}
      ${metric("Comentarios", pendingComments, "pendientes de respuesta")}
      ${metric("Semana", formatNumber(wordsThisWeek), "palabras registradas")}
      ${metric("Lecturas", `${readingLinked}/${state.readings.length}`, "vinculadas a capitulos")}
    </section>

    <section class="onboarding-strip">
      <article class="${state.chapters.length ? "is-done" : ""}">
        <span class="step-number">1</span>
        <h3>Crea tus capitulos</h3>
        <p>Define la estructura minima y el capitulo activo.</p>
        <button class="tiny-button" data-action="go" data-view="chapters" type="button">Abrir</button>
      </article>
      <article class="${state.tasks.length ? "is-done" : ""}">
        <span class="step-number">2</span>
        <h3>Planifica la semana</h3>
        <p>Convierte tesis en tareas pequenas con fecha.</p>
        <button class="tiny-button" data-action="go" data-view="planner" type="button">Abrir</button>
      </article>
      <article class="${state.reviewComments.length || state.meetings.length ? "is-done" : ""}">
        <span class="step-number">3</span>
        <h3>Cierra comentarios</h3>
        <p>Registra acuerdos y feedback accionable.</p>
        <button class="tiny-button" data-action="go" data-view="reviews" type="button">Abrir</button>
      </article>
    </section>

    <section class="grid-2">
      <article class="card">
        <div class="section-header">
          <div>
            <p class="card-kicker">Arquitectura de tesis</p>
            <h2>Capitulos y avance</h2>
          </div>
          <button class="tiny-button" data-action="go" data-view="chapters" type="button">Abrir</button>
        </div>
        <div class="card-list">
          ${state.chapters.slice(0, 4).map((chapter) => `
            <div class="list-row">
              <div class="list-row-header">
                <strong>${escapeHtml(chapter.title)}</strong>
                ${statusPill(chapter.status)}
              </div>
              <div class="progress-bar" aria-label="Progreso de ${escapeHtml(chapter.title)}">
                <span style="--width: ${clamp(chapter.progress, 0, 100)}%"></span>
              </div>
              <span class="muted">${formatNumber(chapter.words)} de ${formatNumber(chapter.target)} palabras &middot; entrega ${formatDate(chapter.due)}</span>
            </div>
          `).join("")}
        </div>
      </article>

      <article class="card">
        <div class="section-header">
          <div>
            <p class="card-kicker">Revision</p>
            <h2>Comentarios abiertos</h2>
          </div>
          <button class="tiny-button" data-action="go" data-view="reviews" type="button">Abrir</button>
        </div>
        ${state.reviewComments.slice(0, 3).map((comment) => `
          <div class="list-row">
            <div class="list-row-header">
              <strong>${escapeHtml(comment.chapter)}</strong>
              ${statusPill(comment.status)}
            </div>
            <p>${escapeHtml(comment.comment)}</p>
            <span class="muted">Limite: ${formatDate(comment.due)}</span>
          </div>
        `).join("") || emptyState("Sin comentarios todavia. Registra los proximos acuerdos de revision.")}
      </article>
    </section>
  `;
}

function renderChapters() {
  ensureStateShape(state);
  const activeChapter = state.chapters.find((chapter) => chapter.id === state.editorChapterId) || state.chapters[0];
  if (!activeChapter) {
    screen.innerHTML = `
      <section class="chapter-layout">
        <div class="empty-state">Crea el primer capitulo para activar el editor.</div>
        ${newChapterPanel()}
      </section>
    `;
    return;
  }

  const quality = qualityProgress(activeChapter);

  screen.innerHTML = `
    <section class="chapter-layout">
      <div>
        <div class="section-header">
          <div>
            <p class="eyebrow">Editor doctoral</p>
            <h2>${escapeHtml(activeChapter.title)}</h2>
            <p>Edita secciones, notas, tareas pendientes y checklist de calidad en un solo lugar.</p>
          </div>
          <button class="ghost-button" data-action="add-section" data-id="${activeChapter.id}" type="button"><span data-icon="plus"></span>Nueva seccion</button>
        </div>

        <div class="chapter-tabs" role="tablist" aria-label="Capitulos">
          ${state.chapters.map((chapter) => `
            <button class="chapter-tab ${chapter.id === activeChapter.id ? "is-active" : ""}" data-action="select-chapter" data-id="${chapter.id}" type="button">
              <strong>${escapeHtml(chapter.title)}</strong>
              <span>${formatNumber(chapter.words)} / ${formatNumber(chapter.target)} palabras</span>
            </button>
          `).join("")}
        </div>

        <form class="editor-panel" data-form="chapter-editor" data-chapter-id="${activeChapter.id}">
          <section class="editor-summary">
            <div class="progress-orbit editor-orbit" style="--value: ${quality}%">
              <div>
                <strong>${quality}%</strong>
                <span>calidad</span>
              </div>
            </div>
            <div class="editor-meta-grid">
              ${field("Titulo", "title", "input", activeChapter.title, true)}
              ${selectField("Estado", "status", ["Esquema", "Borrador", "En revision", "Aprobado"], activeChapter.status)}
              ${field("Objetivo", "goal", "textarea", activeChapter.goal, true)}
              ${field("Argumento central", "argument", "textarea", activeChapter.argument, true)}
              <div class="inline-fields">
                ${field("Objetivo palabras", "target", "number", activeChapter.target, true)}
                ${field("Fecha de entrega", "due", "date", activeChapter.due, true)}
              </div>
              ${field("Tareas, una por linea", "tasks", "textarea", (activeChapter.tasks || []).join("\n"), true)}
            </div>
          </section>

          <section class="editor-section-block">
            <div class="section-header">
              <div>
                <p class="card-kicker">Secciones</p>
                <h2>Texto estructurado</h2>
              </div>
            </div>
            <div class="section-editor-stack">
              ${activeChapter.sections.map((section, index) => `
                <article class="section-editor" data-section-id="${section.id}">
                  <div class="section-editor-head">
                    <span class="step-number">${index + 1}</span>
                    <div class="section-title-fields">
                      ${field(`Titulo seccion ${index + 1}`, `sectionTitle-${section.id}`, "input", section.title, true)}
                    </div>
                    <button class="tiny-button" data-action="delete-section" data-chapter-id="${activeChapter.id}" data-id="${section.id}" type="button"><span data-icon="trash"></span></button>
                  </div>
                  <div class="inline-fields">
                    ${selectField("Estado", `sectionStatus-${section.id}`, ["Esquema", "Borrador", "En revision", "Cerrada"], section.status)}
                    ${field("Palabras", `sectionWords-${section.id}`, "number", section.words, true)}
                  </div>
                  ${field("Funcion de la seccion", `sectionGoal-${section.id}`, "textarea", section.goal, true)}
                  ${field("Borrador / notas de texto", `sectionContent-${section.id}`, "textarea", section.content, true)}
                </article>
              `).join("")}
            </div>
          </section>

          <section class="editor-section-block">
            <div class="section-header">
              <div>
                <p class="card-kicker">Checklist</p>
                <h2>Calidad del capitulo</h2>
              </div>
            </div>
            <div class="checklist-grid">
              ${activeChapter.checklist.map((item) => `
                <label class="check-item">
                  <input data-action="toggle-check" data-chapter-id="${activeChapter.id}" data-id="${item.id}" type="checkbox" ${item.done ? "checked" : ""}>
                  <span>${escapeHtml(item.label)}</span>
                </label>
              `).join("")}
            </div>
          </section>

          <div class="chapter-controls editor-actions">
            <button class="button" type="submit"><span data-icon="save"></span>Guardar capitulo</button>
            <button class="ghost-button" data-action="chapter-status" data-id="${activeChapter.id}" data-value="En revision" type="button">Enviar a revision</button>
            <button class="ghost-button" data-action="chapter-status" data-id="${activeChapter.id}" data-value="Aprobado" type="button">Marcar aprobado</button>
            <button class="danger-button" data-action="delete-chapter" data-id="${activeChapter.id}" type="button"><span data-icon="trash"></span>Eliminar</button>
          </div>
        </form>

        <section class="notes-panel">
          <div class="section-header">
            <div>
              <p class="card-kicker">Notas internas</p>
              <h2>Decisiones, dudas y citas pendientes</h2>
            </div>
          </div>
          <div class="notes-grid">
            ${activeChapter.notes.map((note) => `
              <article class="note-card">
                <div class="list-row-header">
                  <div>
                    <strong>${escapeHtml(note.title)}</strong>
                    <div class="muted">${escapeHtml(note.type)} &middot; ${formatDate(note.date)}</div>
                  </div>
                  <button class="tiny-button" data-action="delete-note" data-chapter-id="${activeChapter.id}" data-id="${note.id}" type="button"><span data-icon="trash"></span></button>
                </div>
                <p>${escapeHtml(note.text)}</p>
              </article>
            `).join("") || emptyState("Sin notas todavia.")}
          </div>
        </section>
      </div>

      <aside class="side-stack">
        <div class="form-panel">
          <h2>Nueva nota</h2>
          <form class="form-grid" data-form="chapter-note" data-chapter-id="${activeChapter.id}">
            ${field("Titulo", "title", "input", "Decision de capitulo")}
            <div class="inline-fields">
              ${selectField("Tipo", "type", ["Idea", "Duda", "Decision", "Cita pendiente", "Feedback"])}
              ${field("Fecha", "date", "date", todayISO(), true)}
            </div>
            ${field("Texto", "text", "textarea", "Anota la decision, duda o cita pendiente")}
            <button class="button" type="submit"><span data-icon="plus"></span>Anadir nota</button>
          </form>
        </div>

        ${newChapterPanel()}
      </aside>
    </section>
  `;
}

function newChapterPanel() {
  return `
    <div class="form-panel">
      <h2>Nuevo capitulo</h2>
      <form class="form-grid" data-form="chapter">
        ${field("Titulo", "title", "input", "Discusion")}
        ${field("Objetivo", "goal", "textarea", "Que debe lograr este capitulo")}
        ${field("Argumento central", "argument", "textarea", "La idea que sostiene el capitulo")}
        <div class="inline-fields">
          ${selectField("Estado", "status", ["Esquema", "Borrador", "En revision", "Aprobado"])}
          ${field("Progreso", "progress", "number", "0")}
        </div>
        <div class="inline-fields">
          ${field("Palabras actuales", "words", "number", "0")}
          ${field("Objetivo palabras", "target", "number", "8000")}
        </div>
        ${field("Fecha de entrega", "due", "date", "")}
        ${field("Tareas, una por linea", "tasks", "textarea", "Revisar citas\nAnadir tabla")}
        <button class="button" type="submit"><span data-icon="plus"></span>Anadir capitulo</button>
      </form>
    </div>
  `;
}

function renderLiterature() {
  const term = (state.literatureFilter || "").trim().toLowerCase();
  const filtered = state.readings.filter((reading) => {
    const haystack = `${reading.title} ${reading.authors} ${reading.chapter} ${reading.status} ${reading.use}`.toLowerCase();
    return !term || haystack.includes(term);
  });

  screen.innerHTML = `
    <section class="literature-layout">
      <div>
        <div class="section-header">
          <div>
            <p class="eyebrow">Lecturas minimas</p>
            <h2>Fuentes vinculadas a capitulos</h2>
            <p>En la v1, las lecturas sirven para sostener capitulos concretos y mantener clara su utilidad en la tesis.</p>
          </div>
        </div>

        <div class="filter-row">
          <input data-literature-filter type="search" value="${escapeAttribute(state.literatureFilter || "")}" placeholder="Buscar por autor, capitulo o estado">
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Autor</th>
                <th>Ano</th>
                <th>Tema</th>
                <th>Uso en tesis</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map((reading) => `
                <tr>
                  <td><strong>${escapeHtml(reading.authors)}</strong><br>${escapeHtml(reading.title)}</td>
                  <td>${escapeHtml(reading.year)}</td>
                  <td>${escapeHtml(reading.chapter)}<br>${statusPill(reading.status)}</td>
                  <td>${escapeHtml(reading.use)}</td>
                  <td><button class="tiny-button" data-action="delete-reading" data-id="${reading.id}" type="button"><span data-icon="trash"></span></button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <aside class="side-stack">
        <div class="form-panel">
          <h2>Nueva ficha</h2>
          <form class="form-grid" data-form="reading">
            ${field("Titulo", "title", "input", "Articulo o libro")}
            ${field("Autores", "authors", "input", "Apellido, A.")}
            ${field("Ano", "year", "number", "2026")}
            <div class="inline-fields">
              ${selectField("Estado", "status", ["Pendiente", "Leyendo", "Leido", "Clave", "Descartado"])}
              ${chapterSelect("Capitulo", "chapter")}
            </div>
            ${field("Uso en mi tesis", "use", "textarea", "Donde lo citare y para que")}
            ${field("DOI / URL", "doi", "input", "10.xxxx/...")}
            <button class="button" type="submit"><span data-icon="plus"></span>Anadir lectura</button>
          </form>
        </div>
      </aside>
    </section>
  `;
  hydrateIcons(screen);
}

function renderPlanner() {
  const columns = [
    { id: "today", title: "Hoy" },
    { id: "week", title: "Esta semana" },
    { id: "later", title: "Despues" }
  ];

  screen.innerHTML = `
    <section class="section-header">
      <div>
        <p class="eyebrow">Trabajo sostenible</p>
        <h2>Plan semanal</h2>
        <p>Convierte capitulos, lecturas y reuniones en tareas pequenas con vencimiento e impacto claro.</p>
      </div>
    </section>

    <section class="kanban">
      ${columns.map((column) => {
        const tasks = state.tasks.filter((task) => task.status === column.id);
        return `
          <div class="kanban-column">
            <h3>${column.title}<span class="badge">${tasks.length}</span></h3>
            ${tasks.map((task) => taskCard(task)).join("") || emptyState("Sin tareas en esta columna.")}
          </div>
        `;
      }).join("")}
    </section>

    <section class="grid-2" style="margin-top: 18px;">
      <article class="form-panel">
        <h2>Nueva tarea</h2>
        <form class="form-grid" data-form="task">
          ${field("Tarea", "title", "input", "Escribir 500 palabras del marco teorico")}
          <div class="inline-fields">
            ${field("Area", "area", "input", "Capitulos")}
            ${selectField("Columna", "status", ["today", "week", "later"])}
          </div>
          <div class="inline-fields">
            ${field("Fecha", "due", "date", "")}
            ${field("Esfuerzo", "effort", "input", "45 min")}
          </div>
          ${selectField("Impacto", "impact", ["Alto", "Medio", "Bajo"])}
          <button class="button" type="submit"><span data-icon="plus"></span>Anadir tarea</button>
        </form>
      </article>
      <article class="card">
        <p class="card-kicker">Guia semanal</p>
        <h2>Una tesis avanza por entregables pequenos</h2>
        <p>Elige pocas tareas, asigna fecha y mueve lo que no quepa a "Despues".</p>
      </article>
    </section>
  `;
}

function renderReviews() {
  const columns = ["Pendiente", "En proceso", "Necesita aclaracion", "Resuelto"];
  const open = state.reviewComments.filter((comment) => comment.status !== "Resuelto").length;
  const high = state.reviewComments.filter((comment) => comment.priority === "Alta" && comment.status !== "Resuelto").length;
  const latest = state.meetings[0];

  screen.innerHTML = `
    <section class="review-layout">
      <div>
        <div class="section-header">
          <div>
            <p class="eyebrow">Reuniones y revision</p>
            <h2>Acuerdos, feedback y cierre</h2>
            <p>La v1 une reuniones y comentarios para que cada conversacion termine en tareas y decisiones visibles.</p>
          </div>
        </div>

        <section class="metrics-grid compact-metrics">
          ${metric("Abiertos", open, "comentarios sin resolver")}
          ${metric("Alta prioridad", high, "requieren respuesta pronta")}
          ${metric("Resueltos", state.reviewComments.filter((item) => item.status === "Resuelto").length, "comentarios cerrados")}
          ${metric("Reuniones", state.meetings.length, "actas registradas")}
        </section>

        ${latest ? `
          <article class="panel">
            <p class="card-kicker">Ultima reunion</p>
            <h2>${formatDate(latest.date)} &middot; ${escapeHtml(latest.type)}</h2>
            <p><strong>Decisiones:</strong> ${escapeHtml(latest.decisions)}</p>
            <p><strong>Tareas:</strong> ${escapeHtml(latest.tasks)}</p>
            <div class="generated-box">${escapeHtml(generateMeetingEmail(latest))}</div>
          </article>
        ` : emptyState("Registra tu proxima reunion para convertir acuerdos en tareas.")}

        <section class="kanban review-board" style="margin-top: 18px;">
          ${columns.map((column) => {
            const comments = state.reviewComments.filter((comment) => comment.status === column);
            return `
              <div class="kanban-column">
                <h3>${escapeHtml(column)}<span class="badge">${comments.length}</span></h3>
                ${comments.map((comment) => reviewCard(comment, columns)).join("") || emptyState("Sin comentarios.")}
              </div>
            `;
          }).join("")}
        </section>

        <section class="timeline-list" style="margin-top: 18px;">
          ${state.meetings.map((meeting) => `
            <article class="meeting-note">
              <div class="list-row-header">
                <div>
                  <strong>${formatDate(meeting.date)} &middot; ${escapeHtml(meeting.type)}</strong>
                  <div class="meeting-meta muted">${escapeHtml(meeting.attendees)} &middot; proxima ${formatDate(meeting.next)}</div>
                </div>
                <button class="tiny-button" data-action="delete-meeting" data-id="${meeting.id}" type="button"><span data-icon="trash"></span></button>
              </div>
              <p><strong>Agenda:</strong> ${escapeHtml(meeting.agenda)}</p>
              <p><strong>Decisiones:</strong> ${escapeHtml(meeting.decisions)}</p>
              <p><strong>Tareas:</strong> ${escapeHtml(meeting.tasks)}</p>
            </article>
          `).join("") || ""}
        </section>
      </div>

      <aside class="side-stack">
        <div class="form-panel">
          <h2>Nueva reunion</h2>
          <form class="form-grid" data-form="meeting">
            <div class="inline-fields">
              ${field("Fecha", "date", "date", new Date().toISOString().slice(0, 10), true)}
              ${selectField("Tipo", "type", ["Direccion", "Comite", "Grupo", "Revision interna"])}
            </div>
            ${field("Asistentes", "attendees", "input", "Director/a, codirector/a")}
            ${field("Agenda", "agenda", "textarea", "Temas a tratar")}
            ${field("Decisiones", "decisions", "textarea", "Acuerdos tomados")}
            ${field("Tareas", "tasks", "textarea", "Tareas y responsables")}
            ${field("Proxima reunion", "next", "date", "")}
            <button class="button" type="submit"><span data-icon="plus"></span>Guardar reunion</button>
          </form>
        </div>

        <div class="form-panel">
          <h2>Nuevo comentario</h2>
          <form class="form-grid" data-form="comment">
            <div class="inline-fields">
              ${chapterSelect("Capitulo", "chapter")}
              ${field("Fuente", "source", "input", "Director/a")}
            </div>
            ${field("Comentario recibido", "comment", "textarea", "Que hay que revisar")}
            ${field("Respuesta prevista", "response", "textarea", "Como se va a resolver")}
            <div class="inline-fields">
              ${selectField("Estado", "status", columns)}
              ${selectField("Prioridad", "priority", ["Alta", "Media", "Baja"])}
            </div>
            ${field("Fecha limite", "due", "date", "")}
            <button class="button" type="submit"><span data-icon="plus"></span>Registrar comentario</button>
          </form>
        </div>
      </aside>
    </section>
  `;
}

function renderWriting() {
  const totalWords = state.writingLog.reduce((sum, entry) => sum + Number(entry.words || 0), 0);
  const totalMinutes = state.writingLog.reduce((sum, entry) => sum + Number(entry.minutes || 0), 0);
  const last7 = writingWordsLastDays(7);
  const plan = generateWritingPlan();

  screen.innerHTML = `
    <section class="writing-layout">
      <div>
        <div class="section-header">
          <div>
            <p class="eyebrow">Continuidad de escritura</p>
            <h2>Bitacora de escritura</h2>
            <p>Registra sesiones reales, suma palabras al capitulo correspondiente y observa el ritmo semanal.</p>
          </div>
        </div>

        <section class="metrics-grid compact-metrics">
          ${metric("Total registrado", formatNumber(totalWords), "palabras en sesiones")}
          ${metric("Ultimos 7 dias", formatNumber(last7), "palabras recientes")}
          ${metric("Horas", Math.round(totalMinutes / 60), "registradas")}
          ${metric("Ritmo", `${writingPace()} p/h`, "palabras por hora")}
        </section>

        <article class="panel">
          <p class="card-kicker">Plan sugerido</p>
          <div class="generated-box">${escapeHtml(plan)}</div>
        </article>

        <section class="timeline-list" style="margin-top: 18px;">
          ${state.writingLog.map((entry) => `
            <article class="timeline-item">
              <div class="list-row-header">
                <div>
                  <strong>${formatDate(entry.date)} &middot; ${escapeHtml(entry.chapter)}</strong>
                  <div class="muted">${formatNumber(entry.words)} palabras en ${entry.minutes} min &middot; ${escapeHtml(entry.mood)}</div>
                </div>
                <button class="tiny-button" data-action="delete-writing" data-id="${entry.id}" type="button"><span data-icon="trash"></span></button>
              </div>
              <p>${escapeHtml(entry.note)}</p>
            </article>
          `).join("") || emptyState("Todavia no hay sesiones de escritura.")}
        </section>
      </div>

      <aside class="form-panel">
        <h2>Nueva sesion</h2>
        <form class="form-grid" data-form="writing">
          <div class="inline-fields">
            ${field("Fecha", "date", "date", todayISO(), true)}
            ${chapterSelect("Capitulo", "chapter")}
          </div>
          <div class="inline-fields">
            ${field("Palabras", "words", "number", "500")}
            ${field("Minutos", "minutes", "number", "60")}
          </div>
          ${selectField("Estado", "mood", ["Fluido", "Neutral", "Trabado", "Revision", "Lectura"])}
          ${field("Nota", "note", "textarea", "Que avance o decision salio de esta sesion")}
          <button class="button" type="submit"><span data-icon="plus"></span>Guardar sesion</button>
        </form>
      </aside>
    </section>
  `;
}

function metric(label, value, hint) {
  return `
    <article class="metric">
      <span class="metric-label">${label}</span>
      <strong class="metric-value">${value}</strong>
      <span class="metric-hint">${hint}</span>
    </article>
  `;
}

function taskCard(task) {
  const nextStatuses = [
    { id: "today", label: "Hoy" },
    { id: "week", label: "Semana" },
    { id: "later", label: "Despues" }
  ].filter((item) => item.id !== task.status);

  return `
    <article class="task-card">
      <div class="task-top">
        <strong>${escapeHtml(task.title)}</strong>
        <button class="tiny-button" data-action="delete-task" data-id="${task.id}" type="button"><span data-icon="trash"></span></button>
      </div>
      <div class="task-meta">
        <span>${escapeHtml(task.area)}</span>
        <span>${formatDate(task.due)}</span>
        <span>${escapeHtml(task.effort)}</span>
        <span>${escapeHtml(task.impact)}</span>
      </div>
      <div class="row-actions">
        ${nextStatuses.map((status) => `<button class="tiny-button" data-action="task-status" data-id="${task.id}" data-value="${status.id}" type="button">${status.label}</button>`).join("")}
      </div>
    </article>
  `;
}

function reviewCard(comment, statuses) {
  const nextStatuses = statuses.filter((status) => status !== comment.status);
  return `
    <article class="task-card">
      <div class="task-top">
        <div>
          <strong>${escapeHtml(comment.chapter)}</strong>
          <div class="task-meta">
            <span>${escapeHtml(comment.source)}</span>
            <span>${formatDate(comment.due)}</span>
            <span>${escapeHtml(comment.priority)}</span>
          </div>
        </div>
        <button class="tiny-button" data-action="delete-comment" data-id="${comment.id}" type="button"><span data-icon="trash"></span></button>
      </div>
      <p><strong>Comentario:</strong> ${escapeHtml(comment.comment)}</p>
      <p><strong>Respuesta:</strong> ${escapeHtml(comment.response)}</p>
      <div class="row-actions">
        ${nextStatuses.map((status) => `<button class="tiny-button" data-action="comment-status" data-id="${comment.id}" data-value="${escapeAttribute(status)}" type="button">${escapeHtml(status)}</button>`).join("")}
        <button class="tiny-button" data-action="comment-to-task" data-id="${comment.id}" type="button">Crear tarea</button>
      </div>
    </article>
  `;
}

function field(label, name, type, value, fill = false) {
  const safeValue = escapeAttribute(value ?? "");
  const textValue = fill ? escapeHtml(value ?? "") : "";
  const inputValue = fill ? safeValue : "";
  if (type === "textarea") {
    return `
      <div class="field">
        <label for="${name}">${label}</label>
        <textarea id="${name}" name="${name}" placeholder="${safeValue}">${textValue}</textarea>
      </div>
    `;
  }

  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" type="${type}" value="${inputValue}" placeholder="${safeValue}">
    </div>
  `;
}

function selectField(label, name, options, selected = options[0]) {
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <select id="${name}" name="${name}">
        ${options.map((option) => `<option value="${escapeAttribute(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
      </select>
    </div>
  `;
}

function chapterSelect(label, name) {
  const options = ["Sin capitulo", ...state.chapters.map((chapter) => chapter.title)];
  return selectField(label, name, options);
}

function emptyState(text) {
  return `<div class="empty-state">${escapeHtml(text)}</div>`;
}

function statusPill(status) {
  const normalized = String(status || "").toLowerCase();
  let className = "";
  if (normalized.includes("aprob") || normalized.includes("complet") || normalized.includes("leido") || normalized.includes("clave") || normalized.includes("resuelto") || normalized.includes("limpio") || normalized.includes("codificado") || normalized.includes("analizado")) className = "done";
  if (normalized.includes("revision") || normalized.includes("curso") || normalized.includes("leyendo") || normalized.includes("proceso")) className = "review";
  if (normalized.includes("borrador") || normalized.includes("esquema")) className = "draft";
  if (normalized.includes("pendiente") || normalized.includes("descartado") || normalized.includes("aclaracion")) className = "risk";
  return `<span class="status-pill ${className}">${escapeHtml(status)}</span>`;
}

function updateChapterStatus(id, status) {
  const chapter = state.chapters.find((item) => item.id === id);
  if (!chapter) return;
  chapter.status = status;
  if (status === "Aprobado") chapter.progress = Math.max(chapter.progress, 95);
  chapter.editorUpdatedAt = new Date().toISOString();
  saveState("Estado actualizado");
  render();
}

function recalcChapterWords(chapter) {
  chapter.words = chapter.sections.reduce((sum, section) => sum + Number(section.words || 0), 0);
  return chapter.words;
}

function qualityProgress(chapter) {
  if (!chapter?.checklist?.length) return Number(chapter?.progress || 0);
  const done = chapter.checklist.filter((item) => item.done).length;
  return Math.round((done / chapter.checklist.length) * 100);
}

function generateMeetingEmail(meeting) {
  return `Hola,\n\nDejo por escrito el resumen de la reunion del ${formatDate(meeting.date)}.\n\nAgenda:\n${meeting.agenda}\n\nDecisiones tomadas:\n${meeting.decisions}\n\nTareas acordadas:\n${meeting.tasks}\n\nProxima reunion: ${formatDate(meeting.next)}.\n\nGracias.`;
}

function generateWritingPlan() {
  const nextChapter = [...state.chapters]
    .filter((chapter) => Number(chapter.words || 0) < Number(chapter.target || 0))
    .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"))[0];

  if (!nextChapter) {
    return "Todos los capitulos registrados han alcanzado su objetivo de palabras. Dedica la semana a revision, citas y coherencia global.";
  }

  const remaining = Math.max(0, Number(nextChapter.target || 0) - Number(nextChapter.words || 0));
  const daily = Math.ceil(remaining / 10);
  return `Capitulo prioritario: ${nextChapter.title}
Palabras pendientes aproximadas: ${formatNumber(remaining)}
Plan de 10 sesiones: ${formatNumber(daily)} palabras por sesion
Primera sesion: escribir solo el parrafo puente que conecte objetivo, argumento y fuentes
Criterio de cierre: terminar con una decision visible, no con mas lecturas pendientes`;
}

function writingWordsLastDays(days) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  return state.writingLog
    .filter((entry) => {
      const date = new Date(`${entry.date}T00:00:00`);
      return date >= start && date <= now;
    })
    .reduce((sum, entry) => sum + Number(entry.words || 0), 0);
}

function writingPace() {
  const words = state.writingLog.reduce((sum, entry) => sum + Number(entry.words || 0), 0);
  const minutes = state.writingLog.reduce((sum, entry) => sum + Number(entry.minutes || 0), 0);
  if (!minutes) return 0;
  return Math.round(words / (minutes / 60));
}

function overallProgress() {
  const chapterProgress = average(state.chapters.map((chapter) => chapter.progress));
  return Math.round(chapterProgress);
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

function nextDueLabel() {
  const candidates = [
    ...state.tasks.map((task) => ({ label: task.title, due: task.due })),
    ...state.chapters.map((chapter) => ({ label: chapter.title, due: chapter.due })),
    ...state.meetings.map((meeting) => ({ label: "Reunion", due: meeting.next })),
    ...state.reviewComments.map((comment) => ({ label: comment.chapter, due: comment.due }))
  ].filter((item) => item.due);
  if (!candidates.length) return "-";
  const next = candidates.sort((a, b) => a.due.localeCompare(b.due))[0];
  return formatDate(next.due);
}

function exportData() {
  downloadText("doctoral-os-respaldo.json", JSON.stringify({ state, exportedAt: new Date().toISOString() }, null, 2), "application/json");
  showToast("Respaldo exportado");
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      state = ensureStateShape(deepMerge(structuredClone(defaultState), imported.state || imported));
      saveState("Datos importados");
      render();
    } catch (error) {
      showToast("No se pudo importar el archivo");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function downloadText(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatDate(value) {
  if (!value) return "-";
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("es-ES").format(Number(value || 0));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function splitLines(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}
