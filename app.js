const STORAGE_KEY = "doctoral-os-state-v1";
const DEMO_STORAGE_KEY = "doctoral-os-demo-state-v1";
const DEMO_QUERY_PARAM = "demo";
const API_ENABLED = window.location.protocol === "http:" || window.location.protocol === "https:";
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
  assistant: "Asistente",
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
  assistantThread: []
};

let demoMode = isDemoRequested();
let state = loadState();
let auth = {
  user: null,
  status: API_ENABLED ? "checking" : "file",
  lastSync: "",
  statusLabel: API_ENABLED ? "Comprobando" : "Archivo local"
};
let syncTimer = null;
let assistantBusy = false;

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
  screen.addEventListener("click", handleScreenClick);
  screen.addEventListener("submit", handleFormSubmit);
  screen.addEventListener("input", handleScreenInput);
  render();
  updateAuthUI();
  restoreSession().finally(() => maybeOpenAuthFromUrl());
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

function clearDemoQuery() {
  const url = new URL(window.location.href);
  url.searchParams.delete(DEMO_QUERY_PARAM);
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
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
  target.meetings.forEach((meeting) => {
    meeting.time = meeting.time || "";
    if (meeting.type === "Direccion") meeting.type = "Dirección";
    if (meeting.type === "Revision interna") meeting.type = "Revisión interna";
  });
  target.readings.forEach((reading) => {
    if (reading.status === "Leido") reading.status = "Leído";
    if (reading.chapter === "Sin capitulo") reading.chapter = "Sin capítulo";
    if (reading.title === "Lectura sin título") reading.title = "Lectura sin título";
  });
  target.tasks.forEach((task) => {
    if (task.area === "Revision") task.area = "Revisión";
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
    assistantThread: createInitialAssistantThread()
  });
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
      { id: createId("mt"), date: demoDateOffset(3), time: "16:00", type: "Dirección", attendees: "Directora", agenda: "Método y criterios de muestreo", decisions: "Llegar con una justificación más explícita del tamaño de muestra y una tabla final de participantes.", tasks: "Reescribir apartado 2.2 y llevar una agenda de 5 puntos.", next: demoDateOffset(17) },
      { id: createId("mt"), date: demoDateOffset(-5), time: "11:30", type: "Dirección", attendees: "Directora", agenda: "Revisión del marco teórico", decisions: "Reducir repetición conceptual y cerrar mejor el paso a metodología.", tasks: "Ajustar secciones 2.2 y 2.3; preparar transición a capítulo 3.", next: demoDateOffset(3) }
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
      { id: createId("msg"), role: "assistant", text: "Estás en la demo guiada de DoctoralOS. En dos o tres minutos puedes ver el panel, abrir el capítulo metodológico, revisar comentarios y pedirme acciones dentro de esta tesis de ejemplo.", createdAt: demoTimestamp(-1, 9, 6) },
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
        title: section.title || "Sección sin título",
        goal: section.goal || "",
        status: section.status === "En revision" ? "En revisión" : (section.status || "Borrador"),
        words: Number(section.words || 0),
        content: section.content || ""
      }))
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
  localStorage.setItem(activeStorageKey(), JSON.stringify(state));
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

function authModalCopy(mode) {
  if (mode === "recover") {
    return {
      title: "Recuperar acceso",
      description: "Solicita un enlace seguro para restablecer tu contraseña. Durante esta beta, la entrega del enlace se gestiona de forma asistida para mantener el acceso más controlado."
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
    showToast(mode === "password-reset-confirm" ? "Contraseña actualizada" : "Cuenta sincronizada");
    render();
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
      auth = { user: null, status: "local", lastSync: "", statusLabel: demoMode ? "Demo guiada" : "Local" };
      updateAuthUI();
      return;
    }
    if (!response.ok) throw new Error(result.error || "No se pudo recuperar la sesión");

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
    auth = { ...auth, user: null, status: "offline", lastSync: "", statusLabel: "Backend offline" };
    updateAuthUI();
  }
}

function applySession(result) {
  auth.user = result.user || null;
  auth.status = "synced";
  auth.lastSync = shortTime();
  auth.statusLabel = "Sincronizado";
  if (demoMode) {
    demoMode = false;
    clearDemoQuery();
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
  auth = { user: null, status: "local", lastSync: "", statusLabel: "Local" };
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
      auth = { user: null, status: "local", lastSync: "", statusLabel: "Vuelve a entrar" };
      updateAuthUI();
      if (showMessage) showToast("La sesión ha caducado. Vuelve a entrar.");
      openAuthModal();
      return;
    }
    if (!response.ok) throw new Error(result.error || "No se pudo sincronizar");

    auth.status = "synced";
    auth.lastSync = shortTime();
    auth.statusLabel = "Sincronizado";
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

function handleScreenClick(event) {
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

  if (action === "assistant-suggest") {
    submitAssistantPrompt(target.dataset.message || "");
    return;
  }

  if (action === "assistant-clear") {
    state.assistantThread = createInitialAssistantThread();
    saveState("Conversación reiniciada");
    render();
    return;
  }

  if (action === "exit-demo") {
    demoMode = false;
    clearDemoQuery();
    state = loadState();
    saveState("Demo cerrada", { skipSync: true });
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
    saveState("Sesión eliminada");
    render();
  }

  if (action === "delete-forum-topic") {
    state.forumTopics = state.forumTopics.filter((topic) => topic.id !== id);
    saveState("Tema eliminado");
    render();
  }
}

function handleFormSubmit(event) {
  const form = event.target;
  if (!form.matches("form[data-form]")) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
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
    state.readings.push({
      id: createId("rd"),
      title: data.title || "Lectura sin título",
      authors: data.authors || "Autor pendiente",
      year: data.year || "",
      type: data.type || "Artículo",
      status: data.status || "Pendiente",
      chapter: data.chapter || "Sin capítulo",
      use: data.use || "",
      doi: data.doi || ""
    });
    saveState("Lectura añadida");
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
      time: data.time || "",
      type: data.type || "Dirección",
      attendees: data.attendees || "",
      agenda: data.agenda || "",
      decisions: data.decisions || "",
      tasks: data.tasks || "",
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

  if (requiresAuthenticationWall()) {
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.classList.remove("is-active");
    });
    viewTitle.textContent = "Acceso privado";
    updateSidebar();
    renderAuthGate();
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
            <li>Asistente y foro preparados para crecer con la v1</li>
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
  const nextTask = [...state.tasks].sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"))[0];
  const readingLinked = state.readings.filter((item) => item.chapter && item.chapter !== "Sin capítulo").length;
  const pendingComments = state.reviewComments.filter((item) => item.status !== "Resuelto").length;
  const wordsThisWeek = writingWordsLastDays(7);
  const hasStarted = state.chapters.length || state.tasks.length || state.meetings.length || state.reviewComments.length;
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
        <p>Empieza por el panel para ver foco y próxima entrega, abre el capítulo metodológico para entender el editor y termina en revisión o asistente para ver cómo se convierten reuniones y comentarios en trabajo cerrable.</p>
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
            <strong>3. Prueba el asistente</strong>
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
        <p>Mira comentarios, reunión y asistente para entender cómo se convierte el feedback en acciones.</p>
        <button class="tiny-button" data-action="go" data-view="reviews" type="button">Abrir revisión</button>
      </article>
    </section>
  ` : `
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
            <button class="ghost-button" data-action="go" data-view="assistant" type="button"><span data-icon="assistant"></span>Pedir consejo</button>
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
      ${metric("Plan", state.tasks.filter((task) => task.status !== "later").length, "tareas activas")}
      ${metric("Comentarios", pendingComments, "pendientes de respuesta")}
      ${metric("Semana", formatNumber(wordsThisWeek), "palabras registradas")}
      ${metric("Lecturas", `${readingLinked}/${state.readings.length}`, "vinculadas a capítulos")}
    </section>

    ${dashboardJourney}

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
                <p>${escapeHtml(note.text)}</p>
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
            <p class="eyebrow">Lecturas mínimas</p>
            <h2>Fuentes vinculadas a capítulos</h2>
            <p>En la v1, las lecturas sirven para sostener capítulos concretos y mantener clara su utilidad en la tesis.</p>
          </div>
        </div>

        <div class="filter-row">
          <input data-literature-filter type="search" value="${escapeAttribute(state.literatureFilter || "")}" placeholder="Buscar por autor, capítulo o estado">
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Autor</th>
                <th>Año</th>
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
            ${field("Título", "title", "input", "Artículo o libro")}
            ${field("Autores", "authors", "input", "Apellido, A.")}
            ${field("Año", "year", "number", "2026")}
            <div class="inline-fields">
              ${selectField("Estado", "status", ["Pendiente", "Leyendo", "Leído", "Clave", "Descartado"])}
              ${chapterSelect("Capítulo", "chapter")}
            </div>
            ${field("Uso en mi tesis", "use", "textarea", "Dónde lo citaré y para qué")}
            ${field("DOI / URL", "doi", "input", "10.xxxx/...")}
            <button class="button" type="submit"><span data-icon="plus"></span>Añadir lectura</button>
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
    { id: "later", title: "Después" }
  ];

  screen.innerHTML = `
    <section class="section-header">
      <div>
        <p class="eyebrow">Trabajo sostenible</p>
        <h2>Plan semanal</h2>
        <p>Convierte capítulos, lecturas y reuniones en tareas pequeñas con vencimiento e impacto claro.</p>
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
          ${field("Tarea", "title", "input", "Escribir 500 palabras del marco teórico")}
          <div class="inline-fields">
            ${field("Area", "area", "input", "Capítulos")}
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
      <article class="card">
        <p class="card-kicker">Guia semanal</p>
        <h2>Una tesis avanza por entregables pequeños</h2>
        <p>Elige pocas tareas, asigna fecha y mueve lo que no quepa a "Después".</p>
      </article>
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

        ${latest ? `
          <article class="panel">
            <p class="card-kicker">Última reunión</p>
            <h2>${escapeHtml(formatMeetingLabel(latest))}</h2>
            <p><strong>Decisiones:</strong> ${escapeHtml(latest.decisions)}</p>
            <p><strong>Tareas:</strong> ${escapeHtml(latest.tasks)}</p>
            <div class="generated-box">${escapeHtml(generateMeetingEmail(latest))}</div>
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
    ? "El asistente intentará usar IA si está disponible y, si no, volverá al modo local sin romper tu trabajo."
    : demoMode
      ? "Demo guiada activa. Las acciones se guardan dentro de esta tesis de ejemplo."
      : "Modo local activo. Puedes trabajar con el asistente básico ahora y activar la IA más adelante cuando conectes OpenAI.";

  screen.innerHTML = `
    <section class="assistant-layout">
      <div class="assistant-panel">
        <div class="section-header assistant-header">
          <div>
            <p class="eyebrow">Asistente interno</p>
            <h2>Preguntas, consejo y acciones directas</h2>
            <p>Puedes pedirme resumen, prioridades o escribir cosas como "Agendar reunión el viernes a las 16:00 con directora sobre metodología".</p>
          </div>
          <button class="ghost-button" data-action="assistant-clear" type="button"><span data-icon="trash"></span>Reiniciar chat</button>
        </div>

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

        <article class="card">
          <p class="card-kicker">Puede hacer ahora</p>
          <h2>Lo más útil en esta v1</h2>
          <ul class="quality-list compact-list">
            <li>Resumir progreso y detectar cuellos de botella</li>
            <li>Priorizar la semana según tareas, comentarios y fechas</li>
            <li>Crear tareas desde lenguaje natural</li>
            <li>Agendar reuniones con fecha y hora</li>
            <li>Registrar notas y comentarios de revisión</li>
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
        <strong>${isUser ? "Tú" : "Asistente"}</strong>
        <span>${formatDateTime(message.createdAt)}</span>
      </div>
      <div class="assistant-message-body">${escapeMultiline(message.text)}</div>
    </article>`;
}

function createInitialAssistantThread() {
  const intro = demoMode
    ? `Estás en la demo guiada de DoctoralOS. Te recomiendo este recorrido corto:
- Abre el panel para ver foco y siguiente entrega
- Entra en Capítulos y revisa el método
- Pídeme una agenda o un resumen dentro del Asistente

Prueba algo como:
- Resúmeme el progreso actual
- Qué debería priorizar esta semana
- Prepara una agenda breve para la reunión con la directora`
    : `Soy el asistente de DoctoralOS. Puedo resumir tu progreso, sugerir prioridades, crear tareas y agendar reuniones dentro de la app.

Prueba algo como:
- Qué debería priorizar esta semana
- Crear tarea cerrar comentarios del capítulo 2 para mañana
- Agendar reunión el viernes a las 16:00 con directora sobre metodología`;

  return [createAssistantEntry("assistant", intro)];
}

function createAssistantEntry(role, text) {
  return {
    id: createId("msg"),
    role,
    text,
    createdAt: new Date().toISOString()
  };
}

function assistantSuggestions() {
  return [
    "Qué debería priorizar esta semana",
    "Resúmeme el progreso actual",
    "Agendar reunión el viernes a las 16:00 con directora sobre metodología",
    "Crear tarea cerrar comentarios del capítulo 2 para mañana",
    "Añade nota al capítulo 1: abrir la introducción con el problema de investigación",
    "Registrar comentario del director en capítulo 2: falta justificar la muestra para el viernes"
  ];
}

async function submitAssistantPrompt(message) {
  const text = String(message || "").trim();
  if (!text) {
    showToast("Escribe una pregunta o una acción");
    return;
  }
  if (assistantBusy) {
    showToast("El asistente sigue respondiendo");
    return;
  }

  assistantBusy = true;
  state.assistantThread.push(createAssistantEntry("user", text));
  pruneAssistantThread();
  render();

  try {
    const result = await requestAssistantReply(text);
    state = ensureStateShape(deepMerge(structuredClone(defaultState), result.state));
    saveState("", { skipSync: true });
    showToast(result.model ? "Asistente IA actualizado" : "Asistente actualizado");
  } catch (error) {
    const result = buildAssistantReply(text);
    state.assistantThread.push(createAssistantEntry("assistant", result.reply));
    pruneAssistantThread();
    saveState(result.toastMessage || "Respuesta local guardada");
    if (assistantCanUseRemote()) {
      console.warn("Asistente IA no disponible, usando modo local", error);
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
    body: JSON.stringify({ message, state })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "El asistente no está disponible ahora mismo");

  auth.status = "synced";
  auth.statusLabel = "Sincronizado";
  auth.lastSync = shortTime();
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
    return { reply: "Hola. Estoy dentro de tu espacio de tesis y puedo ayudarte con prioridades, capítulos, tareas y reuniones. Si quieres, empieza por preguntarme qué deberías hacer esta semana." };
  }

  if (isSummaryRequest(normalized)) return { reply: buildProgressSummary() };
  if (isWeeklyPriorityRequest(normalized)) return { reply: buildWeeklyPriorities() };
  if (isMeetingCreationRequest(normalized)) return createMeetingFromPrompt(message);
  if (isTaskCreationRequest(normalized)) return createTaskFromPrompt(message);
  if (isCommentCreationRequest(normalized)) return createReviewCommentFromPrompt(message);
  if (isNoteCreationRequest(normalized)) return createChapterNoteFromPrompt(message);
  if (isMeetingAdviceRequest(normalized)) return { reply: buildMeetingAdvice() };

  const chapter = findChapterFromPrompt(message);
  if (chapter) return { reply: buildChapterAdvice(chapter) };

  return {
    reply: "Puedo ayudarte con cuatro cosas muy útiles ahora mismo: resumir progreso, priorizar la semana, crear tareas y agendar reuniones.\n\nPrueba una de estas:\n- Resúmeme el progreso actual\n- Qué debería priorizar esta semana\n- Crear tarea enviar borrador del capítulo 2 para mañana\n- Agendar reunión el martes a las 16:00 con directora sobre metodología"
  };
}

function isSummaryRequest(normalized) {
  return normalized.includes("resumen") || normalized.includes("resumeme") || normalized.includes("resúmeme") || normalized.includes("resume") || normalized.includes("progreso") || normalized.includes("estado general");
}

function isWeeklyPriorityRequest(normalized) {
  return normalized.includes("esta semana") || normalized.includes("priorizar") || normalized.includes("prioridad") || normalized.includes("por donde empiezo") || normalized.includes("que hago") || normalized.includes("que deberia hacer");
}

function isMeetingCreationRequest(normalized) {
  return (normalized.includes("reunion") || normalized.includes("agendar") || normalized.includes("agenda")) && (normalized.includes("crea") || normalized.includes("programa") || normalized.includes("agendar") || normalized.includes("agenda"));
}

function isTaskCreationRequest(normalized) {
  return normalized.includes("tarea") || normalized.includes("recuerdame") || normalized.includes("recordame") || normalized.includes("anade") || normalized.includes("agrega");
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

function buildProgressSummary() {
  const openTasks = state.tasks.filter((task) => task.status !== "later").length;
  const pendingComments = state.reviewComments.filter((comment) => comment.status !== "Resuelto").length;
  const wordsThisWeek = writingWordsLastDays(7);
  const nextMeeting = upcomingMeeting();
  const lines = [
    `- ${state.chapters.length} capítulos registrados con un progreso medio del ${overallProgress()}%.`,
    `- ${openTasks} tareas activas y ${pendingComments} comentarios abiertos.`,
    `- ${state.meetings.length} reuniones registradas.`,
    `- ${formatNumber(wordsThisWeek)} palabras escritas en los últimos 7 días.`
  ];
  if (nextMeeting) lines.push(`- Próxima reunión detectada: ${formatMeetingLabel(nextMeeting)}.`);
  return `Resumen actual:
${lines.join("\n")}\n\nMi siguiente recomendación: ${recommendNextMove()}`;
}

function buildWeeklyPriorities() {
  const lines = [];
  const urgentComment = [...state.reviewComments]
    .filter((comment) => comment.status !== "Resuelto")
    .sort((a, b) => String(a.due || "9999-12-31").localeCompare(String(b.due || "9999-12-31")))[0];
  const urgentTask = [...state.tasks]
    .filter((task) => task.status !== "later")
    .sort((a, b) => String(a.due || "9999-12-31").localeCompare(String(b.due || "9999-12-31")))[0];
  const chapter = nextChapterToPush();
  if (urgentTask) lines.push(`- Tarea prioritaria: ${urgentTask.title}${urgentTask.due ? ` antes del ${formatDate(urgentTask.due)}` : ""}.`);
  if (urgentComment) lines.push(`- Cierra el comentario de ${urgentComment.chapter}${urgentComment.due ? ` antes del ${formatDate(urgentComment.due)}` : ""}.`);
  if (chapter) lines.push(`- Empuja ${chapter.title}: está cerca de entrega y va por ${chapter.progress}% de avance.`);
  if (!lines.length) lines.push("- Crea un capítulo activo o una tarea semanal para empezar a mover la tesis.");
  return `Te propongo este foco para la semana:
${lines.join("\n")}\n\nRegla simple: una prioridad de escritura, una de revisión y una administrativa como máximo.`;
}

function buildMeetingAdvice() {
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
  ];
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
  return state.chapters.find((chapter) => normalized.includes(normalizeUserText(chapter.title))) || null;
}

function buildChapterAdvice(chapter) {
  const nextSection = [...chapter.sections].sort((a, b) => Number(a.words || 0) - Number(b.words || 0))[0];
  const openCheck = chapter.checklist.find((item) => !item.done);
  const lines = [
    `- Estado actual: ${chapter.status} y ${chapter.progress}% de progreso.`,
    `- Siguiente movimiento recomendado: ${nextSection ? `trabajar la sección "${nextSection.title}"` : "cerrar una sección concreta"}.`,
    `- Control de calidad: ${openCheck ? openCheck.label : "el checklist está bastante bien cubierto"}.`,
    "- Consejo práctico: no abras más frentes; intenta dejar hoy una decisión cerrada o un párrafo completo."
  ];
  return `Sobre ${chapter.title}:\n${lines.join("\n")}`;
}

function createMeetingFromPrompt(message) {
  const date = extractDateFromText(message);
  const time = extractTimeFromText(message);
  if (!date) return { reply: "Puedo agendarla, pero me falta la fecha. Prueba: Agendar reunión el viernes a las 16:00 con directora sobre metodología." };
  if (!time) return { reply: "Puedo crear la reunión, pero me falta la hora. Prueba: Agendar reunión el viernes a las 16:00 con directora sobre metodología." };
  const attendees = extractAttendees(message);
  const agenda = extractTopic(message) || "Seguimiento de tesis";
  const type = inferMeetingType(attendees, agenda);
  state.meetings.unshift({
    id: createId("mt"),
    date,
    time,
    type,
    attendees,
    agenda,
    decisions: "",
    tasks: "",
    next: ""
  });
  return {
    reply: `Listo. He agendado una reunión para el ${formatDate(date)} a las ${time}${attendees ? ` con ${attendees}` : ""}. La he guardado en Reuniones y revisión.`,
    toastMessage: "Reunión creada desde el asistente"
  };
}

function createTaskFromPrompt(message) {
  const title = extractTaskTitle(message);
  if (!title) return { reply: "Puedo crear la tarea, pero necesito una acción concreta. Ejemplo: Crear tarea enviar borrador del capítulo 2 para mañana." };
  const due = extractDateFromText(message);
  const impact = extractImpact(message);
  const effort = extractEffort(message);
  const area = inferTaskArea(message);
  const status = inferTaskColumn(due);
  state.tasks.unshift({
    id: createId("tk"),
    title,
    area,
    status,
    due,
    effort,
    impact
  });
  return {
    reply: `He creado la tarea "${title}"${due ? ` para el ${formatDate(due)}` : ""}. La he colocado en ${status === "today" ? "Hoy" : status === "week" ? "Esta semana" : "Después"}.`,
    toastMessage: "Tarea creada desde el asistente"
  };
}

function createReviewCommentFromPrompt(message) {
  const chapter = findChapterFromPrompt(message);
  const commentText = extractFreeText(message, ["comentario", "registrar comentario", "anade comentario", "agrega comentario"]);
  if (!commentText) return { reply: "Puedo registrar el comentario, pero necesito el texto. Ejemplo: Registrar comentario del director en capítulo 2: falta justificar la muestra." };

  const source = inferCommentSource(message);
  const priority = inferCommentPriority(message);
  const due = extractDateFromText(message);
  state.reviewComments.unshift({
    id: createId("rv"),
    chapter: chapter ? chapter.title : "Sin capítulo",
    source,
    comment: commentText,
    response: "Definir respuesta y criterio de cierre.",
    status: "Pendiente",
    priority,
    due
  });

  return {
    reply: `He registrado un comentario de ${source}${chapter ? ` en ${chapter.title}` : ""}${due ? ` con fecha objetivo ${formatDate(due)}` : ""}.`,
    toastMessage: "Comentario creado desde el asistente"
  };
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

  chapter.notes.unshift({
    id: createId("nt"),
    title: noteTitleFromText(text),
    type: inferNoteType(message),
    date: extractDateFromText(message) || todayISO(),
    text
  });
  chapter.editorUpdatedAt = new Date().toISOString();

  return {
    reply: `He guardado una nota en ${chapter.title}.`,
    toastMessage: "Nota creada desde el asistente"
  };
}

function recommendNextMove() {
  const urgentComment = [...state.reviewComments]
    .filter((comment) => comment.status !== "Resuelto")
    .sort((a, b) => String(a.due || "9999-12-31").localeCompare(String(b.due || "9999-12-31")))[0];
  if (urgentComment) return `cerrar el comentario abierto de ${urgentComment.chapter}`;
  const urgentTask = [...state.tasks]
    .filter((task) => task.status !== "later")
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
  return `Hola,\n\nDejo por escrito el resumen de la reunión del ${formatDate(meeting.date)}.\n\nAgenda:\n${meeting.agenda}\n\nDecisiones tomadas:\n${meeting.decisions}\n\nTareas acordadas:\n${meeting.tasks}\n\nPróxima reunión: ${formatDate(meeting.next)}.\n\nGracias.`;
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
    ...state.meetings.map((meeting) => ({ label: "Reunión", due: meeting.next })),
    ...state.reviewComments.map((comment) => ({ label: comment.chapter, due: comment.due }))
  ].filter((item) => item.due);
  if (!candidates.length) return "-";
  const next = candidates.sort((a, b) => a.due.localeCompare(b.due))[0];
  return formatDate(next.due);
}

async function exportData() {
  if (API_ENABLED && auth.user) {
    try {
      const response = await fetch("/api/backup", { credentials: "same-origin" });
      if (response.ok) {
        const blob = await response.blob();
        downloadBlob("doctoral-os-backup.json", blob);
        showToast("Respaldo exportado desde el servidor");
        return;
      }
    } catch (error) {
      console.warn("No se pudo descargar el respaldo del servidor", error);
    }
  }

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
  downloadBlob(filename, blob);
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
