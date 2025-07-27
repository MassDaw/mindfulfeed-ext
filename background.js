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
  console.log('[MindfulFeed] Extensión instalada/actualizada');
  
  chrome.storage.sync.get(['config', 'zenMode', 'dailyStats', 'detailedStats'], (result) => {
    console.log('[MindfulFeed] Configuración cargada:', result);
    
    if (!result.config) {
      console.log('[MindfulFeed] Configuración no encontrada, usando valores por defecto');
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
    
    console.log('[MindfulFeed] Configuración final:', config);
    
    // Limpiar historial antiguo
    cleanupOldHistory();
    
    // Verificar si el modo Zen expiró
    checkZenModeExpiration();
    
    // Actualizar badge con tiempo actual
    updateBadge();
    
    // Actualizar badge cada 10 segundos para mejor feedback
    setInterval(() => {
      updateBadge();
    }, 10000);
    
    // Actualizar estadísticas diarias cada minuto
    setInterval(() => {
      updateDailyStats();
    }, 60000);
    
    // Verificar pestaña actual al cargar
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        const domain = new URL(tabs[0].url).hostname;
        console.log(`[MindfulFeed] Pestaña actual al cargar: ${domain} (${tabs[0].id})`);
        if (isMonitoredSite(domain)) {
          startTracking(domain, tabs[0].id);
        }
      }
    });
  });
});

// Escuchar cambios en la configuración
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    console.log('[MindfulFeed] Cambios en storage:', changes);
    if (changes.config) {
      config = changes.config.newValue;
      
      // Limpiar configuración antigua si existe
      if (config.notificationsPaused !== undefined) {
        delete config.notificationsPaused;
        chrome.storage.sync.set({ config });
      }
      if (config.pauseEndTime !== undefined) {
        delete config.pauseEndTime;
        chrome.storage.sync.set({ config });
      }
      
      console.log('[MindfulFeed] Nueva configuración:', config);
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

// Listener para cuando la extensión se inicia
chrome.runtime.onStartup.addListener(() => {
  console.log('[MindfulFeed] Extensión iniciada');
  // Cargar configuración al iniciar
  chrome.storage.sync.get(['config'], (result) => {
    if (result.config) {
      config = result.config;
      console.log('[MindfulFeed] Configuración cargada al iniciar:', config);
    }
  });
});

// Listener para cuando la extensión se activa
chrome.runtime.onStartup.addListener(() => {
  console.log('[MindfulFeed] Extensión activada');
  // Verificar pestaña actual cuando se activa
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      const domain = new URL(tabs[0].url).hostname;
      console.log(`[MindfulFeed] Pestaña actual al activar: ${domain} (${tabs[0].id})`);
      if (isMonitoredSite(domain)) {
        startTracking(domain, tabs[0].id);
      }
    }
  });
});

// Manejar cambios de pestaña
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      const domain = new URL(tab.url).hostname;
      console.log(`[MindfulFeed] Tab activada: ${domain} (${activeInfo.tabId})`);
      
      if (isMonitoredSite(domain)) {
        console.log(`[MindfulFeed] Sitio monitoreado detectado: ${domain}`);
        // Verificar si el Modo Zen está activo y bloquear si es necesario
        if (checkZenModeBlocking(activeInfo.tabId, tab.url)) {
          // Si está bloqueado, no iniciar tracking
          console.log(`[MindfulFeed] Modo Zen activo, no iniciando tracking`);
          return;
        }
        startTracking(domain, activeInfo.tabId);
      } else {
        console.log(`[MindfulFeed] Sitio no monitoreado: ${domain}`);
        stopTracking(activeInfo.tabId);
      }
    } else {
      console.log(`[MindfulFeed] Tab sin URL: ${activeInfo.tabId}`);
    }
  });
});

// Manejar actualizaciones de pestañas
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const domain = new URL(tab.url).hostname;
    console.log(`[MindfulFeed] Tab actualizada: ${domain} (${tabId})`);
    
    if (isMonitoredSite(domain)) {
      console.log(`[MindfulFeed] Sitio monitoreado detectado en actualización: ${domain}`);
      // Verificar si el Modo Zen está activo y bloquear si es necesario
      if (checkZenModeBlocking(tabId, tab.url)) {
        // Si está bloqueado, no iniciar tracking
        console.log(`[MindfulFeed] Modo Zen activo en actualización, no iniciando tracking`);
        return;
      }
      startTracking(domain, tabId);
    } else {
      console.log(`[MindfulFeed] Sitio no monitoreado en actualización: ${domain}`);
      stopTracking(tabId);
    }
  }
});

// Manejar cierre de pestañas
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log(`[MindfulFeed] Tab cerrada: ${tabId}`);
  stopTracking(tabId);
});

// Verificar si un sitio está siendo monitoreado
function isMonitoredSite(domain) {
  const isMonitored = config.sites.some(site => domain.includes(site));
  console.log(`[MindfulFeed] Verificando ${domain} - Monitoreado: ${isMonitored}, Sitios configurados:`, config.sites);
  return isMonitored;
}

// Verificar si el Modo Zen está activo y bloquear navegación
function checkZenModeBlocking(tabId, url) {
  if (!zenMode.active) return false;
  
  // Verificar que tabId es válido
  if (!tabId || tabId <= 0) {
    console.log(`[MindfulFeed] TabId inválido para bloqueo: ${tabId}`);
    return false;
  }
  
  // Convertir a número si es string
  const numericTabId = parseInt(tabId);
  if (isNaN(numericTabId)) {
    console.log(`[MindfulFeed] TabId no es un número válido para bloqueo: ${tabId}`);
    return false;
  }
  
  try {
    const domain = new URL(url).hostname;
    if (isMonitoredSite(domain)) {
      console.log(`[MindfulFeed] Modo Zen activo - Bloqueando navegación a: ${url}`);
      
      // Verificar que la pestaña existe antes de enviar mensaje
      try {
        chrome.tabs.get(tabId, (tab) => {
          if (chrome.runtime.lastError) {
            console.log(`[MindfulFeed] Error al obtener tab ${tabId} para bloqueo:`, chrome.runtime.lastError);
            return;
          }
          
          if (!tab) {
            console.log(`[MindfulFeed] Tab ${tabId} no existe para bloqueo`);
            return;
          }
          
          // Enviar mensaje al content script para mostrar el modal de confirmación
          chrome.tabs.sendMessage(tabId, {
            action: 'showZenModeBlocking',
            url: url
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.log(`[MindfulFeed] Error al enviar mensaje de bloqueo a tab ${tabId}:`, chrome.runtime.lastError);
            }
          });
        });
      } catch (error) {
        console.log(`[MindfulFeed] Error al llamar chrome.tabs.get para bloqueo:`, error);
      }
      
      return true;
    }
  } catch (e) {
    console.log(`[MindfulFeed] Error al verificar URL: ${url}`, e);
  }
  
  return false;
}

// Iniciar seguimiento de actividad
function startTracking(domain, tabId) {
  console.log(`[MindfulFeed] startTracking llamado - Domain: ${domain}, TabId: ${tabId}, Config enabled: ${config.enabled}`);
  
  if (!config.enabled) {
    console.log(`[MindfulFeed] Tracking deshabilitado`);
    return;
  }
  
  const now = Date.now();
  userActivity[tabId] = {
    domain,
    startTime: now,
    lastActivity: now
  };
  
  // Inicializar sesión persistente si no existe
  if (!config.currentSessionStart) {
    config.currentSessionStart = now;
    chrome.storage.sync.set({ config });
    console.log(`[MindfulFeed] Sesión persistente iniciada`);
  }
  
  console.log(`[MindfulFeed] Tracking iniciado para ${domain} en tab ${tabId}`);
  console.log(`[MindfulFeed] Actividad actual:`, userActivity);
  
  // Actualizar badge
  updateBadge();
  
  // Programar la primera notificación
  scheduleNotification(tabId);
}

// Detener seguimiento
function stopTracking(tabId) {
  if (userActivity[tabId]) {
    console.log(`[MindfulFeed] Deteniendo tracking para tab ${tabId}`);
    
    // Limpiar timer de notificación
    if (userActivity[tabId].notificationTimer) {
      clearTimeout(userActivity[tabId].notificationTimer);
    }
    
    // Calcular tiempo acumulado
    const sessionTime = Math.floor((Date.now() - userActivity[tabId].startTime) / 60000); // en minutos
    console.log(`[MindfulFeed] Tiempo de sesión acumulado: ${sessionTime} minutos`);
    
    // Solo agregar a estadísticas si el tiempo es mayor a 0
    if (sessionTime > 0) {
      addToDailyStats(sessionTime);
      addToDetailedStats(userActivity[tabId].domain, sessionTime);
      console.log(`[MindfulFeed] Estadísticas actualizadas - Tiempo diario: ${dailyStats.totalTime} minutos`);
    }
    
    delete userActivity[tabId];
    updateBadge();
  }
}

// Programar notificación
function scheduleNotification(tabId) {
  if (!userActivity[tabId]) return;
  
  // Verificar que tabId es válido
  if (!tabId || tabId <= 0) {
    console.log(`[MindfulFeed] TabId inválido para programar notificación: ${tabId}`);
    return;
  }
  
  // Convertir a número si es string
  const numericTabId = parseInt(tabId);
  if (isNaN(numericTabId)) {
    console.log(`[MindfulFeed] TabId no es un número válido: ${tabId}`);
    return;
  }
  

  
  // Limpiar timer anterior si existe
  if (userActivity[tabId].notificationTimer) {
    clearTimeout(userActivity[tabId].notificationTimer);
  }
  
  const intervalMs = (config && config.interval ? config.interval : 10) * 60 * 1000; // convertir a milisegundos
  console.log(`[MindfulFeed] Programando notificación para tab ${tabId} en ${intervalMs}ms (${config.interval || 10} minutos)`);
  
  userActivity[tabId].notificationTimer = setTimeout(() => {
    if (userActivity[tabId]) {
      showNotification(tabId);
    }
  }, intervalMs);
}

// Mostrar notificación
function showNotification(tabId) {
  if (!userActivity[tabId] || !config.enabled) return;
  
  // Verificar que tabId es válido
  if (!tabId || tabId <= 0) {
    console.log(`[MindfulFeed] TabId inválido: ${tabId}`);
    return;
  }
  
  // Convertir a número si es string
  const numericTabId = parseInt(tabId);
  if (isNaN(numericTabId)) {
    console.log(`[MindfulFeed] TabId no es un número válido: ${tabId}`);
    return;
  }
  
  console.log(`[MindfulFeed] Mostrando notificación en tab ${tabId}`);
  
  // Verificar que la pestaña existe antes de enviar mensaje
  try {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.log(`[MindfulFeed] Error al obtener tab ${tabId}:`, chrome.runtime.lastError);
        return;
      }
      
      if (!tab) {
        console.log(`[MindfulFeed] Tab ${tabId} no existe`);
        return;
      }
      
      // Obtener mensaje aleatorio de las categorías activas
      const randomMessage = getRandomMessage();
      
          chrome.tabs.sendMessage(tabId, {
      action: 'showNotification',
      message: randomMessage
    }, (response) => {
              if (chrome.runtime.lastError) {
          console.log(`[MindfulFeed] Error al enviar mensaje a tab ${tabId}:`, chrome.runtime.lastError);
          // En Manifest V3, el content script se inyecta automáticamente
          // Solo logear el error y continuar
        }
    });
    });
  } catch (error) {
    console.log(`[MindfulFeed] Error al llamar chrome.tabs.get:`, error);
  }
  
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
  console.log('[MindfulFeed] Mensaje recibido:', request.action, request);
  
  if (request.action === 'getConfig') {
    sendResponse(config);
  } else if (request.action === 'updateConfig') {
    config = request.config;
    chrome.storage.sync.set({ config });
    resetTimers();
    sendResponse({ success: true });
  } else if (request.action === 'getStats') {
    const currentSession = getCurrentSessionTime();
    const minutes = Math.floor(currentSession / 60000);
    const seconds = Math.floor((currentSession % 60000) / 1000);
    console.log('[MindfulFeed] getStats - Sesión actual:', currentSession, `(${minutes}m ${seconds}s)`);
    sendResponse({
      dailyStats,
      zenMode,
      currentSession: currentSession,
      currentSessionMinutes: Math.max(1, minutes) // Mostrar al menos 1 minuto si hay actividad
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
  } else if (request.action === 'resetStats') {
    console.log(`[MindfulFeed] Reiniciando estadísticas`);
    resetStats();
    sendResponse({ success: true });
  } else if (request.action === 'stopZenMode') {
    console.log(`[MindfulFeed] Deteniendo modo Zen`);
    stopZenMode();
    sendResponse({ success: true, zenMode: zenMode });
  }
});

// Actualizar badge del ícono
function updateBadge() {
  const currentTime = getCurrentSessionTime();
  const minutes = Math.floor(currentTime / 60000);
  const seconds = Math.floor((currentTime % 60000) / 1000);
  
  console.log(`[MindfulFeed] Badge update - Tiempo actual: ${currentTime}ms (${minutes}m ${seconds}s), Actividad:`, Object.keys(userActivity));
  
  if (zenMode.active) {
    const remainingTime = Math.max(0, zenMode.endTime - Date.now());
    const remainingMinutes = Math.ceil(remainingTime / 60000);
    chrome.action.setBadgeText({ text: remainingMinutes.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' }); // Verde para modo Zen
  } else if (currentTime > 0) {
    // Mostrar al menos 1 minuto si hay actividad
    const displayMinutes = Math.max(1, minutes);
    chrome.action.setBadgeText({ text: displayMinutes.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' }); // Rojo para tiempo activo
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Obtener tiempo de sesión actual
function getCurrentSessionTime() {
  const now = Date.now();
  let totalTime = 0;
  
  // Calcular tiempo de pestañas activas
  Object.values(userActivity).forEach(activity => {
    totalTime += now - activity.startTime;
  });
  
  console.log(`[MindfulFeed] getCurrentSessionTime - Actividad:`, userActivity);
  console.log(`[MindfulFeed] getCurrentSessionTime - Tiempo total: ${totalTime}ms (${Math.floor(totalTime / 60000)} minutos)`);
  
  return totalTime;
}

// Obtener tiempo de sesión actual en milisegundos (para estadísticas)
function getCurrentSessionTimeMs() {
  return getCurrentSessionTime();
}

// Pausar solo las notificaciones por un tiempo específico


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
  console.log(`[MindfulFeed] Estadísticas diarias actualizadas: ${dailyStats.totalTime} minutos`);
}

// Actualizar estadísticas diarias con el tiempo actual
function updateDailyStats() {
  const currentTime = getCurrentSessionTime();
  const minutes = Math.floor(currentTime / 60000);
  
  // Solo actualizar si hay actividad activa
  if (minutes > 0 && Object.keys(userActivity).length > 0) {
    const today = new Date().toDateString();
    
    // Resetear estadísticas si es un nuevo día
    if (dailyStats.lastReset !== today) {
      dailyStats.totalTime = 0;
      dailyStats.lastReset = today;
    }
    
    // Actualizar solo si hay diferencia
    if (dailyStats.totalTime !== minutes) {
      dailyStats.totalTime = minutes;
      chrome.storage.sync.set({ dailyStats });
      console.log(`[MindfulFeed] Estadísticas diarias actualizadas automáticamente: ${dailyStats.totalTime} minutos`);
      
      // Agregar al historial detallado cada 5 minutos
      const now = Date.now();
      if (!dailyStats.lastHistoryUpdate || (now - dailyStats.lastHistoryUpdate) > 300000) { // 5 minutos
        Object.keys(userActivity).forEach(tabId => {
          const activity = userActivity[tabId];
          if (activity && activity.domain) {
            addToDetailedStats(activity.domain, minutes);
            console.log(`[MindfulFeed] Guardado automático en historial: ${activity.domain} - ${minutes} minutos`);
          }
        });
        dailyStats.lastHistoryUpdate = now;
        chrome.storage.sync.set({ dailyStats });
      }
    }
  }
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

// Reiniciar estadísticas y guardar en historial
function resetStats() {
  const currentTime = getCurrentSessionTime();
  const minutes = Math.floor(currentTime / 60000);
  
  console.log(`[MindfulFeed] Reiniciando estadísticas - Tiempo actual: ${minutes} minutos`);
  
  if (minutes > 0) {
    // Agregar al historial detallado para todos los sitios activos
    Object.keys(userActivity).forEach(tabId => {
      const activity = userActivity[tabId];
      if (activity && activity.domain) {
        addToDetailedStats(activity.domain, minutes);
        console.log(`[MindfulFeed] Guardado en historial: ${activity.domain} - ${minutes} minutos`);
      }
    });
    
    // Si no hay actividad activa pero hay tiempo en dailyStats, guardar eso
    if (Object.keys(userActivity).length === 0 && dailyStats.totalTime > 0) {
      const today = new Date().toDateString();
      detailedStats.history.push({
        date: today,
        site: 'Tiempo total',
        time: dailyStats.totalTime
      });
      chrome.storage.sync.set({ detailedStats });
      console.log(`[MindfulFeed] Guardado tiempo total en historial: ${dailyStats.totalTime} minutos`);
    }
    
    // Reiniciar contador diario
    dailyStats.totalTime = 0;
    chrome.storage.sync.set({ dailyStats });
    
    // Limpiar actividad actual
    userActivity = {};
    
    console.log(`[MindfulFeed] Estadísticas reiniciadas. Tiempo guardado: ${minutes} minutos`);
  } else {
    console.log(`[MindfulFeed] No hay tiempo para guardar en historial`);
  }
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