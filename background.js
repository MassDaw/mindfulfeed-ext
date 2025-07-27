// Configuración por defecto
const DEFAULT_CONFIG = {
  sites: [
    "twitter.com",
    "reddit.com", 
    "facebook.com",
    "youtube.com",
    "tiktok.com",
    "instagram.com"
  ],
  interval: 10, // minutos
  messageCategories: {
    humor: {
      name: "Humor Nerd",
      enabled: true,
      messages: [
        "Error 404: Vida real no encontrada. Reiniciando... 🔄",
        "Tu CPU cerebral necesita un break. Ctrl+Alt+Delete recomendado 🖥️",
        "Stack overflow de contenido. Memory leak detectado 💾",
        "¿Sabías que los gatos tienen 9 vidas? Tú solo tienes 24 horas al día 😸",
        "Loading... Cargando motivación... 99% fallido 😅",
        "Bug report: Scroll infinito detectado. Patch recomendado 🐛",
        "Tu atención está en modo debug. Breakpoint establecido 🔍",
        "404: Productividad no encontrada en esta página 🚫",
        "Warning: Tiempo de pantalla excede límites recomendados ⚠️",
        "Exception thrown: Life balance not found 🎯"
      ]
    },
    motivacional: {
      name: "Motivacional",
      enabled: true,
      messages: [
        "¿Has notado que el tiempo vuela cuando estás aquí? 🌟",
        "Tu futuro yo te agradecerá por este descanso 💪",
        "Hay un mundo real esperándote ahí fuera ✨",
        "Cada minuto aquí es un minuto menos para tus sueños 🎯",
        "¿Qué tal si haces algo que realmente te haga feliz? 😊",
        "Tu cerebro necesita descansos, no más contenido 📱",
        "La vida es demasiado corta para perderla en scroll infinito ⏰",
        "¿Recuerdas esa cosa que querías aprender? Ahora es el momento 🚀",
        "Tu atención es valiosa, no la regales 🎁",
        "Un pequeño paso hacia afuera, un gran paso hacia adelante 👣"
      ]
    },
    filosofico: {
      name: "Filosófico",
      enabled: true,
      messages: [
        "¿Qué es el tiempo sino la percepción de cambio? 🤔",
        "En el infinito scroll, ¿buscamos contenido o sentido? 🧘",
        "El presente es el único momento que realmente existe ⏳",
        "¿Somos dueños de nuestra atención o esclavos del algoritmo? 🤖",
        "La sabiduría comienza cuando reconocemos nuestros patrones 🧠",
        "Cada elección moldea el futuro que construimos 🏗️",
        "¿Qué historia quieres contar con tu tiempo? 📖",
        "La consciencia es el primer paso hacia la transformación 🌱",
        "En la quietud encontramos la claridad que buscamos 🕯️",
        "El verdadero poder está en decidir dónde enfocar tu energía ⚡"
      ]
    },
    mindfulness: {
      name: "Mindfulness",
      enabled: true,
      messages: [
        "Respira profundamente. ¿Qué sientes en este momento? 🌬️",
        "Observa tus pensamientos sin juzgarlos 🧘‍♀️",
        "Este momento es perfecto tal como es ✨",
        "Conecta con tu respiración. Estás aquí, ahora 🌿",
        "Permítete estar presente sin agenda 📝",
        "La paz está disponible en cada respiración 🕊️",
        "Observa la impermanencia de cada momento 🌊",
        "Tu cuerpo te está hablando. ¿Lo estás escuchando? 👂",
        "La atención plena es el regalo que te das a ti mismo 🎁",
        "En la quietud, encuentra tu verdadera naturaleza 🌟"
      ]
    }
  },
  enabled: true
};

// Variables globales
let userActivity = {};
let config = { ...DEFAULT_CONFIG };
let zenMode = {
  active: false,
  startTime: null,
  duration: 25, // minutos por defecto
  endTime: null
};
let dailyStats = {
  totalTime: 0, // en minutos
  lastReset: new Date().toDateString()
};

let detailedStats = {
  history: [], // Array de objetos con fecha, sitio, tiempo
  lastCleanup: new Date().toDateString()
};

// Inicializar la extensión
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['config', 'zenMode', 'dailyStats', 'detailedStats'], (result) => {
    if (!result.config) {
      chrome.storage.sync.set({ config: DEFAULT_CONFIG });
      config = DEFAULT_CONFIG;
    } else {
      config = result.config;
    }
    
    if (result.zenMode) {
      zenMode = result.zenMode;
    }
    
    if (result.dailyStats) {
      dailyStats = result.dailyStats;
    }
    
    if (result.detailedStats) {
      detailedStats = result.detailedStats;
    }
    
    // Limpiar historial antiguo
    cleanupOldHistory();
    
    // Verificar si el modo Zen expiró
    checkZenModeExpiration();
    
    // Actualizar badge con tiempo actual
    updateBadge();
  });
});

// Escuchar cambios en la configuración
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.config) {
      config = changes.config.newValue;
      resetTimers();
    }
    if (changes.zenMode) {
      zenMode = changes.zenMode.newValue;
      updateBadge();
    }
    if (changes.dailyStats) {
      dailyStats = changes.dailyStats.newValue;
    }
    if (changes.detailedStats) {
      detailedStats = changes.detailedStats.newValue;
    }
  }
});

// Manejar cambios de pestaña
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      const domain = new URL(tab.url).hostname;
      if (isMonitoredSite(domain)) {
        startTracking(domain, activeInfo.tabId);
      } else {
        stopTracking(activeInfo.tabId);
      }
    }
  });
});

// Manejar actualizaciones de pestañas
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const domain = new URL(tab.url).hostname;
    if (isMonitoredSite(domain)) {
      startTracking(domain, tabId);
    } else {
      stopTracking(tabId);
    }
  }
});

// Verificar si un sitio está siendo monitoreado
function isMonitoredSite(domain) {
  return config.sites.some(site => domain.includes(site));
}

// Iniciar seguimiento de actividad
function startTracking(domain, tabId) {
  if (!config.enabled) return;
  
  const now = Date.now();
  userActivity[tabId] = {
    domain,
    startTime: now,
    lastActivity: now
  };
  
  // Actualizar badge
  updateBadge();
  
  // Programar la primera notificación
  scheduleNotification(tabId);
}

// Detener seguimiento
function stopTracking(tabId) {
  if (userActivity[tabId]) {
    // Calcular tiempo acumulado
    const sessionTime = Math.floor((Date.now() - userActivity[tabId].startTime) / 60000); // en minutos
    addToDailyStats(sessionTime);
    addToDetailedStats(userActivity[tabId].domain, sessionTime);
    
    delete userActivity[tabId];
    updateBadge();
  }
}

// Programar notificación
function scheduleNotification(tabId) {
  if (!userActivity[tabId]) return;
  
  const intervalMs = config.interval * 60 * 1000; // convertir a milisegundos
  
  setTimeout(() => {
    if (userActivity[tabId]) {
      showNotification(tabId);
    }
  }, intervalMs);
}

// Mostrar notificación
function showNotification(tabId) {
  if (!userActivity[tabId] || !config.enabled) return;
  
  // Obtener mensaje aleatorio de las categorías activas
  const randomMessage = getRandomMessage();
  
  chrome.tabs.sendMessage(tabId, {
    action: 'showNotification',
    message: randomMessage
  });
  
  // Programar la siguiente notificación
  scheduleNotification(tabId);
}

// Obtener mensaje aleatorio de categorías activas
function getRandomMessage() {
  if (!config.messageCategories) {
    // Fallback para configuración antigua
    return config.messages ? config.messages[Math.floor(Math.random() * config.messages.length)] : "¡Tómate un descanso! ⏰";
  }
  
  // Obtener todas las categorías activas
  const activeCategories = Object.values(config.messageCategories).filter(category => category.enabled);
  
  if (activeCategories.length === 0) {
    return "¡Tómate un descanso! ⏰";
  }
  
  // Seleccionar categoría aleatoria
  const randomCategory = activeCategories[Math.floor(Math.random() * activeCategories.length)];
  
  // Seleccionar mensaje aleatorio de esa categoría
  const randomMessage = randomCategory.messages[Math.floor(Math.random() * randomCategory.messages.length)];
  
  return randomMessage;
}

// Reiniciar timers cuando cambia la configuración
function resetTimers() {
  userActivity = {};
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url) {
        const domain = new URL(tab.url).hostname;
        if (isMonitoredSite(domain)) {
          startTracking(domain, tab.id);
        }
      }
    });
  });
}

// Manejar mensajes del content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getConfig') {
    sendResponse(config);
  } else if (request.action === 'updateConfig') {
    config = request.config;
    chrome.storage.sync.set({ config });
    resetTimers();
    sendResponse({ success: true });
  } else if (request.action === 'getStats') {
    sendResponse({
      dailyStats,
      zenMode,
      currentSession: getCurrentSessionTime()
    });
  } else if (request.action === 'startZenMode') {
    startZenMode(request.duration);
    sendResponse({ success: true });
  } else if (request.action === 'stopZenMode') {
    stopZenMode();
    sendResponse({ success: true });
  } else if (request.action === 'checkZenMode') {
    sendResponse({ zenMode });
  } else if (request.action === 'getDetailedStats') {
    sendResponse({ detailedStats });
  } else if (request.action === 'exportStats') {
    const csvData = generateCSV();
    sendResponse({ csvData });
  } else if (request.action === 'clearStats') {
    detailedStats.history = [];
    chrome.storage.sync.set({ detailedStats });
    sendResponse({ success: true });
  }
});

// Actualizar badge del ícono
function updateBadge() {
  const currentTime = getCurrentSessionTime();
  const minutes = Math.floor(currentTime / 60000);
  
  if (zenMode.active) {
    const remainingTime = Math.max(0, zenMode.endTime - Date.now());
    const remainingMinutes = Math.ceil(remainingTime / 60000);
    chrome.action.setBadgeText({ text: remainingMinutes.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' }); // Verde para modo Zen
  } else if (minutes > 0) {
    chrome.action.setBadgeText({ text: minutes.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' }); // Rojo para tiempo activo
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Obtener tiempo de sesión actual
function getCurrentSessionTime() {
  const now = Date.now();
  let totalTime = 0;
  
  Object.values(userActivity).forEach(activity => {
    totalTime += now - activity.startTime;
  });
  
  return totalTime;
}

// Agregar tiempo a estadísticas diarias
function addToDailyStats(minutes) {
  const today = new Date().toDateString();
  
  // Resetear estadísticas si es un nuevo día
  if (dailyStats.lastReset !== today) {
    dailyStats.totalTime = 0;
    dailyStats.lastReset = today;
  }
  
  dailyStats.totalTime += minutes;
  chrome.storage.sync.set({ dailyStats });
}

// Iniciar modo Zen
function startZenMode(duration = 25) {
  zenMode.active = true;
  zenMode.startTime = Date.now();
  zenMode.duration = duration;
  zenMode.endTime = Date.now() + (duration * 60 * 1000);
  
  chrome.storage.sync.set({ zenMode });
  updateBadge();
  
  // Programar fin del modo Zen
  setTimeout(() => {
    checkZenModeExpiration();
  }, duration * 60 * 1000);
}

// Detener modo Zen
function stopZenMode() {
  zenMode.active = false;
  zenMode.startTime = null;
  zenMode.endTime = null;
  
  chrome.storage.sync.set({ zenMode });
  updateBadge();
}

// Verificar expiración del modo Zen
function checkZenModeExpiration() {
  if (zenMode.active && zenMode.endTime && Date.now() >= zenMode.endTime) {
    stopZenMode();
    
    // Notificar al usuario que el modo Zen terminó
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'zenModeEnded'
        });
      }
    });
  }
}

// Agregar tiempo a estadísticas detalladas
function addToDetailedStats(domain, minutes) {
  if (minutes <= 0) return;
  
  const today = new Date().toDateString();
  const siteName = getSiteDisplayName(domain);
  
  // Buscar si ya existe una entrada para hoy y este sitio
  const existingEntry = detailedStats.history.find(entry => 
    entry.date === today && entry.site === siteName
  );
  
  if (existingEntry) {
    existingEntry.time += minutes;
  } else {
    detailedStats.history.push({
      date: today,
      site: siteName,
      time: minutes
    });
  }
  
  chrome.storage.sync.set({ detailedStats });
}

// Obtener nombre de visualización del sitio
function getSiteDisplayName(domain) {
  const siteMap = {
    'twitter.com': 'Twitter',
    'reddit.com': 'Reddit',
    'facebook.com': 'Facebook',
    'youtube.com': 'YouTube',
    'tiktok.com': 'TikTok',
    'instagram.com': 'Instagram',
    'linkedin.com': 'LinkedIn',
    'pinterest.com': 'Pinterest',
    'snapchat.com': 'Snapchat',
    'discord.com': 'Discord'
  };
  
  return siteMap[domain] || domain;
}

// Limpiar historial antiguo (mantener solo 7 días)
function cleanupOldHistory() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoffDate = sevenDaysAgo.toDateString();
  
  detailedStats.history = detailedStats.history.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= sevenDaysAgo;
  });
  
  chrome.storage.sync.set({ detailedStats });
}

// Generar CSV para exportación
function generateCSV() {
  const headers = ['Fecha', 'Sitio', 'Tiempo (minutos)'];
  const rows = [headers.join(',')];
  
  // Ordenar por fecha (más reciente primero)
  const sortedHistory = [...detailedStats.history].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  sortedHistory.forEach(entry => {
    const row = [
      formatDate(entry.date),
      entry.site,
      entry.time
    ];
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

// Formatear fecha para CSV
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// Actualizar badge cada minuto
setInterval(() => {
  updateBadge();
}, 60000); 