const STORAGE_KEY = "doctoral-os-state-v1";
const DEMO_STORAGE_KEY = "doctoral-os-demo-state-v1";
const SNAPSHOT_STORAGE_KEY = "doctoral-os-snapshots-v1";
const DEMO_SNAPSHOT_STORAGE_KEY = "doctoral-os-demo-snapshots-v1";
const SAFETY_META_STORAGE_KEY = "doctoral-os-safety-v1";
const DEMO_SAFETY_META_STORAGE_KEY = "doctoral-os-demo-safety-v1";
const DEMO_QUERY_PARAM = "demo";
const NEXT_QUERY_PARAM = "next";
const GOOGLE_CALENDAR_QUERY_PARAM = "google_calendar";
const API_ENABLED = window.location.protocol === "http:" || window.location.protocol === "https:";
const PDFJS_MODULE_URL = "/assets/vendor/pdfjs/pdf.min.mjs";
const PDFJS_WORKER_URL = "/assets/vendor/pdfjs/pdf.worker.min.mjs";
const MAX_READING_PDF_BYTES = 20 * 1024 * 1024;
const MAX_LOCAL_SNAPSHOTS = 6;
const SNAPSHOT_INTERVAL_MS = 12 * 60 * 1000;
const DEFAULT_CHECKLIST_ITEMS = [
  "Objetivo del capítulo explícito",
  "Argumento central defendible",
  "Secciones ordenadas de forma lógica",
  "Cada afirmación fuerte tiene fuente o apoyo",
  "Conceptos clave definidos antes de usarse",
  "Transiciones entre secciones claras",
  "Conclusión responde al objetivo",
  "Pendientes convertidos en tareas"
];
const V1_VIEWS = ["dashboard", "chapters", "literature", "planner", "reviews", "writing", "forum", "assistant"];
const ONBOARDING_STEPS = [
  { id: 1, label: "Base", title: "Empecemos por tu tesis" },
  { id: 2, label: "Estructura", title: "Monta el esqueleto inicial" },
  { id: 3, label: "Semana", title: "Convierte la tesis en trabajo real" },
  { id: 4, label: "Revisión", title: "Haz visible la conversación académica" }
];
const ONBOARDING_CHAPTER_TEMPLATES = [
  { title: "Introducción", goal: "Situar el problema, la pregunta y la relevancia del trabajo.", target: 7000 },
  { title: "Marco teórico", goal: "Conectar la literatura clave y construir el marco conceptual.", target: 10000 },
  { title: "Metodología", goal: "Justificar diseño, muestra, instrumentos y análisis.", target: 9000 },
  { title: "Resultados", goal: "Presentar los hallazgos con orden y trazabilidad.", target: 11000 },
  { title: "Discusión", goal: "Interpretar resultados y conectar con la contribución doctoral.", target: 8500 },
  { title: "Conclusiones", goal: "Cerrar aportes, límites y siguientes pasos del proyecto.", target: 5000 }
];

const icons = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 13h6V4H4v9Z"/><path d="M14 20h6V4h-6v16Z"/><path d="M4 20h6v-3H4v3Z"/></svg>',
  chapters: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M6 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M8 8h8"/><path d="M8 12h6"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"/><path d="M4 5.5A2.5 2.5 0 0 0 6.5 8H20"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M7 3v4"/><path d="M17 3v4"/><path d="M4 8h16"/><path d="M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"/></svg>',
  meeting: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M7 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M17 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M2 21a5 5 0 0 1 10 0"/><path d="M14 21a4 4 0 0 1 8 0"/></svg>',
  review: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M5 4h11l3 3v13H5V4Z"/><path d="M16 4v4h4"/><path d="M8 12h8"/><path d="M8 16h5"/><path d="m14 19 2 2 4-5"/></svg>',
  writing: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 20h16"/><path d="M6 16 17.5 4.5a2.1 2.1 0 0 1 3 3L9 19l-4 1 1-4Z"/></svg>',
  assistant: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 3v3"/><path d="M9 6h6"/><rect x="5" y="7" width="14" height="11" rx="3"/><path d="M9 18v2"/><path d="M15 18v2"/><path d="M3 11v3"/><path d="M21 11v3"/><circle cx="10" cy="12" r="1"/><circle cx="14" cy="12" r="1"/><path d="M9 15h6"/></svg>',
  forum: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M7 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M17 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M3 20a5 5 0 0 1 8 0"/><path d="M13 20a5 5 0 0 1 8 0"/><path d="M10 12h4"/><path d="m11 15 1-1 1 1"/></svg>',
  print: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M7 8V3h10v5"/><path d="M7 17H5a2 2 0 0 1-2-2v-5h18v5a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7v-7Z"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 21h16"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M4 3h16"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M5 3h12l2 2v16H5V3Z"/><path d="M8 3v6h8"/><path d="M8 21v-7h8v7"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="m5 13 4 4L19 7"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 14h10l1-14"/><path d="M9 7V4h6v3"/></svg>'
};

const viewTitles = {
  dashboard: "Panel",
  chapters: "Capítulos",
  literature: "Lecturas",
  planner: "Plan semanal",
  reviews: "Reuniones y revisión",
  writing: "Escritura",
  forum: "Foro",
  assistant: "TeDoc",
};

const defaultState = {
  activeView: "dashboard",
  editorChapterId: "",
  literatureFilter: "",
  literatureCitationId: "",
  literatureCitationStyle: "APA 7",
  literatureExtractFilter: "",
  literatureExtractChapter: "all",
  assistantStyleMemory: createInitialAssistantStyleMemory(),
  onboarding: createInitialOnboardingState(),
  project: {
    name: "Mi tesis doctoral",
    candidate: "Doctorando/a",
    program: "",
    university: "",
    mode: "Monográfica",
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
  writingLog: [],
  forumTopics: [],
  assistantThread: [],
  analyticsRange: "week"
};

let demoMode = isDemoRequested();
let state = loadState();
let safety = loadSafetyMeta();
let auth = {
  user: null,
  privateSiteAccess: false,
  status: API_ENABLED ? "checking" : "file",
  lastSync: "",
  statusLabel: API_ENABLED ? "Comprobando" : "Archivo local"
};
let googleCalendar = createInitialGoogleCalendarState();
let syncTimer = null;
let assistantBusy = false;
let assistantPendingAction = null;
let assistantUndoState = null;
let readingPdfViewer = createInitialReadingPdfViewerState();
let pdfJsLibRef = null;
let pdfJsLoadPromise = null;
let readingPdfRenderJob = Promise.resolve();
let readingPdfRenderRequest = 0;

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
const authTitle = document.querySelector("#authTitle");
const authDescription = document.querySelector("#authDescription");
const authGrid = document.querySelector("#authGrid");
const onboardingModal = document.querySelector("#onboardingModal");
const onboardingDialog = document.querySelector("#onboardingDialog");
const onboardingTitle = document.querySelector("#onboardingTitle");
const onboardingDescription = document.querySelector("#onboardingDescription");
const onboardingProgress = document.querySelector("#onboardingProgress");
const onboardingBody = document.querySelector("#onboardingBody");
const onboardingPreview = document.querySelector("#onboardingPreview");
const onboardingBack = document.querySelector("#onboardingBack");
const onboardingPrimary = document.querySelector("#onboardingPrimary");
let authModalMode = "login";
let pendingResetToken = "";

init();

function init() {
  try {
    localStorage.removeItem("doctoral-os-token-v1");
  } catch (error) {
    console.warn("No se pudo limpiar la sesión heredada", error);
  }
  hydrateIcons();
  document.querySelector("#mainNav").addEventListener("click", handleNavigation);
  document.querySelector(".topbar-actions").addEventListener("click", handleTopbarAction);
  document.querySelector("#importFile").addEventListener("change", importData);
  authModal.addEventListener("click", handleAuthModalClick);
  authModal.addEventListener("submit", handleAuthSubmit);
  onboardingModal.addEventListener("click", handleOnboardingModalClick);
  onboardingModal.addEventListener("submit", handleOnboardingSubmit);
  screen.addEventListener("click", handleScreenClick);
  screen.addEventListener("submit", handleFormSubmit);
  screen.addEventListener("input", handleScreenInput);
  screen.addEventListener("change", handleScreenChange);
  configurePdfJs();
  render();
  updateAuthUI();
  restoreSession().finally(() => maybeOpenAuthFromUrl());
}

function createInitialReadingPdfViewerState() {
  return {
    readingId: "",
    document: null,
    totalPages: 0,
    currentPage: 1,
    scale: 1.16,
    loading: false,
    error: "",
    selectedText: "",
    selectedNote: "",
    selectedRects: [],
    selectedPage: 1,
    uploadBusy: false,
    deleteBusy: false
  };
}

function configurePdfJs() {
  void ensurePdfJsLoaded();
}

async function ensurePdfJsLoaded() {
  if (pdfJsLibRef?.getDocument) return pdfJsLibRef;
  if (!pdfJsLoadPromise) {
    pdfJsLoadPromise = import(PDFJS_MODULE_URL)
      .then((module) => {
        const lib = window.pdfjsLib?.getDocument
          ? window.pdfjsLib
          : module?.default?.getDocument
            ? module.default
            : module;
        if (!lib?.getDocument) throw new Error("pdf.js no expone getDocument.");
        if (lib.GlobalWorkerOptions) {
          lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
        }
        pdfJsLibRef = lib;
        return lib;
      })
      .catch((error) => {
        console.error("No se pudo cargar pdf.js", error);
        pdfJsLoadPromise = null;
        return null;
      });
  }
  return pdfJsLoadPromise;
}

function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((node) => {
    const iconName = node.dataset.icon;
    if (icons[iconName]) node.innerHTML = icons[iconName];
  });
}

function loadState() {
  try {
    const raw = localStorage.getItem(activeStorageKey());
    if (!raw) return ensureStateShape(demoMode ? createDemoState() : structuredClone(defaultState));
    return ensureStateShape(deepMerge(demoMode ? createDemoState() : structuredClone(defaultState), JSON.parse(raw)));
  } catch (error) {
    console.warn("No se pudo cargar el estado", error);
    return ensureStateShape(demoMode ? createDemoState() : structuredClone(defaultState));
  }
}

function isDemoRequested() {
  return new URL(window.location.href).searchParams.get(DEMO_QUERY_PARAM) === "1";
}

function activeStorageKey() {
  return demoMode ? DEMO_STORAGE_KEY : STORAGE_KEY;
}

function activeSnapshotStorageKey() {
  return demoMode ? DEMO_SNAPSHOT_STORAGE_KEY : SNAPSHOT_STORAGE_KEY;
}

function activeSafetyMetaStorageKey() {
  return demoMode ? DEMO_SAFETY_META_STORAGE_KEY : SAFETY_META_STORAGE_KEY;
}

function defaultSafetyMeta() {
  return {
    lastLocalSaveAt: "",
    lastRemoteSaveAt: "",
    lastSnapshotAt: "",
    lastSnapshotReason: "",
    lastExportedAt: "",
    lastRestoredAt: "",
    lastSnapshotHash: ""
  };
}

function createInitialGoogleCalendarState() {
  return {
    loading: false,
    configured: false,
    connected: false,
    googleEmail: "",
    calendarId: "",
    updatedAt: "",
    message: API_ENABLED
      ? "Conecta Google Calendar para importar reuniones de Google Meet."
      : "Esta integración necesita abrir la app desde el servidor."
  };
}

function loadSafetyMeta() {
  try {
    const raw = localStorage.getItem(activeSafetyMetaStorageKey());
    if (!raw) return defaultSafetyMeta();
    return { ...defaultSafetyMeta(), ...(JSON.parse(raw) || {}) };
  } catch (error) {
    console.warn("No se pudo cargar la meta de seguridad", error);
    return defaultSafetyMeta();
  }
}

function persistSafetyMeta() {
  try {
    localStorage.setItem(activeSafetyMetaStorageKey(), JSON.stringify(safety));
  } catch (error) {
    console.warn("No se pudo guardar la meta de seguridad", error);
  }
}

function updateSafetyMeta(patch = {}) {
  safety = { ...defaultSafetyMeta(), ...safety, ...patch };
  persistSafetyMeta();
}

function loadSnapshots() {
  try {
    const raw = localStorage.getItem(activeSnapshotStorageKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("No se pudieron cargar los puntos de restauración", error);
    return [];
  }
}

function persistSnapshots(snapshots) {
  try {
    localStorage.setItem(activeSnapshotStorageKey(), JSON.stringify(Array.isArray(snapshots) ? snapshots.slice(0, MAX_LOCAL_SNAPSHOTS) : []));
  } catch (error) {
    console.warn("No se pudieron guardar los puntos de restauración", error);
  }
}

function createInitialAssistantStyleMemory() {
  return {
    explicit: {
      planningDepth: "auto",
      focusMode: "auto",
      workBlock: "auto",
      meetingMode: "auto"
    },
    feedback: {
      helpful: 0,
      moreDirect: 0,
      moreDetail: 0,
      tooLong: 0,
      lastType: "",
      lastAt: ""
    },
    learned: {
      recommendationTone: "direct",
      focusStyle: "single",
      workBlock: "steady",
      meetingStyle: "structured",
      executionBias: "mixed",
      avgBlockMinutes: 45,
      openFronts: 0,
      dominantArea: "General",
      frictionLevel: "low"
    },
    summary: "",
    updatedAt: ""
  };
}

function normalizeAssistantStyleMemory(memory) {
  const base = createInitialAssistantStyleMemory();
  const merged = deepMerge(base, memory || {});
  merged.explicit.planningDepth = ["auto", "direct", "detailed"].includes(merged.explicit.planningDepth) ? merged.explicit.planningDepth : "auto";
  merged.explicit.focusMode = ["auto", "single", "balanced"].includes(merged.explicit.focusMode) ? merged.explicit.focusMode : "auto";
  merged.explicit.workBlock = ["auto", "short", "deep"].includes(merged.explicit.workBlock) ? merged.explicit.workBlock : "auto";
  merged.explicit.meetingMode = ["auto", "brief", "structured"].includes(merged.explicit.meetingMode) ? merged.explicit.meetingMode : "auto";
  merged.feedback = {
    helpful: Math.max(0, Number(merged.feedback?.helpful || 0)),
    moreDirect: Math.max(0, Number(merged.feedback?.moreDirect || 0)),
    moreDetail: Math.max(0, Number(merged.feedback?.moreDetail || 0)),
    tooLong: Math.max(0, Number(merged.feedback?.tooLong || 0)),
    lastType: String(merged.feedback?.lastType || ""),
    lastAt: String(merged.feedback?.lastAt || "")
  };
  merged.summary = String(merged.summary || "");
  merged.updatedAt = String(merged.updatedAt || "");
  return merged;
}

function refreshAssistantStyleMemory(target = state) {
  if (!target || typeof target !== "object") return createInitialAssistantStyleMemory();
  const current = normalizeAssistantStyleMemory(target.assistantStyleMemory);
  const learned = buildAssistantStyleSignals(target);
  const summary = buildAssistantStyleSummary({ explicit: current.explicit, learned });
  const previousSnapshot = JSON.stringify({ learned: current.learned, summary: current.summary });
  const nextSnapshot = JSON.stringify({ learned, summary });
  target.assistantStyleMemory = {
    ...current,
    learned,
    summary,
    updatedAt: previousSnapshot === nextSnapshot ? current.updatedAt : new Date().toISOString()
  };
  return target.assistantStyleMemory;
}

function buildAssistantStyleSignals(target = state) {
  const tasks = Array.isArray(target.tasks) ? target.tasks : [];
  const writingLog = Array.isArray(target.writingLog) ? target.writingLog : [];
  const meetings = Array.isArray(target.meetings) ? target.meetings : [];
  const reviewComments = Array.isArray(target.reviewComments) ? target.reviewComments : [];
  const chapters = Array.isArray(target.chapters) ? target.chapters : [];
  const completedRecent = [...tasks]
    .filter((task) => task.done)
    .sort((a, b) => String(b.completedAt || "").localeCompare(String(a.completedAt || "")))
    .slice(0, 8);
  const openTasks = tasks.filter((task) => !task.done);
  const effortSamples = [
    ...completedRecent.map((task) => effortToMinutes(task.effort)),
    ...openTasks.slice(0, 8).map((task) => effortToMinutes(task.effort)),
    ...writingLog.slice(0, 8).map((entry) => Number(entry.minutes || 0))
  ].filter((value) => Number(value) > 0);
  const avgBlockMinutes = Math.round(average(effortSamples) || 45);
  const workBlock = avgBlockMinutes <= 40 ? "short" : avgBlockMinutes >= 85 ? "deep" : "steady";
  const openAreas = uniqueNormalizedValues(openTasks.map((task) => task.area || "General"));
  const recentAreas = uniqueNormalizedValues(completedRecent.map((task) => task.area || "General"));
  const focusStyle = openAreas.length <= 2 && openTasks.length <= 4 && recentAreas.length <= 2 ? "single" : "balanced";
  const meetingDensity = average(meetings.slice(0, 4).map((meeting) => {
    const agendaSize = String(meeting.agenda || "").trim().length;
    const decisionSize = String(meeting.decisions || "").trim().length;
    const taskSize = String(meeting.tasks || "").trim().length;
    return agendaSize + decisionSize + taskSize;
  }).filter(Boolean));
  const meetingStyle = meetingDensity >= 160 ? "structured" : "brief";
  const recommendationTone = workBlock === "short" || openTasks.length >= 6 ? "direct" : "detailed";
  const frictionLevel = openTasks.length >= 7 || reviewComments.filter((comment) => comment.status !== "Resuelto").length >= 4 ? "high" : openTasks.length >= 4 ? "medium" : "low";
  const writingScore = writingLog.slice(0, 8).length + chaptersTouchedRecently(chapters, 7);
  const reviewScore = reviewComments.filter((comment) => comment.status !== "Resuelto").length + tasks.filter((task) => !task.done && normalizeUserText(task.area).includes("revision")).length;
  const coordinationScore = meetings.filter((meeting) => meeting.date && meeting.date >= todayISO()).length + tasks.filter((task) => !task.done && normalizeUserText(task.area).includes("reunion")).length;
  const executionBias = dominantAssistantExecutionBias({ writingScore, reviewScore, coordinationScore });
  const dominantArea = dominantTaskArea(tasks, writingLog) || "General";

  return {
    recommendationTone,
    focusStyle,
    workBlock,
    meetingStyle,
    executionBias,
    avgBlockMinutes,
    openFronts: openAreas.length,
    dominantArea,
    frictionLevel
  };
}

function buildAssistantStyleSummary(memory) {
  const resolved = resolveAssistantStyle(memory);
  const blockText = resolved.workBlock === "short"
    ? "bloques cortos"
    : resolved.workBlock === "deep"
      ? "bloques profundos"
      : "bloques medios";
  const focusText = resolved.focusMode === "single" ? "una prioridad clara" : "dos o tres frentes coordinados";
  const toneText = resolved.planningDepth === "direct" ? "planes directos" : "planes más desarrollados";
  const biasText = resolved.executionBias === "writing"
    ? "escritura"
    : resolved.executionBias === "review"
      ? "revisión"
      : resolved.executionBias === "coordination"
        ? "coordinación"
        : "trabajo mixto";
  return `TeDoc te ve más cómodo con ${blockText}, ${focusText} y ${toneText}. Tu sesgo actual cae en ${biasText}.`;
}

function resolveAssistantStyle(memory = state.assistantStyleMemory) {
  const normalized = normalizeAssistantStyleMemory(memory);
  const directFeedbackBias = Number(normalized.feedback.moreDirect || 0) + Number(normalized.feedback.tooLong || 0);
  const detailFeedbackBias = Number(normalized.feedback.moreDetail || 0);
  const learnedPlanningDepth = normalized.learned.recommendationTone === "detailed" ? "detailed" : "direct";
  const planningDepth = normalized.explicit.planningDepth !== "auto"
    ? normalized.explicit.planningDepth
    : directFeedbackBias === detailFeedbackBias
      ? learnedPlanningDepth
      : directFeedbackBias > detailFeedbackBias ? "direct" : "detailed";
  const focusMode = normalized.explicit.focusMode !== "auto"
    ? normalized.explicit.focusMode
    : normalized.learned.focusStyle === "balanced" ? "balanced" : "single";
  const workBlock = normalized.explicit.workBlock !== "auto"
    ? normalized.explicit.workBlock
    : normalized.learned.workBlock === "deep" ? "deep" : normalized.learned.workBlock === "short" ? "short" : "steady";
  const meetingMode = normalized.explicit.meetingMode !== "auto"
    ? normalized.explicit.meetingMode
    : normalized.learned.meetingStyle === "brief" ? "brief" : "structured";
  return {
    ...normalized,
    planningDepth,
    focusMode,
    workBlock,
    meetingMode,
    executionBias: normalized.learned.executionBias,
    dominantArea: normalized.learned.dominantArea,
    frictionLevel: normalized.learned.frictionLevel,
    avgBlockMinutes: normalized.learned.avgBlockMinutes,
    openFronts: normalized.learned.openFronts
  };
}

function uniqueNormalizedValues(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value || "").trim()).filter(Boolean))];
}

function effortToMinutes(effort) {
  const text = String(effort || "").trim();
  if (!text) return 0;
  const match = text.match(/(\d{1,3})\s*(min|hora|horas|h)\b/i);
  if (!match) return 0;
  const amount = Number(match[1]);
  return /hora|horas|h/i.test(match[2]) ? amount * 60 : amount;
}

function chaptersTouchedRecently(chapters, days) {
  const cutoff = Date.now() - days * 86400000;
  return (Array.isArray(chapters) ? chapters : []).filter((chapter) => {
    const stamp = new Date(String(chapter.editorUpdatedAt || "")).getTime();
    return Number.isFinite(stamp) && stamp >= cutoff;
  }).length;
}

function dominantAssistantExecutionBias(scores) {
  const entries = Object.entries(scores || {}).sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0));
  if (!entries[0] || Number(entries[0][1] || 0) === 0) return "mixed";
  if (entries[1] && Number(entries[0][1] || 0) - Number(entries[1][1] || 0) <= 1) return "mixed";
  if (entries[0][0] === "writingScore") return "writing";
  if (entries[0][0] === "reviewScore") return "review";
  if (entries[0][0] === "coordinationScore") return "coordination";
  return "mixed";
}

function dominantTaskArea(tasks, writingLog) {
  const counts = new Map();
  (Array.isArray(tasks) ? tasks : []).forEach((task) => {
    const label = String(task.area || "General").trim() || "General";
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  if ((Array.isArray(writingLog) ? writingLog : []).length) {
    counts.set("Capítulos", (counts.get("Capítulos") || 0) + writingLog.length);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || "";
}

function clearDemoQuery() {
  const url = new URL(window.location.href);
  url.searchParams.delete(DEMO_QUERY_PARAM);
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}

function normalizeReadingPdfMeta(pdf) {
  if (!pdf || typeof pdf !== "object") return null;
  const url = String(pdf.url || "").trim();
  if (!url) return null;
  return {
    name: String(pdf.name || "lectura.pdf").trim() || "lectura.pdf",
    size: Number(pdf.size || 0),
    mimeType: String(pdf.mimeType || "application/pdf").trim() || "application/pdf",
    uploadedAt: String(pdf.uploadedAt || "").trim(),
    url
  };
}

function normalizeReadingAnnotations(annotations) {
  return (Array.isArray(annotations) ? annotations : []).map((item) => ({
    id: item.id || createId("hl"),
    page: Number(item.page || 1),
    text: String(item.text || "").trim(),
    note: String(item.note || "").trim(),
    color: String(item.color || "amber").trim() || "amber",
    chapterId: String(item.chapterId || "").trim(),
    rects: (Array.isArray(item.rects) ? item.rects : []).map((rect) => ({
      x: Number(rect.x || 0),
      y: Number(rect.y || 0),
      w: Number(rect.w || 0),
      h: Number(rect.h || 0)
    })).filter((rect) => rect.w > 0 && rect.h > 0),
    createdAt: item.createdAt || new Date().toISOString()
  })).filter((item) => item.text);
}

function ensureStateShape(target) {
  target.chapters = Array.isArray(target.chapters) ? target.chapters : [];
  target.readings = Array.isArray(target.readings) ? target.readings : [];
  target.tasks = Array.isArray(target.tasks) ? target.tasks : [];
  target.meetings = Array.isArray(target.meetings) ? target.meetings : [];
  target.reviewComments = Array.isArray(target.reviewComments) ? target.reviewComments : [];
  target.writingLog = Array.isArray(target.writingLog) ? target.writingLog : [];
  target.forumTopics = Array.isArray(target.forumTopics) ? target.forumTopics : [];
  target.assistantThread = Array.isArray(target.assistantThread) ? target.assistantThread : [];
  target.assistantStyleMemory = normalizeAssistantStyleMemory(target.assistantStyleMemory);
  target.onboarding = normalizeOnboardingState(target.onboarding, target.project?.candidate);
  target.literatureCitationId = typeof target.literatureCitationId === "string" ? target.literatureCitationId : "";
  target.literatureCitationStyle = ["APA 7", "MLA 9", "Chicago", "BibTeX"].includes(target.literatureCitationStyle) ? target.literatureCitationStyle : "APA 7";
  target.literatureExtractFilter = typeof target.literatureExtractFilter === "string" ? target.literatureExtractFilter : "";
  target.literatureExtractChapter = typeof target.literatureExtractChapter === "string" ? target.literatureExtractChapter : "all";
  target.meetings = target.meetings.map((meeting) => normalizeMeetingRecord(meeting));
  target.readings.forEach((reading) => {
    if (reading.status === "Leido") reading.status = "Leído";
    if (reading.chapter === "Sin capitulo") reading.chapter = "Sin capítulo";
    if (reading.title === "Lectura sin título") reading.title = "Lectura sin título";
    reading.type = reading.type || "Artículo";
    reading.source = reading.source || "";
    reading.pdf = normalizeReadingPdfMeta(reading.pdf);
    reading.annotations = normalizeReadingAnnotations(reading.annotations);
  });
  target.tasks.forEach((task) => {
    if (task.area === "Revision") task.area = "Revisión";
    if (task.status === "done") {
      task.done = true;
      task.status = "week";
    }
    task.done = Boolean(task.done);
    task.completedAt = task.completedAt || "";
  });
  target.reviewComments.forEach((comment) => {
    if (comment.status === "Necesita aclaracion") comment.status = "Necesita aclaración";
    if (comment.source === "Direccion") comment.source = "Dirección";
    if (comment.chapter === "Sin capitulo") comment.chapter = "Sin capítulo";
  });
  target.writingLog.forEach((entry) => {
    if (entry.chapter === "Sin capitulo") entry.chapter = "Sin capítulo";
    if (entry.mood === "Revision") entry.mood = "Revisión";
  });
  target.forumTopics = target.forumTopics.map((topic) => ({
    ...topic,
    id: topic.id || createId("ft"),
    title: topic.title || "Tema sin título",
    tag: topic.tag || "Duda",
    body: topic.body || "",
    author: topic.author || (demoMode ? "Comunidad" : "Borrador"),
    createdAt: topic.createdAt || new Date().toISOString()
  }));
  if (!target.assistantThread.length) {
    target.assistantThread = createInitialAssistantThread();
  }
  if (!target.forumTopics.length && demoMode) {
    target.forumTopics = createDemoForumTopics();
  }
  delete target.phases;
  delete target.risks;
  delete target.evidence;
  delete target.aiLog;
  delete target.defenseMinutes;
  if (target.project) {
    delete target.project.defenseDate;
    delete target.project.ethics;
    if (target.project.mode === "Monografica") target.project.mode = "Monográfica";
    if (target.project.phase === "Escritura y revision") target.project.phase = "Escritura y revisión";
  }
  target.chapters.forEach((chapter) => normalizeChapter(chapter));
  if (!target.editorChapterId || !target.chapters.some((chapter) => chapter.id === target.editorChapterId)) {
    target.editorChapterId = target.chapters[0]?.id || "";
  }
  if (!V1_VIEWS.includes(target.activeView)) {
    target.activeView = "dashboard";
  }
  if (!["day", "week"].includes(target.analyticsRange)) {
    target.analyticsRange = "week";
  }
  refreshAssistantStyleMemory(target);
  return target;
}

function normalizeMeetingRecord(meeting) {
  const next = meeting && typeof meeting === "object" ? meeting : {};
  next.id = next.id || createId("mt");
  next.date = next.date || "";
  next.time = next.time || "";
  next.type = next.type || "Dirección";
  next.attendees = next.attendees || "";
  next.agenda = next.agenda || "";
  next.summary = next.summary || "";
  next.decisions = next.decisions || "";
  next.tasks = next.tasks || "";
  next.notes = next.notes || "";
  next.next = next.next || "";
  if (next.type === "Direccion") next.type = "Dirección";
  if (next.type === "Revision interna") next.type = "Revisión interna";
  return next;
}

function createFreshState(user = {}) {
  const name = user.name || "Doctorando/a";
  return ensureStateShape({
    activeView: "dashboard",
    editorChapterId: "",
    literatureFilter: "",
    literatureCitationId: "",
    literatureCitationStyle: "APA 7",
    onboarding: createInitialOnboardingState(name),
    project: {
      name: "Mi tesis doctoral",
      candidate: name,
      program: "",
      university: "",
      mode: "Monográfica",
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
    writingLog: [],
    forumTopics: [],
    assistantThread: createInitialAssistantThread(),
    assistantStyleMemory: createInitialAssistantStyleMemory(),
    analyticsRange: "week"
  });
}

function createInitialOnboardingState(candidate = "Doctorando/a") {
  return {
    active: false,
    completed: false,
    justCompleted: false,
    dismissed: false,
    step: 1,
    data: {
      thesisName: "Mi tesis doctoral",
      candidate,
      program: "",
      university: "",
      phase: "Organizando el trabajo",
      writingTarget: 65000,
      question: "",
      chapterMode: "template",
      templateChapters: ["Introducción", "Marco teórico", "Metodología"],
      customChapters: "",
      focusChapter: "Introducción",
      firstTask: "",
      firstDue: offsetISODate(7),
      setupType: "meeting",
      meetingDate: offsetISODate(7),
      meetingTime: "10:00",
      meetingWith: "Directora",
      meetingTopic: "",
      commentChapter: "Introducción",
      commentText: "",
      commentDue: offsetISODate(7)
    }
  };
}

function normalizeOnboardingState(onboarding, candidate = "Doctorando/a") {
  const base = createInitialOnboardingState(candidate);
  const merged = deepMerge(base, onboarding || {});
  merged.active = Boolean(merged.active);
  merged.completed = Boolean(merged.completed);
  merged.justCompleted = Boolean(merged.justCompleted);
  merged.dismissed = Boolean(merged.dismissed);
  merged.step = clamp(Number(merged.step || 1), 1, ONBOARDING_STEPS.length);
  merged.data.templateChapters = Array.isArray(merged.data.templateChapters)
    ? merged.data.templateChapters.filter(Boolean)
    : [...base.data.templateChapters];
  if (!merged.data.templateChapters.length) {
    merged.data.templateChapters = [...base.data.templateChapters];
  }
  if (!merged.data.focusChapter) {
    merged.data.focusChapter = onboardingPlannedChapterTitles(merged.data)[0] || "Introducción";
  }
  if (!merged.data.commentChapter) {
    merged.data.commentChapter = onboardingPlannedChapterTitles(merged.data)[0] || "Introducción";
  }
  return merged;
}

function createDemoState() {
  const currentYear = new Date().getFullYear();
  const chapter1 = normalizeChapter({
    id: createId("ch"),
    title: "Introducción y problema de investigación",
    goal: "Situar el problema, justificar su relevancia y abrir la pregunta doctoral.",
    argument: "La continuidad semanal condiciona más el avance doctoral que la mera acumulación de lecturas.",
    status: "En revisión",
    progress: 78,
    words: 6900,
    target: 8500,
    due: demoDateOffset(12),
    tasks: ["Reforzar el cierre del apartado 1.3", "Ajustar la transición hacia la pregunta doctoral"],
    sections: [
      { id: createId("sec"), title: "1. Contexto del problema", goal: "Mostrar por qué el tema importa", status: "Cerrada", words: 2100, content: "Las trayectorias doctorales muestran interrupciones frecuentes cuando el trabajo semanal no está claramente definido." },
      { id: createId("sec"), title: "2. Pregunta y objetivos", goal: "Definir la pregunta doctoral", status: "En revisión", words: 2500, content: "La pregunta central conecta continuidad de trabajo, seguimiento y cierre de revisión." },
      { id: createId("sec"), title: "3. Aporte esperado", goal: "Presentar la contribución", status: "Borrador", words: 2300, content: "El capítulo plantea un modelo de coordinación doctoral centrado en continuidad semanal." }
    ],
    notes: [
      { id: createId("nt"), title: "Abrir con dato de abandono", type: "Idea", date: demoDateOffset(-3), text: "Valorar si el primer párrafo debe abrir con un dato sobre abandono o con una escena de trabajo doctoral fragmentado." }
    ],
    checklist: createDefaultChecklist(78)
  });

  const chapter2 = normalizeChapter({
    id: createId("ch"),
    title: "Marco teórico y modelo de continuidad",
    goal: "Unir literatura sobre autorregulación, escritura y seguimiento doctoral.",
    argument: "El trabajo doctoral mejora cuando el seguimiento semanal convierte feedback y escritura en ciclos cerrables.",
    status: "Borrador",
    progress: 62,
    words: 9100,
    target: 12000,
    due: demoDateOffset(24),
    tasks: ["Cerrar mapa conceptual final", "Reducir duplicación entre secciones 2.2 y 2.3"],
    sections: [
      { id: createId("sec"), title: "1. Autorregulación doctoral", goal: "Revisar literatura base", status: "En revisión", words: 3000, content: "La autorregulación aparece como capacidad de mantener objetivos visibles y trabajo recurrente." },
      { id: createId("sec"), title: "2. Sistemas de seguimiento", goal: "Conectar herramientas y continuidad", status: "Borrador", words: 2800, content: "No basta con registrar tareas; importa que cada ciclo deje una siguiente acción clara." },
      { id: createId("sec"), title: "3. Modelo propuesto", goal: "Presentar el modelo", status: "Borrador", words: 3300, content: "El modelo articula capítulos, plan semanal, revisión y escritura en un circuito continuo." }
    ],
    notes: [
      { id: createId("nt"), title: "Revisar término continuidad", type: "Decisión", date: demoDateOffset(-2), text: "Mantener continuidad como término central y no cambiarlo por consistencia para no diluir la idea de seguimiento semanal." }
    ],
    checklist: createDefaultChecklist(62)
  });

  const chapter3 = normalizeChapter({
    id: createId("ch"),
    title: "Método y decisiones de muestreo",
    goal: "Explicar muestra, instrumentos y criterio analítico.",
    argument: "La validez del estudio depende de justificar bien la muestra y el criterio de seguimiento del trabajo doctoral.",
    status: "Borrador",
    progress: 47,
    words: 6400,
    target: 9000,
    due: demoDateOffset(8),
    tasks: ["Justificar tamaño de muestra", "Cerrar tabla de participantes", "Reescribir límites del estudio"],
    sections: [
      { id: createId("sec"), title: "1. Diseño general", goal: "Presentar enfoque del estudio", status: "Cerrada", words: 1900, content: "Se adopta un enfoque cualitativo con seguimiento longitudinal del trabajo doctoral." },
      { id: createId("sec"), title: "2. Muestra y criterios", goal: "Justificar participantes", status: "En revisión", words: 2200, content: "La sección necesita afinar la razón del número final de participantes y su heterogeneidad." },
      { id: createId("sec"), title: "3. Análisis", goal: "Explicar codificación y decisiones", status: "Borrador", words: 2300, content: "Conviene conectar mejor codificación, categorías y pregunta principal." }
    ],
    notes: [
      { id: createId("nt"), title: "Aclarar por qué 18 casos", type: "Duda", date: demoDateOffset(-1), text: "La directora quiere una justificación más clara del tamaño final de muestra y del criterio de saturación." }
    ],
    checklist: createDefaultChecklist(47)
  });

  const chapter4 = normalizeChapter({
    id: createId("ch"),
    title: "Resultados preliminares",
    goal: "Mostrar primeros patrones sobre continuidad y bloqueo.",
    argument: "Los datos apuntan a que la continuidad semanal depende más del cierre de revisión que del volumen de escritura aislado.",
    status: "Esquema",
    progress: 24,
    words: 2800,
    target: 10000,
    due: demoDateOffset(39),
    tasks: ["Definir estructura de hallazgos", "Abrir subapartado sobre interrupciones"],
    sections: [
      { id: createId("sec"), title: "1. Patrones generales", goal: "Presentar primeros hallazgos", status: "Esquema", words: 1200, content: "Los hallazgos se están organizando todavía en torno a continuidad, bloqueo y respuesta al feedback." },
      { id: createId("sec"), title: "2. Casos comparados", goal: "Comparar perfiles", status: "Esquema", words: 900, content: "Falta decidir si esta sección se organiza por perfiles o por momentos de tesis." },
      { id: createId("sec"), title: "3. Implicaciones", goal: "Conectar resultados y discusión", status: "Esquema", words: 700, content: "Esta parte aún está muy abierta y depende del cierre del capítulo metodológico." }
    ],
    notes: [],
    checklist: createDefaultChecklist(24)
  });

  return ensureStateShape({
    activeView: "dashboard",
    editorChapterId: chapter3.id,
    literatureFilter: "",
    project: {
      name: "Continuidad doctoral en plataformas de seguimiento",
      candidate: "Marta Ríos",
      program: "Doctorado en Educación y Tecnología",
      university: "Universitat Autònoma de Barcelona",
      mode: "Monográfica",
      phase: "Escritura y revisión",
      writingTarget: 68000,
      question: "¿Cómo influye un sistema de seguimiento semanal en la continuidad real del trabajo doctoral?",
      contribution: "Modelo práctico para coordinar capítulos, revisión y escritura en tesis individuales.",
      scope: "Estudio cualitativo con entrevistas, diario de escritura y seguimiento longitudinal."
    },
    chapters: [chapter1, chapter2, chapter3, chapter4],
    readings: [
      { id: createId("rd"), title: "Doctoral writing as regulated work", authors: "Hernández, M.", year: "2024", status: "Clave", chapter: chapter2.title, use: "Sostener el modelo de continuidad semanal y autorregulacion.", doi: "10.1200/dw-2024-11" },
      { id: createId("rd"), title: "Feedback loops in supervision", authors: "Gibson, L.; Patel, R.", year: "2023", status: "Leído", chapter: chapter1.title, use: "Justificar por qué el feedback necesita cierre y seguimiento.", doi: "10.9981/fls-2023-07" },
      { id: createId("rd"), title: "Qualitative sampling in doctoral studies", authors: "Santos, P.", year: "2022", status: "Leyendo", chapter: chapter3.title, use: "Reforzar la justificación del tamaño de muestra.", doi: "10.7751/qs-2022-04" },
      { id: createId("rd"), title: "Academic progress dashboards", authors: "López, A.; Green, T.", year: "2025", status: "Pendiente", chapter: chapter4.title, use: "Conectar resultados con herramientas de seguimiento académico.", doi: "10.8841/apd-2025-02" }
    ],
    tasks: [
      { id: createId("tk"), title: "Cerrar respuesta al comentario sobre muestra", area: "Revisión", status: "today", due: demoDateOffset(1), effort: "45 min", impact: "Alto" },
      { id: createId("tk"), title: "Preparar agenda de reunión con directora", area: "Reuniones", status: "today", due: demoDateOffset(0), effort: "30 min", impact: "Alto" },
      { id: createId("tk"), title: "Redactar cierre del marco teórico", area: "Capítulos", status: "week", due: demoDateOffset(4), effort: "90 min", impact: "Alto" },
      { id: createId("tk"), title: "Vincular tres lecturas clave al capítulo metodológico", area: "Lecturas", status: "later", due: demoDateOffset(11), effort: "60 min", impact: "Medio" }
    ],
    meetings: [
      { id: createId("mt"), date: demoDateOffset(3), time: "16:00", type: "Dirección", attendees: "Directora", agenda: "Método y criterios de muestreo", summary: "La próxima reunión ya está enfocada en justificar mejor la muestra y dejar claro el siguiente entregable metodológico.", decisions: "Llegar con una justificación más explícita del tamaño de muestra y una tabla final de participantes.", tasks: "Reescribir apartado 2.2 y llevar una agenda de 5 puntos.", notes: "Conviene entrar con una versión más defendible de la muestra.\nLlevar tabla final de participantes.\nPreparar agenda breve para no dispersar la reunión.", next: demoDateOffset(17) },
      { id: createId("mt"), date: demoDateOffset(-5), time: "11:30", type: "Dirección", attendees: "Directora", agenda: "Revisión del marco teórico", summary: "Se cerró que el marco teórico necesita menos repetición y una mejor transición hacia metodología antes del siguiente envío.", decisions: "Reducir repetición conceptual y cerrar mejor el paso a metodología.", tasks: "Ajustar secciones 2.2 y 2.3; preparar transición a capítulo 3.", notes: "La directora ve repetición entre autorregulación y seguimiento.\nDecisión: limpiar redundancias y reforzar el puente hacia metodología.\nTareas: ajustar 2.2 y 2.3, preparar transición al capítulo 3.", next: demoDateOffset(3) }
    ],
    reviewComments: [
      { id: createId("rv"), chapter: chapter3.title, source: "Dirección", comment: "Falta justificar el tamaño de muestra y explicar por qué 18 casos son suficientes.", response: "Añadir criterio de saturación y justificar heterogeneidad de perfiles.", status: "Pendiente", priority: "Alta", due: demoDateOffset(2) },
      { id: createId("rv"), chapter: chapter2.title, source: "Dirección", comment: "La transición entre autorregulación y seguimiento todavía suena teóricamente separada.", response: "Reescribir cierre del apartado 2.2 y abrir mejor el 2.3.", status: "En proceso", priority: "Media", due: demoDateOffset(5) },
      { id: createId("rv"), chapter: chapter1.title, source: "Dirección", comment: "Conviene hacer más explícita la pregunta doctoral al final de la introducción.", response: "Nueva versión enviada en la reunión pasada.", status: "Resuelto", priority: "Media", due: demoDateOffset(-2) }
    ],
    writingLog: [
      { id: createId("wr"), date: demoDateOffset(-1), chapter: chapter3.title, words: 780, minutes: 95, mood: "Revisión", note: "Reescrito el apartado de criterios de inclusión y dejado una duda clara sobre saturación." },
      { id: createId("wr"), date: demoDateOffset(-2), chapter: chapter2.title, words: 920, minutes: 110, mood: "Fluido", note: "Cerrado el mapa de conceptos y mejorada la conexión con seguimiento semanal." },
      { id: createId("wr"), date: demoDateOffset(-4), chapter: chapter1.title, words: 540, minutes: 70, mood: "Neutral", note: "Ajustado el cierre de la introducción y marcada una nota para abrir con un dato más fuerte." },
      { id: createId("wr"), date: demoDateOffset(-6), chapter: chapter2.title, words: 680, minutes: 80, mood: "Trabado", note: "Sesión lenta por duplicación entre apartados; queda tarea clara para la semana." }
    ],
    assistantThread: [
      { id: createId("msg"), role: "assistant", text: "Soy TeDoc, la guía asistida de esta demo. En dos o tres minutos puedes ver el panel, abrir el capítulo metodológico, revisar comentarios y pedirme acciones dentro de esta tesis de ejemplo.", createdAt: demoTimestamp(-1, 9, 6) },
      { id: createId("msg"), role: "user", text: "Resúmeme el progreso actual", createdAt: demoTimestamp(-1, 9, 7) },
      { id: createId("msg"), role: "assistant", text: `Resumen actual:
- 4 capítulos registrados con un progreso medio del 53%.
- 3 tareas activas y 2 comentarios abiertos.
- 2 reuniones registradas.
- 2920 palabras escritas en los últimos 7 días.
- Próxima reunión detectada: 27/04/${currentYear} 16:00 con Directora.

Mi siguiente recomendación: cerrar el comentario abierto del capítulo metodológico antes de la reunión.`, createdAt: demoTimestamp(-1, 9, 8) }
    ]
  });
}

function createDemoForumTopics() {
  return [
    { id: createId("ft"), title: "Cómo responder comentarios duros del director", tag: "Supervisión", body: "Me gustaría un espacio para compartir estrategias concretas cuando el feedback llega mezclado o poco accionable.", author: "Comunidad", createdAt: demoTimestamp(-3, 10, 15) },
    { id: createId("ft"), title: "Bloqueo al escribir el marco teórico", tag: "Escritura", body: "Sería útil poder contrastar cómo otros doctorandos salen del bucle de leer, releer y no cerrar apartados.", author: "Comunidad", createdAt: demoTimestamp(-2, 18, 5) },
    { id: createId("ft"), title: "Reuniones de seguimiento que sí sirven", tag: "Metodología", body: "Quiero ver agendas reales y formas de convertir una reunión en tareas claras para la semana siguiente.", author: "Comunidad", createdAt: demoTimestamp(-1, 9, 40) }
  ];
}

function demoDateOffset(days) {  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function demoTimestamp(days, hour, minute) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function normalizeChapter(chapter) {
  if (chapter.status === "En revision") chapter.status = "En revisión";
  chapter.sections = Array.isArray(chapter.sections) && chapter.sections.length
    ? chapter.sections.map((section) => ({
        ...section,
        id: section.id || createId("sec"),
        title: section.title || "Sección sin título",
        goal: section.goal || "",
        status: section.status === "En revision" ? "En revisión" : (section.status || "Borrador"),
        words: Number(section.words || 0),
        content: section.content || ""
      }))
    : [createSectionFromChapter(chapter)];
  chapter.notes = Array.isArray(chapter.notes) ? chapter.notes : [];
  chapter.rewriteChecklist = Array.isArray(chapter.rewriteChecklist)
    ? chapter.rewriteChecklist.map((item) => ({
        id: item.id || createId("rw"),
        label: String(item.label || "Paso pendiente"),
        done: Boolean(item.done),
        sourceCommentId: String(item.sourceCommentId || ""),
        sourceCommentText: String(item.sourceCommentText || "")
      }))
    : [];
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
    goal: chapter.goal || "Objetivo de la sección pendiente.",
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
  const title = data.title || "Nuevo capítulo";
  return normalizeChapter({
    id: createId("ch"),
    title,
    goal: data.goal || "Definir objetivo del capítulo.",
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
        goal: data.goal || "Situar el objetivo del capítulo.",
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
  const serializedState = JSON.stringify(state);
  localStorage.setItem(activeStorageKey(), serializedState);
  updateSafetyMeta({ lastLocalSaveAt: new Date().toISOString() });
  maybeCreateSafetySnapshot(serializedState, message, options);
  updateSidebar();
  if (!options.skipSync) scheduleSync();
  if (message) showToast(message);
}

function maybeCreateSafetySnapshot(serializedState, message, options = {}) {
  if (options.skipSnapshot) return;
  const reason = String(options.snapshotReason || message || "").trim();
  if (!reason && !options.forceSnapshot) return;

  const snapshots = loadSnapshots();
  const hash = hashText(serializedState);
  const latest = snapshots[0];
  if (latest?.hash === hash) return;

  const now = Date.now();
  const latestCreatedAt = latest?.createdAt ? new Date(latest.createdAt).getTime() : 0;
  const needsPrioritySnapshot = options.forceSnapshot || isPrioritySnapshotReason(reason);
  if (!needsPrioritySnapshot && latestCreatedAt && now - latestCreatedAt < SNAPSHOT_INTERVAL_MS) {
    return;
  }

  const createdAt = new Date(now).toISOString();
  const snapshot = {
    id: createId("snap"),
    createdAt,
    reason: reason || "Punto de restauración automático",
    summary: buildSnapshotSummary(),
    hash,
    state: JSON.parse(serializedState)
  };
  persistSnapshots([snapshot, ...snapshots]);
  updateSafetyMeta({
    lastSnapshotAt: createdAt,
    lastSnapshotReason: snapshot.reason,
    lastSnapshotHash: hash
  });
}

function isPrioritySnapshotReason(reason) {
  const normalized = normalizeUserText(reason);
  return [
    "eliminado",
    "importado",
    "restaurado",
    "reiniciada",
    "cerrada",
    "creado",
    "guardado",
    "actualizado"
  ].some((token) => normalized.includes(token));
}

function hashText(text) {
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) + hash) + text.charCodeAt(index);
  }
  return String(hash >>> 0);
}

function buildSnapshotSummary() {
  const chapterCount = state.chapters.length;
  const activeTasks = state.tasks.filter((task) => !task.done).length;
  const openComments = state.reviewComments.filter((comment) => comment.status !== "Resuelto").length;
  const words = state.chapters.reduce((sum, chapter) => sum + Number(chapter.words || 0), 0);
  return `${chapterCount} cap., ${activeTasks} tareas, ${openComments} comentarios, ${formatNumber(words)} palabras`;
}

function latestSnapshotRecord() {
  return loadSnapshots()[0] || null;
}

function restoreLatestSnapshot() {
  const snapshot = latestSnapshotRecord();
  if (!snapshot) {
    showToast("Todavía no hay punto de restauración");
    return;
  }

  const confirmed = window.confirm(`Vas a restaurar el punto guardado el ${formatDateTime(snapshot.createdAt)}.\n\n${snapshot.summary}\n\nLa app volverá a ese estado y se sincronizará de nuevo si tienes sesión iniciada.`);
  if (!confirmed) return;

  state = ensureStateShape(deepMerge(structuredClone(defaultState), snapshot.state || {}));
  updateSafetyMeta({ lastRestoredAt: new Date().toISOString() });
  saveState("Restaurado desde punto local", {
    forceSnapshot: true,
    snapshotReason: `Restaurado desde ${formatDateTime(snapshot.createdAt)}`
  });
  render();
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
    syncStatus.title = safety.lastLocalSaveAt
      ? `Último guardado local ${formatDateTime(safety.lastLocalSaveAt)}. Abre la app desde el servidor para usar cuentas y sincronización.`
      : "Abre la app desde el servidor local para usar cuentas y sincronizacion.";
    authLabel.textContent = "Sin backend";
    logoutButton.hidden = true;
    return;
  }

  if (auth.user) {
    const label = auth.status === "synced" && auth.lastSync ? `Sync ${auth.lastSync}` : auth.statusLabel || "Sincronizando";
    syncStatus.textContent = label;
    syncStatus.title = safety.lastRemoteSaveAt
      ? `Última sincronización completa ${formatDateTime(safety.lastRemoteSaveAt)}. Pulsa para sincronizar ahora.`
      : "Pulsa para sincronizar ahora.";
    authLabel.textContent = auth.user.name || auth.user.email;
    logoutButton.hidden = false;
    return;
  }

  syncStatus.textContent = demoMode ? "Demo guiada" : auth.status === "offline" ? "Backend offline" : "Acceso privado";
  syncStatus.title = demoMode
    ? "Estás recorriendo una tesis de ejemplo. Solicita acceso si quieres trabajar con tu tesis real."
    : "Inicia sesión para entrar en tu espacio privado de tesis.";
  authLabel.textContent = demoMode ? "Acceso beta" : "Entrar";
  logoutButton.hidden = true;
}

function maybeOpenAuthFromUrl() {
  const url = new URL(window.location.href);
  const resetToken = url.searchParams.get("reset");
  if (auth.user && consumePostLoginRedirect()) {
    return;
  }
  if (resetToken && !auth.user) {
    pendingResetToken = resetToken;
    openAuthModal("reset");
    return;
  }
  if (resetToken && auth.user) {
    clearResetQueryParam();
  }

  const intent = url.searchParams.get("auth");
  if (!intent || auth.user) return;
  openAuthModal(intent === "register" ? "register" : "login");
  url.searchParams.delete("auth");
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}

function nextRedirectPath() {
  const url = new URL(window.location.href);
  const value = String(url.searchParams.get(NEXT_QUERY_PARAM) || "").trim();
  if (!value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}

function consumePostLoginRedirect() {
  const destination = nextRedirectPath();
  if (!destination) return false;
  const wantsPrivatePreview = destination === "/preview" || destination.startsWith("/preview?");
  const current = window.location.pathname + window.location.search + window.location.hash;
  if (auth.user && wantsPrivatePreview && auth.privateSiteAccess === false) {
    const url = new URL(window.location.href);
    url.searchParams.delete(NEXT_QUERY_PARAM);
    url.searchParams.delete("auth");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    showToast("Esta cuenta no tiene acceso privado con este email");
    return false;
  }
  if (destination === window.location.pathname) {
    const url = new URL(window.location.href);
    url.searchParams.delete(NEXT_QUERY_PARAM);
    url.searchParams.delete("auth");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    return false;
  }
  if (destination === current) return false;
  window.location.assign(destination);
  return true;
}

function clearGoogleCalendarQueryParam() {
  const url = new URL(window.location.href);
  url.searchParams.delete(GOOGLE_CALENDAR_QUERY_PARAM);
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}

function consumeGoogleCalendarQueryResult() {
  const url = new URL(window.location.href);
  const status = String(url.searchParams.get(GOOGLE_CALENDAR_QUERY_PARAM) || "").trim();
  if (!status) return;
  clearGoogleCalendarQueryParam();
  if (status === "connected") {
    showToast("Google Calendar conectado");
    state.activeView = "reviews";
    saveState("", { skipSync: true, skipSnapshot: true });
    render();
    return;
  }
  if (status === "denied") {
    showToast("Has cancelado la conexión con Google");
    return;
  }
  if (status === "unavailable") {
    showToast("Falta configurar Google Calendar en el servidor");
    return;
  }
  if (status === "expired") {
    showToast("La conexión con Google ha caducado. Inténtalo otra vez.");
    return;
  }
  showToast("No se pudo conectar Google Calendar");
}

async function loadGoogleCalendarStatus() {
  if (!API_ENABLED || !auth.user) {
    googleCalendar = createInitialGoogleCalendarState();
    render();
    return;
  }

  googleCalendar = { ...googleCalendar, loading: true };
  render();

  try {
    const response = await fetch("/api/integrations/google-calendar/status", { credentials: "same-origin" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "No se pudo cargar Google Calendar");
    googleCalendar = {
      ...createInitialGoogleCalendarState(),
      loading: false,
      configured: Boolean(result.configured),
      connected: Boolean(result.connected),
      googleEmail: String(result.googleEmail || ""),
      calendarId: String(result.calendarId || ""),
      updatedAt: String(result.updatedAt || ""),
      message: String(result.message || "")
    };
  } catch (error) {
    googleCalendar = {
      ...createInitialGoogleCalendarState(),
      loading: false,
      message: error.message || "No se pudo cargar el estado de Google Calendar."
    };
  }

  render();
  consumeGoogleCalendarQueryResult();
}

function connectGoogleCalendar() {
  if (!API_ENABLED) {
    showToast("Abre la app desde el servidor para usar Google Calendar");
    return;
  }
  if (!auth.user) {
    openAuthModal("login");
    return;
  }
  window.location.assign("/api/integrations/google-calendar/connect");
}

async function importGoogleCalendarMeetingsFromServer() {
  if (!API_ENABLED) {
    showToast("Abre la app desde el servidor para importar reuniones");
    return;
  }
  if (!auth.user) {
    openAuthModal("login");
    return;
  }

  googleCalendar = { ...googleCalendar, loading: true };
  render();

  try {
    const response = await fetch("/api/integrations/google-calendar/import", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daysAhead: 30 })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "No se pudieron importar reuniones");

    state = ensureStateShape(deepMerge(structuredClone(defaultState), result.state || {}));
    googleCalendar = {
      ...googleCalendar,
      loading: false,
      configured: Boolean(result.status?.configured),
      connected: Boolean(result.status?.connected),
      googleEmail: String(result.status?.googleEmail || googleCalendar.googleEmail || ""),
      calendarId: String(result.status?.calendarId || googleCalendar.calendarId || ""),
      updatedAt: String(result.status?.updatedAt || new Date().toISOString()),
      message: String(result.status?.message || googleCalendar.message || "")
    };
    updateSafetyMeta({ lastRemoteSaveAt: result.savedAt || new Date().toISOString() });
    saveState("", { skipSync: true, skipSnapshot: true });
    render();
    showToast(result.importedCount || result.updatedCount
      ? `Meet importadas: ${result.importedCount || 0} nuevas, ${result.updatedCount || 0} actualizadas`
      : "No he encontrado reuniones nuevas de Google Meet");
  } catch (error) {
    googleCalendar = { ...googleCalendar, loading: false };
    render();
    showToast(error.message || "No se pudieron importar reuniones");
  }
}

async function disconnectGoogleCalendar() {
  if (!API_ENABLED || !auth.user) return;
  googleCalendar = { ...googleCalendar, loading: true };
  render();

  try {
    const response = await fetch("/api/integrations/google-calendar/disconnect", {
      method: "POST",
      credentials: "same-origin"
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "No se pudo desconectar Google Calendar");
    googleCalendar = {
      ...createInitialGoogleCalendarState(),
      configured: Boolean(result.status?.configured),
      connected: false,
      message: String(result.status?.message || "Google Calendar desconectado.")
    };
    render();
    showToast("Google Calendar desconectado");
  } catch (error) {
    googleCalendar = { ...googleCalendar, loading: false };
    render();
    showToast(error.message || "No se pudo desconectar Google Calendar");
  }
}

function openAuthModal(intent = "login") {
  if (!API_ENABLED) {
    showToast("Abre la app desde el servidor para usar cuentas");
    return;
  }

  authModalMode = ["register", "recover", "reset"].includes(intent) ? intent : "login";
  authModal.hidden = false;
  syncAuthPanels();
  hydrateIcons(authModal);
  focusAuthField();
}

function closeAuthModal() {
  authModal.hidden = true;
}

function clearResetQueryParam() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("reset")) return;
  url.searchParams.delete("reset");
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}

function onboardingShouldAutoOpen() {
  if (!API_ENABLED || demoMode || !auth.user) return false;
  if (state.onboarding.completed || state.onboarding.dismissed || state.onboarding.active) return false;
  return !state.chapters.length && !state.tasks.length && !state.meetings.length && !state.reviewComments.length && !state.readings.length && !state.writingLog.length;
}

function openOnboarding(step = state.onboarding.step || 1, options = {}) {
  if (requiresAuthenticationWall() || demoMode) return;
  state.onboarding.active = true;
  state.onboarding.dismissed = false;
  state.onboarding.step = clamp(Number(step || 1), 1, ONBOARDING_STEPS.length);
  renderOnboardingModal(options.focus !== false);
}

function closeOnboarding(options = {}) {
  state.onboarding.active = false;
  if (options.dismiss) state.onboarding.dismissed = true;
  onboardingModal.hidden = true;
  if (!options.skipSave) saveState("");
}

function launchOnboardingIfNeeded() {
  if (!onboardingShouldAutoOpen()) return;
  state.onboarding.active = true;
  renderOnboardingModal();
}

function renderOnboardingModal(shouldFocus = true) {
  if (requiresAuthenticationWall() || !state.onboarding.active) {
    onboardingModal.hidden = true;
    return;
  }

  const step = ONBOARDING_STEPS.find((item) => item.id === state.onboarding.step) || ONBOARDING_STEPS[0];
  onboardingTitle.textContent = step.title;
  onboardingDescription.textContent = step.id === 1
    ? "En menos de cinco minutos dejaremos la tesis convertida en un espacio real de trabajo: estructura, semana y primera conversación académica."
    : step.id === 2
      ? "No buscamos perfección. Solo una estructura suficiente para empezar a escribir y revisar sin caos."
      : step.id === 3
        ? "La tesis se vuelve manejable cuando la próxima semana queda convertida en pocas acciones claras."
        : "La tesis también avanza cuando las reuniones y comentarios se transforman en decisiones visibles.";
  onboardingProgress.innerHTML = ONBOARDING_STEPS.map((item) => `
    <article class="onboarding-progress-step ${item.id === step.id ? "is-current" : item.id < step.id ? "is-done" : ""}">
      <span>${item.id}</span>
      <strong>${item.label}</strong>
    </article>
  `).join("");
  onboardingBody.innerHTML = renderOnboardingStepBody(step.id);
  onboardingPreview.innerHTML = renderOnboardingPreview(step.id);
  onboardingBack.hidden = step.id === 1;
  onboardingPrimary.textContent = step.id === ONBOARDING_STEPS.length ? "Activar mi sistema doctoral" : "Continuar";
  onboardingModal.hidden = false;
  hydrateIcons(onboardingModal);
  if (shouldFocus) focusOnboardingField(step.id);
}

function focusOnboardingField(step) {
  const selector = {
    1: "#onboardingThesisName",
    2: "[name='templateChapters']",
    3: "#onboardingFocusChapter",
    4: state.onboarding.data.setupType === "comment" ? "#onboardingCommentText" : "#onboardingMeetingDate"
  }[step] || "#onboardingThesisName";
  onboardingDialog.querySelector(selector)?.focus();
}

function handleOnboardingModalClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;

  if (action === "onboarding-close") {
    persistOnboardingDraft();
    closeOnboarding({ dismiss: true });
    showToast("Configuración inicial pospuesta");
    render();
    return;
  }

  if (action === "onboarding-back") {
    persistOnboardingDraft();
    state.onboarding.step = Math.max(1, state.onboarding.step - 1);
    renderOnboardingModal();
    return;
  }

  if (action === "onboarding-skip") {
    persistOnboardingDraft();
    closeOnboarding({ dismiss: true });
    showToast("Puedes retomar la configuración cuando quieras");
    render();
    return;
  }

  if (action === "onboarding-chapter-mode") {
    persistOnboardingDraft();
    state.onboarding.data.chapterMode = button.dataset.value === "custom" ? "custom" : "template";
    syncOnboardingChapterSelections();
    renderOnboardingModal();
    return;
  }

  if (action === "onboarding-setup-type") {
    persistOnboardingDraft();
    state.onboarding.data.setupType = button.dataset.value === "comment" ? "comment" : "meeting";
    renderOnboardingModal(false);
  }
}

function handleOnboardingSubmit(event) {
  const form = event.target;
  if (!form.matches("[data-onboarding-form]")) return;
  event.preventDefault();
  persistOnboardingDraft(form);

  const validationError = validateOnboardingStep();
  if (validationError) {
    showToast(validationError);
    renderOnboardingModal(false);
    return;
  }

  if (state.onboarding.step < ONBOARDING_STEPS.length) {
    state.onboarding.step += 1;
    renderOnboardingModal();
    return;
  }

  completeOnboarding();
}

function persistOnboardingDraft(form = onboardingDialog.querySelector("[data-onboarding-form]")) {
  if (!form) return;
  const formData = new FormData(form);
  const data = state.onboarding.data;

  if (state.onboarding.step === 1) {
    data.thesisName = String(formData.get("thesisName") || data.thesisName || "").trim() || "Mi tesis doctoral";
    data.program = String(formData.get("program") || "").trim();
    data.university = String(formData.get("university") || "").trim();
    data.phase = String(formData.get("phase") || data.phase || "Organizando el trabajo");
    data.writingTarget = Number(formData.get("writingTarget") || data.writingTarget || 65000);
    data.question = String(formData.get("question") || "").trim();
  }

  if (state.onboarding.step === 2) {
    data.chapterMode = String(formData.get("chapterMode") || data.chapterMode || "template");
    data.templateChapters = formData.getAll("templateChapters").filter(Boolean);
    data.customChapters = String(formData.get("customChapters") || "").trim();
    syncOnboardingChapterSelections();
  }

  if (state.onboarding.step === 3) {
    data.focusChapter = String(formData.get("focusChapter") || data.focusChapter || "").trim();
    data.firstTask = String(formData.get("firstTask") || "").trim();
    data.firstDue = String(formData.get("firstDue") || data.firstDue || "");
  }

  if (state.onboarding.step === 4) {
    data.setupType = String(formData.get("setupType") || data.setupType || "meeting");
    data.meetingDate = String(formData.get("meetingDate") || data.meetingDate || "");
    data.meetingTime = String(formData.get("meetingTime") || data.meetingTime || "");
    data.meetingWith = String(formData.get("meetingWith") || "").trim();
    data.meetingTopic = String(formData.get("meetingTopic") || "").trim();
    data.commentChapter = String(formData.get("commentChapter") || data.commentChapter || "").trim();
    data.commentText = String(formData.get("commentText") || "").trim();
    data.commentDue = String(formData.get("commentDue") || data.commentDue || "");
  }

  state.onboarding.data = data;
  state.onboarding.step = clamp(Number(state.onboarding.step || 1), 1, ONBOARDING_STEPS.length);
}

function syncOnboardingChapterSelections() {
  const planned = onboardingPlannedChapterTitles();
  const fallback = planned[0] || "Introducción";
  if (!planned.includes(state.onboarding.data.focusChapter)) {
    state.onboarding.data.focusChapter = fallback;
  }
  if (!planned.includes(state.onboarding.data.commentChapter)) {
    state.onboarding.data.commentChapter = fallback;
  }
}

function validateOnboardingStep() {
  const data = state.onboarding.data;
  const step = state.onboarding.step;
  if (step === 1) {
    if (!String(data.thesisName || "").trim()) return "Pon al menos un título operativo para arrancar la tesis.";
    if (String(data.question || "").trim().length < 12) return "Escribe una pregunta o foco doctoral un poco más concreto para que el sistema tenga contexto.";
    return "";
  }

  if (step === 2) {
    const planned = onboardingPlannedChapterTitles(data);
    if (planned.length < 2) return "Selecciona o escribe al menos dos capítulos para crear una estructura útil.";
    return "";
  }

  if (step === 3) {
    if (!String(data.focusChapter || "").trim()) return "Elige el capítulo que necesita atención esta semana.";
    if (String(data.firstTask || "").trim().length < 8) return "Define una tarea semanal más concreta para que el plan arranque bien.";
    if (!String(data.firstDue || "").trim()) return "Añade una fecha para que la primera semana quede cerrada.";
    return "";
  }

  if (step === 4) {
    if (data.setupType === "meeting") {
      if (!String(data.meetingDate || "").trim()) return "Pon una fecha para la primera reunión.";
      if (!String(data.meetingWith || "").trim()) return "Indica con quién es la reunión para dejarla bien registrada.";
      if (!String(data.meetingTopic || "").trim()) return "Añade el tema principal de la reunión.";
      return "";
    }
    if (!String(data.commentChapter || "").trim()) return "Elige el capítulo afectado por el comentario.";
    if (String(data.commentText || "").trim().length < 12) return "Escribe el comentario o bloqueo con algo más de detalle.";
    if (!String(data.commentDue || "").trim()) return "Añade una fecha para responder ese comentario.";
    return "";
  }

  return "";
}

function onboardingPlannedChapterTitles(data = state.onboarding.data) {
  if (data.chapterMode === "custom") {
    return [...new Set(splitLines(data.customChapters).map((item) => item.trim()).filter(Boolean))].slice(0, 6);
  }
  return [...new Set((data.templateChapters || []).map((item) => item.trim()).filter(Boolean))];
}

function renderOnboardingStepBody(step) {
  const data = state.onboarding.data;
  if (step === 1) {
    return `
      <div class="onboarding-copy-block">
        <p class="card-kicker">Paso 1 de 4</p>
        <h3>Solo necesitamos una base real, no una versión definitiva</h3>
        <p>DoctoralOS funciona mejor cuando la tesis ya tiene un nombre operativo, una fase y una pregunta visible que te recuerde qué estás intentando cerrar.</p>
      </div>
      ${field("Título provisional", "thesisName", "text", data.thesisName, true).replace('id="thesisName"', 'id="onboardingThesisName"')}
      ${field("Programa o línea doctoral", "program", "text", data.program, true)}
      ${field("Universidad o centro", "university", "text", data.university, true)}
      ${selectField("Fase actual", "phase", ["Organizando el trabajo", "Exploración", "Escritura", "Escritura y revisión", "Cierre"], data.phase)}
      ${field("Objetivo aproximado de palabras", "writingTarget", "number", data.writingTarget, true)}
      ${field("Pregunta o foco doctoral", "question", "textarea", data.question || "Formula en una frase qué intenta resolver tu tesis ahora mismo.", true)}
    `;
  }

  if (step === 2) {
    const planned = onboardingPlannedChapterTitles();
    return `
      <div class="onboarding-copy-block">
        <p class="card-kicker">Paso 2 de 4</p>
        <h3>Construyamos el esqueleto mínimo de la tesis</h3>
        <p>Lo importante aquí no es cerrar el índice definitivo, sino arrancar con una estructura suficiente para poder escribir, revisar y planificar la semana.</p>
      </div>
      <input name="chapterMode" type="hidden" value="${escapeAttribute(data.chapterMode)}">
      <div class="onboarding-toggle-row">
        <button class="onboarding-toggle ${data.chapterMode === "template" ? "is-active" : ""}" data-action="onboarding-chapter-mode" data-value="template" type="button">Plantilla rápida</button>
        <button class="onboarding-toggle ${data.chapterMode === "custom" ? "is-active" : ""}" data-action="onboarding-chapter-mode" data-value="custom" type="button">Capítulos propios</button>
      </div>
      ${data.chapterMode === "template" ? `
        <div class="onboarding-choice-grid">
          ${ONBOARDING_CHAPTER_TEMPLATES.map((chapter) => `
            <label class="onboarding-choice-card ${data.templateChapters.includes(chapter.title) ? "is-selected" : ""}">
              <input ${data.templateChapters.includes(chapter.title) ? "checked" : ""} name="templateChapters" type="checkbox" value="${escapeAttribute(chapter.title)}">
              <strong>${escapeHtml(chapter.title)}</strong>
              <span>${escapeHtml(chapter.goal)}</span>
            </label>
          `).join("")}
        </div>
      ` : `
        ${field("Escribe de 2 a 6 capítulos, uno por línea", "customChapters", "textarea", data.customChapters || "Introducción\nMarco teórico\nMetodología", true)}
      `}
      <p class="form-help">Ahora mismo se crearán solo los capítulos iniciales. Luego podrás editarlos, renombrarlos o ampliarlos con calma.</p>
      ${planned.length ? `<div class="onboarding-inline-note"><strong>Estructura prevista:</strong> ${escapeHtml(planned.join(" · "))}</div>` : `<div class="onboarding-inline-note">Selecciona al menos dos capítulos para continuar con una estructura útil.</div>`}
    `;
  }

  if (step === 3) {
    const chapterOptions = onboardingPlannedChapterTitles();
    return `
      <div class="onboarding-copy-block">
        <p class="card-kicker">Paso 3 de 4</p>
        <h3>Convirtamos la tesis en una semana clara</h3>
        <p>La tesis empieza a respirar mejor cuando traduces el proyecto a una tarea cerrable, una fecha y un capítulo principal. Menos ambición difusa, más siguiente movimiento.</p>
      </div>
      ${selectField("Capítulo que necesita atención ahora", "focusChapter", chapterOptions.length ? chapterOptions : ["Introducción"], data.focusChapter)}
      ${field("Tarea concreta que quieres cerrar esta semana", "firstTask", "text", data.firstTask || "Cerrar borrador del planteamiento metodológico", true)}
      ${field("Fecha importante o límite interno", "firstDue", "date", data.firstDue, true)}
      <div class="onboarding-inline-note"><strong>Regla útil:</strong> una prioridad de escritura, una de revisión y una administrativa como máximo.</div>
    `;
  }

  const commentOptions = onboardingPlannedChapterTitles();
  return `
    <div class="onboarding-copy-block">
      <p class="card-kicker">Paso 4 de 4</p>
      <h3>Haz visible tu primera conversación académica</h3>
      <p>La tesis no solo se escribe. También se revisa, se comenta y se acuerda. Aquí dejaremos preparada una reunión o un comentario real para que el flujo arranque ya con contexto.</p>
    </div>
    <input name="setupType" type="hidden" value="${escapeAttribute(data.setupType)}">
    <div class="onboarding-toggle-row">
      <button class="onboarding-toggle ${data.setupType === "meeting" ? "is-active" : ""}" data-action="onboarding-setup-type" data-value="meeting" type="button">Registrar reunión</button>
      <button class="onboarding-toggle ${data.setupType === "comment" ? "is-active" : ""}" data-action="onboarding-setup-type" data-value="comment" type="button">Registrar comentario</button>
    </div>
    ${data.setupType === "meeting" ? `
      ${field("Fecha de la próxima reunión", "meetingDate", "date", data.meetingDate, true).replace('id="meetingDate"', 'id="onboardingMeetingDate"')}
      ${field("Hora", "meetingTime", "time", data.meetingTime, true)}
      ${field("Con quién", "meetingWith", "text", data.meetingWith || "Directora", true)}
      ${field("Tema principal", "meetingTopic", "text", data.meetingTopic || "Seguimiento del capítulo prioritario", true)}
    ` : `
      ${selectField("Capítulo afectado", "commentChapter", commentOptions.length ? commentOptions : ["Introducción"], data.commentChapter)}
      ${field("Comentario o bloqueo detectado", "commentText", "textarea", data.commentText || "Falta justificar mejor la muestra o afinar el cierre de la pregunta.", true).replace('id="commentText"', 'id="onboardingCommentText"')}
      ${field("Fecha objetivo para responderlo", "commentDue", "date", data.commentDue, true)}
    `}
  `;
}

function renderOnboardingPreview(step) {
  const data = state.onboarding.data;
  const plannedChapters = onboardingPlannedChapterTitles();
  const activeSetup = data.setupType === "meeting"
    ? `Reunión prevista: ${data.meetingDate ? formatDate(data.meetingDate) : "sin fecha"}${data.meetingTime ? ` · ${data.meetingTime}` : ""}${data.meetingWith ? ` · ${data.meetingWith}` : ""}`
    : `Comentario preparado para ${data.commentChapter || "tu capítulo principal"}${data.commentDue ? ` · ${formatDate(data.commentDue)}` : ""}`;
  const tips = {
    1: "No hace falta acertar en todo: solo dejar una base suficientemente real para empezar a trabajar ya.",
    2: "Empieza con 3 o 4 capítulos, no con el índice definitivo de toda la tesis.",
    3: "La tarea de esta semana debería poder cerrarse en menos de dos sesiones largas de trabajo.",
    4: "Una reunión o un comentario visible convierten la revisión en trabajo accionable dentro del sistema."
  };
  const outcomes = [
    `Tesis lista como proyecto: ${data.thesisName || "Mi tesis doctoral"}`,
    plannedChapters.length ? `${plannedChapters.length} capítulos iniciales preparados` : "Estructura mínima de capítulos lista",
    data.firstTask ? "Primera semana convertida en una tarea cerrable" : "Primera semana lista para aterrizarse",
    data.setupType === "meeting" ? "Primera reunión registrada con contexto" : "Primer comentario visible dentro del flujo"
  ];
  return `
    <article class="card onboarding-preview-card">
      <p class="card-kicker">Vista previa</p>
      <h3>${escapeHtml(data.thesisName || "Mi tesis doctoral")}</h3>
      <div class="onboarding-preview-meta">
        <span>4 pasos</span>
        <span>3-5 minutos</span>
        <span>Guardado automático</span>
      </div>
      <div class="onboarding-preview-stack">
        <div>
          <strong>Capítulos iniciales</strong>
          <span>${plannedChapters.length ? escapeHtml(plannedChapters.join(" · ")) : "Aún no definidos"}</span>
        </div>
        <div>
          <strong>Foco semanal</strong>
          <span>${escapeHtml(data.firstTask || "Todavía sin tarea concreta")}</span>
        </div>
        <div>
          <strong>Próxima conversación</strong>
          <span>${escapeHtml(activeSetup)}</span>
        </div>
      </div>
      <div class="onboarding-outcome-list">
        <strong>Al terminar tendrás</strong>
        <ul>
          ${outcomes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
      <p class="onboarding-preview-tip">${escapeHtml(tips[step])}</p>
    </article>
  `;
}

function completeOnboarding() {
  const data = state.onboarding.data;
  const candidate = auth.user?.name || state.project.candidate || data.candidate || "Doctorando/a";
  const plannedTitles = onboardingPlannedChapterTitles();
  const effectiveTitles = plannedTitles.length ? plannedTitles : [...createInitialOnboardingState(candidate).data.templateChapters];
  const selectedTemplates = ONBOARDING_CHAPTER_TEMPLATES.filter((chapter) => effectiveTitles.includes(chapter.title));
  const seeds = selectedTemplates.length
    ? selectedTemplates
    : effectiveTitles.map((title) => ({ title, goal: `Definir el objetivo operativo de ${title.toLowerCase()}.`, target: 8000 }));

  state.project = {
    ...state.project,
    name: data.thesisName || state.project.name,
    candidate,
    program: data.program,
    university: data.university,
    phase: data.phase,
    writingTarget: Number(data.writingTarget || state.project.writingTarget || 65000),
    question: data.question || state.project.question
  };

  if (!state.chapters.length) {
    state.chapters = seeds.map((seed, index) => createChapterScaffold({
      title: seed.title,
      goal: seed.goal,
      status: index === 0 ? "Borrador" : "Esquema",
      progress: index === 0 ? 12 : 0,
      words: 0,
      target: seed.target,
      due: offsetISODate(10 + (index * 7))
    }));
    state.editorChapterId = state.chapters[0]?.id || "";
  }

  if (data.firstTask && !state.tasks.some((task) => normalizeUserText(task.title) === normalizeUserText(data.firstTask))) {
    state.tasks.unshift({
      id: createId("tk"),
      title: data.firstTask,
      area: "Capítulos",
      status: inferTaskColumn(data.firstDue),
      due: data.firstDue || "",
      effort: "90 min",
      impact: "Alto",
      done: false,
      completedAt: ""
    });
  }

  if (data.setupType === "meeting" && data.meetingDate) {
    state.meetings.unshift({
      id: createId("mt"),
      date: data.meetingDate,
      time: data.meetingTime || "",
      type: inferMeetingType(data.meetingWith, data.meetingTopic),
      attendees: data.meetingWith || "",
      agenda: data.meetingTopic || "Seguimiento inicial de tesis",
      summary: "",
      decisions: "",
      tasks: "",
      notes: "",
      next: ""
    });
  }

  if (data.setupType === "comment" && data.commentText) {
    state.reviewComments.unshift({
      id: createId("rv"),
      chapter: data.commentChapter || state.chapters[0]?.title || "Sin capítulo",
      source: "Dirección",
      comment: data.commentText,
      response: "Definir respuesta y criterio de cierre.",
      status: "Pendiente",
      priority: "Media",
      due: data.commentDue || ""
    });
  }

  state.onboarding.completed = true;
  state.onboarding.justCompleted = true;
  state.onboarding.dismissed = false;
  state.onboarding.active = false;
  state.onboarding.step = ONBOARDING_STEPS.length;
  state.activeView = "dashboard";
  saveState("Sistema doctoral activado");
  onboardingModal.hidden = true;
  render();
  showToast("Tu sistema doctoral ya está en marcha");
}

function authModalCopy(mode) {
  if (mode === "recover") {
    return {
      title: "Recuperar acceso",
      description: "Solicita un enlace seguro para restablecer tu contraseña. Si el correo tarda o surge cualquier incidencia durante la beta, también puedes escribirnos y te ayudamos."
    };
  }
  if (mode === "reset") {
    return {
      title: "Elegir nueva contraseña",
      description: "Ya tienes un enlace válido de recuperación. Define una contraseña nueva y entraremos directamente en tu espacio privado."
    };
  }
  return {
    title: "Entrar en DoctoralOS",
    description: "DoctoralOS funciona como beta cerrada: el trabajo real vive en una cuenta privada y el acceso nuevo puede requerir invitación o validación previa."
  };
}

function syncAuthPanels() {
  const singlePanelMode = authModalMode === "recover" || authModalMode === "reset";
  authModal.querySelectorAll("[data-auth-panel]").forEach((panel) => {
    const panelName = panel.dataset.authPanel;
    const visible = singlePanelMode
      ? panelName === authModalMode
      : panelName === "login" || panelName === "register";
    panel.hidden = !visible;
  });

  authGrid?.classList.toggle("is-single", singlePanelMode);
  const copy = authModalCopy(authModalMode);
  if (authTitle) authTitle.textContent = copy.title;
  if (authDescription) authDescription.textContent = copy.description;

  const resetTokenField = authModal.querySelector("#resetToken");
  if (resetTokenField) resetTokenField.value = pendingResetToken;
}

function focusAuthField() {
  const focusTarget = {
    login: "#loginEmail",
    register: "#registerName",
    recover: "#recoverEmail",
    reset: "#resetNewPassword"
  }[authModalMode] || "#loginEmail";
  authModal.querySelector(focusTarget)?.focus();
}

function handleAuthModalClick(event) {
  if (event.target === authModal || event.target.closest("[data-action='auth-close']")) {
    closeAuthModal();
    return;
  }

  const switchButton = event.target.closest("[data-action='auth-switch']");
  if (!switchButton) return;
  openAuthModal(switchButton.dataset.intent || "login");
}

async function handleAuthSubmit(event) {
  const form = event.target;
  if (!form.matches("[data-auth-form]")) return;
  event.preventDefault();

  const mode = form.dataset.authForm;
  const payload = Object.fromEntries(new FormData(form).entries());

  if (mode === "password-reset-confirm") {
    const newPassword = String(payload.newPassword || "");
    const confirmPassword = String(payload.confirmPassword || "");
    if (newPassword !== confirmPassword) {
      showToast("Las contraseñas nuevas no coinciden");
      return;
    }
    delete payload.confirmPassword;
  }

  try {
    setAuthStatus(mode.startsWith("password-reset") ? "Preparando recuperación" : "Conectando");
    const endpoint = mode === "password-reset-request"
      ? "/api/password-reset/request"
      : mode === "password-reset-confirm"
        ? "/api/password-reset/confirm"
        : "/api/" + mode;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo completar la solicitud");

    if (mode === "password-reset-request") {
      form.reset();
      if (result.previewUrl) {
        const previewUrl = new URL(result.previewUrl, window.location.origin);
        pendingResetToken = previewUrl.searchParams.get("reset") || "";
        window.history.replaceState({}, "", previewUrl.pathname + previewUrl.search + previewUrl.hash);
        openAuthModal("reset");
        showToast("Enlace de recuperación preparado en entorno de prueba");
        return;
      }
      openAuthModal("login");
      showToast(result.message || "Si la cuenta existe, ya hemos preparado la recuperación.");
      return;
    }

    applySession(result);
    if (result.state && Object.keys(result.state).length) {
      state = ensureStateShape(deepMerge(structuredClone(defaultState), result.state));
      saveState("", { skipSync: true });
    } else {
      state = createFreshState(result.user);
      saveState("", { skipSync: true });
      await syncNow(false);
    }

    if (mode === "password-reset-confirm") {
      pendingResetToken = "";
      clearResetQueryParam();
    }

    closeAuthModal();
    form.reset();
    await loadGoogleCalendarStatus();
    if (consumePostLoginRedirect()) return;
    showToast(mode === "password-reset-confirm" ? "Contraseña actualizada" : "Cuenta sincronizada");
    render();
    launchOnboardingIfNeeded();
  } catch (error) {
    setAuthStatus("Error");
    showToast(error.message || "No se pudo conectar");
  }
}

async function restoreSession() {
  if (!API_ENABLED) {
    updateAuthUI();
    return;
  }

  try {
    setAuthStatus("Comprobando");
    const response = await fetch("/api/me", { credentials: "same-origin" });
    const result = await response.json().catch(() => ({}));

    if (response.status === 401) {
      auth = { user: null, privateSiteAccess: false, status: "local", lastSync: "", statusLabel: demoMode ? "Demo guiada" : "Local" };
      googleCalendar = createInitialGoogleCalendarState();
      updateAuthUI();
      return;
    }
    if (!response.ok) throw new Error(result.error || "No se pudo recuperar la sesión");

    applySession(result);
    if (result.state && Object.keys(result.state).length) {
      state = ensureStateShape(deepMerge(structuredClone(defaultState), result.state));
      saveState("", { skipSync: true });
      render();
      launchOnboardingIfNeeded();
    } else {
      state = createFreshState(result.user);
      saveState("", { skipSync: true });
      await syncNow(false);
      render();
      launchOnboardingIfNeeded();
    }
    await loadGoogleCalendarStatus();
  } catch (error) {
    auth = { ...auth, user: null, privateSiteAccess: false, status: "offline", lastSync: "", statusLabel: "Backend offline" };
    googleCalendar = createInitialGoogleCalendarState();
    updateAuthUI();
  }
}

function applySession(result) {
  auth.user = result.user || null;
  auth.privateSiteAccess = Boolean(result.user?.privateSiteAccess);
  auth.status = "synced";
  auth.lastSync = shortTime();
  auth.statusLabel = "Sincronizado";
  if (demoMode) {
    demoMode = false;
    clearDemoQuery();
    safety = loadSafetyMeta();
  }
  updateAuthUI();
}

async function logout() {
  if (API_ENABLED) {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
    } catch (error) {
      // La sesión local se cierra igualmente.
    }
  }
  auth = { user: null, privateSiteAccess: false, status: "local", lastSync: "", statusLabel: "Local" };
  googleCalendar = createInitialGoogleCalendarState();
  updateAuthUI();
  showToast("Sesión cerrada");
}

function scheduleSync() {
  if (!API_ENABLED || !auth.user) {
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

  if (!auth.user) {
    openAuthModal();
    return;
  }

  try {
    setAuthStatus("Guardando");
    const response = await fetch("/api/state", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state })
    });
    const result = await response.json().catch(() => ({}));

    if (response.status === 401) {
      auth = { user: null, privateSiteAccess: false, status: "local", lastSync: "", statusLabel: "Vuelve a entrar" };
      googleCalendar = createInitialGoogleCalendarState();
      updateAuthUI();
      if (showMessage) showToast("La sesión ha caducado. Vuelve a entrar.");
      openAuthModal();
      return;
    }
    if (!response.ok) throw new Error(result.error || "No se pudo sincronizar");

    auth.status = "synced";
    auth.lastSync = shortTime();
    auth.statusLabel = "Sincronizado";
    updateSafetyMeta({ lastRemoteSaveAt: result.savedAt || new Date().toISOString() });
    updateAuthUI();
    if (showMessage) showToast("Sincronizado");
  } catch (error) {
    auth.status = "offline";
    auth.statusLabel = "Error de sincronización";
    updateAuthUI();
    if (showMessage) showToast(error.message || "Sincronización fallida");
  }
}

function setAuthStatus(label) {
  auth.statusLabel = label;
  updateAuthUI();
}

function shortTime() {
  return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function handleNavigation(event) {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  if (requiresAuthenticationWall()) {
    openAuthModal("login");
    return;
  }
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

async function handleScreenClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  const id = target.dataset.id;

  if (action === "go") {
    if (requiresAuthenticationWall()) {
      openAuthModal("login");
      return;
    }
    state.activeView = target.dataset.view;
    saveState("");
    render();
    return;
  }

  if (action === "auth-launch") {
    openAuthModal(target.dataset.intent === "register" ? "register" : "login");
    return;
  }

  if (action === "open-onboarding") {
    if (requiresAuthenticationWall()) {
      openAuthModal("login");
      return;
    }
    openOnboarding(Number(target.dataset.step || 1));
    return;
  }

  if (action === "dismiss-onboarding-summary") {
    state.onboarding.justCompleted = false;
    saveState("");
    render();
    return;
  }

  if (action === "assistant-suggest") {
    submitAssistantPrompt(target.dataset.message || "");
    return;
  }

  if (action === "assistant-clear") {
    state.assistantThread = createInitialAssistantThread();
    assistantPendingAction = null;
    saveState("Conversación reiniciada");
    render();
    return;
  }

  if (action === "assistant-snapshot") {
    saveState("Punto de restauración creado", {
      skipSync: true,
      forceSnapshot: true,
      snapshotReason: "Punto de restauración manual"
    });
    render();
    return;
  }

  if (action === "assistant-restore-latest") {
    restoreLatestSnapshot();
    return;
  }

  if (action === "assistant-export") {
    exportData();
    return;
  }

  if (action === "assistant-confirm-action") {
    confirmAssistantPendingAction();
    return;
  }

  if (action === "assistant-cancel-action") {
    assistantPendingAction = null;
    showToast("Vista previa cancelada");
    render();
    return;
  }

  if (action === "assistant-undo-action") {
    undoAssistantLastAction();
    return;
  }

  if (action === "assistant-feedback") {
    applyAssistantFeedback(target.dataset.id, target.dataset.feedback);
    return;
  }

  if (action === "assistant-style-pref") {
    updateAssistantStylePreference(target.dataset.key, target.dataset.value);
    return;
  }

  if (action === "assistant-style-reset") {
    state.assistantStyleMemory = createInitialAssistantStyleMemory();
    refreshAssistantStyleMemory(state);
    saveState("Memoria de estilo reiniciada");
    render();
    return;
  }

  if (action === "google-calendar-connect") {
    connectGoogleCalendar();
    return;
  }

  if (action === "google-calendar-import") {
    importGoogleCalendarMeetingsFromServer();
    return;
  }

  if (action === "google-calendar-disconnect") {
    disconnectGoogleCalendar();
    return;
  }

  if (action === "save-meeting-notes") {
    const meeting = state.meetings.find((item) => item.id === id);
    if (!meeting) return;
    saveState("Notas de reunión guardadas");
    render();
    return;
  }

  if (action === "meeting-autoclose") {
    const meeting = state.meetings.find((item) => item.id === id);
    if (!meeting) return;
    if (!meetingHasClosureSource(meeting)) {
      showToast("Añade primero unas notas rápidas o acuerdos de salida");
      return;
    }
    submitAssistantPrompt(`Cierra la reunión del ${meeting.date}${meeting.time ? ` a las ${meeting.time}` : ""} y deja resumen, decisiones y tareas a partir de sus notas.`);
    return;
  }

  if (action === "analytics-range") {
    state.analyticsRange = target.dataset.value === "day" ? "day" : "week";
    saveState("", { skipSync: true });
    render();
    return;
  }

  if (action === "exit-demo") {
    demoMode = false;
    clearDemoQuery();
    state = loadState();
    safety = loadSafetyMeta();
    saveState("Demo cerrada", { skipSync: true });
    render();
    return;
  }

  if (action === "toggle-rewrite-check") {
    const chapter = state.chapters.find((item) => item.id === target.dataset.chapterId);
    const item = chapter?.rewriteChecklist?.find((entry) => entry.id === id);
    if (!chapter || !item) return;
    item.done = !item.done;
    chapter.editorUpdatedAt = new Date().toISOString();
    saveState("Checklist de reescritura actualizada");
    render();
    return;
  }

  if (action === "chapter-status") {
    updateChapterStatus(id, target.dataset.value);
  }

  if (action === "delete-chapter") {
    state.chapters = state.chapters.filter((chapter) => chapter.id !== id);
    if (state.editorChapterId === id) state.editorChapterId = state.chapters[0]?.id || "";
    saveState("Capítulo eliminado");
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
        title: `Sección ${chapter.sections.length + 1}`,
        goal: "Definir función de esta sección.",
        status: "Esquema",
        words: 0,
        content: ""
      });
      chapter.editorUpdatedAt = new Date().toISOString();
    }
    saveState("Sección añadida");
    render();
  }

  if (action === "delete-section") {
    const chapter = state.chapters.find((item) => item.id === target.dataset.chapterId);
    if (chapter && chapter.sections.length > 1) {
      chapter.sections = chapter.sections.filter((section) => section.id !== id);
      recalcChapterWords(chapter);
      chapter.editorUpdatedAt = new Date().toISOString();
    }
    saveState("Sección eliminada");
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
    try {
      await deleteReadingRecord(id);
    } catch (error) {
      showToast(error.message || "No se pudo eliminar la lectura.");
    }
    return;
  }

  if (action === "select-reading") {
    state.literatureCitationId = id;
    resetReadingPdfViewer(id);
    saveState("", { skipSync: true });
    render();
    return;
  }

  if (action === "reading-pdf-prev") {
    if (!readingPdfViewer.document) return;
    readingPdfViewer.currentPage = Math.max(1, readingPdfViewer.currentPage - 1);
    clearReadingPdfSelection(false);
    await renderReadingPdfPage(findReadingById(state.literatureCitationId));
    return;
  }

  if (action === "reading-pdf-next") {
    if (!readingPdfViewer.document) return;
    readingPdfViewer.currentPage = Math.min(readingPdfViewer.totalPages || 1, readingPdfViewer.currentPage + 1);
    clearReadingPdfSelection(false);
    await renderReadingPdfPage(findReadingById(state.literatureCitationId));
    return;
  }

  if (action === "reading-pdf-zoom-in") {
    if (!readingPdfViewer.document) return;
    readingPdfViewer.scale = Math.min(2.2, Number((readingPdfViewer.scale + 0.1).toFixed(2)));
    await renderReadingPdfPage(findReadingById(state.literatureCitationId));
    return;
  }

  if (action === "reading-pdf-zoom-out") {
    if (!readingPdfViewer.document) return;
    readingPdfViewer.scale = Math.max(0.8, Number((readingPdfViewer.scale - 0.1).toFixed(2)));
    await renderReadingPdfPage(findReadingById(state.literatureCitationId));
    return;
  }

  if (action === "save-reading-highlight") {
    saveReadingHighlight();
    return;
  }

  if (action === "delete-reading-highlight") {
    const reading = findReadingById(target.dataset.readingId);
    if (!reading) return;
    reading.annotations = (reading.annotations || []).filter((item) => item.id !== id);
    saveState("Subrayado eliminado");
    render();
    return;
  }

  if (action === "reading-highlight-to-note") {
    sendReadingHighlightToChapter(target.dataset.readingId, id);
    return;
  }

  if (action === "open-reading-highlight") {
    const readingId = target.dataset.readingId;
    const reading = findReadingById(readingId);
    const annotation = reading?.annotations?.find((item) => item.id === id);
    if (!reading || !annotation) return;
    state.literatureCitationId = readingId;
    if (readingPdfViewer.readingId !== readingId) {
      resetReadingPdfViewer(readingId);
    }
    readingPdfViewer.currentPage = Number(annotation.page || 1);
    readingPdfViewer.selectedPage = Number(annotation.page || 1);
    saveState("", { skipSync: true });
    render();
    return;
  }

  if (action === "remove-reading-pdf") {
    await removeReadingPdf(id);
    return;
  }

  if (action === "show-citation") {
    state.literatureCitationId = id;
    saveState("", { skipSync: true });
    render();
  }

  if (action === "copy-citation") {
    const reading = state.readings.find((item) => item.id === id);
    if (reading) copyTextToClipboard(buildBibliographicReference(reading, state.literatureCitationStyle));
  }

  if (action === "task-status") {
    const task = state.tasks.find((item) => item.id === id);
    if (task) {
      task.status = target.dataset.value;
      task.done = false;
      task.completedAt = "";
    }
    saveState("Tarea actualizada");
    render();
  }

  if (action === "toggle-task-done") {
    const task = state.tasks.find((item) => item.id === id);
    if (task) {
      task.done = !task.done;
      task.completedAt = task.done ? new Date().toISOString() : "";
    }
    saveState(task?.done ? "Tarea completada" : "Tarea reabierta");
    render();
  }

  if (action === "delete-task") {
    state.tasks = state.tasks.filter((task) => task.id !== id);
    saveState("Tarea eliminada");
    render();
  }

  if (action === "delete-meeting") {
    state.meetings = state.meetings.filter((meeting) => meeting.id !== id);
    saveState("Reunión eliminada");
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
        area: "Revisión",
        status: "week",
        due: comment.due || "",
        effort: comment.priority === "Alta" ? "90 min" : "45 min",
        impact: comment.priority === "Alta" ? "Alto" : "Medio",
        done: false,
        completedAt: ""
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
    saveState("Sesión eliminada");
    render();
  }

  if (action === "delete-forum-topic") {
    state.forumTopics = state.forumTopics.filter((topic) => topic.id !== id);
    saveState("Tema eliminado");
    render();
  }
}

async function handleFormSubmit(event) {
  const form = event.target;
  if (!form.matches("form[data-form]")) return;
  event.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  const formType = form.dataset.form;

  if (formType === "assistant") {
    submitAssistantPrompt(String(data.message || ""));
    form.reset();
    return;
  }

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
    saveState("Capítulo creado");
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
          title: sectionNode.querySelector(`[name="sectionTitle-${sectionId}"]`)?.value || "Sección",
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
    saveState("Capítulo guardado");
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
    saveState("Nota añadida");
    form.reset();
    render();
  }

  if (formType === "reading") {
    const reading = {
      id: createId("rd"),
      title: data.title || "Lectura sin título",
      authors: data.authors || "Autor pendiente",
      year: data.year || "",
      type: data.type || "Artículo",
      source: data.source || "",
      status: data.status || "Pendiente",
      chapter: data.chapter || "Sin capítulo",
      use: data.use || "",
      doi: data.doi || "",
      pdf: null,
      annotations: []
    };
    state.readings.push(reading);
    state.literatureCitationId = reading.id;
    const readingPdfFile = formData.get("pdfFile");
    if (readingPdfFile instanceof File && readingPdfFile.size) {
      const uploaded = await uploadReadingPdf(reading, readingPdfFile);
      if (!uploaded) {
        saveState("Lectura añadida sin PDF");
        form.reset();
        render();
        return;
      }
      form.reset();
      return;
    }
    saveState("Lectura añadida");
    form.reset();
    render();
    return;
  }

  if (formType === "task") {
    state.tasks.push({
      id: createId("tk"),
      title: data.title || "Nueva tarea",
      area: data.area || "General",
      status: data.status || "week",
      due: data.due || "",
      effort: data.effort || "30 min",
      impact: data.impact || "Medio",
      done: false,
      completedAt: ""
    });
    saveState("Tarea creada");
    form.reset();
    render();
  }

  if (formType === "meeting") {
    state.meetings.unshift({
      id: createId("mt"),
      date: data.date || new Date().toISOString().slice(0, 10),
      time: data.time || "",
      type: data.type || "Dirección",
      attendees: data.attendees || "",
      agenda: data.agenda || "",
      summary: "",
      decisions: data.decisions || "",
      tasks: data.tasks || "",
      notes: "",
      next: data.next || ""
    });
    saveState("Reunión guardada");
    form.reset();
    render();
  }

  if (formType === "comment") {
    state.reviewComments.unshift({
      id: createId("rv"),
      chapter: data.chapter || "Sin capítulo",
      source: data.source || "Dirección",
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

  if (formType === "forum-topic") {
    state.forumTopics.unshift({
      id: createId("ft"),
      title: data.title || "Tema sin título",
      tag: data.tag || "Duda",
      body: data.body || "",
      author: auth.user ? auth.user.name : "Borrador",
      createdAt: new Date().toISOString()
    });
    saveState("Tema guardado");
    form.reset();
    render();
  }

  if (formType === "writing") {
    const words = Number(data.words || 0);
    state.writingLog.unshift({
      id: createId("wl"),
      date: data.date || todayISO(),
      chapter: data.chapter || "Sin capítulo",
      words,
      minutes: Number(data.minutes || 0),
      mood: data.mood || "Neutral",
      note: data.note || ""
    });
    const chapter = state.chapters.find((item) => item.title === data.chapter);
    if (chapter) chapter.words = Number(chapter.words || 0) + words;
    saveState("Sesión de escritura guardada");
    form.reset();
    render();
  }
}

function handleScreenInput(event) {
  if (event.target.matches("[data-meeting-notes]")) {
    const meeting = state.meetings.find((item) => item.id === event.target.dataset.id);
    if (meeting) meeting.notes = event.target.value;
    return;
  }

  if (event.target.matches("[data-literature-filter]")) {
    const cursor = event.target.selectionStart;
    state.literatureFilter = event.target.value;
    renderLiterature();
    hydrateIcons(screen);
    initReadingPdfView();
    const restored = screen.querySelector("[data-literature-filter]");
    if (restored) {
      restored.focus();
      restored.setSelectionRange(cursor, cursor);
    }
  }

  if (event.target.matches("[data-citation-style]")) {
    state.literatureCitationStyle = event.target.value;
    saveState("", { skipSync: true });
    renderLiterature();
    hydrateIcons(screen);
    initReadingPdfView();
  }

  if (event.target.matches("[data-reading-selection-note]")) {
    readingPdfViewer.selectedNote = event.target.value;
  }

  if (event.target.matches("[data-literature-extract-filter]")) {
    const cursor = event.target.selectionStart;
    state.literatureExtractFilter = event.target.value;
    renderLiterature();
    hydrateIcons(screen);
    initReadingPdfView();
    const restored = screen.querySelector("[data-literature-extract-filter]");
    if (restored) {
      restored.focus();
      restored.setSelectionRange(cursor, cursor);
    }
  }

  if (event.target.matches("[data-literature-extract-chapter]")) {
    state.literatureExtractChapter = event.target.value || "all";
    saveState("", { skipSync: true });
    renderLiterature();
    hydrateIcons(screen);
    initReadingPdfView();
  }
}

function handleScreenChange(event) {
  if (event.target.matches("[data-reading-pdf-upload]")) {
    const file = event.target.files && event.target.files[0];
    const readingId = event.target.dataset.id;
    event.target.value = "";
    if (file && readingId) {
      uploadReadingPdfForExistingRecord(readingId, file);
    }
  }
}

function findReadingById(id) {
  return state.readings.find((reading) => reading.id === id) || null;
}

function resetReadingPdfViewer(readingId = "") {
  const nextPage = readingPdfViewer.readingId === readingId ? readingPdfViewer.currentPage : 1;
  const nextScale = readingPdfViewer.scale || 1.16;
  readingPdfViewer = {
    ...createInitialReadingPdfViewerState(),
    readingId,
    currentPage: nextPage,
    selectedPage: nextPage,
    scale: nextScale
  };
}

function currentReadingPdfUrl(reading) {
  if (!reading?.pdf?.url) return "";
  return `${reading.pdf.url}?v=${encodeURIComponent(reading.pdf.uploadedAt || "")}`;
}

function updateReadingPdfSelectionUi() {
  const preview = screen.querySelector("[data-reading-selection-preview]");
  const pageChip = screen.querySelector("[data-reading-selection-page]");
  const saveButton = screen.querySelector("[data-action='save-reading-highlight']");
  if (!preview || !pageChip || !saveButton) return;
  preview.textContent = readingPdfViewer.selectedText || "Selecciona texto dentro del PDF para guardar aquí un subrayado con nota.";
  pageChip.textContent = readingPdfViewer.selectedText ? `Pág. ${readingPdfViewer.selectedPage}` : "Sin selección";
  saveButton.disabled = !readingPdfViewer.selectedText || !readingPdfViewer.selectedRects.length;
}

function applyReadingPdfViewerStatus({ loading = false, error = "" } = {}) {
  const loadingNode = screen.querySelector("[data-reading-pdf-loading]");
  const errorNode = screen.querySelector("[data-reading-pdf-error]");
  if (loadingNode) loadingNode.hidden = !loading;
  if (errorNode) {
    errorNode.hidden = !error;
    errorNode.textContent = error || "";
  }
}

function updateReadingPdfPageMeta() {
  const pageNode = screen.querySelector("[data-reading-pdf-page]");
  const totalNode = screen.querySelector("[data-reading-pdf-total]");
  const prevButton = screen.querySelector("[data-action='reading-pdf-prev']");
  const nextButton = screen.querySelector("[data-action='reading-pdf-next']");
  const scaleNode = screen.querySelector("[data-reading-pdf-scale]");
  if (pageNode) pageNode.textContent = String(readingPdfViewer.currentPage || 1);
  if (totalNode) totalNode.textContent = String(readingPdfViewer.totalPages || 1);
  if (prevButton) prevButton.disabled = (readingPdfViewer.currentPage || 1) <= 1;
  if (nextButton) nextButton.disabled = (readingPdfViewer.currentPage || 1) >= (readingPdfViewer.totalPages || 1);
  if (scaleNode) scaleNode.textContent = `${Math.round((readingPdfViewer.scale || 1.16) * 100)}%`;
}

async function uploadReadingPdfForExistingRecord(readingId, file) {
  const reading = findReadingById(readingId);
  if (!reading) {
    showToast("La lectura ya no está disponible.");
    return;
  }
  await uploadReadingPdf(reading, file);
}

async function uploadReadingPdf(reading, file) {
  if (!API_ENABLED || !auth.user) {
    showToast("Para guardar PDFs necesitas entrar en la app privada.");
    return false;
  }
  if (!file) return false;
  if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
    showToast("Sube un PDF válido.");
    return false;
  }
  if (file.size > MAX_READING_PDF_BYTES) {
    showToast("El PDF supera el límite de 20 MB.");
    return false;
  }

  try {
    readingPdfViewer.uploadBusy = true;
    const response = await fetch(`/api/readings/${encodeURIComponent(reading.id)}/file`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/pdf",
        "X-File-Name": file.name
      },
      body: file
    });
    const result = await response.json().catch(() => ({}));

    if (response.status === 401) {
      openAuthModal("login");
      showToast("La sesión ha caducado. Vuelve a entrar.");
      return false;
    }
    if (!response.ok) {
      throw new Error(result.error || "No se pudo subir el PDF.");
    }

    reading.pdf = normalizeReadingPdfMeta(result.file);
    reading.annotations = Array.isArray(reading.annotations) ? reading.annotations : [];
    state.literatureCitationId = reading.id;
    resetReadingPdfViewer(reading.id);
    saveState(reading.pdf ? "PDF vinculado a la lectura" : "Lectura actualizada");
    render();
    return true;
  } catch (error) {
    showToast(error.message || "No se pudo subir el PDF.");
    return false;
  } finally {
    readingPdfViewer.uploadBusy = false;
  }
}

async function removeReadingPdf(readingId) {
  const reading = findReadingById(readingId);
  if (!reading?.pdf) return;
  if (!API_ENABLED || !auth.user) {
    showToast("Necesitas sesión para borrar el PDF del servidor.");
    return;
  }
  try {
    readingPdfViewer.deleteBusy = true;
    const response = await fetch(`/api/readings/${encodeURIComponent(readingId)}/file`, {
      method: "DELETE",
      credentials: "same-origin"
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "No se pudo eliminar el PDF.");
    reading.pdf = null;
    resetReadingPdfViewer(readingId);
    saveState("PDF eliminado de la lectura");
    render();
  } catch (error) {
    showToast(error.message || "No se pudo eliminar el PDF.");
  } finally {
    readingPdfViewer.deleteBusy = false;
  }
}

function captureReadingPdfSelection() {
  const textLayer = screen.querySelector("[data-reading-pdf-text]");
  if (!textLayer) return;
  const selection = window.getSelection();
  const anchorNode = selection && selection.anchorNode;
  if (!anchorNode || !textLayer.contains(anchorNode)) return;
  const text = String(selection.toString() || "").replace(/\s+/g, " ").trim();
  if (!text) return;
  const range = selection.rangeCount ? selection.getRangeAt(0) : null;
  const layerBounds = textLayer.getBoundingClientRect();
  const rects = range
    ? [...range.getClientRects()]
        .map((rect) => ({
          x: (rect.left - layerBounds.left) / layerBounds.width,
          y: (rect.top - layerBounds.top) / layerBounds.height,
          w: rect.width / layerBounds.width,
          h: rect.height / layerBounds.height
        }))
        .filter((rect) => rect.w > 0 && rect.h > 0)
    : [];
  readingPdfViewer.selectedText = text;
  readingPdfViewer.selectedPage = readingPdfViewer.currentPage;
  readingPdfViewer.selectedRects = rects;
  updateReadingPdfSelectionUi();
}

function clearReadingPdfSelection(clearNote = true) {
  readingPdfViewer.selectedText = "";
  readingPdfViewer.selectedRects = [];
  if (clearNote) readingPdfViewer.selectedNote = "";
  if (window.getSelection) window.getSelection().removeAllRanges();
  const noteField = screen.querySelector("[data-reading-selection-note]");
  if (noteField && clearNote) noteField.value = "";
  updateReadingPdfSelectionUi();
}

async function initReadingPdfView() {
  const reading = findReadingById(state.literatureCitationId) || state.readings[0] || null;
  if (!reading?.pdf?.url) {
    resetReadingPdfViewer("");
    updateReadingPdfSelectionUi();
    return;
  }
  applyReadingPdfViewerStatus({ loading: true, error: "" });
  const pdfjsLib = await ensurePdfJsLoaded();
  if (!pdfjsLib) {
    applyReadingPdfViewerStatus({ error: "El visor PDF no se ha podido cargar en este navegador." });
    return;
  }
  if (readingPdfViewer.readingId !== reading.id) {
    resetReadingPdfViewer(reading.id);
  }
  if (!readingPdfViewer.document) {
    await loadReadingPdfDocument(reading, pdfjsLib);
    return;
  }
  updateReadingPdfPageMeta();
  await renderReadingPdfPage(reading, pdfjsLib);
}

async function loadReadingPdfDocument(reading, pdfjsLib = pdfJsLibRef) {
  try {
    readingPdfViewer.loading = true;
    readingPdfViewer.error = "";
    applyReadingPdfViewerStatus({ loading: true });
    const loadingTask = pdfjsLib.getDocument({
      url: currentReadingPdfUrl(reading),
      withCredentials: true
    });
    const documentRef = await loadingTask.promise;
    if (readingPdfViewer.readingId !== reading.id) return;
    readingPdfViewer.document = documentRef;
    readingPdfViewer.totalPages = Number(documentRef.numPages || 1);
    readingPdfViewer.currentPage = Math.min(Math.max(readingPdfViewer.currentPage || 1, 1), readingPdfViewer.totalPages);
    updateReadingPdfPageMeta();
    await renderReadingPdfPage(reading, pdfjsLib);
  } catch (error) {
    console.error("No se pudo abrir el PDF en la app", error);
    readingPdfViewer.error = "No se ha podido abrir el PDF en la app.";
    applyReadingPdfViewerStatus({ error: readingPdfViewer.error });
  } finally {
    readingPdfViewer.loading = false;
    applyReadingPdfViewerStatus({ loading: false, error: readingPdfViewer.error });
  }
}

async function renderReadingPdfPage(reading, pdfjsLib = pdfJsLibRef) {
  const requestId = ++readingPdfRenderRequest;
  const previousJob = readingPdfRenderJob.catch(() => {});
  const nextJob = previousJob.then(async () => {
    if (!reading || !readingPdfViewer.document || readingPdfViewer.readingId !== reading.id) return;
    const canvas = screen.querySelector("[data-reading-pdf-canvas]");
    const highlightLayer = screen.querySelector("[data-reading-pdf-highlights]");
    const textLayer = screen.querySelector("[data-reading-pdf-text]");
    if (!canvas || !textLayer || !highlightLayer) return;

    applyReadingPdfViewerStatus({ loading: true, error: "" });
    const page = await readingPdfViewer.document.getPage(readingPdfViewer.currentPage);
    if (requestId !== readingPdfRenderRequest) return;
    const viewport = page.getViewport({ scale: readingPdfViewer.scale });
    const context = canvas.getContext("2d");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    highlightLayer.style.width = `${viewport.width}px`;
    highlightLayer.style.height = `${viewport.height}px`;
    await page.render({ canvasContext: context, viewport }).promise;
    if (requestId !== readingPdfRenderRequest) return;

    highlightLayer.innerHTML = "";
    textLayer.innerHTML = "";
    textLayer.style.width = `${viewport.width}px`;
    textLayer.style.height = `${viewport.height}px`;
    const textContent = await page.getTextContent();
    const textLayerBuilder = new pdfjsLib.TextLayer({
      textContentSource: textContent,
      container: textLayer,
      viewport
    });
    await textLayerBuilder.render();
    if (requestId !== readingPdfRenderRequest) return;

    textLayer.onmouseup = captureReadingPdfSelection;
    textLayer.onkeyup = captureReadingPdfSelection;
    renderReadingPdfHighlights(reading, viewport);
    updateReadingPdfPageMeta();
    applyReadingPdfViewerStatus({ loading: false, error: readingPdfViewer.error });
    updateReadingPdfSelectionUi();
  });
  readingPdfRenderJob = nextJob.catch(() => {});
  return nextJob;
}

function saveReadingHighlight() {
  const reading = findReadingById(state.literatureCitationId);
  if (!reading || !readingPdfViewer.selectedText) return;
  reading.annotations = Array.isArray(reading.annotations) ? reading.annotations : [];
  reading.annotations.unshift({
    id: createId("hl"),
    page: readingPdfViewer.selectedPage || readingPdfViewer.currentPage || 1,
    text: readingPdfViewer.selectedText,
    note: String(readingPdfViewer.selectedNote || "").trim(),
    color: "amber",
    chapterId: state.chapters.find((chapter) => chapter.title === reading.chapter)?.id || "",
    rects: readingPdfViewer.selectedRects.map((rect) => ({ ...rect })),
    createdAt: new Date().toISOString()
  });
  clearReadingPdfSelection();
  saveState("Subrayado guardado");
  render();
}

function renderReadingPdfHighlights(reading, viewport) {
  const layer = screen.querySelector("[data-reading-pdf-highlights]");
  if (!layer || !reading) return;
  const highlights = (reading.annotations || []).filter((annotation) => Number(annotation.page || 1) === Number(readingPdfViewer.currentPage || 1) && Array.isArray(annotation.rects) && annotation.rects.length);
  layer.innerHTML = highlights.map((annotation) => annotation.rects.map((rect) => `
    <div class="reading-pdf-highlight" style="left:${rect.x * viewport.width}px;top:${rect.y * viewport.height}px;width:${rect.w * viewport.width}px;height:${rect.h * viewport.height}px" title="${escapeAttribute(annotation.note || annotation.text)}"></div>
  `).join("")).join("");
}

function sendReadingHighlightToChapter(readingId, annotationId) {
  const reading = findReadingById(readingId);
  const annotation = reading?.annotations?.find((item) => item.id === annotationId);
  if (!reading || !annotation) return;
  const chapter = state.chapters.find((item) => item.id === annotation.chapterId) || state.chapters.find((item) => item.title === reading.chapter);
  if (!chapter) {
    showToast("Vincula primero la lectura a un capítulo para mandar la idea.");
    return;
  }
  chapter.notes.unshift({
    id: createId("nt"),
    title: `Idea desde ${reading.title}`,
    type: "Fuente",
    date: todayISO(),
    text: `Fuente: ${reading.authors} (${reading.year || "s. f."}) — ${reading.title}\nPágina: ${annotation.page}\n\nCita:\n“${annotation.text}”\n\nIdea:\n${annotation.note || "Desarrollar esta idea dentro del capítulo."}`
  });
  chapter.editorUpdatedAt = new Date().toISOString();
  saveState("Idea enviada al capítulo");
  render();
}

function chapterTitleFromId(id, fallback = "Sin capítulo") {
  if (!id) return fallback;
  return state.chapters.find((chapter) => chapter.id === id)?.title || fallback;
}

function buildReadingExtractBank() {
  return state.readings.flatMap((reading) => (reading.annotations || []).map((annotation) => ({
    readingId: reading.id,
    readingTitle: reading.title,
    readingAuthors: reading.authors,
    readingYear: reading.year,
    readingChapter: reading.chapter || "Sin capítulo",
    annotation
  })));
}

function filteredReadingExtractBank() {
  const term = String(state.literatureExtractFilter || "").trim().toLowerCase();
  const chapterFilter = String(state.literatureExtractChapter || "all");
  return buildReadingExtractBank()
    .filter((entry) => {
      const chapterLabel = entry.annotation.chapterId ? chapterTitleFromId(entry.annotation.chapterId, entry.readingChapter) : entry.readingChapter;
      const haystack = `${entry.readingTitle} ${entry.readingAuthors} ${entry.annotation.text} ${entry.annotation.note} ${chapterLabel}`.toLowerCase();
      if (term && !haystack.includes(term)) return false;
      if (chapterFilter !== "all" && chapterLabel !== chapterFilter) return false;
      return true;
    })
    .sort((a, b) => String(b.annotation.createdAt || "").localeCompare(String(a.annotation.createdAt || "")));
}

function readingExtractChapterOptions() {
  const fromReadings = state.readings.map((reading) => reading.chapter || "Sin capítulo");
  const fromAnnotations = buildReadingExtractBank().map((entry) => entry.annotation.chapterId ? chapterTitleFromId(entry.annotation.chapterId, entry.readingChapter) : entry.readingChapter);
  return [...new Set([...fromReadings, ...fromAnnotations].map((item) => String(item || "").trim()).filter(Boolean))];
}

async function deleteReadingRecord(readingId) {
  const reading = findReadingById(readingId);
  if (!reading) return;
  if (reading.pdf && API_ENABLED && auth.user) {
    const response = await fetch(`/api/readings/${encodeURIComponent(readingId)}/file`, {
      method: "DELETE",
      credentials: "same-origin"
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || "No se pudo eliminar el PDF asociado.");
    }
  }
  state.readings = state.readings.filter((item) => item.id !== readingId);
  if (state.literatureCitationId === readingId) {
    state.literatureCitationId = state.readings[0]?.id || "";
  }
  resetReadingPdfViewer(state.literatureCitationId);
  saveState("Lectura eliminada");
  render();
}

function render() {
  if (!V1_VIEWS.includes(state.activeView)) {
    state.activeView = "dashboard";
  }

  if (requiresAuthenticationWall()) {
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.classList.remove("is-active");
    });
    viewTitle.textContent = "Acceso privado";
    updateSidebar();
    renderAuthGate();
    onboardingModal.hidden = true;
    hydrateIcons(screen);
    screen.focus({ preventScroll: true });
    return;
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
    writing: renderWriting,
    forum: renderForum,
    assistant: renderAssistant
  };

  (renderers[state.activeView] || renderers.dashboard)();
  hydrateIcons(screen);
  if (state.activeView === "literature") initReadingPdfView();
  renderOnboardingModal(false);
  launchOnboardingIfNeeded();
  screen.focus({ preventScroll: true });
}

function updateSidebar() {
  if (requiresAuthenticationWall()) {
    sidebarProgress.textContent = "--";
    sidebarDue.textContent = "Inicia sesión";
    return;
  }
  sidebarProgress.textContent = `${overallProgress()}%`;
  sidebarDue.textContent = nextDueLabel();
}

function requiresAuthenticationWall() {
  return API_ENABLED && !demoMode && !auth.user;
}

function renderAuthGate() {
  screen.innerHTML = `
    <section class="hero-panel auth-gate-layout">
      <div class="panel project-summary auth-gate-panel">
        <div>
          <div class="badge-row auth-gate-badges">
            <span class="badge gold">Acceso protegido</span>
            <span class="badge violet">Beta cerrada</span>
            <span class="badge teal">Sincronización privada</span>
          </div>
          <p class="eyebrow">Acceso privado</p>
          <h2>DoctoralOS abre solo cuando la tesis entra en un espacio real de trabajo</h2>
          <p>La app pública te deja entender el producto y la demo te enseña el flujo completo. El workspace real, en cambio, se mantiene detrás de una cuenta privada para trabajar con capítulos, reuniones, comentarios y escritura sin dejar la tesis en abierto.</p>
          <div class="summary-actions auth-gate-actions">
            <button class="button" data-action="auth-launch" data-intent="login" type="button"><span data-icon="assistant"></span>Iniciar sesión</button>
            <button class="ghost-button" data-action="auth-launch" data-intent="register" type="button"><span data-icon="plus"></span>Entrar con invitación</button>
          </div>
          <div class="auth-gate-links">
            <a class="auth-link-card" href="/">
              <strong>Volver a la página pública</strong>
              <span>Qué es DoctoralOS, cómo funciona, precios y acceso a la beta.</span>
            </a>
            <a class="auth-link-card" href="/app?demo=1">
              <strong>Abrir demo guiada</strong>
              <span>Explora una tesis de ejemplo y entiende el producto en menos de tres minutos.</span>
            </a>
            <a class="auth-link-card" href="mailto:mario.martinez.cgr@gmail.com?subject=Solicitud%20de%20acceso%20a%20DoctoralOS">
              <strong>Solicitar acceso beta</strong>
              <span>Pide invitación si quieres probar la app con tu tesis real o darnos feedback.</span>
            </a>
          </div>
        </div>
        <article class="card auth-gate-card locked-card">
          <p class="card-kicker">Beta cerrada</p>
          <h2>Qué desbloqueas al entrar</h2>
          <ul class="quality-list compact-list">
            <li>Capítulos con editor, checklist y notas</li>
            <li>Plan semanal, reuniones y comentarios en el mismo sitio</li>
            <li>Escritura registrada, respaldo exportable y cuenta privada</li>
            <li>TeDoc y el foro preparados para crecer con la v1</li>
          </ul>
          <div class="gate-trust-list">
            <article>
              <strong>Acceso controlado</strong>
              <span>La beta se abre por invitación o validación previa, no por registro libre.</span>
            </article>
            <article>
              <strong>Workspace personal</strong>
              <span>Tu trabajo vive en un entorno privado con sincronización y sesiones seguras.</span>
            </article>
            <article>
              <strong>Demo separada</strong>
              <span>Puedes enseñar el producto o entenderlo sin tocar datos reales.</span>
            </article>
          </div>
          <p class="muted auth-gate-note">Pensado para una beta cerrada: menos ruido, mejor feedback y una experiencia más seria desde el primer acceso.</p>
        </article>
      </div>
    </section>
  `;
}

function renderDashboard() {
  const totalWords = state.chapters.reduce((sum, chapter) => sum + Number(chapter.words || 0), 0);
  const targetWords = Number(state.project.writingTarget || 0);
  const nextTask = [...state.tasks].filter((task) => !task.done).sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"))[0];
  const activeChapter = state.chapters.find((chapter) => chapter.id === state.editorChapterId)
    || state.chapters.find((chapter) => chapter.status !== "Aprobado")
    || state.chapters[0];
  const nextMeeting = [...state.meetings]
    .filter((meeting) => meeting.date)
    .sort((a, b) => `${a.date}T${a.time || "99:99"}`.localeCompare(`${b.date}T${b.time || "99:99"}`))[0];
  const priorityComment = [...state.reviewComments]
    .filter((comment) => comment.status !== "Resuelto")
    .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"))[0];
  const readingLinked = state.readings.filter((item) => item.chapter && item.chapter !== "Sin capítulo").length;
  const pendingComments = state.reviewComments.filter((item) => item.status !== "Resuelto").length;
  const wordsThisWeek = writingWordsLastDays(7);
  const hasStarted = state.chapters.length || state.tasks.length || state.meetings.length || state.reviewComments.length;
  const analytics = buildAnalyticsSnapshot();
  const demoBanner = demoMode ? `
    <section class="demo-banner panel">
      <div>
        <div class="badge-row auth-gate-badges">
          <span class="badge gold">Demo guiada</span>
          <span class="badge teal">Sin registro</span>
          <span class="badge violet">Recorrido de 3 minutos</span>
        </div>
        <p class="card-kicker">Tesis de ejemplo</p>
        <h2>Entiende el valor del producto antes de pedir acceso</h2>
        <p>Empieza por el panel para ver foco y próxima entrega, abre el capítulo metodológico para entender el editor y termina en revisión o en TeDoc para ver cómo se convierten reuniones y comentarios en trabajo cerrable.</p>
        <div class="demo-tour-grid">
          <button class="demo-tour-card" data-action="go" data-view="dashboard" type="button">
            <strong>1. Entiende el panel</strong>
            <span>Foco semanal, progreso global y siguiente entrega en la misma vista.</span>
          </button>
          <button class="demo-tour-card" data-action="go" data-view="chapters" type="button">
            <strong>2. Abre el capítulo metodológico</strong>
            <span>Editor con secciones, checklist de calidad, notas y tareas del capítulo.</span>
          </button>
          <button class="demo-tour-card" data-action="go" data-view="assistant" type="button">
            <strong>3. Prueba TeDoc</strong>
            <span>Pide un resumen, una agenda o una acción concreta dentro de la demo.</span>
          </button>
        </div>
      </div>
      <div class="summary-actions">
        <a class="button" href="mailto:mario.martinez.cgr@gmail.com?subject=Solicitud%20de%20acceso%20a%20DoctoralOS">Solicitar acceso beta</a>
        <button class="ghost-button" data-action="exit-demo" type="button">Salir demo</button>
      </div>
    </section>
  ` : "";

  const dashboardJourney = demoMode ? `
    <section class="onboarding-strip demo-journey-strip">
      <article class="is-done">
        <span class="step-number">1</span>
        <h3>Panel ejecutivo</h3>
        <p>Ve cómo DoctoralOS junta siguiente entrega, tareas activas y ritmo de trabajo.</p>
        <button class="tiny-button" data-action="go" data-view="dashboard" type="button">Ver panel</button>
      </article>
      <article class="is-done">
        <span class="step-number">2</span>
        <h3>Capítulo activo</h3>
        <p>Abre la parte metodológica y fíjate en estructura, notas y checklist de calidad.</p>
        <button class="tiny-button" data-action="go" data-view="chapters" type="button">Abrir capítulo</button>
      </article>
      <article class="is-done">
        <span class="step-number">3</span>
        <h3>Revisión y cierre</h3>
        <p>Mira comentarios, reunión y TeDoc para entender cómo se convierte el feedback en acciones.</p>
        <button class="tiny-button" data-action="go" data-view="reviews" type="button">Abrir revisión</button>
      </article>
    </section>
  ` : state.onboarding.justCompleted ? `
    <section class="onboarding-success panel">
      <div class="onboarding-success-copy">
        <p class="eyebrow">Sistema activado</p>
        <h2>Ya tienes una primera semana doctoral montada</h2>
        <p>La estructura, el foco semanal y la primera conversación académica ya están dentro de DoctoralOS. Ahora lo importante es convertir eso en una sesión real de trabajo.</p>
        <div class="badge-row">
          <span class="badge teal">${state.chapters.length} capítulos</span>
          <span class="badge violet">${state.tasks.filter((task) => !task.done).length} tareas activas</span>
          <span class="badge gold">${state.meetings.length || state.reviewComments.length} conversaciones visibles</span>
        </div>
      </div>
      <div class="onboarding-success-actions">
        <button class="button" data-action="go" data-view="chapters" type="button"><span data-icon="chapters"></span>Abrir capítulo prioritario</button>
        <button class="ghost-button" data-action="go" data-view="planner" type="button"><span data-icon="calendar"></span>Revisar semana</button>
        <button class="ghost-button" data-action="go" data-view="assistant" type="button"><span data-icon="assistant"></span>Pedir siguiente paso a TeDoc</button>
        <button class="subtle-button" data-action="dismiss-onboarding-summary" type="button">Ocultar resumen</button>
      </div>
    </section>
    <section class="onboarding-strip">
      <article class="is-done">
        <span class="step-number">1</span>
        <h3>Tu base ya existe</h3>
        <p>Título, fase y pregunta ya están visibles dentro del sistema.</p>
        <button class="tiny-button" data-action="open-onboarding" data-step="1" type="button">Revisar</button>
      </article>
      <article class="${state.chapters.length ? "is-done" : ""}">
        <span class="step-number">2</span>
        <h3>Estructura inicial creada</h3>
        <p>Ya tienes capítulos suficientes para empezar a escribir y revisar.</p>
        <button class="tiny-button" data-action="go" data-view="chapters" type="button">Abrir</button>
      </article>
      <article class="${state.tasks.length ? "is-done" : ""}">
        <span class="step-number">3</span>
        <h3>Semana aterrizada</h3>
        <p>Hay una primera tarea cerrable y una fecha visible para esta semana.</p>
        <button class="tiny-button" data-action="go" data-view="planner" type="button">Abrir</button>
      </article>
    </section>
  ` : state.onboarding.completed ? `
    <section class="onboarding-strip">
      <article class="${state.chapters.length ? "is-done" : ""}">
        <span class="step-number">1</span>
        <h3>Crea tus capítulos</h3>
        <p>Define la estructura mínima y el capítulo activo.</p>
        <button class="tiny-button" data-action="go" data-view="chapters" type="button">Abrir</button>
      </article>
      <article class="${state.tasks.length ? "is-done" : ""}">
        <span class="step-number">2</span>
        <h3>Planifica la semana</h3>
        <p>Convierte la tesis en tareas pequeñas con fecha.</p>
        <button class="tiny-button" data-action="go" data-view="planner" type="button">Abrir</button>
      </article>
      <article class="${state.reviewComments.length || state.meetings.length ? "is-done" : ""}">
        <span class="step-number">3</span>
        <h3>Cierra comentarios</h3>
        <p>Registra acuerdos y feedback accionable.</p>
        <button class="tiny-button" data-action="go" data-view="reviews" type="button">Abrir</button>
      </article>
    </section>
  ` : `
    <section class="onboarding-strip premium-onboarding-strip">
      <article class="${state.project.program || state.project.university || state.project.question ? "is-done" : ""}">
        <span class="step-number">1</span>
        <h3>Define tu base doctoral</h3>
        <p>Título, fase, programa y pregunta visibles desde el primer día.</p>
        <button class="tiny-button" data-action="open-onboarding" data-step="1" type="button">Abrir paso</button>
      </article>
      <article class="${state.chapters.length ? "is-done" : ""}">
        <span class="step-number">2</span>
        <h3>Monta la estructura</h3>
        <p>Crea un esqueleto suficiente para empezar a escribir sin bloquearte.</p>
        <button class="tiny-button" data-action="open-onboarding" data-step="2" type="button">Abrir paso</button>
      </article>
      <article class="${state.tasks.length ? "is-done" : ""}">
        <span class="step-number">3</span>
        <h3>Haz la semana cerrable</h3>
        <p>Convierte la tesis en una tarea concreta con fecha y capítulo activo.</p>
        <button class="tiny-button" data-action="open-onboarding" data-step="3" type="button">Abrir paso</button>
      </article>
      <article class="${state.reviewComments.length || state.meetings.length ? "is-done" : ""}">
        <span class="step-number">4</span>
        <h3>Registra tu primera conversación</h3>
        <p>Deja una reunión o comentario real para empezar con contexto.</p>
        <button class="tiny-button" data-action="open-onboarding" data-step="4" type="button">Abrir paso</button>
      </article>
    </section>
  `;

  screen.innerHTML = `
    ${demoBanner}
    <section class="hero-panel">
      <div class="panel project-summary">
        <div>
          <p class="eyebrow">${demoMode ? "Demo guiada de producto" : "Sistema de trabajo doctoral"}</p>
          <h2>${escapeHtml(state.project.name)}</h2>
          <p>${escapeHtml(state.project.question || "Convierte la tesis en capítulos, tareas semanales, reuniones útiles y sesiones de escritura medibles.")}</p>
          <div class="badge-row">
            <span class="badge teal">${escapeHtml(state.project.phase || "Organizando el trabajo")}</span>
            <span class="badge violet">${escapeHtml(state.project.mode)}</span>
            <span class="badge gold">Respaldo exportable</span>
          </div>
          <div class="summary-actions">
            <button class="button" data-action="go" data-view="chapters" type="button"><span data-icon="chapters"></span>Escribir capítulo</button>
            <button class="ghost-button" data-action="go" data-view="planner" type="button"><span data-icon="calendar"></span>Planificar semana</button>
            <button class="ghost-button" data-action="go" data-view="reviews" type="button"><span data-icon="review"></span>Resolver comentarios</button>
            <button class="ghost-button" data-action="go" data-view="assistant" type="button"><span data-icon="assistant"></span>Pedir consejo a TeDoc</button>
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
        <p class="card-kicker">Siguiente foco</p>
        <h2>${nextTask ? escapeHtml(nextTask.title) : hasStarted ? "Elige una tarea para esta semana" : "Crea tu primer capítulo"}</h2>
        <p>${nextTask ? `Vence: ${formatDate(nextTask.due)}. Impacto: ${escapeHtml(nextTask.impact)}.` : "La v1 funciona con una regla simple: capítulo activo, plan semanal y comentarios cerrados."}</p>
        <button class="ghost-button" data-action="go" data-view="${nextTask ? "planner" : "chapters"}" type="button"><span data-icon="arrow"></span>Continuar</button>
      </div>
    </section>

    <section class="metrics-grid" aria-label="Indicadores principales">
      ${metric("Palabras", `${formatNumber(totalWords)}`, `${Math.round((totalWords / targetWords) * 100) || 0}% del objetivo`)}
      ${metric("Capítulos", state.chapters.length, "estructurados en el editor")}
      ${metric("Plan", state.tasks.filter((task) => task.status !== "later" && !task.done).length, "tareas activas")}
      ${metric("Comentarios", pendingComments, "pendientes de respuesta")}
      ${metric("Semana", formatNumber(wordsThisWeek), "palabras registradas")}
      ${metric("Lecturas", `${readingLinked}/${state.readings.length}`, "vinculadas a capítulos")}
    </section>

    ${demoMode ? "" : renderReentrySection({ hasStarted, nextTask, activeChapter, nextMeeting, priorityComment })}

    ${dashboardJourney}

    ${renderAnalyticsSection(analytics)}

    <section class="grid-2">
      <article class="card">
        <div class="section-header">
          <div>
            <p class="card-kicker">Arquitectura de tesis</p>
            <h2>Capítulos y avance</h2>
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
            <p class="card-kicker">Revisión</p>
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
        `).join("") || emptyState("Sin comentarios todavía. Registra los próximos acuerdos de revisión.")}
      </article>
    </section>
  `;
}

function renderReentrySection({ hasStarted, nextTask, activeChapter, nextMeeting, priorityComment }) {
  const cards = hasStarted ? [
    {
      kicker: "Reentrada rápida",
      title: nextTask ? escapeHtml(nextTask.title) : "Aterriza una tarea cerrable",
      body: nextTask
        ? `Empieza por la tarea más inmediata para no reabrir demasiados frentes a la vez.`
        : "Si hoy vuelves a la tesis, lo más rentable es dejar una tarea pequeña, clara y con fecha.",
      meta: [
        nextTask?.due ? `Vence ${formatDate(nextTask.due)}` : "Sin fecha todavía",
        nextTask?.impact ? `Impacto ${escapeHtml(nextTask.impact)}` : "Semana sin priorizar"
      ],
      view: "planner",
      label: nextTask ? "Abrir tarea" : "Planificar semana"
    },
    {
      kicker: "Capítulo activo",
      title: activeChapter ? escapeHtml(activeChapter.title) : "Monta tu estructura base",
      body: activeChapter
        ? "Retoma el capítulo que ya tienes abierto y decide si toca escribir, revisar o cerrar checklist."
        : "Tener un capítulo activo suele ser la forma más simple de recuperar continuidad en la tesis.",
      meta: [
        activeChapter ? `${formatNumber(activeChapter.words)} palabras` : "Sin capítulos todavía",
        activeChapter?.status ? escapeHtml(activeChapter.status) : "Empieza por el esqueleto"
      ],
      view: "chapters",
      label: activeChapter ? "Retomar capítulo" : "Crear capítulos"
    },
    {
      kicker: "Conversación visible",
      title: priorityComment ? escapeHtml(priorityComment.chapter) : nextMeeting ? escapeHtml(nextMeeting.type || "Próxima reunión") : "Haz visible la conversación académica",
      body: priorityComment
        ? "Tienes feedback pendiente: conviene convertirlo pronto en respuesta o tarea concreta."
        : nextMeeting
          ? "La siguiente reunión ya tiene contexto: agenda, decisiones y tareas pueden vivir en el mismo sitio."
          : "Cuando la conversación con dirección entra en el sistema, la tesis suele perder menos continuidad.",
      meta: [
        priorityComment?.due ? `Límite ${formatDate(priorityComment.due)}` : nextMeeting?.date ? `Fecha ${formatDate(nextMeeting.date)}` : "Sin revisión registrada",
        priorityComment ? escapeHtml(priorityComment.status) : nextMeeting?.attendees ? escapeHtml(nextMeeting.attendees) : "Todavía no hay contexto"
      ],
      view: "reviews",
      label: priorityComment ? "Resolver feedback" : nextMeeting ? "Abrir reunión" : "Registrar revisión"
    }
  ] : [
    {
      kicker: "Primer paso",
      title: "Define tu capítulo activo",
      body: "Empieza por una estructura mínima y un solo capítulo con objetivo, fecha y checklist visible.",
      meta: ["Base doctoral", "Esqueleto inicial"],
      view: "chapters",
      label: "Crear estructura"
    },
    {
      kicker: "Segundo paso",
      title: "Haz tu semana cerrable",
      body: "Convierte la tesis en una sola tarea concreta con fecha para volver a coger ritmo sin fricción.",
      meta: ["Semana real", "Prioridad visible"],
      view: "planner",
      label: "Planificar semana"
    },
    {
      kicker: "Tercer paso",
      title: "Registra tu primera conversación",
      body: "Deja una reunión o comentario dentro del sistema para que el contexto no dependa solo de tu memoria.",
      meta: ["Revisión", "Contexto compartido"],
      view: "reviews",
      label: "Abrir revisión"
    }
  ];

  return `
    <section class="reentry-shell">
      <div class="section-header">
        <div>
          <p class="card-kicker">Volver al foco</p>
          <h2>Retoma la tesis sin tener que decidir todo de nuevo</h2>
          <p>DoctoralOS ya puede sugerirte por dónde seguir: tarea inmediata, capítulo activo y conversación pendiente.</p>
        </div>
      </div>
      <div class="reentry-grid">
        ${cards.map((card) => `
          <article class="card reentry-card">
            <p class="card-kicker">${card.kicker}</p>
            <h3>${card.title}</h3>
            <p>${card.body}</p>
            <div class="reentry-meta">
              ${card.meta.map((item) => `<span>${item}</span>`).join("")}
            </div>
            <button class="ghost-button" data-action="go" data-view="${card.view}" type="button">${card.label}</button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderChapters() {
  ensureStateShape(state);
  const activeChapter = state.chapters.find((chapter) => chapter.id === state.editorChapterId) || state.chapters[0];
  if (!activeChapter) {
    screen.innerHTML = `
      <section class="chapter-layout">
        <div class="empty-state">Crea el primer capítulo para activar el editor.</div>
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
          <button class="ghost-button" data-action="add-section" data-id="${activeChapter.id}" type="button"><span data-icon="plus"></span>Nueva sección</button>
        </div>

        <div class="chapter-tabs" role="tablist" aria-label="Capítulos">
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
              ${field("Título", "title", "input", activeChapter.title, true)}
              ${selectField("Estado", "status", ["Esquema", "Borrador", "En revisión", "Aprobado"], activeChapter.status)}
              ${field("Objetivo", "goal", "textarea", activeChapter.goal, true)}
              ${field("Argumento central", "argument", "textarea", activeChapter.argument, true)}
              <div class="inline-fields">
                ${field("Objetivo palabras", "target", "number", activeChapter.target, true)}
                ${field("Fecha de entrega", "due", "date", activeChapter.due, true)}
              </div>
              ${field("Tareas, una por línea", "tasks", "textarea", (activeChapter.tasks || []).join("\n"), true)}
            </div>
          </section>

          ${renderChapterCopilotPanel(activeChapter)}

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
                      ${field(`Título sección ${index + 1}`, `sectionTitle-${section.id}`, "input", section.title, true)}
                    </div>
                    <button class="tiny-button" data-action="delete-section" data-chapter-id="${activeChapter.id}" data-id="${section.id}" type="button"><span data-icon="trash"></span></button>
                  </div>
                  <div class="inline-fields">
                    ${selectField("Estado", `sectionStatus-${section.id}`, ["Esquema", "Borrador", "En revisión", "Cerrada"], section.status)}
                    ${field("Palabras", `sectionWords-${section.id}`, "number", section.words, true)}
                  </div>
                  ${field("Función de la sección", `sectionGoal-${section.id}`, "textarea", section.goal, true)}
                  ${field("Borrador / notas de texto", `sectionContent-${section.id}`, "textarea", section.content, true)}
                </article>
              `).join("")}
            </div>
          </section>

          <section class="editor-section-block">
            <div class="section-header">
              <div>
                <p class="card-kicker">Checklist</p>
                <h2>Calidad del capítulo</h2>
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

          ${renderChapterRewriteChecklist(activeChapter)}

          <div class="chapter-controls editor-actions">
            <button class="button" type="submit"><span data-icon="save"></span>Guardar capítulo</button>
            <button class="ghost-button" data-action="chapter-status" data-id="${activeChapter.id}" data-value="En revisión" type="button">Enviar a revisión</button>
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
                <div class="note-card-body">${escapeMultiline(note.text)}</div>
              </article>
            `).join("") || emptyState("Sin notas todavía.")}
          </div>
        </section>
      </div>

      <aside class="side-stack">
        <div class="form-panel">
          <h2>Nueva nota</h2>
          <form class="form-grid" data-form="chapter-note" data-chapter-id="${activeChapter.id}">
            ${field("Título", "title", "input", "Decisión de capítulo")}
            <div class="inline-fields">
              ${selectField("Tipo", "type", ["Idea", "Duda", "Decisión", "Cita pendiente", "Feedback"])}
              ${field("Fecha", "date", "date", todayISO(), true)}
            </div>
            ${field("Texto", "text", "textarea", "Anota la decisión, duda o cita pendiente")}
            <button class="button" type="submit"><span data-icon="plus"></span>Añadir nota</button>
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
      <h2>Nuevo capítulo</h2>
      <form class="form-grid" data-form="chapter">
        ${field("Título", "title", "input", "Discusion")}
        ${field("Objetivo", "goal", "textarea", "Qué debe lograr este capítulo")}
        ${field("Argumento central", "argument", "textarea", "La idea que sostiene el capítulo")}
        <div class="inline-fields">
          ${selectField("Estado", "status", ["Esquema", "Borrador", "En revisión", "Aprobado"])}
          ${field("Progreso", "progress", "number", "0")}
        </div>
        <div class="inline-fields">
          ${field("Palabras actuales", "words", "number", "0")}
          ${field("Objetivo palabras", "target", "number", "8000")}
        </div>
        ${field("Fecha de entrega", "due", "date", "")}
        ${field("Tareas, una por línea", "tasks", "textarea", "Revisar citas\nAñadir tabla")}
        <button class="button" type="submit"><span data-icon="plus"></span>Añadir capítulo</button>
      </form>
    </div>
  `;
}

function renderChapterCopilotPanel(chapter) {
  const weakestSection = findWeakestSection(chapter);
  const openComment = findOpenCommentForChapter(chapter.title);
  const weaknessReason = weakestSection
    ? buildWeakestSectionExplanation(chapter, weakestSection)
    : "Todavía no hay secciones suficientes para detectar una parte más débil.";
  const rewriteOpen = (chapter.rewriteChecklist || []).filter((item) => !item.done).length;
  const chapterTitle = escapeAttribute(chapter.title);

  return `
    <section class="editor-section-block chapter-copilot-panel">
      <div class="section-header">
        <div>
          <p class="card-kicker">Modo capítulo</p>
          <h2>Dónde intervenir ahora</h2>
          <p>TeDoc puede leer el capítulo activo, detectar la sección más floja y preparar una intervención concreta antes de tocar el texto.</p>
        </div>
      </div>

      <div class="assistant-brief-grid chapter-copilot-grid">
        <article class="assistant-brief-card">
          <p class="card-kicker">Sección más floja</p>
          <h3>${escapeHtml(weakestSection ? weakestSection.title : "Pendiente de detectar")}</h3>
          <p>${escapeHtml(weaknessReason)}</p>
          <div class="assistant-brief-meta">
            <span>${weakestSection ? weakestSection.status : "Sin secciones"}</span>
            <span>${weakestSection ? `${formatNumber(weakestSection.words)} palabras` : "0 palabras"}</span>
          </div>
          <button class="ghost-button" data-action="assistant-suggest" data-message="Detecta la sección más floja del capítulo ${chapterTitle} y dime por qué" type="button">Analizar capítulo</button>
        </article>

        <article class="assistant-brief-card">
          <p class="card-kicker">Comentario vivo</p>
          <h3>${escapeHtml(openComment ? openComment.source : "Sin comentario abierto")}</h3>
          <p>${escapeHtml(openComment ? openComment.comment : "Cuando haya feedback activo, TeDoc puede convertirlo en checklist de reescritura y dejar visible por dónde entrar.")}</p>
          <div class="assistant-brief-meta">
            <span>${escapeHtml(openComment ? openComment.priority : "Sin prioridad")}</span>
            <span>${escapeHtml(rewriteOpen ? `${rewriteOpen} pasos abiertos` : "Checklist vacía")}</span>
          </div>
          <button class="ghost-button" data-action="assistant-suggest" data-message="Convierte el comentario más urgente del capítulo ${chapterTitle} en checklist de reescritura" type="button" ${openComment ? "" : "disabled"}>Pasar a checklist</button>
        </article>

        <article class="assistant-brief-card">
          <p class="card-kicker">Próxima sesión</p>
          <h3>${escapeHtml(chapter.status)}</h3>
          <p>${escapeHtml(`TeDoc puede proponerte la estructura de un apartado y dejar preparada la siguiente sesión para ${chapter.title} sin abrir más frentes de la cuenta.`)}</p>
          <div class="assistant-brief-meta">
            <span>${chapter.due ? `Entrega ${formatDate(chapter.due)}` : "Sin entrega cerrada"}</span>
            <span>${chapter.tasks?.length ? `${chapter.tasks.length} tareas internas` : "Sin tareas internas"}</span>
          </div>
          <div class="summary-actions">
            <button class="ghost-button" data-action="assistant-suggest" data-message="Propón una estructura para un apartado del capítulo ${chapterTitle}" type="button">Proponer estructura</button>
            <button class="ghost-button" data-action="assistant-suggest" data-message="Prepárame la siguiente sesión del capítulo ${chapterTitle}" type="button">Preparar sesión</button>
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderChapterRewriteChecklist(chapter) {
  const items = Array.isArray(chapter.rewriteChecklist) ? chapter.rewriteChecklist : [];
  const pending = items.filter((item) => !item.done).length;
  return `
    <section class="editor-section-block">
      <div class="section-header">
        <div>
          <p class="card-kicker">Reescritura guiada</p>
          <h2>Checklist de reescritura</h2>
          <p>${escapeHtml(items.length ? `Tienes ${pending} paso${pending === 1 ? "" : "s"} abiertos para este capítulo.` : "Todavía no hay checklist creada. Puedes generarla desde un comentario abierto del capítulo.")}</p>
        </div>
      </div>
      <div class="checklist-grid">
        ${items.length ? items.map((item) => `
          <label class="check-item">
            <input data-action="toggle-rewrite-check" data-chapter-id="${chapter.id}" data-id="${item.id}" type="checkbox" ${item.done ? "checked" : ""}>
            <span>${escapeHtml(item.label)}</span>
          </label>
        `).join("") : emptyState("Aún no hay pasos de reescritura para este capítulo.")}
      </div>
    </section>
  `;
}

function formatReferenceAuthors(value) {
  return String(value || "")
    .split(/;| y | and /i)
    .map((item) => item.trim())
    .filter(Boolean);
}

function ensureReferencePeriod(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function normalizeReferenceLocator(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  if (/^doi\.org\//i.test(text)) return `https://${text}`;
  if (/^10\./i.test(text)) return `https://doi.org/${text}`;
  return text;
}

function formatAuthorsForApa(authors) {
  if (!authors.length) return "Autor pendiente";
  const formatted = authors.map((author) => {
    const parts = author.split(',').map((item) => item.trim()).filter(Boolean);
    if (parts.length >= 2) return `${parts[0]}, ${parts.slice(1).join(', ')}`;
    return author;
  });
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]} & ${formatted[1]}`;
  return `${formatted.slice(0, -1).join(', ')}, & ${formatted[formatted.length - 1]}`;
}

function formatAuthorsForMla(authors) {
  if (!authors.length) return "Autor pendiente";
  if (authors.length === 1) return authors[0];
  return `${authors[0]}, et al.`;
}

function formatAuthorsForChicago(authors) {
  if (!authors.length) return "Autor pendiente";
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} y ${authors[1]}`;
  return `${authors[0]} et al.`;
}

function bibliographyEntryType(reading) {
  const normalized = normalizeUserText(reading?.type || "");
  if (normalized.includes("libro")) return "book";
  if (normalized.includes("capitulo")) return "incollection";
  if (normalized.includes("informe")) return "techreport";
  return "article";
}

function bibliographyKey(reading, authors, year) {
  const authorSeed = normalizeUserText(authors[0] || "autor")
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join("") || "autor";
  const titleSeed = normalizeUserText(reading?.title || "tesis")
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join("") || "tesis";
  return `${authorSeed}${year || "sf"}${titleSeed}`;
}

function buildApaReference(reading) {
  const authors = formatReferenceAuthors(reading?.authors);
  const year = String(reading?.year || "").trim() || "s. f.";
  const title = ensureReferencePeriod(reading?.title || "Título pendiente");
  const source = ensureReferencePeriod(reading?.source || reading?.type || "");
  const locator = normalizeReferenceLocator(reading?.doi);
  return [formatAuthorsForApa(authors), `(${year}).`, title, source, locator].filter(Boolean).join(" ");
}

function buildMlaReference(reading) {
  const authors = formatReferenceAuthors(reading?.authors);
  const year = String(reading?.year || "").trim() || "s. f.";
  const title = String(reading?.title || "Título pendiente").trim();
  const source = String(reading?.source || reading?.type || "Fuente pendiente").trim();
  const locator = normalizeReferenceLocator(reading?.doi);
  return [ensureReferencePeriod(formatAuthorsForMla(authors)), `"${title}."`, source, year, locator].filter(Boolean).join(", ").replace(/, ([^,]*)$/, '. $1');
}

function buildChicagoReference(reading) {
  const authors = formatReferenceAuthors(reading?.authors);
  const year = String(reading?.year || "").trim() || "s. f.";
  const title = String(reading?.title || "Título pendiente").trim();
  const source = ensureReferencePeriod(reading?.source || reading?.type || "");
  const locator = normalizeReferenceLocator(reading?.doi);
  return [ensureReferencePeriod(formatAuthorsForChicago(authors)), `${year}.`, `"${title}."`, source, locator].filter(Boolean).join(" ");
}

function buildBibtexReference(reading) {
  const authors = formatReferenceAuthors(reading?.authors);
  const year = String(reading?.year || "").trim() || "0000";
  const type = bibliographyEntryType(reading);
  const key = bibliographyKey(reading, authors, year === "s. f." ? "sf" : year);
  const lines = [
    `@${type}{${key},`,
    `  author = {${authors.join(' and ') || 'Autor pendiente'}},`,
    `  title = {${String(reading?.title || 'Título pendiente').trim()}},`,
    `  year = {${year}},`
  ];
  if (reading?.source) {
    const sourceField = type === 'book' ? 'publisher' : type === 'techreport' ? 'institution' : type === 'incollection' ? 'booktitle' : 'journal';
    lines.push(`  ${sourceField} = {${String(reading.source).trim()}},`);
  }
  if (reading?.doi) {
    lines.push(`  doi = {${String(reading.doi).replace(/^https?:\/\/doi\.org\//i, '').trim()}},`);
  }
  lines.push('}');
  return lines.join('\n');
}

function buildBibliographicReference(reading, style = state.literatureCitationStyle || "APA 7") {
  if (!reading) return "";
  if (style === "MLA 9") return buildMlaReference(reading);
  if (style === "Chicago") return buildChicagoReference(reading);
  if (style === "BibTeX") return buildBibtexReference(reading);
  return buildApaReference(reading);
}

async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      showToast("Referencia copiada");
      return;
    }
  } catch (error) {
    // Fallback below.
  }
  copyWithFallback(text);
}

function copyWithFallback(text) {
  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "absolute";
  helper.style.left = "-9999px";
  document.body.appendChild(helper);
  helper.select();
  document.execCommand("copy");
  helper.remove();
  showToast("Referencia copiada");
}

function renderLiterature() {
  const term = (state.literatureFilter || "").trim().toLowerCase();
  const filtered = state.readings.filter((reading) => {
    const haystack = `${reading.title} ${reading.authors} ${reading.chapter} ${reading.status} ${reading.use} ${reading.source || ""}`.toLowerCase();
    return !term || haystack.includes(term);
  });
  const selectedReading = state.readings.find((reading) => reading.id === state.literatureCitationId) || filtered[0] || state.readings[0] || null;
  const style = state.literatureCitationStyle || "APA 7";
  const citation = selectedReading ? buildBibliographicReference(selectedReading, style) : "";
  const selectedAnnotations = [...(selectedReading?.annotations || [])].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  const pdfUrl = selectedReading ? currentReadingPdfUrl(selectedReading) : "";
  const hasPdf = Boolean(selectedReading?.pdf?.url);
  const currentPdfPage = selectedReading && readingPdfViewer.readingId === selectedReading.id ? readingPdfViewer.currentPage : 1;
  const extractBank = filteredReadingExtractBank();
  const extractChapterOptions = readingExtractChapterOptions();

  screen.innerHTML = `
    <section class="literature-layout">
      <div>
        <div class="section-header">
          <div>
            <p class="eyebrow">Lecturas con trabajo real</p>
            <h2>Fuentes vinculadas a capítulos</h2>
            <p>Ahora puedes guardar el PDF privado dentro de la lectura, leerlo desde DoctoralOS y convertir subrayados en ideas de escritura sin salir del flujo de tesis.</p>
          </div>
        </div>

        <div class="filter-row">
          <input data-literature-filter type="search" value="${escapeAttribute(state.literatureFilter || "")}" placeholder="Buscar por autor, capítulo, fuente o estado">
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Autor</th>
                <th>Año</th>
                <th>Fuente</th>
                <th>Uso en tesis</th>
                <th>PDF</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map((reading) => `
                <tr class="${selectedReading?.id === reading.id ? "reading-row reading-row--active" : "reading-row"}">
                  <td><strong>${escapeHtml(reading.authors)}</strong><br>${escapeHtml(reading.title)}</td>
                  <td>${escapeHtml(reading.year)}</td>
                  <td>${escapeHtml(reading.source || reading.chapter)}<br>${statusPill(reading.status)}</td>
                  <td>${escapeHtml(reading.use)}</td>
                  <td>${reading.pdf ? `<span class="status-pill done">PDF</span>` : `<span class="status-pill">Ficha</span>`}</td>
                  <td>
                    <div class="row-actions">
                      <button class="tiny-button" data-action="select-reading" data-id="${reading.id}" type="button">Abrir</button>
                      <button class="tiny-button" data-action="show-citation" data-id="${reading.id}" type="button">Referencia</button>
                      <button class="tiny-button" data-action="delete-reading" data-id="${reading.id}" type="button"><span data-icon="trash"></span></button>
                    </div>
                  </td>
                </tr>`
              ).join("") || `<tr><td colspan="6">${emptyState("Todavía no hay lecturas registradas.")}</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <aside class="side-stack">
        <div class="form-panel">
          <h2>Nueva ficha</h2>
          <form class="form-grid" data-form="reading">
            ${field("Título", "title", "input", "Artículo o libro")}
            ${field("Autores", "authors", "input", "Apellido, A.")}
            ${field("Año", "year", "number", "2026")}
            ${field("Revista, editorial o fuente", "source", "input", "Revista, editorial, congreso...")}
            <div class="inline-fields">
              ${selectField("Estado", "status", ["Pendiente", "Leyendo", "Leído", "Clave", "Descartado"])}
              ${chapterSelect("Capítulo", "chapter")}
            </div>
            ${field("Uso en mi tesis", "use", "textarea", "Dónde lo citaré y para qué")}
            ${field("DOI / URL", "doi", "input", "10.xxxx/... o URL")}
            <div class="field">
              <label for="readingPdfFile">PDF privado (opcional)</label>
              <input id="readingPdfFile" name="pdfFile" type="file" accept="application/pdf">
              <p class="form-help">Hasta 20 MB. El PDF queda guardado como archivo privado del workspace y los subrayados se guardan en la lectura.</p>
            </div>
            <button class="button" type="submit"><span data-icon="plus"></span>Añadir lectura</button>
          </form>
        </div>

        <article class="card citation-card citation-card--premium">
          <div class="section-header compact-head">
            <div>
              <p class="card-kicker">Referencia rápida</p>
              <h2>${selectedReading ? escapeHtml(selectedReading.title) : "Selecciona una lectura"}</h2>
            </div>
            ${selectedReading ? `<button class="tiny-button" data-action="copy-citation" data-id="${selectedReading.id}" type="button"><span data-icon="copy"></span>Copiar</button>` : ""}
          </div>
          <p class="muted">Elige el estilo y copia una versión provisional directamente desde la lectura seleccionada.</p>
          <div class="citation-toolbar">
            <label class="field citation-style-field">
              <span>Estilo</span>
              <select data-citation-style>
                ${["APA 7", "MLA 9", "Chicago", "BibTeX"].map((option) => `<option value="${escapeAttribute(option)}" ${option === style ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
              </select>
            </label>
            <div class="citation-style-chip">${escapeHtml(style)}</div>
          </div>
          <div class="generated-box citation-preview ${style === "BibTeX" ? "citation-preview--code" : ""}">${selectedReading ? escapeHtml(citation) : "Selecciona una lectura de la tabla o crea una nueva para generar aquí una referencia rápida."}</div>
        </article>

        <article class="card reading-workspace-card">
          <div class="section-header compact-head">
            <div>
              <p class="card-kicker">Lectura activa</p>
              <h2>${selectedReading ? escapeHtml(selectedReading.title) : "Selecciona una lectura"}</h2>
            </div>
            ${selectedReading ? `<button class="tiny-button" data-action="select-reading" data-id="${selectedReading.id}" type="button">Ver ficha</button>` : ""}
          </div>
          ${selectedReading ? `
            <div class="reading-workspace-meta">
              <span>${escapeHtml(selectedReading.authors)}</span>
              <span>${escapeHtml(selectedReading.year || "s. f.")}</span>
              <span>${escapeHtml(selectedReading.chapter || "Sin capítulo")}</span>
              <span>${selectedAnnotations.length} subrayados</span>
            </div>

            <div class="reading-workspace-actions">
              <label class="tiny-button file-action">
                <span data-icon="upload"></span>${hasPdf ? "Cambiar PDF" : "Subir PDF"}
                <input data-reading-pdf-upload data-id="${selectedReading.id}" type="file" accept="application/pdf">
              </label>
              ${hasPdf ? `<a class="tiny-button" href="${escapeAttribute(pdfUrl)}" target="_blank" rel="noopener noreferrer">Abrir aparte</a>` : ""}
              ${hasPdf ? `<a class="tiny-button" href="${escapeAttribute(pdfUrl)}" download="${escapeAttribute(selectedReading.pdf.name || "lectura.pdf")}">Descargar</a>` : ""}
              ${hasPdf ? `<button class="tiny-button" data-action="remove-reading-pdf" data-id="${selectedReading.id}" type="button">Quitar PDF</button>` : ""}
            </div>

            ${hasPdf ? `
              <div class="reading-pdf-toolbar">
                <div class="reading-pdf-toolbar-group">
                  <button class="tiny-button" data-action="reading-pdf-prev" type="button" ${readingPdfViewer.currentPage <= 1 ? "disabled" : ""}>Anterior</button>
                  <span class="reading-pdf-page-chip">Página <strong data-reading-pdf-page>${escapeHtml(String(currentPdfPage))}</strong>/<strong data-reading-pdf-total>${escapeHtml(String(readingPdfViewer.totalPages || 1))}</strong></span>
                  <button class="tiny-button" data-action="reading-pdf-next" type="button" ${(readingPdfViewer.totalPages || 1) <= (readingPdfViewer.currentPage || 1) ? "disabled" : ""}>Siguiente</button>
                </div>
                <div class="reading-pdf-toolbar-group">
                  <button class="tiny-button" data-action="reading-pdf-zoom-out" type="button">-</button>
                  <span class="reading-pdf-page-chip" data-reading-pdf-scale>${Math.round((readingPdfViewer.scale || 1.16) * 100)}%</span>
                  <button class="tiny-button" data-action="reading-pdf-zoom-in" type="button">+</button>
                </div>
              </div>

                <div class="reading-pdf-stage">
                  <p class="reading-pdf-loading" data-reading-pdf-loading hidden>Cargando PDF...</p>
                  <p class="reading-pdf-error" data-reading-pdf-error hidden></p>
                  <div class="reading-pdf-sheet">
                    <canvas data-reading-pdf-canvas></canvas>
                    <div class="reading-pdf-highlight-layer" data-reading-pdf-highlights></div>
                    <div class="reading-pdf-text-layer" data-reading-pdf-text></div>
                  </div>
                </div>

              <div class="reading-selection-panel">
                <div class="reading-selection-head">
                  <strong>Subrayado en preparación</strong>
                  <span class="reading-pdf-page-chip" data-reading-selection-page>Sin selección</span>
                </div>
                <div class="generated-box reading-selection-preview" data-reading-selection-preview>Selecciona texto dentro del PDF para guardar aquí un subrayado con nota.</div>
                <div class="field">
                  <label for="readingSelectionNote">Idea o utilidad para escribir después</label>
                  <textarea id="readingSelectionNote" data-reading-selection-note placeholder="Qué te llevas de este fragmento y dónde podrías usarlo"></textarea>
                </div>
                <div class="reading-workspace-actions">
                  <button class="button" data-action="save-reading-highlight" type="button" disabled>Guardar subrayado</button>
                </div>
              </div>
            ` : `
              <div class="empty-state">
                Sube el PDF de esta lectura para leerlo aquí, guardar subrayados y convertir ideas en notas de capítulo.
              </div>
            `}

            <div class="reading-highlight-list">
              <div class="section-header compact-head">
                <div>
                  <p class="card-kicker">Banco de extractos</p>
                  <h3>Subrayados reutilizables</h3>
                </div>
              </div>
              <div class="filter-row reading-extract-filters">
                <input data-literature-extract-filter type="search" value="${escapeAttribute(state.literatureExtractFilter || "")}" placeholder="Buscar idea, cita o fuente dentro de tus extractos">
                <select data-literature-extract-chapter>
                  <option value="all" ${state.literatureExtractChapter === "all" ? "selected" : ""}>Todos los capítulos</option>
                  ${extractChapterOptions.map((chapter) => `<option value="${escapeAttribute(chapter)}" ${state.literatureExtractChapter === chapter ? "selected" : ""}>${escapeHtml(chapter)}</option>`).join("")}
                </select>
              </div>
              ${extractBank.map((entry) => {
                const annotation = entry.annotation;
                const chapterLabel = annotation.chapterId ? chapterTitleFromId(annotation.chapterId, entry.readingChapter) : entry.readingChapter;
                const isCurrentReading = selectedReading && entry.readingId === selectedReading.id;
                return `
                <article class="reading-highlight-card">
                  <div class="reading-highlight-head">
                    <span class="status-pill review">Pág. ${annotation.page}</span>
                    <span class="reading-highlight-source">${escapeHtml(entry.readingTitle)}${isCurrentReading ? " · lectura activa" : ""}</span>
                    <div class="row-actions">
                      <button class="tiny-button" data-action="open-reading-highlight" data-reading-id="${entry.readingId}" data-id="${annotation.id}" type="button">Abrir en PDF</button>
                      <button class="tiny-button" data-action="reading-highlight-to-note" data-reading-id="${entry.readingId}" data-id="${annotation.id}" type="button">Pasar a nota</button>
                      <button class="tiny-button" data-action="delete-reading-highlight" data-reading-id="${entry.readingId}" data-id="${annotation.id}" type="button"><span data-icon="trash"></span></button>
                    </div>
                  </div>
                  <div class="reading-highlight-meta">
                    <span>${escapeHtml(entry.readingAuthors)}</span>
                    <span>${escapeHtml(chapterLabel)}</span>
                  </div>
                  <blockquote class="reading-highlight-quote">“${escapeHtml(annotation.text)}”</blockquote>
                  <p class="reading-highlight-note">${escapeHtml(annotation.note || "Sin nota adicional todavía.")}</p>
                </article>
              `;
              }).join("") || `<div class="empty-state">Todavía no has guardado subrayados que coincidan con este filtro.</div>`}
            </div>

            <p class="form-help">Nota: el JSON de respaldo exporta la ficha y los subrayados, pero el binario del PDF se guarda como archivo privado del servidor.</p>
          ` : `
            <div class="empty-state">Selecciona una lectura para abrir aquí su ficha, su referencia y el espacio de lectura en PDF.</div>
          `}
        </article>
      </aside>
    </section>
  `;
}

function renderPlanner() {
  const columns = [
    { id: "today", title: "Hoy" },
    { id: "week", title: "Esta semana" },
    { id: "later", title: "Después" }
  ];
  const activeTasks = state.tasks.filter((task) => !task.done);
  const completedTasks = [...state.tasks]
    .filter((task) => task.done)
    .sort((a, b) => String(b.completedAt || "").localeCompare(String(a.completedAt || "")));
  const completionRate = state.tasks.length ? Math.round((completedTasks.length / state.tasks.length) * 100) : 0;

  screen.innerHTML = `
    <section class="section-header">
      <div>
        <p class="eyebrow">Trabajo sostenible</p>
        <h2>Plan semanal</h2>
        <p>Convierte capítulos, lecturas y reuniones en tareas pequeñas con vencimiento e impacto claro. Marca lo completado a medida que avanzas y deja una semana más legible.</p>
      </div>
    </section>

    <section class="metrics-grid compact-metrics planner-metrics">
      ${metric("Activas", activeTasks.length, "tareas todavía abiertas")}
      ${metric("Completadas", completedTasks.length, "cerradas esta semana o antes")}
      ${metric("Progreso", `${completionRate}%`, "del total de tareas registradas")}
    </section>

    <section class="kanban planner-kanban">
      ${columns.map((column) => {
        const tasks = state.tasks.filter((task) => task.status === column.id && !task.done);
        return `
          <div class="kanban-column">
            <h3>${column.title}<span class="badge">${tasks.length}</span></h3>
            ${tasks.map((task) => taskCard(task)).join("") || emptyState("Sin tareas en esta columna.")}
          </div>
        `;
      }).join("")}
    </section>

    <section class="grid-2 planner-bottom-grid" style="margin-top: 18px;">
      <article class="form-panel">
        <h2>Nueva tarea</h2>
        <form class="form-grid" data-form="task">
          ${field("Tarea", "title", "input", "Escribir 500 palabras del marco teórico")}
          <div class="inline-fields">
            ${field("Área", "area", "input", "Capítulos")}
            ${selectField("Columna", "status", ["today", "week", "later"])}
          </div>
          <div class="inline-fields">
            ${field("Fecha", "due", "date", "")}
            ${field("Esfuerzo", "effort", "input", "45 min")}
          </div>
          ${selectField("Impacto", "impact", ["Alto", "Medio", "Bajo"])}
          <button class="button" type="submit"><span data-icon="plus"></span>Añadir tarea</button>
        </form>
      </article>
      <article class="card planner-guide-card">
        <p class="card-kicker">Checklist semanal</p>
        <h2>Una tesis avanza cuando lo terminado desaparece del ruido</h2>
        <p>Marca cada tarea al cerrarla. Si necesitas retomarla, vuelve a abrirla o muévela de columna sin perder el historial.</p>
        <ul class="quality-list compact-list">
          <li>Hoy: tareas pequeñas y cerrables</li>
          <li>Semana: lo importante que sí cabe</li>
          <li>Después: lo que todavía no debe robar foco</li>
        </ul>
        <div class="summary-actions">
          <button class="ghost-button" data-action="assistant-suggest" data-message="Créame tres tareas foco para esta semana" type="button"><span data-icon="assistant"></span>Montar semana</button>
          <button class="ghost-button" data-action="assistant-suggest" data-message="Dame un plan de arranque de 45 minutos para hoy" type="button"><span data-icon="assistant"></span>Arranque rápido</button>
        </div>
      </article>
    </section>

    <section class="panel completed-panel" style="margin-top: 18px;">
      <div class="section-header compact-head">
        <div>
          <p class="card-kicker">Completadas</p>
          <h2>Tareas ya cerradas</h2>
        </div>
        <span class="badge teal">${completedTasks.length}</span>
      </div>
      <div class="completed-task-list">
        ${completedTasks.map((task) => completedTaskRow(task)).join("") || emptyState("Todavía no has marcado tareas como completadas.")}
      </div>
    </section>
  `;
}
function renderReviews() {
  const columns = ["Pendiente", "En proceso", "Necesita aclaración", "Resuelto"];
  const open = state.reviewComments.filter((comment) => comment.status !== "Resuelto").length;
  const high = state.reviewComments.filter((comment) => comment.priority === "Alta" && comment.status !== "Resuelto").length;
  const latest = state.meetings[0];

  screen.innerHTML = `
    <section class="review-layout">
      <div>
        <div class="section-header">
          <div>
            <p class="eyebrow">Reuniones y revisión</p>
            <h2>Acuerdos, feedback y cierre</h2>
            <p>La v1 une reuniones y comentarios para que cada conversación termine en tareas y decisiones visibles.</p>
          </div>
        </div>

        <section class="metrics-grid compact-metrics">
          ${metric("Abiertos", open, "comentarios sin resolver")}
          ${metric("Alta prioridad", high, "requieren respuesta pronta")}
          ${metric("Resueltos", state.reviewComments.filter((item) => item.status === "Resuelto").length, "comentarios cerrados")}
          ${metric("Reuniones", state.meetings.length, "actas registradas")}
        </section>

        ${renderGoogleCalendarPanel()}

        ${latest ? `
          <article class="panel">
            <p class="card-kicker">Última reunión</p>
            <h2>${escapeHtml(formatMeetingLabel(latest))}</h2>
            ${latest.provider === "google_meet" && latest.meetLink ? `
              <div class="integration-inline-row">
                <span class="badge teal">Google Meet</span>
                <a class="tiny-button" href="${escapeAttribute(latest.meetLink)}" target="_blank" rel="noreferrer">Abrir Meet</a>
              </div>
            ` : ""}
            ${latest.summary ? `<p><strong>Resumen:</strong> ${escapeHtml(latest.summary)}</p>` : ""}
            <p><strong>Decisiones:</strong> ${escapeHtml(latest.decisions)}</p>
            <p><strong>Tareas:</strong> ${escapeHtml(latest.tasks)}</p>
            <div class="generated-box">${escapeHtml(generateMeetingEmail(latest))}</div>
            <div class="summary-actions">
              <button class="ghost-button" data-action="assistant-suggest" data-message="${escapeAttribute(`Prepárame la reunión del ${latest.date}${latest.time ? ` a las ${latest.time}` : ""} y guárdala en la app`)}" type="button"><span data-icon="assistant"></span>Preparar agenda</button>
            </div>
          </article>
        ` : emptyState("Registra tu próxima reunión para convertir acuerdos en tareas.")}

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
                  <strong>${escapeHtml(formatMeetingLabel(meeting))}</strong>
                  <div class="meeting-meta muted">${escapeHtml(meeting.attendees)} &middot; próxima ${formatDate(meeting.next)}</div>
                </div>
                <div class="meeting-actions">
                  ${meeting.provider === "google_meet" && meeting.meetLink ? `<a class="tiny-button" href="${escapeAttribute(meeting.meetLink)}" target="_blank" rel="noreferrer">Abrir Meet</a>` : ""}
                  <button class="tiny-button" data-action="delete-meeting" data-id="${meeting.id}" type="button"><span data-icon="trash"></span></button>
                </div>
              </div>
              ${meeting.provider === "google_meet" ? `<div class="integration-inline-row"><span class="badge teal">Google Meet</span><span class="muted">Sincronizada ${meeting.syncedAt ? formatDateTime(meeting.syncedAt) : "ahora"}</span></div>` : ""}
              <p><strong>Agenda:</strong> ${escapeHtml(meeting.agenda)}</p>
              ${meeting.summary ? `<p><strong>Resumen:</strong> ${escapeHtml(meeting.summary)}</p>` : ""}
              <p><strong>Decisiones:</strong> ${escapeHtml(meeting.decisions)}</p>
              <p><strong>Tareas:</strong> ${escapeHtml(meeting.tasks)}</p>
              <label class="field">
                <span>Notas rápidas de salida</span>
                <textarea data-meeting-notes data-id="${meeting.id}" rows="5" placeholder="Pega aquí notas, acuerdos sueltos o tareas habladas para que TeDoc cierre la reunión automáticamente.">${escapeHtml(meeting.notes || "")}</textarea>
              </label>
              <div class="summary-actions">
                <button class="tiny-button" data-action="save-meeting-notes" data-id="${meeting.id}" type="button">Guardar notas</button>
                <button class="ghost-button" data-action="meeting-autoclose" data-id="${meeting.id}" type="button" ${meetingHasClosureSource(meeting) ? "" : "disabled"}><span data-icon="assistant"></span>TeDoc cierra reunión</button>
              </div>
            </article>
          `).join("") || ""}
        </section>
      </div>

      <aside class="side-stack">
        <div class="form-panel">
          <h2>Nueva reunión</h2>
          <form class="form-grid" data-form="meeting">
            <div class="inline-fields">
              ${field("Fecha", "date", "date", new Date().toISOString().slice(0, 10), true)}
              ${field("Hora", "time", "time", "")}
              ${selectField("Tipo", "type", ["Dirección", "Comité", "Grupo", "Revisión interna"])}
            </div>
            ${field("Asistentes", "attendees", "input", "Director/a, codirector/a")}
            ${field("Agenda", "agenda", "textarea", "Temas a tratar")}
            ${field("Decisiones", "decisions", "textarea", "Acuerdos tomados")}
            ${field("Tareas", "tasks", "textarea", "Tareas y responsables")}
            ${field("Próxima reunión", "next", "date", "")}
            <button class="button" type="submit"><span data-icon="plus"></span>Guardar reunión</button>
          </form>
        </div>

        <div class="form-panel">
          <h2>Nuevo comentario</h2>
          <form class="form-grid" data-form="comment">
            <div class="inline-fields">
              ${chapterSelect("Capítulo", "chapter")}
              ${field("Fuente", "source", "input", "Director/a")}
            </div>
            ${field("Comentario recibido", "comment", "textarea", "Qué hay que revisar")}
            ${field("Respuesta prevista", "response", "textarea", "Cómo se va a resolver")}
            <div class="inline-fields">
              ${selectField("Estado", "status", columns)}
              ${selectField("Prioridad", "priority", ["Alta", "Media", "Baja"])}
            </div>
            ${field("Fecha límite", "due", "date", "")}
            <button class="button" type="submit"><span data-icon="plus"></span>Registrar comentario</button>
          </form>
        </div>
      </aside>
    </section>
  `;
}

function renderGoogleCalendarPanel() {
  const statusBadge = googleCalendar.connected
    ? `<span class="badge teal">Conectado</span>`
    : googleCalendar.configured
      ? `<span class="badge gold">Disponible</span>`
      : `<span class="badge">Pendiente</span>`;

  const primaryAction = googleCalendar.connected
    ? `<button class="ghost-button" data-action="google-calendar-import" type="button" ${googleCalendar.loading ? "disabled" : ""}>${googleCalendar.loading ? "Importando..." : "Importar reuniones de Meet"}</button>`
    : `<button class="button" data-action="google-calendar-connect" type="button" ${googleCalendar.loading || !googleCalendar.configured ? "disabled" : ""}>Conectar Google Calendar</button>`;

  const secondaryAction = googleCalendar.connected
    ? `<button class="tiny-button" data-action="google-calendar-disconnect" type="button" ${googleCalendar.loading ? "disabled" : ""}>Desconectar</button>`
    : "";

  const detail = googleCalendar.connected
    ? `${escapeHtml(googleCalendar.googleEmail || "Cuenta conectada")}${googleCalendar.updatedAt ? ` &middot; última sync ${escapeHtml(formatDateTime(googleCalendar.updatedAt))}` : ""}`
    : "Trae tus eventos con enlace de Meet y conviértelos en reuniones registradas dentro de la app.";

  return `
    <article class="panel integration-panel">
      <div class="section-header">
        <div>
          <p class="card-kicker">Google Calendar + Meet</p>
          <h2>Importa reuniones reales</h2>
          <p>${escapeHtml(googleCalendar.message)}</p>
        </div>
        ${statusBadge}
      </div>
      <p class="muted">${detail}</p>
      <div class="integration-actions">
        ${primaryAction}
        ${secondaryAction}
      </div>
    </article>
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
            <h2>Bitácora de escritura</h2>
            <p>Registra sesiones reales, suma palabras al capítulo correspondiente y observa el ritmo semanal.</p>
          </div>
        </div>

        <section class="metrics-grid compact-metrics">
          ${metric("Total registrado", formatNumber(totalWords), "palabras en sesiones")}
          ${metric("Últimos 7 días", formatNumber(last7), "palabras recientes")}
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
          `).join("") || emptyState("Todavía no hay sesiones de escritura.")}
        </section>
      </div>

      <aside class="form-panel">
        <h2>Nueva sesión</h2>
        <form class="form-grid" data-form="writing">
          <div class="inline-fields">
            ${field("Fecha", "date", "date", todayISO(), true)}
            ${chapterSelect("Capítulo", "chapter")}
          </div>
          <div class="inline-fields">
            ${field("Palabras", "words", "number", "500")}
            ${field("Minutos", "minutes", "number", "60")}
          </div>
          ${selectField("Estado", "mood", ["Fluido", "Neutral", "Trabado", "Revisión", "Lectura"])}
          ${field("Nota", "note", "textarea", "Qué avance o decisión salió de esta sesión") }
          <button class="button" type="submit"><span data-icon="plus"></span>Guardar sesión</button>
        </form>
      </aside>
    </section>
  `;
}

function renderForum() {
  const topics = [...state.forumTopics].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  screen.innerHTML = `
    <section class="section-header">
      <div>
        <p class="eyebrow">Próximamente</p>
        <h2>Foro doctoral</h2>
        <p>Este espacio está reservado para una comunidad cuidada de doctorandos. Más adelante servirá para compartir inquietudes, dudas y conversaciones sin mezclarlo con el trabajo individual de la tesis.</p>
      </div>
    </section>

    <section class="grid-2">
      <article class="panel">
        <p class="card-kicker">Qué queremos construir</p>
        <h2>Una comunidad útil, no ruido</h2>
        <ul class="quality-list compact-list">
          <li>Dudas sobre capítulos, metodología y escritura doctoral</li>
          <li>Conversaciones sobre supervisión, bloqueos y organización semanal</li>
          <li>Hilos moderados por temas para no convertirlo en un chat caótico</li>
          <li>Privacidad y normas claras antes de abrirlo a usuarios reales</li>
        </ul>
      </article>

      <article class="form-panel">
        <h2>Deja un tema en borrador</h2>
        <p class="muted">Todavía no es un foro compartido. De momento puedes guardar ideas de conversaciones que te gustaría encontrar cuando lo lancemos.</p>
        <form class="form-grid" data-form="forum-topic">
          ${field("Tema", "title", "input", "Cómo responder comentarios duros del director")}
          ${selectField("Tipo", "tag", ["Duda", "Metodología", "Escritura", "Supervisión", "Bloqueos", "Vida doctoral"])}
          ${field("Mensaje inicial", "body", "textarea", "Explica la inquietud o la conversación que te gustaría abrir")}
          <button class="button" type="submit"><span data-icon="plus"></span>Guardar tema</button>
        </form>
      </article>
    </section>

    <section class="notes-panel">
      <div class="section-header">
        <div>
          <p class="card-kicker">Borradores de comunidad</p>
          <h2>Temas que ya merecen conversación</h2>
        </div>
      </div>
      <div class="notes-grid">
        ${topics.map((topic) => `
          <article class="note-card">
            <div class="list-row-header">
              <div>
                <strong>${escapeHtml(topic.title)}</strong>
                <div class="muted">${escapeHtml(topic.tag)} · ${escapeHtml(topic.author)} · ${formatDateTime(topic.createdAt)}</div>
              </div>
              <button class="tiny-button" data-action="delete-forum-topic" data-id="${topic.id}" type="button"><span data-icon="trash"></span></button>
            </div>
            <p>${escapeHtml(topic.body)}</p>
          </article>
        `).join("") || emptyState("Todavía no hay temas guardados.")}
      </div>
    </section>
  `;
}

function renderAssistant() {
  const suggestions = assistantSuggestions();
  const assistantModeText = assistantCanUseRemote()
    ? "TeDoc puede usar IA, guardar acciones dentro de la app y volver al modo local si el servidor no responde."
    : demoMode
      ? "Demo guiada activa. Las acciones se guardan dentro de esta tesis de ejemplo."
      : "Modo local activo. Puedes trabajar con TeDoc ahora, mantener puntos de restauración locales y activar la IA más adelante.";

  screen.innerHTML = `
    <section class="assistant-layout">
      <div class="assistant-panel">
        <div class="section-header assistant-header">
          <div>
            <p class="eyebrow">TeDoc</p>
            <h2>Preguntas, consejo y acciones directas</h2>
            <p>Puedes pedirme resumen, prioridades o escribir cosas como "Agendar reunión el viernes a las 16:00 con directora sobre metodología".</p>
          </div>
          <button class="ghost-button" data-action="assistant-clear" type="button"><span data-icon="trash"></span>Reiniciar chat</button>
        </div>

        ${renderAssistantBriefing()}

        <div class="assistant-thread">
          ${state.assistantThread.map((message) => renderAssistantMessage(message)).join("")}
        </div>

        <form class="assistant-composer" data-form="assistant">
          ${field("Escribe tu mensaje", "message", "textarea", "Ejemplo: Crear tarea enviar borrador del capítulo 2 para mañana") }
          <div class="summary-actions">
            <button class="button" type="submit" ${assistantBusy ? 'disabled' : ''}><span data-icon="plus"></span>${assistantBusy ? 'Pensando...' : 'Enviar'}</button>
          </div>
        </form>
      </div>

      <aside class="assistant-sidebar">
        <div class="form-panel">
          <h2>Pruebas útiles</h2>
          <p class="muted">${assistantModeText}</p>
          <div class="assistant-suggestion-grid">
            ${suggestions.map((item) => `<button class="ghost-button assistant-suggestion" data-action="assistant-suggest" data-message="${escapeAttribute(item)}" type="button">${escapeHtml(item)}</button>`).join("")}
          </div>
        </div>

        ${renderAssistantActionCard()}

        ${renderAssistantStyleCard()}

        ${renderAssistantSafetyCard()}

        <article class="card">
          <p class="card-kicker">Puede hacer ahora</p>
          <h2>Lo más útil en esta v1</h2>
          <ul class="quality-list compact-list">
            <li>Resumir progreso y detectar cuellos de botella</li>
            <li>Priorizar la semana según tareas, comentarios y fechas</li>
            <li>Crear un mini plan semanal dentro de la app</li>
            <li>Detectar riesgos visibles antes de una entrega</li>
            <li>Proponer un plan de arranque de 45 minutos</li>
            <li>Crear tareas desde lenguaje natural</li>
            <li>Agendar reuniones con fecha y hora</li>
            <li>Preparar y guardar agendas de reunión</li>
            <li>Registrar notas y comentarios de revisión</li>
            <li>Redactar respuestas de trabajo a comentarios</li>
            <li>Dar consejo práctico sobre un capítulo concreto</li>
          </ul>
        </article>
      </aside>
    </section>`;
}

function renderAssistantMessage(message) {
  const isUser = message.role === "user";
  return `
    <article class="assistant-message ${isUser ? "is-user" : "is-assistant"}">
      <div class="assistant-message-head">
        <strong>${isUser ? "Tú" : "TeDoc"}</strong>
        <span>${formatDateTime(message.createdAt)}</span>
      </div>
      <div class="assistant-message-body">${escapeMultiline(message.text)}</div>
      ${isUser ? "" : renderAssistantFeedbackRow(message)}
    </article>`;
}

function renderAssistantFeedbackRow(message) {
  const current = String(message.feedback || "");
  return `
    <div class="assistant-feedback-row">
      ${assistantFeedbackButton(message.id, "helpful", "Esto sí me sirve", current)}
      ${assistantFeedbackButton(message.id, "too-long", "Demasiado largo", current)}
      ${assistantFeedbackButton(message.id, "more-direct", "Quiero más directo", current)}
      ${assistantFeedbackButton(message.id, "more-detail", "Quiero más detalle", current)}
    </div>
  `;
}

function assistantFeedbackButton(messageId, feedback, label, current) {
  return `<button class="tiny-button ${current === feedback ? "is-active" : ""}" data-action="assistant-feedback" data-id="${messageId}" data-feedback="${feedback}" type="button">${label}</button>`;
}

function renderAssistantBriefing() {
  const analytics = buildAnalyticsSnapshot();
  const urgentTask = nextOpenTask();
  const urgentComment = findUrgentComment();
  const chapter = nextChapterToPush();
  const meeting = upcomingMeeting();
  const latestSnapshot = latestSnapshotRecord();
  const nextMoveTitle = urgentTask ? urgentTask.title : chapter ? chapter.title : "Aterriza una primera sesión";
  const nextMoveMeta = [
    urgentTask?.due ? `Vence ${formatDate(urgentTask.due)}` : chapter?.due ? `Entrega ${formatDate(chapter.due)}` : "Sin fecha inmediata",
    urgentTask ? escapeHtml(urgentTask.area) : chapter ? `${chapter.progress}% de avance` : "Primer arranque"
  ];
  const rhythmLine = analytics.wordsLast7
    ? `${formatNumber(analytics.wordsLast7)} palabras en 7 días y ${analytics.writingTrend.toLowerCase()}.`
    : "No hay escritura reciente registrada; conviene reactivar una sesión pequeña antes de abrir más frentes.";
  const calmLine = latestSnapshot
    ? `Último punto de restauración ${formatDateTime(latestSnapshot.createdAt)}.`
    : "Todavía no hay punto de restauración local; puedes crear uno ahora mismo.";

  return `
    <section class="assistant-brief-grid">
      <article class="assistant-brief-card">
        <p class="card-kicker">Siguiente jugada</p>
        <h3>${escapeHtml(nextMoveTitle)}</h3>
        <p>${escapeHtml(`TeDoc te llevaría ahora a ${recommendNextMove()} para reducir fricción y recuperar continuidad real.`)}</p>
        <div class="assistant-brief-meta">
          ${nextMoveMeta.map((item) => `<span>${item}</span>`).join("")}
        </div>
        <button class="ghost-button" data-action="assistant-suggest" data-message="Dame un plan de arranque de 45 minutos para hoy" type="button">Plan de 45 min</button>
      </article>

      <article class="assistant-brief-card">
        <p class="card-kicker">Radar visible</p>
        <h3>${escapeHtml(buildAssistantRiskHeadline(analytics, urgentComment, meeting))}</h3>
        <p>${escapeHtml(buildAssistantRiskLine(analytics, urgentTask, urgentComment, chapter, meeting))}</p>
        <div class="assistant-brief-meta">
          <span>${openReviewCount()} comentarios vivos</span>
          <span>${analytics.tasksOverdue} tareas vencidas</span>
        </div>
        <button class="ghost-button" data-action="assistant-suggest" data-message="Detecta mis riesgos de entrega ahora mismo" type="button">Ver riesgos</button>
      </article>

      <article class="assistant-brief-card">
        <p class="card-kicker">Tranquilidad operativa</p>
        <h3>${escapeHtml(buildSafetyHeadline())}</h3>
        <p>${escapeHtml(`${calmLine} ${rhythmLine}`)}</p>
        <div class="assistant-brief-meta">
          <span>${safety.lastLocalSaveAt ? `Guardado ${formatDateTime(safety.lastLocalSaveAt)}` : "Sin guardado reciente"}</span>
          <span>${auth.user ? (safety.lastRemoteSaveAt ? `Sync ${formatDateTime(safety.lastRemoteSaveAt)}` : auth.statusLabel) : "Modo local"}</span>
        </div>
        <button class="ghost-button" data-action="assistant-snapshot" type="button">Crear punto ahora</button>
      </article>
    </section>
  `;
}

function renderAssistantSafetyCard() {
  const latestSnapshot = latestSnapshotRecord();
  const snapshotCount = loadSnapshots().length;
  return `
    <article class="card assistant-safety-card">
      <p class="card-kicker">Seguridad y tranquilidad</p>
      <h2>Tu trabajo deja un rastro recuperable</h2>
      <div class="assistant-safety-list">
        <div>
          <strong>${safety.lastLocalSaveAt ? formatDateTime(safety.lastLocalSaveAt) : "Pendiente"}</strong>
          <span>Último guardado local</span>
        </div>
        <div>
          <strong>${safety.lastSnapshotAt ? formatDateTime(safety.lastSnapshotAt) : "Sin punto aún"}</strong>
          <span>${snapshotCount} punto${snapshotCount === 1 ? "" : "s"} de restauración</span>
        </div>
        <div>
          <strong>${safety.lastExportedAt ? formatDateTime(safety.lastExportedAt) : "Todavía no"}</strong>
          <span>Último respaldo exportado</span>
        </div>
        <div>
          <strong>${auth.user ? (safety.lastRemoteSaveAt ? formatDateTime(safety.lastRemoteSaveAt) : auth.statusLabel) : "Local"}</strong>
          <span>${auth.user ? "Última sincronización remota" : "Sesión sin backend"}</span>
        </div>
      </div>
      <p class="muted">Los puntos de restauración se guardan en este navegador cuando detectamos cambios relevantes. Si quieres máxima calma, exporta un respaldo antes de una edición grande.</p>
      <div class="summary-actions assistant-safety-actions">
        <button class="ghost-button" data-action="assistant-snapshot" type="button">Crear punto ahora</button>
        <button class="ghost-button" data-action="assistant-export" type="button">Exportar respaldo</button>
        <button class="ghost-button" data-action="assistant-restore-latest" type="button" ${latestSnapshot ? "" : "disabled"}>Restaurar último</button>
      </div>
      ${latestSnapshot ? `<p class="assistant-safety-note">Último punto: ${escapeHtml(latestSnapshot.summary)}</p>` : ""}
    </article>
  `;
}

function renderAssistantActionCard() {
  const pending = normalizeAssistantPendingAction(assistantPendingAction);
  if (pending) {
    return `
      <article class="card assistant-action-card">
        <p class="card-kicker">Vista previa</p>
        <h2>${escapeHtml(pending.summary)}</h2>
        <p class="muted">TeDoc no tocará la app hasta que confirmes. Puedes revisar el impacto exacto y deshacer la última acción después.</p>
        <ul class="quality-list compact-list assistant-action-list">
          ${pending.actions.map((action) => `<li>${escapeHtml(describeAssistantAction(action))}</li>`).join("")}
        </ul>
        <div class="summary-actions">
          <button class="button" data-action="assistant-confirm-action" type="button"><span data-icon="check"></span>Confirmar</button>
          <button class="ghost-button" data-action="assistant-cancel-action" type="button">Cancelar</button>
          <button class="ghost-button" data-action="assistant-undo-action" type="button" ${assistantUndoState ? "" : "disabled"}>Deshacer última</button>
        </div>
      </article>
    `;
  }

  if (!assistantUndoState) return "";
  return `
    <article class="card assistant-action-card">
      <p class="card-kicker">Última acción aplicada</p>
      <h2>${escapeHtml(assistantUndoState.summary || "Acción reciente de TeDoc")}</h2>
      <p class="muted">Si no te convence lo último que aplicaste, puedes volver exactamente al estado anterior.</p>
      <div class="summary-actions">
        <button class="ghost-button" data-action="assistant-undo-action" type="button">Deshacer última</button>
      </div>
    </article>
  `;
}

function renderAssistantStyleCard() {
  const style = resolveAssistantStyle(refreshAssistantStyleMemory(state));
  return `
    <article class="card assistant-style-card">
      <p class="card-kicker">Memoria de estilo</p>
      <h2>Cómo cree TeDoc que trabajas mejor</h2>
      <p class="muted">${escapeHtml(style.summary || buildAssistantStyleSummary(style))}</p>
      <div class="assistant-style-metrics">
        <span>${escapeHtml(style.workBlock === "short" ? "Bloques cortos" : style.workBlock === "deep" ? "Bloques profundos" : "Bloques medios")}</span>
        <span>${escapeHtml(style.focusMode === "single" ? "Un frente claro" : "Frentes equilibrados")}</span>
        <span>${escapeHtml(style.planningDepth === "direct" ? "Planes directos" : "Planes detallados")}</span>
        <span>${escapeHtml(style.meetingMode === "brief" ? "Reuniones breves" : "Reuniones estructuradas")}</span>
      </div>
      <div class="assistant-style-pref-group">
        <strong>Planes</strong>
        <div class="assistant-style-pref-row">
          ${assistantStylePrefButton("planningDepth", "auto", "Auto", state.assistantStyleMemory.explicit.planningDepth)}
          ${assistantStylePrefButton("planningDepth", "direct", "Directos", state.assistantStyleMemory.explicit.planningDepth)}
          ${assistantStylePrefButton("planningDepth", "detailed", "Detallados", state.assistantStyleMemory.explicit.planningDepth)}
        </div>
      </div>
      <div class="assistant-style-pref-group">
        <strong>Foco</strong>
        <div class="assistant-style-pref-row">
          ${assistantStylePrefButton("focusMode", "auto", "Auto", state.assistantStyleMemory.explicit.focusMode)}
          ${assistantStylePrefButton("focusMode", "single", "Un frente", state.assistantStyleMemory.explicit.focusMode)}
          ${assistantStylePrefButton("focusMode", "balanced", "Equilibrado", state.assistantStyleMemory.explicit.focusMode)}
        </div>
      </div>
      <div class="assistant-style-pref-group">
        <strong>Bloques</strong>
        <div class="assistant-style-pref-row">
          ${assistantStylePrefButton("workBlock", "auto", "Auto", state.assistantStyleMemory.explicit.workBlock)}
          ${assistantStylePrefButton("workBlock", "short", "Cortos", state.assistantStyleMemory.explicit.workBlock)}
          ${assistantStylePrefButton("workBlock", "deep", "Profundos", state.assistantStyleMemory.explicit.workBlock)}
        </div>
      </div>
      <div class="assistant-style-pref-group">
        <strong>Reuniones</strong>
        <div class="assistant-style-pref-row">
          ${assistantStylePrefButton("meetingMode", "auto", "Auto", state.assistantStyleMemory.explicit.meetingMode)}
          ${assistantStylePrefButton("meetingMode", "brief", "Breves", state.assistantStyleMemory.explicit.meetingMode)}
          ${assistantStylePrefButton("meetingMode", "structured", "Estructuradas", state.assistantStyleMemory.explicit.meetingMode)}
        </div>
      </div>
      <div class="summary-actions">
        <button class="ghost-button" data-action="assistant-style-reset" type="button">Reiniciar memoria</button>
      </div>
    </article>
  `;
}

function assistantStylePrefButton(key, value, label, currentValue) {
  return `<button class="tiny-button ${currentValue === value ? "is-active" : ""}" data-action="assistant-style-pref" data-key="${key}" data-value="${value}" type="button">${label}</button>`;
}

function updateAssistantStylePreference(key, value) {
  const allowed = {
    planningDepth: ["auto", "direct", "detailed"],
    focusMode: ["auto", "single", "balanced"],
    workBlock: ["auto", "short", "deep"],
    meetingMode: ["auto", "brief", "structured"]
  };
  if (!allowed[key] || !allowed[key].includes(value)) return;
  state.assistantStyleMemory = normalizeAssistantStyleMemory(state.assistantStyleMemory);
  state.assistantStyleMemory.explicit[key] = value;
  refreshAssistantStyleMemory(state);
  saveState("Preferencia de estilo guardada");
  render();
}

function normalizeAssistantPendingAction(plan) {
  if (!plan || typeof plan !== "object" || !Array.isArray(plan.actions) || !plan.actions.length) return null;
  return {
    id: String(plan.id || createId("ap")),
    actions: plan.actions.filter(Boolean),
    summary: String(plan.summary || buildAssistantActionSummary(plan.actions)),
    toastMessage: String(plan.toastMessage || "Cambios aplicados desde TeDoc"),
    createdAt: String(plan.createdAt || new Date().toISOString())
  };
}

function createAssistantActionPlan(actions, options = {}) {
  const normalized = normalizeAssistantPendingAction({
    id: options.id,
    actions,
    summary: options.summary,
    toastMessage: options.toastMessage,
    createdAt: options.createdAt
  });
  return normalized;
}

function buildAssistantActionSummary(actions) {
  const counts = new Map();
  (Array.isArray(actions) ? actions : []).forEach((action) => {
    counts.set(action.type, (counts.get(action.type) || 0) + 1);
  });
  const pieces = [];
  if (counts.get("create_task")) pieces.push(`crear ${counts.get("create_task")} tarea${counts.get("create_task") === 1 ? "" : "s"}`);
  if (counts.get("create_meeting")) pieces.push(`agendar ${counts.get("create_meeting")} reunión${counts.get("create_meeting") === 1 ? "" : "es"}`);
  if (counts.get("update_meeting_brief")) pieces.push(`preparar ${counts.get("update_meeting_brief")} agenda${counts.get("update_meeting_brief") === 1 ? "" : "s"} de reunión`);
  if (counts.get("update_meeting_closure")) pieces.push(`cerrar ${counts.get("update_meeting_closure")} reunión${counts.get("update_meeting_closure") === 1 ? "" : "es"} con resumen y tareas`);
  if (counts.get("update_review_comment_response")) pieces.push(`actualizar ${counts.get("update_review_comment_response")} comentario${counts.get("update_review_comment_response") === 1 ? "" : "s"}`);
  if (counts.get("convert_review_comment_to_task")) pieces.push(`convertir ${counts.get("convert_review_comment_to_task")} comentario${counts.get("convert_review_comment_to_task") === 1 ? "" : "s"} en tarea`);
  if (counts.get("create_review_comment")) pieces.push(`registrar ${counts.get("create_review_comment")} comentario${counts.get("create_review_comment") === 1 ? "" : "s"}`);
  if (counts.get("create_chapter_note")) pieces.push(`guardar ${counts.get("create_chapter_note")} nota${counts.get("create_chapter_note") === 1 ? "" : "s"} de capítulo`);
  if (counts.get("set_chapter_rewrite_checklist")) pieces.push(`crear ${counts.get("set_chapter_rewrite_checklist")} checklist${counts.get("set_chapter_rewrite_checklist") === 1 ? "" : "s"} de reescritura`);
  if (!pieces.length) return "TeDoc ha preparado una acción";
  return `Voy a ${joinSentenceParts(pieces)}.`;
}

function joinSentenceParts(parts) {
  const items = (Array.isArray(parts) ? parts : []).filter(Boolean);
  if (!items.length) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} y ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

function describeAssistantAction(action) {
  if (!action || typeof action !== "object") return "Acción propuesta";
  if (action.type === "create_task") {
    return `Crear tarea "${action.task?.title || "Sin título"}"${action.task?.due ? ` para el ${formatDate(action.task.due)}` : ""}.`;
  }
  if (action.type === "create_meeting") {
    return `Agendar reunión ${action.meeting?.type || "de seguimiento"} el ${formatDate(action.meeting?.date || "")}${action.meeting?.time ? ` a las ${action.meeting.time}` : ""}.`;
  }
  if (action.type === "update_meeting_brief") {
    return `Actualizar la agenda de ${action.meetingLabel || "la reunión"} con próximos puntos y tareas.`;
  }
  if (action.type === "update_meeting_closure") {
    return `Cerrar ${action.meetingLabel || "la reunión"} con resumen, decisiones y tareas a partir de sus notas.`;
  }
  if (action.type === "update_review_comment_response") {
    return `Guardar respuesta de trabajo para el comentario de ${action.chapterTitle || "un capítulo"}.`;
  }
  if (action.type === "convert_review_comment_to_task") {
    return `Convertir el comentario de ${action.chapterTitle || "un capítulo"} en la tarea "${action.task?.title || "Resolver comentario"}".`;
  }
  if (action.type === "create_review_comment") {
    return `Registrar comentario en ${action.reviewComment?.chapter || "Sin capítulo"}.`;
  }
  if (action.type === "create_chapter_note") {
    return `Guardar una nota en ${action.chapterTitle || "el capítulo"}: "${action.note?.title || "Nota"}".`;
  }
  if (action.type === "set_chapter_rewrite_checklist") {
    return `Crear checklist de reescritura en ${action.chapterTitle || "el capítulo"} con ${action.items?.length || 0} paso${(action.items?.length || 0) === 1 ? "" : "s"}.`;
  }
  return "Acción propuesta";
}

function confirmAssistantPendingAction() {
  const plan = normalizeAssistantPendingAction(assistantPendingAction);
  if (!plan) return;
  assistantUndoState = {
    snapshot: JSON.parse(JSON.stringify(state)),
    summary: plan.summary,
    createdAt: new Date().toISOString()
  };
  plan.actions.forEach((action) => applyAssistantAction(action));
  assistantPendingAction = null;
  refreshAssistantStyleMemory(state);
  saveState(plan.toastMessage, {
    forceSnapshot: true,
    snapshotReason: plan.summary
  });
  render();
}

function undoAssistantLastAction() {
  if (!assistantUndoState?.snapshot) {
    showToast("No hay una acción reciente para deshacer");
    return;
  }
  const summary = assistantUndoState.summary;
  state = ensureStateShape(deepMerge(structuredClone(defaultState), assistantUndoState.snapshot || {}));
  assistantUndoState = null;
  assistantPendingAction = null;
  updateSafetyMeta({ lastRestoredAt: new Date().toISOString() });
  saveState("Última acción deshecha", {
    forceSnapshot: true,
    snapshotReason: `Deshacer TeDoc: ${summary || "acción reciente"}`
  });
  render();
}

function applyAssistantAction(action) {
  if (!action || typeof action !== "object") return;

  if (action.type === "create_task") {
    const task = action.task && typeof action.task === "object" ? action.task : null;
    if (!task || state.tasks.some((item) => item.id === task.id)) return;
    state.tasks.unshift({
      id: task.id || createId("tk"),
      title: task.title || "Tarea",
      area: task.area || "General",
      status: task.status || inferTaskColumn(task.due || ""),
      due: task.due || "",
      effort: task.effort || "45 min",
      impact: task.impact || "Medio",
      done: false,
      completedAt: ""
    });
    return;
  }

  if (action.type === "create_meeting") {
    const meeting = action.meeting && typeof action.meeting === "object" ? action.meeting : null;
    if (!meeting || state.meetings.some((item) => item.id === meeting.id)) return;
    state.meetings.unshift({
      id: meeting.id || createId("mt"),
      date: meeting.date || "",
      time: meeting.time || "",
      type: meeting.type || "Dirección",
      attendees: meeting.attendees || "",
      agenda: meeting.agenda || "",
      summary: meeting.summary || "",
      decisions: meeting.decisions || "",
      tasks: meeting.tasks || "",
      notes: meeting.notes || "",
      next: meeting.next || ""
    });
    return;
  }

  if (action.type === "update_meeting_brief") {
    const meeting = findMeetingByAction(action);
    if (!meeting) return;
    meeting.agenda = action.agenda || meeting.agenda || "";
    meeting.tasks = action.tasks || meeting.tasks || "";
    meeting.next = action.next || meeting.next || "";
    return;
  }

  if (action.type === "update_meeting_closure") {
    const meeting = findMeetingByAction(action);
    if (!meeting) return;
    meeting.summary = action.summary || meeting.summary || "";
    meeting.decisions = action.decisions || meeting.decisions || "";
    meeting.tasks = action.tasks || meeting.tasks || "";
    meeting.next = action.next || meeting.next || "";
    return;
  }

  if (action.type === "update_review_comment_response") {
    const comment = findReviewCommentByAction(action);
    if (!comment) return;
    comment.response = action.response || comment.response || "";
    comment.status = action.status || comment.status || "En proceso";
    return;
  }

  if (action.type === "convert_review_comment_to_task") {
    applyAssistantAction({ type: "create_task", task: action.task });
    const comment = findReviewCommentByAction(action);
    if (comment) comment.status = action.status || comment.status || "En proceso";
    return;
  }

  if (action.type === "create_review_comment") {
    const comment = action.reviewComment && typeof action.reviewComment === "object" ? action.reviewComment : null;
    if (!comment || state.reviewComments.some((item) => item.id === comment.id)) return;
    state.reviewComments.unshift({
      id: comment.id || createId("rv"),
      chapter: comment.chapter || "Sin capítulo",
      source: comment.source || "Dirección",
      comment: comment.comment || "",
      response: comment.response || "Definir respuesta y criterio de cierre.",
      status: comment.status || "Pendiente",
      priority: comment.priority || "Media",
      due: comment.due || ""
    });
    return;
  }

  if (action.type === "create_chapter_note") {
    const chapter = findChapterByAction(action);
    const note = action.note && typeof action.note === "object" ? action.note : null;
    if (!chapter || !note || chapter.notes.some((item) => item.id === note.id)) return;
    chapter.notes.unshift({
      id: note.id || createId("nt"),
      title: note.title || "Nota",
      type: note.type || "Idea",
      date: note.date || todayISO(),
      text: note.text || ""
    });
    chapter.editorUpdatedAt = new Date().toISOString();
    return;
  }

  if (action.type === "set_chapter_rewrite_checklist") {
    const chapter = findChapterByAction(action);
    if (!chapter) return;
    chapter.rewriteChecklist = (Array.isArray(action.items) ? action.items : []).map((item) => ({
      id: item.id || createId("rw"),
      label: String(item.label || "Paso pendiente"),
      done: Boolean(item.done),
      sourceCommentId: String(item.sourceCommentId || action.sourceCommentId || ""),
      sourceCommentText: String(item.sourceCommentText || action.sourceCommentText || "")
    }));
    chapter.editorUpdatedAt = new Date().toISOString();
  }
}

function findChapterByAction(action) {
  return state.chapters.find((chapter) => chapter.id === action.chapterId)
    || state.chapters.find((chapter) => chapter.title === action.chapterTitle)
    || null;
}

function findMeetingByAction(action) {
  return state.meetings.find((meeting) => meeting.id === action.meetingId)
    || state.meetings.find((meeting) => meeting.date === action.date && (!action.time || meeting.time === action.time))
    || null;
}

function findReviewCommentByAction(action) {
  return state.reviewComments.find((comment) => comment.id === action.commentId)
    || state.reviewComments.find((comment) => comment.chapter === action.chapterTitle && comment.status !== "Resuelto")
    || null;
}

function applyAssistantFeedback(messageId, feedbackType) {
  const message = state.assistantThread.find((item) => item.id === messageId && item.role === "assistant");
  if (!message) return;

  const counters = {
    helpful: "helpful",
    "too-long": "tooLong",
    "more-direct": "moreDirect",
    "more-detail": "moreDetail"
  };
  const counterKey = counters[feedbackType];
  if (!counterKey) return;

  state.assistantStyleMemory = normalizeAssistantStyleMemory(state.assistantStyleMemory);
  const feedback = state.assistantStyleMemory.feedback;
  if (message.feedback && counters[message.feedback]) {
    const previousKey = counters[message.feedback];
    feedback[previousKey] = Math.max(0, Number(feedback[previousKey] || 0) - 1);
  }
  feedback[counterKey] = Number(feedback[counterKey] || 0) + 1;
  feedback.lastType = feedbackType;
  feedback.lastAt = new Date().toISOString();
  message.feedback = feedbackType;
  refreshAssistantStyleMemory(state);
  saveState("TeDoc ha ajustado tu preferencia de respuesta");
  render();
}

function buildAssistantClientMeta() {
  return {
    authStatus: auth.status,
    lastLocalSaveAt: safety.lastLocalSaveAt,
    lastRemoteSaveAt: safety.lastRemoteSaveAt,
    lastSnapshotAt: safety.lastSnapshotAt,
    lastExportedAt: safety.lastExportedAt,
    lastRestoredAt: safety.lastRestoredAt,
    snapshotCount: loadSnapshots().length,
    styleSummary: state.assistantStyleMemory?.summary || "",
    demoMode
  };
}

function buildAssistantRiskHeadline(analytics, urgentComment, meeting) {
  if (analytics.tasksOverdue) return "Hay ruido vencido que conviene limpiar";
  if (urgentComment) return `Feedback pendiente en ${urgentComment.chapter}`;
  if (analytics.stalledChapter) return `${analytics.stalledChapter.title} merece protección`;
  if (meeting) return "La próxima reunión pide contexto claro";
  return "Buen momento para consolidar continuidad";
}

function buildAssistantRiskLine(analytics, urgentTask, urgentComment, chapter, meeting) {
  if (analytics.tasksOverdue) {
    return `Tienes ${analytics.tasksOverdue} tarea${analytics.tasksOverdue === 1 ? "" : "s"} vencida${analytics.tasksOverdue === 1 ? "" : "s"}. Antes de abrir más trabajo, limpia ese retraso para bajar ansiedad operativa.`;
  }
  if (urgentComment) {
    return `El comentario más sensible ahora mismo está en ${urgentComment.chapter}${urgentComment.due ? ` y apunta al ${formatDate(urgentComment.due)}` : ""}. Conviene convertirlo pronto en respuesta o tarea.`;
  }
  if (chapter) {
    return `${chapter.title} va por ${chapter.progress}%${chapter.due ? ` y entrega ${formatDate(chapter.due)}` : ""}. La mejor protección ahora es dejar una sección o decisión realmente cerrada.`;
  }
  if (meeting) {
    return `Tienes una reunión próxima (${formatMeetingLabel(meeting)}). Merece la pena entrar con un punto bloqueado, una decisión y un siguiente entregable visibles.`;
  }
  if (!analytics.wordsLast7) {
    return "No hay escritura reciente. El riesgo no es técnico: es perder continuidad. Una sesión pequeña hoy cambia bastante el cuadro.";
  }
  return "No veo un riesgo crítico inmediato; ahora el valor está en sostener el ritmo sin dispersarte.";
}

function buildSafetyHeadline() {
  if (auth.user && safety.lastRemoteSaveAt && safety.lastSnapshotAt) return "Guardado local y sincronización en marcha";
  if (safety.lastSnapshotAt) return "Ya tienes red de seguridad local";
  return "Conviene crear tu primer punto de restauración";
}

function createInitialAssistantThread() {
  const intro = demoMode
    ? `Estás en la demo guiada de DoctoralOS. Te recomiendo este recorrido corto:
- Abre el panel para ver foco y siguiente entrega
- Entra en Capítulos y revisa el método
- Pídeme una agenda o un resumen dentro de TeDoc

Prueba algo como:
- Resúmeme el progreso actual
- Qué debería priorizar esta semana
- Detecta mis riesgos de entrega ahora mismo
- Prepara una agenda breve para la reunión con la directora`
    : `Soy TeDoc, el asistente de DoctoralOS. Puedo resumir tu progreso, sugerir prioridades, crear tareas y agendar reuniones dentro de la app.

Prueba algo como:
- Qué debería priorizar esta semana
- Créame tres tareas foco para esta semana
- Dame un plan de arranque de 45 minutos para hoy
- Detecta mis riesgos de entrega ahora mismo
- Prepárame la próxima reunión y guárdala
- Redacta respuesta al comentario más urgente
- Crear tarea cerrar comentarios del capítulo 2 para mañana
- Agendar reunión el viernes a las 16:00 con directora sobre metodología`;

  return [createAssistantEntry("assistant", intro)];
}

function createAssistantEntry(role, text, extra = {}) {
  return {
    id: createId("msg"),
    role,
    text,
    createdAt: new Date().toISOString(),
    ...extra
  };
}

function assistantSuggestions() {
  const activeChapter = state.chapters.find((chapter) => chapter.id === state.editorChapterId) || state.chapters[0];
  const chapterSuggestions = activeChapter
    ? [
        `Detecta la sección más floja del capítulo ${activeChapter.title}`,
        `Convierte el comentario más urgente del capítulo ${activeChapter.title} en checklist de reescritura`,
        `Prepárame la siguiente sesión del capítulo ${activeChapter.title}`
      ]
    : [];
  return [
    "Qué debería priorizar esta semana",
    "Resúmeme el progreso actual",
    "Créame tres tareas foco para esta semana",
    "Dame un plan de arranque de 45 minutos para hoy",
    "Detecta mis riesgos de entrega ahora mismo",
    "Convierte mis comentarios pendientes en foco de esta semana",
    "Prepárame la próxima reunión y guárdala en la app",
    "Redacta respuesta al comentario más urgente",
    ...chapterSuggestions,
    "Cómo de seguro está mi trabajo ahora mismo",
    "Analiza mi ritmo de escritura de las últimas semanas",
    "Dónde está mi cuello de botella ahora mismo",
    "Qué necesito llevar a la próxima reunión",
    "Agendar reunión el viernes a las 16:00 con directora sobre metodología",
    "Crear tarea cerrar comentarios del capítulo 2 para mañana"
  ];
}

async function submitAssistantPrompt(message) {
  const text = String(message || "").trim();
  if (!text) {
    showToast("Escribe una pregunta o una acción");
    return;
  }
  if (assistantPendingAction?.actions?.length) {
    showToast("Confirma o cancela la vista previa antes de pedir otra acción");
    return;
  }
  if (assistantBusy) {
    showToast("TeDoc sigue respondiendo");
    return;
  }

  assistantBusy = true;
  state.assistantThread.push(createAssistantEntry("user", text));
  pruneAssistantThread();
  render();

  try {
    const result = await requestAssistantReply(text);
    assistantPendingAction = normalizeAssistantPendingAction(result.pendingAction);
    state = ensureStateShape(deepMerge(structuredClone(defaultState), result.state));
    saveState("", { skipSync: true });
    showToast(assistantPendingAction ? "Vista previa lista" : (result.model ? "TeDoc con IA actualizado" : "TeDoc actualizado"));
  } catch (error) {
    const result = buildAssistantReply(text);
    assistantPendingAction = normalizeAssistantPendingAction(result.pendingAction);
    state.assistantThread.push(createAssistantEntry("assistant", result.reply));
    pruneAssistantThread();
    saveState("");
    showToast(assistantPendingAction ? "Vista previa lista" : "Respuesta local guardada");
    if (assistantCanUseRemote()) {
      console.warn("TeDoc con IA no disponible, usando modo local", error);
    }
  } finally {
    assistantBusy = false;
    render();
  }
}

function assistantCanUseRemote() {
  return API_ENABLED && Boolean(auth.user);
}

async function requestAssistantReply(message) {
  if (!assistantCanUseRemote()) throw new Error("remote-unavailable");

  const response = await fetch("/api/assistant", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, state, clientMeta: buildAssistantClientMeta() })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "TeDoc no está disponible ahora mismo");

  auth.status = "synced";
  auth.statusLabel = "Sincronizado";
  auth.lastSync = shortTime();
  updateSafetyMeta({ lastRemoteSaveAt: result.savedAt || new Date().toISOString() });
  updateAuthUI();
  return result;
}

function pruneAssistantThread() {
  if (state.assistantThread.length <= 28) return;
  const first = state.assistantThread[0];
  state.assistantThread = [first, ...state.assistantThread.slice(-27)];
}

function buildAssistantReply(message) {
  const normalized = normalizeUserText(message);

  if (/^(hola|buenas|hey|hi)\b/.test(normalized)) {
    return { reply: "Hola. Estoy dentro de tu espacio de tesis y puedo ayudarte con prioridades, capítulos, tareas, reuniones y un pequeño radar de tranquilidad. Si quieres, empieza por preguntarme qué deberías hacer esta semana o qué riesgo ves ahora mismo." };
  }

  if (isSummaryRequest(normalized)) return { reply: buildProgressSummary() };
  if (isChapterWeaknessRequest(normalized)) return buildChapterWeaknessReply(message);
  if (isRewriteChecklistRequest(normalized)) return prepareRewriteChecklistFromPrompt(message);
  if (isSectionStructureRequest(normalized)) return prepareSectionStructureFromPrompt(message);
  if (isNextChapterSessionRequest(normalized)) return prepareNextChapterSessionFromPrompt(message);
  if (isWeeklyPlanCreationRequest(normalized)) return createWeeklyFocusTasksFromState();
  if (isWeeklyPriorityRequest(normalized)) return { reply: buildWeeklyPriorities() };
  if (isPerformanceAdviceRequest(normalized)) return { reply: buildPerformanceAdvice() };
  if (isRiskRequest(normalized)) return { reply: buildRiskRadar() };
  if (isWarmStartRequest(normalized)) return { reply: buildWarmStartPlan() };
  if (isSafetyRequest(normalized)) return { reply: buildSafetyReply() };
  if (isMeetingClosureRequest(normalized)) return prepareMeetingClosureFromPrompt(message);
  if (isMeetingPreparationRequest(normalized)) return prepareMeetingBriefFromPrompt(message);
  if (isCommentResponseRequest(normalized)) return prepareCommentResponseFromPrompt(message);
  if (isCommentToTaskRequest(normalized)) return convertCommentToTaskFromPrompt(message);
  if (isCommentActionPlanRequest(normalized)) return { reply: buildCommentActionPlan() };
  if (isMeetingCreationRequest(normalized)) return createMeetingFromPrompt(message);
  if (isCommentCreationRequest(normalized)) return createReviewCommentFromPrompt(message);
  if (isNoteCreationRequest(normalized)) return createChapterNoteFromPrompt(message);
  if (isTaskCreationRequest(normalized)) return createTaskFromPrompt(message);
  if (isMeetingAdviceRequest(normalized)) return { reply: buildMeetingAdvice() };

  const chapter = findChapterFromPrompt(message);
  if (chapter) return { reply: buildChapterAdvice(chapter) };

  return {
    reply: "Puedo ayudarte con diez cosas muy útiles ahora mismo: resumir progreso, priorizar la semana, montar un mini plan semanal, detectar riesgos, proponerte un arranque de 45 minutos, preparar reuniones, responder comentarios, crear tareas, trabajar un capítulo concreto y dejar una vista previa antes de aplicar cambios.\n\nPrueba una de estas:\n- Resúmeme el progreso actual\n- Qué debería priorizar esta semana\n- Créame tres tareas foco para esta semana\n- Detecta mis riesgos de entrega ahora mismo\n- Detecta la sección más floja del capítulo 2\n- Convierte el comentario más urgente del capítulo 2 en checklist de reescritura\n- Propón una estructura para un apartado del capítulo 2\n- Prepárame la próxima reunión y guárdala\n- Redacta respuesta al comentario más urgente\n- Crear tarea enviar borrador del capítulo 2 para mañana"
  };
}

function isSummaryRequest(normalized) {
  return normalized.includes("resumen") || normalized.includes("resumeme") || normalized.includes("resúmeme") || normalized.includes("resume") || normalized.includes("progreso") || normalized.includes("estado general");
}

function isChapterWeaknessRequest(normalized) {
  return normalized.includes("capitulo")
    && (
      normalized.includes("seccion mas floja")
      || normalized.includes("sección más floja")
      || normalized.includes("parte mas floja")
      || normalized.includes("parte más floja")
      || normalized.includes("seccion mas debil")
      || normalized.includes("sección más débil")
      || normalized.includes("seccion mas debil")
    );
}

function isRewriteChecklistRequest(normalized) {
  return normalized.includes("capitulo")
    && normalized.includes("checklist")
    && (normalized.includes("reescritura") || normalized.includes("rehacer"));
}

function isSectionStructureRequest(normalized) {
  return normalized.includes("capitulo")
    && (normalized.includes("estructura") || normalized.includes("esquema"))
    && (normalized.includes("apartado") || normalized.includes("seccion"));
}

function isNextChapterSessionRequest(normalized) {
  return normalized.includes("capitulo")
    && normalized.includes("sesion")
    && (normalized.includes("siguiente") || normalized.includes("proxima") || normalized.includes("prepara"));
}

function isWeeklyPriorityRequest(normalized) {
  return normalized.includes("esta semana") || normalized.includes("priorizar") || normalized.includes("prioridad") || normalized.includes("por donde empiezo") || normalized.includes("que hago") || normalized.includes("que deberia hacer");
}

function isMeetingCreationRequest(normalized) {
  return normalized.includes("agendar")
    || /(?:crea|crear|programa|programar)\s+(?:una\s+)?reunion/.test(normalized);
}

function isTaskCreationRequest(normalized) {
  if (normalized.includes("comentario") || normalized.includes("nota") || normalized.includes("reunion")) return false;
  return normalized.includes("tarea") || normalized.includes("recuerdame") || normalized.includes("recordame");
}

function isCommentCreationRequest(normalized) {
  return normalized.includes("comentario") && (normalized.includes("anade") || normalized.includes("agrega") || normalized.includes("registr") || normalized.includes("crea"));
}

function isNoteCreationRequest(normalized) {
  return normalized.includes("nota") && (normalized.includes("anade") || normalized.includes("agrega") || normalized.includes("registr") || normalized.includes("crea"));
}

function isMeetingAdviceRequest(normalized) {
  return normalized.includes("reunion") && (normalized.includes("que llevo") || normalized.includes("preparar") || normalized.includes("agenda recomendada"));
}

function isPerformanceAdviceRequest(normalized) {
  return normalized.includes("ritmo") || normalized.includes("rendimiento") || normalized.includes("cuello de botella") || normalized.includes("atascado") || normalized.includes("analiza") || normalized.includes("productividad");
}

function isRiskRequest(normalized) {
  return normalized.includes("riesgo") || normalized.includes("riesgos") || normalized.includes("entrega") || normalized.includes("expuesto") || normalized.includes("puede salir mal");
}

function isWarmStartRequest(normalized) {
  return normalized.includes("45 minutos") || normalized.includes("arranque") || normalized.includes("empezar ahora") || normalized.includes("bloque corto") || normalized.includes("plan corto");
}

function isSafetyRequest(normalized) {
  return normalized.includes("seguridad") || normalized.includes("respaldo") || normalized.includes("backup") || normalized.includes("copia") || normalized.includes("seguro esta mi trabajo") || normalized.includes("seguro está mi trabajo");
}

function isCommentToTaskRequest(normalized) {
  return normalized.includes("comentario") && normalized.includes("tarea") && (normalized.includes("convierte") || normalized.includes("convertir") || normalized.includes("pasa"));
}

function isCommentActionPlanRequest(normalized) {
  return normalized.includes("comentario") && (normalized.includes("foco") || normalized.includes("plan") || normalized.includes("pendiente"));
}

function isWeeklyPlanCreationRequest(normalized) {
  return normalized.includes("plan semanal")
    || normalized.includes("creame tres tareas")
    || normalized.includes("crea tres tareas")
    || normalized.includes("organiza mi semana")
    || normalized.includes("monta mi semana");
}

function isMeetingPreparationRequest(normalized) {
  return normalized.includes("reunion")
    && (normalized.includes("preparame") || normalized.includes("prepara") || normalized.includes("guarda agenda") || normalized.includes("deja agenda") || normalized.includes("agenda para"))
    && !isMeetingCreationRequest(normalized);
}

function isMeetingClosureRequest(normalized) {
  return normalized.includes("reunion")
    && (
      normalized.includes("cierra")
      || normalized.includes("cerrar")
      || normalized.includes("cierre")
      || normalized.includes("resumen")
      || normalized.includes("decisiones")
    )
    && normalized.includes("tareas");
}

function isCommentResponseRequest(normalized) {
  return normalized.includes("comentario")
    && (normalized.includes("respuesta") || normalized.includes("responder") || normalized.includes("contestar") || normalized.includes("redacta"));
}

function buildProgressSummary() {
  const analytics = buildAnalyticsSnapshot();
  const openTasks = state.tasks.filter((task) => task.status !== "later" && !task.done).length;
  const pendingComments = Number(analytics.reviewCounts.Pendientes || 0) + Number(analytics.reviewCounts["En proceso"] || 0);
  const nextMeeting = upcomingMeeting();
  const lines = [
    `- ${state.chapters.length} capítulos registrados con un progreso medio del ${overallProgress()}%.`,
    `- ${openTasks} tareas activas y ${pendingComments} comentarios vivos.`,
    `- Escritura reciente: ${formatNumber(analytics.wordsLast7)} palabras en 7 días (${analytics.writingTrend.toLowerCase()}).`,
    `- Lecturas activas: ${analytics.readingCounts.Leyendo} en curso y ${analytics.readingCounts.Clave} clave.`
  ];
  if (nextMeeting) lines.push(`- Próxima reunión detectada: ${formatMeetingLabel(nextMeeting)}.`);
  return `Resumen actual:\n${lines.join("\n")}\n\nMi siguiente recomendación: ${buildAnalyticsLead(analytics)}`;
}

function buildWeeklyPriorities() {
  const analytics = buildAnalyticsSnapshot();
  const style = resolveAssistantStyle(refreshAssistantStyleMemory(state));
  const lines = [];
  const urgentComment = findUrgentComment();
  const urgentTask = [...state.tasks]
    .filter((task) => task.status !== "later" && !task.done)
    .sort((a, b) => String(a.due || "9999-12-31").localeCompare(String(b.due || "9999-12-31")))[0];
  const chapter = nextChapterToPush();
  if (!analytics.wordsLast7) {
    lines.push("- Recupera el ritmo con una sesión corta de escritura antes de abrir más lecturas.");
  } else if (analytics.wordsDelta < 0) {
    lines.push(`- Tu escritura ha bajado frente a la semana previa; protege una sesión cerrada para ${chapter ? chapter.title : "tu capítulo principal"}.`);
  }
  if (urgentTask) lines.push(`- Tarea prioritaria: ${urgentTask.title}${urgentTask.due ? ` antes del ${formatDate(urgentTask.due)}` : ""}.`);
  if (urgentComment) lines.push(`- Cierra el comentario de ${urgentComment.chapter}${urgentComment.due ? ` antes del ${formatDate(urgentComment.due)}` : ""}.`);
  if (chapter) lines.push(`- Empuja ${chapter.title}: está cerca de entrega y va por ${chapter.progress}% de avance.`);
  if ((analytics.readingCounts.Leyendo + analytics.readingCounts.Clave) > analytics.readingCounts["Leídas"] && analytics.wordsLast7 < 1200) {
    lines.push("- Convierte una lectura activa en un párrafo útil en lugar de abrir más fuentes esta semana.");
  }
  if (!lines.length) lines.push("- Crea un capítulo activo o una tarea semanal para empezar a mover la tesis.");
  const trimmed = style.focusMode === "single" ? lines.slice(0, 2) : lines.slice(0, 4);
  const close = style.focusMode === "single"
    ? "Según cómo sueles trabajar, te conviene salir con una prioridad central y un solo apoyo secundario."
    : "Según tu patrón actual, puedes sostener dos o tres frentes coordinados si cada uno queda muy claro.";
  return `Te propongo este foco para la semana:\n${trimmed.join("\n")}\n\n${close}`;
}

function buildPerformanceAdvice() {
  const analytics = buildAnalyticsSnapshot();
  const reviewActive = Number(analytics.reviewCounts.Pendientes || 0) + Number(analytics.reviewCounts["En proceso"] || 0);
  const lines = [
    `- Escritura reciente: ${formatNumber(analytics.wordsLast7)} palabras en 7 días y ${analytics.streakWeeks} semana${analytics.streakWeeks === 1 ? "" : "s"} seguida${analytics.streakWeeks === 1 ? "" : "s"} con actividad.`,
    `- Revisión: ${reviewActive} comentario${reviewActive === 1 ? "" : "s"} vivo${reviewActive === 1 ? "" : "s"}.`,
    `- Lecturas: ${analytics.readingCounts.Leyendo} en lectura, ${analytics.readingCounts.Clave} clave y ${analytics.readingCounts["Leídas"]} ya cerradas.`
  ];
  if (analytics.stalledChapter) {
    lines.push(`- Capítulo más expuesto ahora mismo: ${analytics.stalledChapter.title} (${analytics.stalledChapter.progress}% y entrega ${formatDate(analytics.stalledChapter.due)}).`);
  }
  if (analytics.tasksOverdue) {
    lines.push(`- Hay ${analytics.tasksOverdue} tarea${analytics.tasksOverdue === 1 ? "" : "s"} vencida${analytics.tasksOverdue === 1 ? "" : "s"}.`);
  }
  return `Lectura de rendimiento:\n${lines.join("\n")}\n\nMi recomendación: ${buildAnalyticsLead(analytics)}`;
}

function buildRiskRadar() {
  const analytics = buildAnalyticsSnapshot();
  const urgentTask = nextOpenTask();
  const urgentComment = findUrgentComment();
  const chapter = nextChapterToPush();
  const meeting = upcomingMeeting();
  const lines = [];

  if (analytics.tasksOverdue) {
    lines.push(`- Hay ${analytics.tasksOverdue} tarea${analytics.tasksOverdue === 1 ? "" : "s"} vencida${analytics.tasksOverdue === 1 ? "" : "s"}. Ese ruido suele multiplicar sensación de descontrol.`);
  }
  if (urgentComment) {
    lines.push(`- Comentario más sensible: ${urgentComment.chapter}${urgentComment.due ? ` con fecha ${formatDate(urgentComment.due)}` : ""}. Conviene transformarlo ya en respuesta o tarea.`);
  }
  if (chapter) {
    lines.push(`- Capítulo más expuesto: ${chapter.title} (${chapter.progress}%${chapter.due ? `, entrega ${formatDate(chapter.due)}` : ""}).`);
  }
  if (meeting) {
    lines.push(`- Próxima reunión: ${formatMeetingLabel(meeting)}. Entra con una decisión concreta y no solo con avances dispersos.`);
  }
  if (urgentTask) {
    lines.push(`- Tarea que más te ordena ahora: ${urgentTask.title}${urgentTask.due ? ` antes del ${formatDate(urgentTask.due)}` : ""}.`);
  }
  if (!lines.length) {
    lines.push("- No veo un riesgo crítico inmediato. El riesgo real ahora sería abrir más frentes sin cerrar una siguiente acción visible.");
  }

  return `Radar de riesgo:\n${lines.join("\n")}\n\nMi recomendación: ${buildAnalyticsLead(analytics)}`;
}

function buildWarmStartPlan() {
  const style = resolveAssistantStyle(refreshAssistantStyleMemory(state));
  const urgentTask = nextOpenTask();
  const chapter = nextChapterToPush();
  const urgentComment = findUrgentComment();
  const lines = style.workBlock === "short"
    ? [
        `- Min 0-8: reabre ${urgentTask ? `"${urgentTask.title}"` : chapter ? chapter.title : "tu capítulo principal"} y define una sola micro-meta cerrable.`,
        `- Min 8-25: trabaja en ${urgentComment ? `la respuesta al comentario de ${urgentComment.chapter}` : chapter ? `la parte más floja de ${chapter.title}` : "un párrafo o decisión concreta"} sin abrir lecturas nuevas.`,
        "- Min 25-35: deja una nota o decisión cerrada para no perder continuidad.",
        "- Min 35-45: crea o ajusta la siguiente tarea antes de salir."
      ]
    : style.workBlock === "deep"
      ? [
          `- Min 0-10: despeja ruido y reabre ${urgentTask ? `"${urgentTask.title}"` : chapter ? chapter.title : "tu capítulo principal"} con una meta concreta.`,
          `- Min 10-35: bloque largo sobre ${urgentComment ? `la respuesta al comentario de ${urgentComment.chapter}` : chapter ? `la parte más floja de ${chapter.title}` : "una sección concreta"} sin multitarea.`,
          "- Min 35-45: deja salida preparada con tarea, criterio de cierre y siguiente punto de entrada."
        ]
      : [
          `- Min 0-10: reabre ${urgentTask ? `"${urgentTask.title}"` : chapter ? chapter.title : "tu capítulo principal"} y define una sola micro-meta cerrable.`,
          `- Min 10-30: trabaja en ${urgentComment ? `la respuesta al comentario de ${urgentComment.chapter}` : chapter ? `la parte más floja de ${chapter.title}` : "un párrafo o decisión concreta"} sin abrir lecturas nuevas.`,
          `- Min 30-45: deja salida preparada. Crea o ajusta una tarea con fecha y anota qué queda vivo para la siguiente sesión.`
        ];
  return `Plan de arranque de 45 minutos:\n${lines.join("\n")}\n\n${style.workBlock === "short" ? "TeDoc está inclinando el plan a bloques cortos porque ese parece tu patrón más sostenible." : style.workBlock === "deep" ? "TeDoc está protegiendo un bloque más profundo porque sueles aprovechar mejor sesiones largas." : "Regla simple: acaba con una siguiente acción visible, no con una sensación difusa de haber avanzado."}`;
}

function buildCommentActionPlan() {
  const style = resolveAssistantStyle(refreshAssistantStyleMemory(state));
  const comment = findUrgentComment();
  if (!comment) {
    return "No veo comentarios pendientes ahora mismo. Si quieres, puedo ayudarte a convertir una reunión o una nota en una tarea semanal concreta.";
  }

  const lines = style.planningDepth === "detailed"
    ? [
        `- Comentario a convertir: ${comment.comment}`,
        `- Capítulo afectado: ${comment.chapter}.`,
        `- Primer movimiento: redacta una respuesta tentativa o crea una tarea específica para cerrar el punto.`,
        `- Segundo movimiento: identifica qué parte del texto hay que tocar antes de la próxima revisión.`,
        `- Criterio de cierre: deja visible qué evidencia, texto o decisión haría que este comentario pase a resuelto.`
      ]
    : [
        `- Comentario a convertir: ${comment.comment}`,
        `- Capítulo afectado: ${comment.chapter}.`,
        `- Primer movimiento: deja una respuesta tentativa y una tarea concreta para cerrarlo.`
      ];
  return `Foco de revisión:\n${lines.join("\n")}\n\nSi quieres, también puedo convertir este comentario en tarea desde aquí.`;
}

function buildSafetyReply() {
  const snapshot = latestSnapshotRecord();
  const lines = [
    `- Último guardado local: ${safety.lastLocalSaveAt ? formatDateTime(safety.lastLocalSaveAt) : "todavía no visible"}.`,
    `- Último punto de restauración: ${snapshot ? `${formatDateTime(snapshot.createdAt)} (${snapshot.summary})` : "todavía no creado"}.`,
    `- Último respaldo exportado: ${safety.lastExportedAt ? formatDateTime(safety.lastExportedAt) : "aún no has exportado uno"}.`,
    `- Sincronización remota: ${auth.user ? (safety.lastRemoteSaveAt ? `última sync completa ${formatDateTime(safety.lastRemoteSaveAt)}` : auth.statusLabel) : "sin sesión remota, trabajando en local"}.`
  ];
  return `Estado de tranquilidad:\n${lines.join("\n")}\n\nMi recomendación: ${snapshot ? "antes de un cambio grande, exporta un respaldo además del punto local." : "crea ahora un punto de restauración y exporta un respaldo antes de tocar algo importante."}`;
}

function assistantReplyWithPreview(reply, actions, options = {}) {
  const pendingAction = createAssistantActionPlan(actions, options);
  if (!pendingAction) return { reply };
  return { reply, pendingAction };
}

function createWeeklyFocusTasksFromState() {
  const candidates = buildWeeklyFocusTaskCandidates();
  const created = candidates
    .filter((candidate) => candidate?.title && !taskExists(candidate.title))
    .map((candidate) => ({
      id: createId("tk"),
      title: candidate.title,
      area: candidate.area,
      status: candidate.status,
      due: candidate.due,
      effort: candidate.effort,
      impact: candidate.impact,
      done: false,
      completedAt: ""
    }));

  if (!created.length) {
    return {
      reply: "No he creado tareas nuevas porque el foco principal ya parece bastante representado en tu tablero. Si quieres, puedo revisar una reunión o un comentario concreto para afinar más."
    };
  }

  const lines = created.map((task) => `- ${task.title}${task.due ? ` (${formatDate(task.due)})` : ""}`);
  return assistantReplyWithPreview(
    `Te dejo una vista previa de mini plan semanal:\n${lines.join("\n")}\n\nSi la confirmas, la guardo dentro de la app sin abrir más de tres frentes: escritura, revisión y coordinación.`,
    created.map((task) => ({ type: "create_task", task })),
    {
      summary: `Voy a crear ${created.length} tarea${created.length === 1 ? "" : "s"} foco para esta semana.`,
      toastMessage: "Plan semanal creado desde TeDoc"
    }
  );
}

function preferredAssistantEffort(style, intensity = "medium") {
  if (style.workBlock === "short") {
    return intensity === "high" ? "45 min" : intensity === "low" ? "20 min" : "30 min";
  }
  if (style.workBlock === "deep") {
    return intensity === "high" ? "120 min" : intensity === "low" ? "45 min" : "90 min";
  }
  return intensity === "high" ? "90 min" : intensity === "low" ? "30 min" : "45 min";
}

function buildWeeklyFocusTaskCandidates() {
  const style = resolveAssistantStyle(refreshAssistantStyleMemory(state));
  const chapter = nextChapterToPush();
  const comment = findUrgentComment();
  const meeting = upcomingMeeting();
  const candidates = [];

  if (comment) {
    candidates.push({
      title: `Responder comentario: ${comment.chapter}`,
      area: "Revisión",
      status: inferTaskColumn(comment.due || ""),
      due: comment.due || "",
      effort: preferredAssistantEffort(style, comment.priority === "Alta" ? "high" : "medium"),
      impact: comment.priority === "Alta" ? "Alto" : "Medio"
    });
  }

  if (chapter) {
    const weakestSection = findWeakestSection(chapter);
    candidates.push({
      title: weakestSection
        ? `Empujar ${chapter.title}: ${weakestSection.title}`
        : `Empujar ${chapter.title}`,
      area: "Capítulos",
      status: inferTaskColumn(chapter.due || ""),
      due: chapter.due || "",
      effort: preferredAssistantEffort(style, "high"),
      impact: "Alto"
    });
  }

  if (meeting) {
    candidates.push({
      title: `Preparar reunión: ${meeting.type || "Seguimiento"}`,
      area: "Reuniones",
      status: inferTaskColumn(meeting.date || ""),
      due: meeting.date || "",
      effort: preferredAssistantEffort(style, "low"),
      impact: "Medio"
    });
  }

  if (!candidates.length) {
    candidates.push({
      title: "Definir primer bloque semanal de tesis",
      area: "General",
      status: "week",
      due: offsetISODate(2),
      effort: preferredAssistantEffort(style, "medium"),
      impact: "Medio"
    });
  }

  return candidates.slice(0, style.focusMode === "single" ? 2 : 3);
}

function findWeakestSection(chapter) {
  if (!chapter?.sections?.length) return null;
  return [...chapter.sections].sort((a, b) => {
    const scoreDiff = sectionWeaknessScore(chapter, b) - sectionWeaknessScore(chapter, a);
    if (scoreDiff !== 0) return scoreDiff;
    return Number(a.words || 0) - Number(b.words || 0);
  })[0];
}

function sectionWeaknessScore(chapter, section) {
  if (!section) return 0;
  const averageWords = average((chapter?.sections || []).map((item) => Number(item.words || 0))) || 1;
  let score = 0;
  const status = normalizeUserText(section.status || "");
  if (status.includes("esquema")) score += 5;
  else if (status.includes("borrador")) score += 4;
  else if (status.includes("revision")) score += 2;
  if (Number(section.words || 0) < averageWords * 0.7) score += 3;
  if (String(section.content || "").trim().length < 220) score += 3;
  if (!String(section.goal || "").trim()) score += 2;
  return score;
}

function buildWeakestSectionExplanation(chapter, section) {
  if (!chapter || !section) return "No hay datos suficientes para priorizar una sección concreta todavía.";
  const reasons = [];
  const averageWords = average((chapter.sections || []).map((item) => Number(item.words || 0))) || 0;
  if (normalizeUserText(section.status || "").includes("esquema")) reasons.push("sigue en esquema");
  else if (normalizeUserText(section.status || "").includes("borrador")) reasons.push("aún está en borrador");
  if (Number(section.words || 0) < averageWords * 0.7) reasons.push("está por debajo del volumen medio del capítulo");
  if (String(section.content || "").trim().length < 220) reasons.push("todavía tiene poco texto defendible");
  if (!String(section.goal || "").trim()) reasons.push("no deja clara su función");
  if (!reasons.length) reasons.push("es la pieza menos cerrada en relación con el resto");
  return `${section.title} es ahora mismo la parte más expuesta porque ${joinSentenceParts(reasons)}.`;
}

function taskExists(title) {
  const normalizedTitle = normalizeUserText(title);
  return state.tasks.some((task) => normalizeUserText(task.title) === normalizedTitle);
}

function prepareMeetingClosureFromPrompt(message) {
  const meeting = findMeetingForClosureFromPrompt(message);
  if (!meeting) {
    return { reply: "No encuentro una reunión adecuada para cerrar. Si quieres, dime la fecha exacta o registra primero esa reunión." };
  }
  if (!meetingHasClosureSource(meeting)) {
    return { reply: `Puedo cerrar ${formatMeetingLabel(meeting)}, pero necesito unas notas rápidas de salida, acuerdos o tareas habladas dentro de la reunión.` };
  }

  const closure = buildMeetingClosureDraft(meeting);
  const followupTasks = buildMeetingClosureFollowupTasks(meeting, closure);
  const taskPreview = followupTasks.length
    ? `\n\nTareas que también pasaré al plan semanal:\n${followupTasks.map((task) => `- ${task.title}${task.due ? ` (${formatDate(task.due)})` : ""}`).join("\n")}`
    : "";
  return assistantReplyWithPreview(
    `Te dejo una vista previa de cierre para ${formatMeetingLabel(meeting)}.\n\nResumen:\n${closure.summary}\n\nDecisiones:\n${bulletizeText(closure.decisions)}\n\nTareas:\n${bulletizeText(closure.tasks)}${taskPreview}\n\nSi la confirmas, la dejo guardada dentro de la reunión.`,
    [
      {
        type: "update_meeting_closure",
        meetingId: meeting.id,
        meetingLabel: formatMeetingLabel(meeting),
        date: meeting.date,
        time: meeting.time,
        summary: closure.summary,
        decisions: closure.decisions,
        tasks: closure.tasks,
        next: closure.next
      },
      ...followupTasks.map((task) => ({ type: "create_task", task }))
    ],
    {
      summary: `Voy a cerrar ${formatMeetingLabel(meeting)} con resumen, decisiones y tareas${followupTasks.length ? ` y crear ${followupTasks.length} tarea${followupTasks.length === 1 ? "" : "s"} de seguimiento` : ""}.`,
      toastMessage: followupTasks.length ? "Cierre de reunión y tareas guardados desde TeDoc" : "Cierre de reunión guardado desde TeDoc"
    }
  );
}

function prepareMeetingBriefFromPrompt(message) {
  const style = resolveAssistantStyle(refreshAssistantStyleMemory(state));
  const meeting = findMeetingFromPrompt(message);
  if (!meeting) {
    return { reply: "No encuentro una reunión próxima para preparar. Si quieres, puedo agendar una primero y luego dejarte la agenda guardada." };
  }

  const chapter = nextChapterToPush();
  const comment = findUrgentComment();
  const urgentTask = nextOpenTask();
  const explicitTopic = extractTopic(message);
  const agendaLines = [
    explicitTopic ? `Tema central: ${capitalizeSentence(explicitTopic)}.` : "",
    chapter ? `Estado del capítulo sensible: ${chapter.title} (${chapter.progress}%${chapter.due ? ` y entrega ${formatDate(chapter.due)}` : ""}).` : "",
    comment ? `Comentario a resolver: ${comment.chapter}. ${comment.comment}` : "",
    urgentTask ? `Tarea que conviene dejar cerrada: ${urgentTask.title}.` : "",
    "Decisión que debe salir de la reunión: siguiente entregable y criterio de cierre."
  ].filter(Boolean).slice(0, style.meetingMode === "brief" ? 3 : 5);
  const taskLines = [
    comment ? `Responder comentario de ${comment.chapter}` : "",
    chapter ? `Empujar ${chapter.title}` : "",
    urgentTask ? `Cerrar o replanificar ${urgentTask.title}` : ""
  ].filter(Boolean);
  const next = meeting.next || chapter?.due || comment?.due || urgentTask?.due || "";

  return assistantReplyWithPreview(
    `Te dejo una vista previa de agenda para ${formatMeetingLabel(meeting)}.\n\nAgenda:\n${agendaLines.map((line) => `- ${line}`).join("\n")}\n\nSi la confirmas, la guardo en Reuniones y revisión.`,
    [{
      type: "update_meeting_brief",
      meetingId: meeting.id,
      meetingLabel: formatMeetingLabel(meeting),
      date: meeting.date,
      time: meeting.time,
      agenda: agendaLines.join("\n"),
      tasks: taskLines.join("\n"),
      next
    }],
    {
      summary: `Voy a preparar la agenda de ${formatMeetingLabel(meeting)}.`,
      toastMessage: "Agenda guardada desde TeDoc"
    }
  );
}

function findMeetingForClosureFromPrompt(message) {
  const date = extractDateFromText(message);
  const time = extractTimeFromText(message);
  if (date) {
    return [...state.meetings]
      .sort((a, b) => `${b.date || ""} ${b.time || "00:00"}`.localeCompare(`${a.date || ""} ${a.time || "00:00"}`))
      .find((meeting) => meeting.date === date && (!time || meeting.time === time))
      || null;
  }

  return [...state.meetings]
    .sort((a, b) => `${b.date || ""} ${b.time || "00:00"}`.localeCompare(`${a.date || ""} ${a.time || "00:00"}`))
    .find((meeting) => meetingHasClosureSource(meeting))
    || [...state.meetings]
      .sort((a, b) => `${b.date || ""} ${b.time || "00:00"}`.localeCompare(`${a.date || ""} ${a.time || "00:00"}`))[0]
    || null;
}

function meetingHasClosureSource(meeting) {
  return Boolean(String(buildMeetingClosureSource(meeting)).trim());
}

function buildMeetingClosureSource(meeting) {
  return [
    String(meeting?.notes || "").trim(),
    String(meeting?.decisions || "").trim(),
    String(meeting?.tasks || "").trim(),
    String(meeting?.agenda || "").trim()
  ].filter(Boolean).join("\n");
}

function buildMeetingClosureDraft(meeting) {
  const style = resolveAssistantStyle(refreshAssistantStyleMemory(state));
  const topic = meetingPrimaryTopic(meeting);
  const source = buildMeetingClosureSource(meeting);
  const sections = parseMeetingNotesSections(source);
  const baseLines = [...sections.summary, ...sections.general].filter(Boolean);
  const summary = buildMeetingSummaryText(meeting, baseLines, topic, style);
  const decisionLines = (sections.decisions.length ? sections.decisions : inferMeetingDecisionLines(baseLines, topic)).slice(0, style.meetingMode === "brief" ? 2 : 4);
  const taskLines = (sections.tasks.length ? sections.tasks : inferMeetingTaskLines(baseLines, topic)).slice(0, style.meetingMode === "brief" ? 2 : 4);
  const next = extractDateFromText(meeting.notes || "") || meeting.next || "";
  return {
    summary,
    decisions: decisionLines.join("\n"),
    tasks: taskLines.join("\n"),
    next
  };
}

function buildMeetingClosureFollowupTasks(meeting, closure) {
  const style = resolveAssistantStyle(refreshAssistantStyleMemory(state));
  const fallbackDue = closure.next || meeting.next || "";
  return splitLines(closure.tasks)
    .map((line) => buildMeetingFollowupTaskDraft(meeting, line, fallbackDue, style))
    .filter((task) => task?.title && !taskExists(task.title))
    .slice(0, 3);
}

function buildMeetingFollowupTaskDraft(meeting, line, fallbackDue, style) {
  const rawLine = cleanMeetingNoteLine(line);
  const title = normalizeMeetingFollowupTaskTitle(rawLine);
  if (!title) return null;
  const due = extractDateFromText(rawLine) || fallbackDue || "";
  const area = inferTaskArea(title);
  const intensity = inferMeetingFollowupIntensity(area, title);
  return {
    id: createId("tk"),
    title,
    area,
    status: inferTaskColumn(due),
    due,
    effort: preferredAssistantEffort(style, intensity),
    impact: inferMeetingFollowupImpact(due, title, area),
    done: false,
    completedAt: ""
  };
}

function normalizeMeetingFollowupTaskTitle(text) {
  const cleaned = String(text || "")
    .replace(/\b(?:el|para el|antes del)\s+\d{4}-\d{2}-\d{2}\b/gi, "")
    .replace(/\b(?:el|para el|antes del)\s+\d{1,2}\/\d{1,2}\/20\d{2}\b/gi, "")
    .replace(/[.;:,]+$/g, "")
    .trim();
  return capitalizeSentence(cleaned);
}

function inferMeetingFollowupIntensity(area, title) {
  const normalized = normalizeUserText(title);
  if (area === "Capítulos" || /(reescrib|redact|borrador|capitulo|capítulo|apartado|marco|metodo|método)/.test(normalized)) return "high";
  if (area === "Reuniones" || /(preparar agenda|coordinar|confirmar|convocar)/.test(normalized)) return "low";
  return "medium";
}

function inferMeetingFollowupImpact(due, title, area) {
  const normalized = normalizeUserText(title);
  if (inferTaskColumn(due) === "today") return "Alto";
  if (area === "Capítulos" || /(enviar|cerrar|entregar|reescrib|redact|resolver)/.test(normalized)) return "Alto";
  return "Medio";
}

function parseMeetingNotesSections(text) {
  const sections = { summary: [], decisions: [], tasks: [], general: [] };
  let current = "general";
  splitLines(text).forEach((line) => {
    const normalized = normalizeUserText(line.replace(/^[-*•\d.)\s]+/, ""));
    if (/^(resumen|sintesis|síntesis)\b/.test(normalized)) {
      current = "summary";
      return;
    }
    if (/^(decision|decisiones|acuerdo|acuerdos)\b/.test(normalized)) {
      current = "decisions";
      return;
    }
    if (/^(tarea|tareas|siguiente paso|proximos pasos|próximos pasos|follow up)\b/.test(normalized)) {
      current = "tasks";
      return;
    }
    if (/^(agenda|contexto|notas)\b/.test(normalized)) {
      current = "general";
      return;
    }
    sections[current].push(cleanMeetingNoteLine(line));
  });
  return sections;
}

function cleanMeetingNoteLine(line) {
  return String(line || "")
    .replace(/^[-*•]\s*/, "")
    .replace(/^\d+[.)]\s*/, "")
    .trim();
}

function buildMeetingSummaryText(meeting, lines, topic, style) {
  const trimmed = lines.filter(Boolean).slice(0, style.meetingMode === "brief" ? 1 : 2);
  const attendees = String(meeting.attendees || "").trim();
  if (trimmed.length) {
    const intro = `Se revisó ${topic}${attendees ? ` con ${attendees}` : ""}.`;
    const body = trimmed.map((line) => ensureSentence(line)).join(" ");
    return `${intro} ${body}`.trim();
  }
  return `Se revisó ${topic}${attendees ? ` con ${attendees}` : ""} y quedó definido un siguiente paso operativo para no perder continuidad.`;
}

function inferMeetingDecisionLines(lines, topic) {
  const matched = lines.filter((line) => /(decid|acord|queda|quedo|quedó|priorizar|enfoque|se mantiene|se cambia|se cierra|se enviara|se enviará)/i.test(normalizeUserText(line)));
  if (matched.length) return matched.map((line) => ensureSentence(line));
  const first = lines[0] ? ensureSentence(lines[0]) : "";
  return [first || `Queda como foco inmediato ${topic}.`];
}

function inferMeetingTaskLines(lines, topic) {
  const matched = lines.filter((line) => /(enviar|revisar|cerrar|preparar|reescribir|actualizar|hacer|redactar|llevar|compartir|subir|ajustar|confirmar|entregar)/i.test(normalizeUserText(line)));
  if (matched.length) return matched.map((line) => ensureSentence(line));
  return [`Dejar por escrito el siguiente entregable asociado a ${topic}.`];
}

function meetingPrimaryTopic(meeting) {
  const agendaLines = splitLines(meeting?.agenda || "");
  const first = agendaLines[0] || String(meeting?.agenda || "").trim();
  return first ? `"${first}"` : "el avance de la tesis";
}

function bulletizeText(text) {
  const lines = splitLines(text);
  return lines.length ? lines.map((line) => `- ${line}`).join("\n") : "- Sin contenido todavía.";
}

function ensureSentence(text) {
  const cleaned = cleanMeetingNoteLine(text);
  if (!cleaned) return "";
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

function prepareCommentResponseFromPrompt(message) {
  const comment = findCommentFromPrompt(message);
  if (!comment) {
    return { reply: "No encuentro un comentario abierto para responder. Si quieres, dime el capítulo o registra primero el comentario." };
  }

  const chapter = state.chapters.find((item) => item.title === comment.chapter);
  const response = buildCommentResponseDraft(comment, chapter);
  return assistantReplyWithPreview(
    `Te dejo una vista previa de respuesta de trabajo para el comentario de ${comment.chapter}:\n\n${response}\n\nSi la confirmas, la guardo dentro de Reuniones y revisión.`,
    [{
      type: "update_review_comment_response",
      commentId: comment.id,
      chapterTitle: comment.chapter,
      response,
      status: comment.status === "Pendiente" ? "En proceso" : comment.status
    }],
    {
      summary: `Voy a actualizar la respuesta del comentario de ${comment.chapter}.`,
      toastMessage: "Respuesta al comentario guardada"
    }
  );
}

function buildCommentResponseDraft(comment, chapter) {
  const style = resolveAssistantStyle(refreshAssistantStyleMemory(state));
  const focusSection = chapter ? findWeakestSection(chapter) : null;
  const lines = style.planningDepth === "detailed"
    ? [
        `- Qué voy a corregir: ${comment.comment}`,
        focusSection
          ? `- Dónde tocar primero: ${chapter.title}, especialmente en "${focusSection.title}".`
          : `- Dónde tocar primero: el apartado de ${comment.chapter} directamente afectado por el comentario.`,
        chapter?.argument
          ? `- Criterio de respuesta: reforzar el texto para que el argumento central quede explícito (${chapter.argument}).`
          : "- Criterio de respuesta: dejar visible el cambio textual y la justificación académica del ajuste.",
        "- Evidencia de cierre: el cambio tiene que quedar escrito y verificable antes de marcar el comentario como resuelto."
      ]
    : [
        `- Qué voy a corregir: ${comment.comment}`,
        focusSection
          ? `- Dónde tocar primero: ${chapter.title}, especialmente en "${focusSection.title}".`
          : `- Dónde tocar primero: el apartado de ${comment.chapter} directamente afectado por el comentario.`,
        "- Señal de cierre: dejar el cambio escrito, no solo pensado."
      ];
  return lines.join("\n");
}

function buildChapterWeaknessReply(message) {
  const chapter = inferAssistantChapterContext(message);
  if (!chapter) {
    return { reply: "Puedo detectar la sección más floja, pero necesito que me digas el capítulo o que exista un capítulo activo." };
  }
  const weakestSection = findWeakestSection(chapter);
  const chapterComment = findOpenCommentForChapter(chapter.title);
  const openCheck = (chapter.rewriteChecklist || []).filter((item) => !item.done)[0];
  const lines = [
    `- Capítulo: ${chapter.title} (${chapter.status}, ${chapter.progress}% de avance).`,
    weakestSection
      ? `- Sección más floja: ${weakestSection.title}. ${buildWeakestSectionExplanation(chapter, weakestSection)}`
      : "- No veo una sección clara todavía; conviene crear estructura mínima primero.",
    chapterComment
      ? `- Comentario que más aprieta: ${chapterComment.comment}`
      : "- No hay comentario abierto sobre este capítulo ahora mismo.",
    openCheck
      ? `- Paso abierto de reescritura: ${openCheck.label}`
      : "- Consejo práctico: convierte la parte más floja en una sesión cerrable antes de abrir otra lectura."
  ];
  return { reply: `Lectura rápida del capítulo:\n${lines.join("\n")}` };
}

function prepareRewriteChecklistFromPrompt(message) {
  const chapter = inferAssistantChapterContext(message);
  if (!chapter) {
    return { reply: "Puedo preparar el checklist, pero necesito saber qué capítulo estás trabajando." };
  }
  const comment = findCommentForChapterPrompt(chapter, message);
  if (!comment) {
    return { reply: `No encuentro un comentario abierto para ${chapter.title}. Si lo registras primero, te lo convierto en checklist de reescritura.` };
  }
  const items = buildRewriteChecklistItems(chapter, comment);
  return assistantReplyWithPreview(
    `Te dejo una vista previa de checklist de reescritura para ${chapter.title} a partir del comentario abierto:\n${items.map((item) => `- ${item.label}`).join("\n")}\n\nSi la confirmas, la guardo dentro del capítulo.`,
    [{
      type: "set_chapter_rewrite_checklist",
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      sourceCommentId: comment.id,
      sourceCommentText: comment.comment,
      items
    }],
    {
      summary: `Voy a crear un checklist de reescritura para ${chapter.title}.`,
      toastMessage: "Checklist de reescritura guardada"
    }
  );
}

function prepareSectionStructureFromPrompt(message) {
  const chapter = inferAssistantChapterContext(message);
  if (!chapter) {
    return { reply: "Puedo proponer una estructura, pero necesito saber qué capítulo quieres tocar." };
  }
  const section = findSectionFromPrompt(chapter, message) || findWeakestSection(chapter);
  const proposal = buildSectionStructureProposal(chapter, section);
  const note = {
    id: createId("nt"),
    title: `Estructura sugerida: ${section ? section.title : chapter.title}`,
    type: "Decisión",
    date: todayISO(),
    text: proposal
  };
  return assistantReplyWithPreview(
    `Te dejo una vista previa de estructura para ${section ? section.title : chapter.title}:\n\n${proposal}\n\nSi la confirmas, la guardo como nota interna del capítulo.`,
    [{ type: "create_chapter_note", chapterId: chapter.id, chapterTitle: chapter.title, note }],
    {
      summary: `Voy a guardar una estructura sugerida para ${chapter.title}.`,
      toastMessage: "Estructura sugerida guardada"
    }
  );
}

function prepareNextChapterSessionFromPrompt(message) {
  const chapter = inferAssistantChapterContext(message);
  if (!chapter) {
    return { reply: "Puedo preparar la siguiente sesión, pero necesito saber qué capítulo quieres empujar." };
  }
  const style = resolveAssistantStyle(refreshAssistantStyleMemory(state));
  const weakestSection = findWeakestSection(chapter);
  const comment = findOpenCommentForChapter(chapter.title);
  const due = extractDateFromText(message) || offsetISODate(1);
  const task = {
    id: createId("tk"),
    title: weakestSection ? `Sesión foco: ${chapter.title} · ${weakestSection.title}` : `Sesión foco: ${chapter.title}`,
    area: "Capítulos",
    status: inferTaskColumn(due),
    due,
    effort: preferredAssistantEffort(style, weakestSection ? "high" : "medium"),
    impact: "Alto",
    done: false,
    completedAt: ""
  };
  const note = {
    id: createId("nt"),
    title: `Entrada de sesión: ${chapter.title}`,
    type: "Decisión",
    date: todayISO(),
    text: buildNextChapterSessionPlan(chapter, weakestSection, comment)
  };
  return assistantReplyWithPreview(
    `Te dejo una vista previa para la siguiente sesión de ${chapter.title}:\n- ${task.title}${task.due ? ` (${formatDate(task.due)})` : ""}\n\n${note.text}\n\nSi la confirmas, te guardo la tarea y la nota de entrada.`,
    [
      { type: "create_task", task },
      { type: "create_chapter_note", chapterId: chapter.id, chapterTitle: chapter.title, note }
    ],
    {
      summary: `Voy a preparar la siguiente sesión de ${chapter.title}.`,
      toastMessage: "Siguiente sesión preparada"
    }
  );
}

function inferAssistantChapterContext(message) {
  return findChapterFromPrompt(message)
    || state.chapters.find((chapter) => chapter.id === state.editorChapterId)
    || state.chapters[0]
    || null;
}

function findCommentForChapterPrompt(chapter, message) {
  const normalized = normalizeUserText(message);
  const openComments = state.reviewComments.filter((item) => item.chapter === chapter.title && item.status !== "Resuelto");
  const matched = openComments.find((item) => normalized.includes(normalizeUserText(item.source || "")) || normalized.includes(normalizeUserText(item.comment || "")));
  return matched || openComments.sort((a, b) => String(a.due || "9999-12-31").localeCompare(String(b.due || "9999-12-31")))[0] || null;
}

function buildRewriteChecklistItems(chapter, comment) {
  const weakestSection = findWeakestSection(chapter);
  const items = [
    `Traducir el comentario a un cambio textual concreto: ${comment.comment}`,
    weakestSection
      ? `Reabrir "${weakestSection.title}" y decidir qué frase o párrafo debe cambiar primero.`
      : `Decidir qué apartado de ${chapter.title} se toca primero.`,
    chapter.argument
      ? `Reforzar el vínculo con el argumento central del capítulo: ${chapter.argument}.`
      : `Dejar explícito el argumento o criterio académico que resuelve el comentario.`,
    "Comprobar si falta evidencia, cita o justificación metodológica antes de cerrar.",
    "Dejar criterio de cierre visible antes de marcar el comentario como resuelto."
  ];
  return items.map((label) => ({
    id: createId("rw"),
    label,
    done: false,
    sourceCommentId: comment.id,
    sourceCommentText: comment.comment
  }));
}

function findSectionFromPrompt(chapter, message) {
  if (!chapter?.sections?.length) return null;
  const normalized = normalizeUserText(message);
  const indexMatch = normalized.match(/(?:apartado|seccion)\s+(\d+)/);
  if (indexMatch) {
    return chapter.sections[Number(indexMatch[1]) - 1] || null;
  }
  return chapter.sections.find((section) => normalized.includes(normalizeUserText(section.title))) || null;
}

function buildSectionStructureProposal(chapter, section) {
  const target = section || findWeakestSection(chapter);
  const sectionTitle = target ? target.title : chapter.title;
  const focusGoal = target?.goal || chapter.goal || "Dejar claro qué sostiene este apartado";
  const argumentLine = chapter.argument ? `Argumento que no debería perderse: ${chapter.argument}.` : "Argumento pendiente de volver explícito.";
  return [
    `Propuesta para ${sectionTitle}:`,
    `1. Apertura: enuncia el objetivo del apartado y por qué importa aquí. (${focusGoal})`,
    "2. Desarrollo: presenta una idea central y la evidencia mínima que la sostiene.",
    "3. Tensión o matiz: introduce el punto que necesita justificar mejor, no solo describir.",
    `4. Cierre: conecta el apartado con el siguiente paso del capítulo. ${argumentLine}`
  ].join("\n");
}

function buildNextChapterSessionPlan(chapter, weakestSection, comment) {
  const sessionLines = [
    `Objetivo: ${weakestSection ? `cerrar la parte más floja, ${weakestSection.title}` : `cerrar una pieza concreta de ${chapter.title}`}.`,
    `Entrada rápida: relee ${comment ? `el comentario "${comment.comment}"` : "la última nota o párrafo abierto"} y define qué cambio textual te llevas a la sesión.`,
    "Bloque central: reescribe primero una sola unidad defendible, no el capítulo entero.",
    "Salida: deja una frase cerrada, una tarea visible y un criterio de cierre para la próxima sesión."
  ];
  return sessionLines.join("\n");
}

function findCommentFromPrompt(message) {
  const chapter = findChapterFromPrompt(message);
  if (chapter) {
    return [...state.reviewComments]
      .find((item) => item.chapter === chapter.title && item.status !== "Resuelto") || null;
  }
  return findUrgentComment();
}

function findMeetingFromPrompt(message) {
  const date = extractDateFromText(message);
  const time = extractTimeFromText(message);
  if (!date) return upcomingMeeting();
  return [...state.meetings]
    .sort((a, b) => `${a.date} ${a.time || "23:59"}`.localeCompare(`${b.date} ${b.time || "23:59"}`))
    .find((meeting) => meeting.date === date && (!time || meeting.time === time))
    || null;
}

function buildMeetingAdvice() {
  const style = resolveAssistantStyle(refreshAssistantStyleMemory(state));
  const nextMeeting = upcomingMeeting();
  const chapter = nextChapterToPush();
  const urgentComment = [...state.reviewComments].find((comment) => comment.status !== "Resuelto");
  if (!nextMeeting) {
    return "No veo ninguna reunión futura registrada. Si quieres, puedo agendar una desde aquí con una frase como: Agendar reunión el martes a las 16:00 con directora sobre marco teórico.";
  }
  const lines = [
    `- Estado del capítulo más sensible: ${chapter ? `${chapter.title} (${chapter.progress}% de avance)` : "elige un capítulo principal"}.`,
    "- Una decisión que necesitas cerrar, no solo avances.",
    urgentComment ? `- Respuesta propuesta al comentario abierto de ${urgentComment.chapter}.` : "- Una lista corta de bloqueos concretos.",
    "- Próximo entregable con fecha realista."
  ].slice(0, style.meetingMode === "brief" ? 3 : 4);
  return `Para la reunión de ${formatMeetingLabel(nextMeeting)} yo llevaría esto:
${lines.join("\n")}`;
}

function findChapterFromPrompt(message) {
  const normalized = normalizeUserText(message);
  if (!normalized.includes("capitulo")) return null;
  const numberMatch = normalized.match(/capitulo\s+(\d+)/);
  if (numberMatch) {
    const chapter = state.chapters[Number(numberMatch[1]) - 1];
    if (chapter) return chapter;
  }
  return state.chapters.find((chapter) => normalized.includes(normalizeUserText(chapter.title)))
    || state.chapters.find((chapter) => chapter.id === state.editorChapterId)
    || state.chapters[0]
    || null;
}

function buildChapterAdvice(chapter) {
  const nextSection = findWeakestSection(chapter);
  const chapterComment = findOpenCommentForChapter(chapter.title);
  const openCheck = chapter.checklist.find((item) => !item.done);
  const lines = [
    `- Estado actual: ${chapter.status} y ${chapter.progress}% de progreso.`,
    `- Siguiente movimiento recomendado: ${nextSection ? `trabajar la sección "${nextSection.title}"` : "cerrar una sección concreta"}.`,
    chapterComment ? `- Comentario abierto sobre este capítulo: ${chapterComment.comment}` : "- No hay comentario abierto específico sobre este capítulo ahora mismo.",
    `- Control de calidad: ${openCheck ? openCheck.label : "el checklist está bastante bien cubierto"}.`,
    "- Consejo práctico: no abras más frentes; intenta dejar hoy una decisión cerrada o un párrafo completo."
  ];
  return `Sobre ${chapter.title}:\n${lines.join("\n")}`;
}

function findOpenCommentForChapter(chapterTitle) {
  return [...state.reviewComments]
    .filter((comment) => comment.chapter === chapterTitle && comment.status !== "Resuelto")
    .sort((a, b) => String(a.due || "9999-12-31").localeCompare(String(b.due || "9999-12-31")))[0] || null;
}

function createMeetingFromPrompt(message) {
  const date = extractDateFromText(message);
  const time = extractTimeFromText(message);
  if (!date) return { reply: "Puedo agendarla, pero me falta la fecha. Prueba: Agendar reunión el viernes a las 16:00 con directora sobre metodología." };
  if (!time) return { reply: "Puedo crear la reunión, pero me falta la hora. Prueba: Agendar reunión el viernes a las 16:00 con directora sobre metodología." };
  const attendees = extractAttendees(message);
  const agenda = extractTopic(message) || "Seguimiento de tesis";
  const type = inferMeetingType(attendees, agenda);
  const meeting = {
    id: createId("mt"),
    date,
    time,
    type,
    attendees,
    agenda,
    summary: "",
    decisions: "",
    tasks: "",
    notes: "",
    next: ""
  };
  return assistantReplyWithPreview(
    `Te dejo la vista previa de una reunión para el ${formatDate(date)} a las ${time}${attendees ? ` con ${attendees}` : ""}. Si la confirmas, la guardo en Reuniones y revisión.`,
    [{ type: "create_meeting", meeting }],
    {
      summary: `Voy a agendar una reunión para el ${formatDate(date)} a las ${time}.`,
      toastMessage: "Reunión creada desde TeDoc"
    }
  );
}

function createTaskFromPrompt(message) {
  const title = extractTaskTitle(message);
  if (!title) return { reply: "Puedo crear la tarea, pero necesito una acción concreta. Ejemplo: Crear tarea enviar borrador del capítulo 2 para mañana." };
  const due = extractDateFromText(message);
  const impact = extractImpact(message);
  const effort = extractEffort(message);
  const area = inferTaskArea(message);
  const status = inferTaskColumn(due);
  const task = {
    id: createId("tk"),
    title,
    area,
    status,
    due,
    effort,
    impact,
    done: false,
    completedAt: ""
  };
  return assistantReplyWithPreview(
    `Te dejo la vista previa de la tarea "${title}"${due ? ` para el ${formatDate(due)}` : ""}. Si la confirmas, la coloco en ${status === "today" ? "Hoy" : status === "week" ? "Esta semana" : "Después"}.`,
    [{ type: "create_task", task }],
    {
      summary: `Voy a crear la tarea "${title}".`,
      toastMessage: "Tarea creada desde TeDoc"
    }
  );
}

function convertCommentToTaskFromPrompt(message) {
  const chapter = findChapterFromPrompt(message);
  const comment = chapter
    ? [...state.reviewComments].find((item) => item.chapter === chapter.title && item.status !== "Resuelto")
    : findUrgentComment();

  if (!comment) {
    return { reply: "Puedo convertir un comentario en tarea, pero no encuentro ninguno abierto ahora mismo. Si quieres, dime el capítulo o registra primero el comentario." };
  }

  const due = extractDateFromText(message) || comment.due || "";
  const task = {
    id: createId("tk"),
    title: `Resolver comentario: ${comment.chapter}`,
    area: "Revisión",
    status: inferTaskColumn(due),
    due,
    effort: comment.priority === "Alta" ? "90 min" : "45 min",
    impact: comment.priority === "Alta" ? "Alto" : "Medio",
    done: false,
    completedAt: ""
  };
  return assistantReplyWithPreview(
    `Te dejo una vista previa para convertir el comentario abierto de ${comment.chapter} en una tarea${due ? ` con fecha ${formatDate(due)}` : ""}. Si la confirmas, también dejo el comentario en proceso.`,
    [{
      type: "convert_review_comment_to_task",
      commentId: comment.id,
      chapterTitle: comment.chapter,
      status: comment.status === "Pendiente" ? "En proceso" : comment.status,
      task
    }],
    {
      summary: `Voy a convertir el comentario de ${comment.chapter} en una tarea.`,
      toastMessage: "Comentario convertido en tarea"
    }
  );
}

function createReviewCommentFromPrompt(message) {
  const chapter = findChapterFromPrompt(message);
  const commentText = extractFreeText(message, ["comentario", "registrar comentario", "anade comentario", "agrega comentario"]);
  if (!commentText) return { reply: "Puedo registrar el comentario, pero necesito el texto. Ejemplo: Registrar comentario del director en capítulo 2: falta justificar la muestra." };

  const source = inferCommentSource(message);
  const priority = inferCommentPriority(message);
  const due = extractDateFromText(message);
  const reviewComment = {
    id: createId("rv"),
    chapter: chapter ? chapter.title : "Sin capítulo",
    source,
    comment: commentText,
    response: "Definir respuesta y criterio de cierre.",
    status: "Pendiente",
    priority,
    due
  };

  return assistantReplyWithPreview(
    `Te dejo la vista previa del comentario de ${source}${chapter ? ` en ${chapter.title}` : ""}${due ? ` con fecha objetivo ${formatDate(due)}` : ""}. Si lo confirmas, lo registro en Reuniones y revisión.`,
    [{ type: "create_review_comment", reviewComment }],
    {
      summary: `Voy a registrar un comentario de ${source}.`,
      toastMessage: "Comentario creado desde TeDoc"
    }
  );
}

function createChapterNoteFromPrompt(message) {
  const chapter = findChapterFromPrompt(message);
  if (!chapter) {
    return { reply: "Puedo guardar la nota, pero necesito que me digas a qué capítulo pertenece. Ejemplo: Añade nota al capítulo 1: abrir la introducción con el problema de investigación." };
  }

  const text = extractFreeText(message, ["nota", "anade nota", "agrega nota", "registrar nota"]);
  if (!text) {
    return { reply: "Puedo guardar la nota, pero me falta el contenido. Ejemplo: Añade nota al capítulo 1: reforzar el cierre de la sección teórica." };
  }

  const note = {
    id: createId("nt"),
    title: noteTitleFromText(text),
    type: inferNoteType(message),
    date: extractDateFromText(message) || todayISO(),
    text
  };

  return assistantReplyWithPreview(
    `Te dejo la vista previa de una nota para ${chapter.title}. Si la confirmas, la guardo en el capítulo.`,
    [{ type: "create_chapter_note", chapterId: chapter.id, chapterTitle: chapter.title, note }],
    {
      summary: `Voy a guardar una nota en ${chapter.title}.`,
      toastMessage: "Nota creada desde TeDoc"
    }
  );
}

function findUrgentComment() {
  return [...state.reviewComments]
    .filter((comment) => comment.status !== "Resuelto")
    .sort((a, b) => String(a.due || "9999-12-31").localeCompare(String(b.due || "9999-12-31")))[0] || null;
}

function nextOpenTask() {
  return [...state.tasks]
    .filter((task) => !task.done)
    .sort((a, b) => String(a.due || "9999-12-31").localeCompare(String(b.due || "9999-12-31")))[0] || null;
}

function openReviewCount() {
  return state.reviewComments.filter((comment) => comment.status !== "Resuelto").length;
}

function recommendNextMove() {
  const urgentComment = findUrgentComment();
  if (urgentComment) return `cerrar el comentario abierto de ${urgentComment.chapter}`;
  const urgentTask = [...state.tasks]
    .filter((task) => task.status !== "later" && !task.done)
    .sort((a, b) => String(a.due || "9999-12-31").localeCompare(String(b.due || "9999-12-31")))[0];
  if (urgentTask) return `terminar la tarea ${urgentTask.title}`;
  const chapter = nextChapterToPush();
  if (chapter) return `empujar ${chapter.title} y cerrar una sección concreta`;
  return "crear el primer capítulo y planificar tres tareas para esta semana";
}

function nextChapterToPush() {
  return [...state.chapters].sort((a, b) => String(a.due || "9999-12-31").localeCompare(String(b.due || "9999-12-31")) || Number(a.progress || 0) - Number(b.progress || 0))[0] || null;
}

function upcomingMeeting() {
  const today = todayISO();
  return [...state.meetings]
    .filter((meeting) => meeting.date && meeting.date >= today)
    .sort((a, b) => `${a.date} ${a.time || "23:59"}`.localeCompare(`${b.date} ${b.time || "23:59"}`))[0] || null;
}

function normalizeUserText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDateFromText(text) {
  const raw = String(text || "");
  const normalized = normalizeUserText(raw);
  let match = raw.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  match = raw.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/);
  if (match) return `${match[3]}-${String(match[2]).padStart(2, "0")}-${String(match[1]).padStart(2, "0")}`;
  if (normalized.includes("pasado manana")) return offsetISODate(2);
  if (/\bmanana\b/.test(normalized)) return offsetISODate(1);
  if (/\bhoy\b/.test(normalized)) return offsetISODate(0);
  const weekday = normalized.match(/\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/);
  if (weekday) return nextWeekdayISO(weekday[1]);
  return "";
}

function extractTimeFromText(text) {
  const raw = String(text || "");
  let match = raw.match(/\b(\d{1,2}):(\d{2})\b/);
  if (match) return `${String(match[1]).padStart(2, "0")}:${match[2]}`;
  match = raw.match(/\ba las\s+(\d{1,2})(?:[:h.](\d{2}))?\b/i);
  if (match) return `${String(match[1]).padStart(2, "0")}:${String(match[2] || "00").padStart(2, "0")}`;
  match = raw.match(/\b(\d{1,2})h\b/i);
  if (match) return `${String(match[1]).padStart(2, "0")}:00`;
  return "";
}

function extractAttendees(text) {
  const match = String(text || "").match(/\bcon\s+([^,.]+?)(?=\s+(?:sobre|para|el|la|a las|a la)\b|$)/i);
  return match ? match[1].trim() : "";
}

function extractTopic(text) {
  const match = String(text || "").match(/\b(?:sobre|para)\s+([^,.]+?)(?=\s+(?:con|el|la|a las|a la)\b|$)/i);
  return match ? match[1].trim() : "";
}

function inferMeetingType(attendees, agenda) {
  const normalized = normalizeUserText(`${attendees} ${agenda}`);
  if (normalized.includes("director") || normalized.includes("directora")) return "Dirección";
  if (normalized.includes("comite")) return "Comité";
  if (normalized.includes("grupo")) return "Grupo";
  return "Revisión interna";
}

function extractTaskTitle(text) {
  let title = String(text || "").trim();
  title = title.replace(/^(crear|crea|anade|añade|agrega|programa|planifica|recuerdame|recordame)(?:\s+una)?(?:\s+nueva)?\s*tarea[: ]*/i, "");
  title = title.replace(/^tarea[: ]*/i, "");
  title = title.replace(/\s+(?:para|el|hoy|manana|mañana|pasado manana|pasado mañana|lunes|martes|miercoles|miércoles|jueves|viernes|sabado|sábado|domingo|prioridad|impacto)\b[\s\S]*$/i, "");
  return title.trim().replace(/\.$/, "");
}

function extractFreeText(text, keywords = []) {
  const raw = String(text || "").trim();
  const colonIndex = raw.indexOf(":");
  if (colonIndex >= 0) return raw.slice(colonIndex + 1).trim();

  let cleaned = raw;
  for (const keyword of keywords) {
    const pattern = new RegExp(keyword, "i");
    cleaned = cleaned.replace(pattern, "").trim();
  }
  cleaned = cleaned.replace(/^(del|de la|de|al|a la|a)\s+/i, "");
  cleaned = cleaned.replace(/capitulo\s+\d+/i, "").trim();
  cleaned = cleaned.replace(/^(director|directora|comite|comité)\s+/i, "").trim();
  return cleaned.replace(/\s+(?:para|el|hoy|manana|mañana|pasado manana|pasado mañana|lunes|martes|miercoles|miércoles|jueves|viernes|sabado|sábado|domingo)\b[\s\S]*$/i, "").trim();
}

function noteTitleFromText(text) {
  const compact = String(text || "").trim();
  if (!compact) return "Nota";
  return compact.length > 54 ? compact.slice(0, 51).trim() + "..." : compact;
}

function inferNoteType(text) {
  const normalized = normalizeUserText(text);
  if (normalized.includes("riesgo")) return "Riesgo";
  if (normalized.includes("fuente") || normalized.includes("referencia")) return "Fuente";
  if (normalized.includes("decision")) return "Decisión";
  return "Idea";
}

function inferCommentSource(text) {
  const normalized = normalizeUserText(text);
  if (normalized.includes("director") || normalized.includes("directora")) return "Dirección";
  if (normalized.includes("comite") || normalized.includes("comite")) return "Comité";
  return "Dirección";
}

function inferCommentPriority(text) {
  const normalized = normalizeUserText(text);
  if (normalized.includes("alta") || normalized.includes("urgente")) return "Alta";
  if (normalized.includes("baja")) return "Baja";
  return "Media";
}

function extractImpact(text) {
  const normalized = normalizeUserText(text);
  if (normalized.includes("alta") || normalized.includes("alto")) return "Alto";
  if (normalized.includes("baja") || normalized.includes("bajo")) return "Bajo";
  return "Medio";
}

function extractEffort(text) {
  const match = String(text || "").match(/\b(\d{1,3})\s*(min|hora|horas|h)\b/i);
  if (!match) return "45 min";
  const amount = Number(match[1]);
  return /hora|horas|h/i.test(match[2]) ? `${amount} h` : `${amount} min`;
}

function inferTaskArea(text) {
  const normalized = normalizeUserText(text);
  if (normalized.includes("capitulo") || normalized.includes("borrador") || normalized.includes("escribir")) return "Capítulos";
  if (normalized.includes("comentario") || normalized.includes("revision")) return "Revisión";
  if (normalized.includes("lectura") || normalized.includes("fuente")) return "Lecturas";
  if (normalized.includes("reunion")) return "Reuniones";
  return "General";
}

function inferTaskColumn(due) {
  if (!due) return "week";
  const diff = daysUntil(due);
  if (diff <= 1) return "today";
  if (diff <= 7) return "week";
  return "later";
}

function daysUntil(date) {
  const target = new Date(`${date}T00:00:00`);
  const today = new Date(`${todayISO()}T00:00:00`);
  return Math.round((target - today) / 86400000);
}

function offsetISODate(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function nextWeekdayISO(dayName) {
  const week = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 };
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const current = date.getDay();
  let diff = (week[dayName] - current + 7) % 7;
  if (diff === 0) diff = 7;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

function formatMeetingLabel(meeting) {
  return `${formatDate(meeting.date)}${meeting.time ? ` · ${meeting.time}` : ""} · ${meeting.type}`;
}

function formatDateTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function escapeMultiline(value) {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

function capitalizeSentence(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
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
    { id: "later", label: "Después" }
  ].filter((item) => item.id !== task.status);

  return `
    <article class="task-card ${task.done ? "task-card--done" : ""}">
      <div class="task-top">
        <div class="task-main">
          <label class="task-check" aria-label="Marcar tarea como completada">
            <input ${task.done ? "checked" : ""} data-action="toggle-task-done" data-id="${task.id}" type="checkbox">
            <span class="task-check-mark" aria-hidden="true"></span>
          </label>
          <strong class="task-title">${escapeHtml(task.title)}</strong>
        </div>
        <button class="tiny-button" data-action="delete-task" data-id="${task.id}" type="button"><span data-icon="trash"></span></button>
      </div>
      <div class="task-meta">
        <span>${escapeHtml(task.area)}</span>
        <span>${formatDate(task.due)}</span>
        <span>${escapeHtml(task.effort)}</span>
        <span>${escapeHtml(task.impact)}</span>
      </div>
      ${task.done ? `<div class="task-completion-note">Completada ${formatDate(task.completedAt)}</div>` : ""}
      <div class="row-actions">
        ${nextStatuses.map((status) => `<button class="tiny-button" data-action="task-status" data-id="${task.id}" data-value="${status.id}" type="button">${status.label}</button>`).join("")}
      </div>
    </article>
  `;
}

function completedTaskRow(task) {
  return `
    <article class="completed-task-row">
      <div>
        <strong>${escapeHtml(task.title)}</strong>
        <div class="task-meta">
          <span>${escapeHtml(task.area)}</span>
          <span>${formatDate(task.completedAt || task.due)}</span>
          <span>${escapeHtml(task.effort)}</span>
        </div>
      </div>
      <button class="tiny-button" data-action="toggle-task-done" data-id="${task.id}" type="button">Reabrir</button>
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
        <button class="tiny-button" data-action="assistant-suggest" data-message="${escapeAttribute(`Redacta respuesta al comentario de ${comment.chapter}`)}" type="button">Responder</button>
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
  const options = ["Sin capítulo", ...state.chapters.map((chapter) => chapter.title)];
  return selectField(label, name, options);
}

function emptyState(text) {
  return `<div class="empty-state">${escapeHtml(text)}</div>`;
}

function statusPill(status) {
  const normalized = normalizeUserText(status);
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
  return `Hola,\n\nDejo por escrito el resumen de la reunión del ${formatDate(meeting.date)}.\n\nResumen ejecutivo:\n${meeting.summary || "Pendiente de cerrar con TeDoc o de completar manualmente."}\n\nAgenda:\n${meeting.agenda}\n\nDecisiones tomadas:\n${meeting.decisions}\n\nTareas acordadas:\n${meeting.tasks}\n\nPróxima reunión: ${formatDate(meeting.next)}.\n\nGracias.`;
}

function generateWritingPlan() {
  const nextChapter = [...state.chapters]
    .filter((chapter) => Number(chapter.words || 0) < Number(chapter.target || 0))
    .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"))[0];

  if (!nextChapter) {
    return "Todos los capítulos registrados han alcanzado su objetivo de palabras. Dedica la semana a revisión, citas y coherencia global.";
  }

  const remaining = Math.max(0, Number(nextChapter.target || 0) - Number(nextChapter.words || 0));
  const daily = Math.ceil(remaining / 10);
  return `Capítulo prioritario: ${nextChapter.title}
Palabras pendientes aproximadas: ${formatNumber(remaining)}
Plan de 10 sesiones: ${formatNumber(daily)} palabras por sesión
Primera sesión: escribir solo el párrafo puente que conecte objetivo, argumento y fuentes
Criterio de cierre: terminar con una decisión visible, no con más lecturas pendientes`;
}

function buildAnalyticsSnapshot() {
  const writingSeries = buildWritingSeries(state.analyticsRange);
  const wordsLast7 = writingWordsLastDays(7);
  const wordsPrevious7 = writingWordsBetweenDays(7, 13);
  const reviewCounts = reviewStatusCounts();
  const readingCounts = readingStatusCounts();
  const stalledChapter = findMostStalledChapter();
  const activeChapters = state.chapters.filter((chapter) => Number(chapter.progress || 0) > 0).length;
  const threshold = addDays(startOfLocalDay(new Date()), -6);
  const chaptersUpdatedThisWeek = state.chapters.filter((chapter) => {
    if (!chapter.editorUpdatedAt) return false;
    return new Date(chapter.editorUpdatedAt) >= threshold;
  }).length;
  return {
    range: state.analyticsRange,
    writingSeries,
    wordsLast7,
    wordsPrevious7,
    wordsDelta: wordsLast7 - wordsPrevious7,
    writingTrend: buildWritingTrendText(wordsLast7, wordsPrevious7),
    streakWeeks: countConsecutiveWritingWeeks(),
    stalledChapter,
    reviewCounts,
    readingCounts,
    activeChapters,
    chaptersUpdatedThisWeek,
    tasksOverdue: state.tasks.filter((task) => task.due && task.due < todayISO() && task.status !== "later" && !task.done).length,
    chapters: [...state.chapters]
      .sort((a, b) => String(a.due || "9999-12-31").localeCompare(String(b.due || "9999-12-31")) || Number(a.progress || 0) - Number(b.progress || 0))
      .slice(0, 6)
  };
}

function renderAnalyticsSection(analytics) {
  return `
    <section class="analytics-shell">
      <div class="section-header analytics-header">
        <div>
          <p class="card-kicker">Analítica útil</p>
          <h2>Ritmo, carga y focos reales</h2>
          <p>Lee la semana en una sola vista: escritura, capítulos, revisión y lecturas.</p>
        </div>
        <div class="segmented-control" role="tablist" aria-label="Rango del gráfico de escritura">
          <button class="tab-button ${state.analyticsRange === "day" ? "is-active" : ""}" data-action="analytics-range" data-value="day" type="button">Días</button>
          <button class="tab-button ${state.analyticsRange === "week" ? "is-active" : ""}" data-action="analytics-range" data-value="week" type="button">Semanas</button>
        </div>
      </div>

      <div class="analytics-summary-grid">
        ${metric("Racha", analytics.streakWeeks, analytics.streakWeeks ? "semanas con escritura" : "sin continuidad todavía")}
        ${metric("Capítulos activos", analytics.activeChapters, `${analytics.chaptersUpdatedThisWeek} tocados en los últimos 7 días`)}
        ${metric("Tareas vencidas", analytics.tasksOverdue, analytics.tasksOverdue ? "requieren limpieza inmediata" : "sin retrasos críticos")}
      </div>

      <article class="panel analytics-insight">
        <p class="card-kicker">Lectura rápida</p>
        <h3>${analytics.stalledChapter ? escapeHtml(analytics.stalledChapter.title) : "Buen momento para sostener el ritmo"}</h3>
        <p>${escapeHtml(buildAnalyticsLead(analytics))}</p>
      </article>

      <div class="analytics-grid">
        ${renderWritingChart(analytics)}
        <article class="card analytics-card">
          <div class="section-header">
            <div>
              <p class="card-kicker">Capítulos</p>
              <h2>Progreso por capítulo</h2>
            </div>
          </div>
          <div class="analytics-list">
            ${renderChapterProgressAnalytics(analytics.chapters)}
          </div>
        </article>
        ${renderDistributionTrack("Revisión", "Comentarios abiertos, en proceso y resueltos.", analytics.reviewCounts, ["#c89f32", "#e4bd64", "#f3e6c0"])}
        ${renderDistributionTrack("Lecturas", "Dónde está ahora mismo tu base de fuentes.", analytics.readingCounts, ["#6157a8", "#8a82c8", "#c5c1ea", "#dddaf5"])}
      </div>
    </section>
  `;
}

function buildWritingSeries(range) {
  return range === "day" ? buildWritingDaySeries(14) : buildWritingWeekSeries(8);
}

function buildWritingDaySeries(days) {
  const series = [];
  const today = startOfLocalDay(new Date());
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = addDays(today, -index);
    const iso = toLocalISODate(date);
    const words = writingWordsOnDate(iso);
    series.push({
      id: iso,
      label: formatChartDayLabel(date),
      value: words,
      title: `${formatChartDayLabel(date)} · ${formatNumber(words)} palabras`
    });
  }
  return series;
}

function buildWritingWeekSeries(weeks) {
  const series = [];
  const currentWeekStart = startOfLocalWeek(new Date());
  for (let index = weeks - 1; index >= 0; index -= 1) {
    const start = addDays(currentWeekStart, -index * 7);
    const end = addDays(start, 6);
    const words = writingWordsBetweenDates(start, end);
    series.push({
      id: toLocalISODate(start),
      label: formatChartWeekLabel(start, end),
      value: words,
      title: `${formatChartWeekLabel(start, end)} · ${formatNumber(words)} palabras`
    });
  }
  return series;
}

function renderWritingChart(analytics) {
  const max = Math.max(...analytics.writingSeries.map((item) => item.value), 1);
  return `
    <article class="card analytics-card analytics-wide">
      <div class="section-header">
        <div>
          <p class="card-kicker">Escritura</p>
          <h2>Palabras por ${analytics.range === "day" ? "día" : "semana"}</h2>
        </div>
        <div class="analytics-chip-row">
          <span class="analytics-chip">${formatNumber(analytics.wordsLast7)} palabras / 7 días</span>
          <span class="analytics-chip">${analytics.writingTrend}</span>
        </div>
      </div>
      <div class="analytics-chart" role="img" aria-label="Gráfico de escritura por ${analytics.range === "day" ? "día" : "semana"}">
        ${analytics.writingSeries.map((item) => `
          <div class="chart-bar" title="${escapeAttribute(item.title)}">
            <span class="chart-bar-value">${compactNumber(item.value)}</span>
            <div class="chart-bar-track"><span style="--height:${Math.max(10, Math.round((item.value / max) * 100))}%"></span></div>
            <span class="chart-bar-label">${escapeHtml(item.label)}</span>
          </div>
        `).join("")}
      </div>
      <p class="muted analytics-footnote">${analytics.streakWeeks ? `Llevas ${analytics.streakWeeks} semana${analytics.streakWeeks === 1 ? "" : "s"} consecutiva${analytics.streakWeeks === 1 ? "" : "s"} con escritura registrada.` : "Todavía no hay una racha estable de escritura; conviene consolidar dos sesiones por semana como mínimo."}</p>
    </article>
  `;
}

function renderChapterProgressAnalytics(chapters) {
  if (!chapters.length) return emptyState("Todavía no hay capítulos suficientes para mostrar progreso.");
  return chapters.map((chapter) => `
    <div class="analytics-chapter-row">
      <div class="analytics-chapter-head">
        <strong>${escapeHtml(chapter.title)}</strong>
        ${statusPill(chapter.status)}
      </div>
      <div class="progress-bar analytics-progress"><span style="--width:${clamp(chapter.progress, 0, 100)}%"></span></div>
      <div class="analytics-chapter-meta">
        <span>${chapter.progress}%</span>
        <span>${formatNumber(chapter.words)} / ${formatNumber(chapter.target)} palabras</span>
        <span>Calidad ${qualityProgress(chapter)}%</span>
        <span>${chapter.due ? `Entrega ${formatDate(chapter.due)}` : "Sin fecha cerrada"}</span>
      </div>
    </div>
  `).join("");
}

function renderDistributionTrack(title, description, counts, palette) {
  const entries = Object.entries(counts).filter(([, value]) => value > 0);
  const total = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0);
  return `
    <article class="card analytics-card">
      <div class="section-header">
        <div>
          <p class="card-kicker">${escapeHtml(title)}</p>
          <h2>${escapeHtml(title)}</h2>
        </div>
      </div>
      <p class="muted">${escapeHtml(description)}</p>
      ${total ? `
        <div class="distribution-track">
          ${entries.map(([label, value], index) => `
            <span class="distribution-segment" style="width:${Math.max(8, (value / total) * 100)}%; background:${palette[index % palette.length]};" title="${escapeAttribute(`${label}: ${value}`)}"></span>
          `).join("")}
        </div>
        <div class="distribution-legend">
          ${entries.map(([label, value], index) => `
            <div class="legend-item">
              <span class="legend-dot" style="background:${palette[index % palette.length]};"></span>
              <strong>${value}</strong>
              <span>${escapeHtml(label)}</span>
            </div>
          `).join("")}
        </div>
      ` : emptyState(`Aún no hay datos de ${title.toLowerCase()}.`)}
    </article>
  `;
}

function buildAnalyticsLead(analytics) {
  const openReview = Number(analytics.reviewCounts.Pendientes || 0) + Number(analytics.reviewCounts["En proceso"] || 0);
  const readingsInFlight = Number(analytics.readingCounts.Leyendo || 0) + Number(analytics.readingCounts.Clave || 0);
  if (!analytics.wordsLast7) {
    return "Llevas una semana sin escritura registrada. Antes de abrir más lecturas, reactiva una sesión breve y medible.";
  }
  if (analytics.tasksOverdue) {
    return `Hay ${analytics.tasksOverdue} tarea${analytics.tasksOverdue === 1 ? "" : "s"} vencida${analytics.tasksOverdue === 1 ? "" : "s"}. Limpia ese ruido antes de abrir un frente nuevo.`;
  }
  if (analytics.stalledChapter && openReview) {
    return `El punto más sensible es ${analytics.stalledChapter.title}. Conviene cerrar revisión y luego empujarlo con una sesión de redacción.`;
  }
  if (readingsInFlight > Number(analytics.readingCounts["Leídas"] || 0) && analytics.wordsLast7 < 1200) {
    return "Ahora mismo estás más en lectura que en redacción. Conviene convertir una fuente abierta en un párrafo útil esta semana.";
  }
  if (analytics.wordsDelta > 0) {
    return "El ritmo mejora respecto a la semana previa. Mantén una sesión de escritura y otra de revisión para consolidarlo.";
  }
  return "El trabajo avanza, pero conviene concentrar la semana en un solo capítulo y un solo frente de revisión.";
}

function buildWritingTrendText(wordsLast7, wordsPrevious7) {
  if (!wordsLast7 && !wordsPrevious7) return "Sin escritura reciente";
  if (!wordsPrevious7 && wordsLast7) return "Arranque frente a la semana previa";
  if (wordsLast7 === wordsPrevious7) return "Ritmo igual que la semana previa";
  const diff = Math.abs(wordsLast7 - wordsPrevious7);
  return wordsLast7 > wordsPrevious7
    ? `+${formatNumber(diff)} frente a la semana previa`
    : `-${formatNumber(diff)} frente a la semana previa`;
}

function countConsecutiveWritingWeeks() {
  const series = buildWritingWeekSeries(8);
  let streak = 0;
  for (let index = series.length - 1; index >= 0; index -= 1) {
    if (!series[index].value) break;
    streak += 1;
  }
  return streak;
}

function findMostStalledChapter() {
  return [...state.chapters]
    .filter((chapter) => normalizeUserText(chapter.status) !== "aprobado")
    .sort((a, b) => String(a.due || "9999-12-31").localeCompare(String(b.due || "9999-12-31")) || Number(a.progress || 0) - Number(b.progress || 0))[0] || null;
}

function reviewStatusCounts() {
  const counts = { Pendientes: 0, "En proceso": 0, Resueltos: 0 };
  state.reviewComments.forEach((comment) => {
    counts[normalizeReviewStatus(comment.status)] += 1;
  });
  return counts;
}

function readingStatusCounts() {
  const counts = { Pendientes: 0, Leyendo: 0, "Leídas": 0, Clave: 0 };
  state.readings.forEach((reading) => {
    counts[normalizeReadingStatus(reading.status)] += 1;
  });
  return counts;
}

function normalizeReviewStatus(status) {
  const normalized = normalizeUserText(status);
  if (normalized.includes("resuelto")) return "Resueltos";
  if (normalized.includes("proceso") || normalized.includes("curso") || normalized.includes("revision")) return "En proceso";
  return "Pendientes";
}

function normalizeReadingStatus(status) {
  const normalized = normalizeUserText(status);
  if (normalized.includes("clave")) return "Clave";
  if (normalized.includes("leyendo")) return "Leyendo";
  if (normalized.includes("leido")) return "Leídas";
  return "Pendientes";
}

function writingWordsOnDate(date) {
  return state.writingLog
    .filter((entry) => entry.date === date)
    .reduce((sum, entry) => sum + Number(entry.words || 0), 0);
}

function writingWordsBetweenDays(startOffset, endOffset) {
  const end = addDays(startOfLocalDay(new Date()), -startOffset);
  const start = addDays(startOfLocalDay(new Date()), -endOffset);
  return writingWordsBetweenDates(start, end);
}

function writingWordsBetweenDates(start, end) {
  const startIso = toLocalISODate(start);
  const endIso = toLocalISODate(end);
  return state.writingLog
    .filter((entry) => entry.date >= startIso && entry.date <= endIso)
    .reduce((sum, entry) => sum + Number(entry.words || 0), 0);
}

function startOfLocalDay(date) {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function startOfLocalWeek(date) {
  const clone = startOfLocalDay(date);
  const day = (clone.getDay() + 6) % 7;
  clone.setDate(clone.getDate() - day);
  return clone;
}

function addDays(date, amount) {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + amount);
  return clone;
}

function toLocalISODate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatChartDayLabel(date) {
  return new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "2-digit" }).format(date).replace(".", "");
}

function formatChartWeekLabel(start, end) {
  const startLabel = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit" }).format(start);
  const endLabel = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit" }).format(end);
  return `${startLabel}–${endLabel}`;
}

function compactNumber(value) {
  return new Intl.NumberFormat("es-ES", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));
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
    ...state.tasks.filter((task) => !task.done).map((task) => ({ label: task.title, due: task.due })),
    ...state.chapters.map((chapter) => ({ label: chapter.title, due: chapter.due })),
    ...state.meetings.map((meeting) => ({ label: "Reunión", due: meeting.next })),
    ...state.reviewComments.map((comment) => ({ label: comment.chapter, due: comment.due }))
  ].filter((item) => item.due);
  if (!candidates.length) return "-";
  const next = candidates.sort((a, b) => a.due.localeCompare(b.due))[0];
  return formatDate(next.due);
}

async function exportData() {
  const exportedAt = new Date().toISOString();
  if (API_ENABLED && auth.user) {
    try {
      const response = await fetch("/api/backup", { credentials: "same-origin" });
      if (response.ok) {
        const payload = await response.json();
        downloadText("doctoral-os-backup.json", JSON.stringify(buildExportPayload(payload, exportedAt), null, 2), "application/json");
        updateSafetyMeta({ lastExportedAt: exportedAt });
        showToast("Respaldo exportado desde el servidor");
        return;
      }
    } catch (error) {
      console.warn("No se pudo descargar el respaldo del servidor", error);
    }
  }

  downloadText("doctoral-os-respaldo.json", JSON.stringify(buildExportPayload({ state }, exportedAt), null, 2), "application/json");
  updateSafetyMeta({ lastExportedAt: exportedAt });
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
      saveState("Datos importados", { forceSnapshot: true, snapshotReason: "Importación de datos" });
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
  downloadBlob(filename, blob);
}

function buildExportPayload(basePayload, exportedAt) {
  const snapshot = latestSnapshotRecord();
  return {
    ...basePayload,
    exportedAt,
    safety: {
      ...buildAssistantClientMeta(),
      latestSnapshotSummary: snapshot ? snapshot.summary : "",
      restorePoints: loadSnapshots().map((item) => ({
        createdAt: item.createdAt,
        reason: item.reason,
        summary: item.summary
      }))
    }
  };
}

function downloadBlob(filename, blob) {
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
