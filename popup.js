// Variables globales
let currentConfig = {};
let editingMessageIndex = -1;
let editingCategoryId = null;

// Sitios disponibles por defecto
const availableSites = [
  { domain: 'twitter.com', name: 'Twitter' },
  { domain: 'reddit.com', name: 'Reddit' },
  { domain: 'facebook.com', name: 'Facebook' },
  { domain: 'youtube.com', name: 'YouTube' },
  { domain: 'tiktok.com', name: 'TikTok' },
  { domain: 'instagram.com', name: 'Instagram' },
  { domain: 'linkedin.com', name: 'LinkedIn' },
  { domain: 'pinterest.com', name: 'Pinterest' },
  { domain: 'snapchat.com', name: 'Snapchat' },
  { domain: 'discord.com', name: 'Discord' }
];

// Íconos para categorías
const categoryIcons = {
  humor: '😄',
  motivacional: '💪',
  filosofico: '🤔',
  mindfulness: '🧘‍♀️',
  default: '💭'
};

// Inicializar popup
document.addEventListener('DOMContentLoaded', () => {
  loadConfig();
  setupEventListeners();
});

// Cargar configuración
function loadConfig() {
  chrome.runtime.sendMessage({ action: 'getConfig' }, (config) => {
    if (config) {
      currentConfig = config;
      updateUI();
    }
  });
}

// Configurar event listeners
function setupEventListeners() {
  // Toggle principal
  document.getElementById('main-toggle').addEventListener('click', toggleExtension);
  
  // Botón guardar
  document.getElementById('save-config').addEventListener('click', saveConfig);
  
  // Botón agregar categoría
  document.getElementById('add-category').addEventListener('click', addNewCategory);
  
  // Intervalo
  document.getElementById('interval').addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    currentConfig.interval = isNaN(value) ? 10 : Math.max(1, Math.min(60, value));
  });
  
  // Modo Zen
  document.getElementById('zen-toggle').addEventListener('click', toggleZenConfig);
  document.getElementById('start-zen').addEventListener('click', startZenMode);
  document.getElementById('cancel-zen').addEventListener('click', cancelZenConfig);
  document.getElementById('stop-zen').addEventListener('click', stopZenMode);
  
  // Pestañas
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });
  
  // Estadísticas
  document.getElementById('export-csv').addEventListener('click', exportStats);
  document.getElementById('clear-stats').addEventListener('click', clearStats);
  document.getElementById('reset-stats').addEventListener('click', resetStats);
}

// Actualizar UI con la configuración actual
function updateUI() {
  // Toggle principal
  const toggle = document.getElementById('main-toggle');
  if (currentConfig.enabled) {
    toggle.classList.add('active');
  } else {
    toggle.classList.remove('active');
  }
  
  // Intervalo
  document.getElementById('interval').value = currentConfig.interval !== undefined ? currentConfig.interval : 10;
  
  // Sitios
  renderSitesList();
  
  // Categorías de mensajes
  renderCategoriesList();
  
  // Cargar estadísticas
  loadStats();
  
  // Iniciar actualización en tiempo real
  startStatsUpdate();
  
  // Cargar estadísticas detalladas
  loadDetailedStats();
}

// Renderizar lista de sitios
function renderSitesList() {
  const sitesList = document.getElementById('sites-list');
  sitesList.innerHTML = '';
  
  availableSites.forEach(site => {
    const isChecked = currentConfig.sites && currentConfig.sites.includes(site.domain);
    
    const siteItem = document.createElement('div');
    siteItem.className = 'site-item';
    siteItem.innerHTML = `
      <input type="checkbox" id="site-${site.domain}" ${isChecked ? 'checked' : ''}>
      <label for="site-${site.domain}">${site.name}</label>
    `;
    
    siteItem.querySelector('input').addEventListener('change', (e) => {
      if (!currentConfig.sites) currentConfig.sites = [];
      
      if (e.target.checked) {
        if (!currentConfig.sites.includes(site.domain)) {
          currentConfig.sites.push(site.domain);
        }
      } else {
        currentConfig.sites = currentConfig.sites.filter(s => s !== site.domain);
      }
    });
    
    sitesList.appendChild(siteItem);
  });
}

// Renderizar lista de categorías
function renderCategoriesList() {
  const categoriesContainer = document.getElementById('categories-container');
  categoriesContainer.innerHTML = '';
  
  if (!currentConfig.messageCategories) {
    // Migrar configuración antigua si es necesario
    if (currentConfig.messages) {
      currentConfig.messageCategories = {
        motivacional: {
          name: "Motivacional",
          enabled: true,
          messages: currentConfig.messages
        }
      };
      delete currentConfig.messages;
    } else {
      currentConfig.messageCategories = {};
    }
  }
  
  Object.entries(currentConfig.messageCategories).forEach(([categoryId, category]) => {
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item';
    categoryItem.innerHTML = `
      <div class="category-header">
        <div class="category-title">
          <span class="category-icon">${categoryIcons[categoryId] || categoryIcons.default}</span>
          ${category.name}
        </div>
        <div class="category-toggle ${category.enabled ? 'active' : ''}" data-category="${categoryId}"></div>
      </div>
      <div class="category-content" data-category="${categoryId}">
        <div class="messages-list" data-category="${categoryId}">
          ${category.messages.length > 0 ? 
            category.messages.map((message, index) => `
              <div class="message-item">
                <div class="message-text">${message}</div>
                <div class="message-actions">
                  <button class="btn btn-edit" data-category="${categoryId}" data-index="${index}">✏️</button>
                  <button class="btn btn-delete" data-category="${categoryId}" data-index="${index}">🗑️</button>
                </div>
              </div>
            `).join('') :
            '<div class="empty-messages">No hay mensajes en esta categoría. ¡Agrega el primero!</div>'
          }
        </div>
        <button class="btn btn-add-message" data-category="${categoryId}">+ Agregar mensaje</button>
        <div class="category-actions">
          <button class="btn btn-rename" data-category="${categoryId}">✏️ Renombrar</button>
          <button class="btn btn-delete-category" data-category="${categoryId}">🗑️ Eliminar categoría</button>
        </div>
      </div>
    `;
    
    // Event listeners para la categoría
    const toggle = categoryItem.querySelector('.category-toggle');
    toggle.addEventListener('click', () => {
      toggleCategory(categoryId);
    });
    
    // Event listeners para mensajes
    categoryItem.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        editMessage(btn.dataset.category, parseInt(btn.dataset.index));
      });
    });
    
    categoryItem.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        deleteMessage(btn.dataset.category, parseInt(btn.dataset.index));
      });
    });
    
    // Event listener para agregar mensaje
    categoryItem.querySelector('.btn-add-message').addEventListener('click', () => {
      addNewMessage(categoryId);
    });
    
    // Event listeners para acciones de categoría
    categoryItem.querySelector('.btn-rename').addEventListener('click', () => {
      renameCategory(categoryId);
    });
    
    categoryItem.querySelector('.btn-delete-category').addEventListener('click', () => {
      deleteCategory(categoryId);
    });
    
    // Event listener para expandir/contraer categoría
    categoryItem.querySelector('.category-header').addEventListener('click', (e) => {
      if (e.target !== toggle) {
        toggleCategoryExpansion(categoryId);
      }
    });
    
    categoriesContainer.appendChild(categoryItem);
  });
}

// Toggle categoría (activar/desactivar)
function toggleCategory(categoryId) {
  currentConfig.messageCategories[categoryId].enabled = !currentConfig.messageCategories[categoryId].enabled;
  renderCategoriesList();
}

// Expandir/contraer categoría
function toggleCategoryExpansion(categoryId) {
  const content = document.querySelector(`.category-content[data-category="${categoryId}"]`);
  const categoryItem = content.closest('.category-item');
  
  content.classList.toggle('expanded');
  categoryItem.classList.toggle('expanded');
}

// Editar mensaje
function editMessage(categoryId, index) {
  const message = currentConfig.messageCategories[categoryId].messages[index];
  const newMessage = prompt('Editar mensaje:', message);
  
  if (newMessage !== null && newMessage.trim() !== '') {
    currentConfig.messageCategories[categoryId].messages[index] = newMessage.trim();
    renderCategoriesList();
  }
}

// Eliminar mensaje
function deleteMessage(categoryId, index) {
  if (confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
    currentConfig.messageCategories[categoryId].messages.splice(index, 1);
    renderCategoriesList();
  }
}

// Agregar nuevo mensaje
function addNewMessage(categoryId) {
  const newMessage = prompt('Agregar nuevo mensaje:');
  
  if (newMessage !== null && newMessage.trim() !== '') {
    if (!currentConfig.messageCategories[categoryId].messages) {
      currentConfig.messageCategories[categoryId].messages = [];
    }
    currentConfig.messageCategories[categoryId].messages.push(newMessage.trim());
    renderCategoriesList();
    
    // Expandir la categoría automáticamente después de agregar un mensaje
    setTimeout(() => {
      const content = document.querySelector(`.category-content[data-category="${categoryId}"]`);
      if (content) {
        content.classList.add('expanded');
        content.closest('.category-item').classList.add('expanded');
      }
    }, 100);
  }
}

// Renombrar categoría
function renameCategory(categoryId) {
  const currentName = currentConfig.messageCategories[categoryId].name;
  const newName = prompt('Renombrar categoría:', currentName);
  
  if (newName !== null && newName.trim() !== '') {
    currentConfig.messageCategories[categoryId].name = newName.trim();
    renderCategoriesList();
  }
}

// Eliminar categoría
function deleteCategory(categoryId) {
  if (confirm('¿Estás seguro de que quieres eliminar esta categoría? Todos los mensajes se perderán.')) {
    delete currentConfig.messageCategories[categoryId];
    renderCategoriesList();
  }
}

// Agregar nueva categoría
function addNewCategory() {
  const categoryName = prompt('Nombre de la nueva categoría:');
  
  if (categoryName !== null && categoryName.trim() !== '') {
    const categoryId = 'custom_' + Date.now();
    currentConfig.messageCategories[categoryId] = {
      name: categoryName.trim(),
      enabled: true,
      messages: []
    };
    renderCategoriesList();
    
    // Expandir la nueva categoría automáticamente
    setTimeout(() => {
      const content = document.querySelector(`.category-content[data-category="${categoryId}"]`);
      if (content) {
        content.classList.add('expanded');
        content.closest('.category-item').classList.add('expanded');
      }
    }, 100);
  }
}

// Toggle extensión
function toggleExtension() {
  currentConfig.enabled = !currentConfig.enabled;
  const toggle = document.getElementById('main-toggle');
  
  if (currentConfig.enabled) {
    toggle.classList.add('active');
  } else {
    toggle.classList.remove('active');
  }
}

// Guardar configuración
function saveConfig() {
  const saveBtn = document.getElementById('save-config');
  const status = document.getElementById('status');
  
  // Validar configuración
  if (!currentConfig.sites || currentConfig.sites.length === 0) {
    showStatus('Debes seleccionar al menos un sitio para monitorear', 'error');
    return;
  }
  
  // Validar que haya al menos una categoría con mensajes
  if (!currentConfig.messageCategories) {
    showStatus('Debes configurar al menos una categoría de mensajes', 'error');
    return;
  }
  
  const activeCategories = Object.values(currentConfig.messageCategories).filter(category => category.enabled);
  if (activeCategories.length === 0) {
    showStatus('Debes tener al menos una categoría activa', 'error');
    return;
  }
  
  const hasMessages = activeCategories.some(category => category.messages && category.messages.length > 0);
  if (!hasMessages) {
    showStatus('Debes agregar al menos un mensaje en las categorías activas', 'error');
    return;
  }
  
  if (currentConfig.interval < 1 || currentConfig.interval > 60) {
    showStatus('El intervalo debe estar entre 1 y 60 minutos', 'error');
    return;
  }
  
  // Deshabilitar botón
  saveBtn.disabled = true;
  saveBtn.textContent = 'Guardando...';
  
  // Enviar configuración al background script
  chrome.runtime.sendMessage({
    action: 'updateConfig',
    config: currentConfig
  }, (response) => {
    if (response && response.success) {
      showStatus('✅ Configuración guardada exitosamente', 'success');
    } else {
      showStatus('❌ Error al guardar la configuración', 'error');
    }
    
    // Rehabilitar botón
    saveBtn.disabled = false;
    saveBtn.textContent = '💾 Guardar configuración';
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      hideStatus();
    }, 3000);
  });
}

// Mostrar mensaje de estado
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
}

// Ocultar mensaje de estado
function hideStatus() {
  const status = document.getElementById('status');
  status.style.display = 'none';
}

// Cargar estadísticas
function loadStats() {
  chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
    if (response) {
      // Actualizar tiempo total (único contador)
      const totalMinutes = response.dailyStats.totalTime || 0;
      document.getElementById('daily-time').textContent = totalMinutes;
      
      // Actualizar estado del modo Zen
      updateZenStatus(response.zenMode);
    }
  });
}

// Actualizar estadísticas en tiempo real
function startStatsUpdate() {
  // Actualizar inmediatamente
  loadStats();
  
  // Actualizar cada 5 segundos para mejor feedback
  setInterval(() => {
    loadStats();
  }, 5000);
}

// Actualizar estado del modo Zen
function updateZenStatus(zenMode) {
  const zenStatus = document.getElementById('zen-status');
  const zenToggle = document.getElementById('zen-toggle');
  const zenStop = document.getElementById('stop-zen');
  const zenTime = document.getElementById('zen-time');
  const statusText = document.querySelector('.zen-status-text');
  
  if (zenMode && zenMode.active) {
    zenStatus.classList.add('active');
    zenToggle.textContent = 'Iniciar Modo Zen';
    zenToggle.classList.remove('active');
    zenStop.style.display = 'block';
    
    const remainingTime = Math.max(0, zenMode.endTime - Date.now());
    const remainingMinutes = Math.ceil(remainingTime / 60000);
    const remainingSeconds = Math.ceil((remainingTime % 60000) / 1000);
    
    zenTime.textContent = `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')} restantes`;
    statusText.textContent = 'Activo';
    
    // Actualizar cada segundo
    setTimeout(() => {
      updateZenStatus(zenMode);
    }, 1000);
  } else {
    zenStatus.classList.remove('active');
    zenToggle.textContent = 'Iniciar Modo Zen';
    zenToggle.classList.remove('active');
    zenStop.style.display = 'none';
    zenTime.textContent = '';
    statusText.textContent = 'Inactivo';
  }
}

// Toggle configuración del modo Zen
function toggleZenConfig() {
  const zenConfig = document.getElementById('zen-config');
  const zenToggle = document.getElementById('zen-toggle');
  
  if (zenToggle.classList.contains('active')) {
    // Detener modo Zen
    chrome.runtime.sendMessage({ action: 'stopZenMode' }, (response) => {
      if (response && response.success) {
        zenConfig.style.display = 'none';
        loadStats();
      }
    });
  } else {
    // Mostrar configuración
    zenConfig.style.display = 'block';
  }
}

// Iniciar modo Zen
function startZenMode() {
  const duration = parseInt(document.getElementById('zen-duration').value) || 25;
  
  chrome.runtime.sendMessage({ 
    action: 'startZenMode', 
    duration: duration 
  }, (response) => {
    if (response && response.success) {
      document.getElementById('zen-config').style.display = 'none';
      loadStats();
      showStatus('🧘‍♀️ Modo Zen iniciado', 'success');
    }
  });
}

// Cancelar configuración del modo Zen
function cancelZenConfig() {
  document.getElementById('zen-config').style.display = 'none';
}

// Detener modo Zen
function stopZenMode() {
  chrome.runtime.sendMessage({ action: 'stopZenMode' }, (response) => {
    if (response && response.success) {
      updateZenStatus(response.zenMode);
      showStatus('🧘‍♀️ Modo Zen detenido', 'success');
    }
  });
}

// Cambiar pestaña
function switchTab(tabName) {
  // Actualizar botones de pestaña
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Actualizar contenido de pestaña
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  // Cargar datos específicos de la pestaña
  if (tabName === 'stats') {
    loadDetailedStats();
  }
}

// Cargar estadísticas detalladas
function loadDetailedStats() {
  chrome.runtime.sendMessage({ action: 'getDetailedStats' }, (response) => {
    if (response && response.detailedStats) {
      renderStatsTable(response.detailedStats.history || []);
    }
  });
}

// Renderizar tabla de estadísticas
function renderStatsTable(history) {
  const tbody = document.getElementById('stats-tbody');
  const noData = document.getElementById('no-data');
  
  if (history.length === 0) {
    tbody.innerHTML = '';
    noData.style.display = 'block';
    return;
  }
  
  noData.style.display = 'none';
  
  // Ordenar por fecha (más reciente primero)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  tbody.innerHTML = sortedHistory.map(entry => `
    <tr>
      <td>${formatDate(entry.date)}</td>
      <td>${entry.site}</td>
      <td>${entry.time}</td>
    </tr>
  `).join('');
}

// Formatear fecha para mostrar
function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Hoy';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Ayer';
  } else {
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
}

// Exportar estadísticas como CSV
function exportStats() {
  chrome.runtime.sendMessage({ action: 'exportStats' }, (response) => {
    if (response && response.csvData) {
      const blob = new Blob([response.csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `stop-doomscrolling-stats-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showStatus('✅ Estadísticas exportadas exitosamente', 'success');
    }
  });
}

// Limpiar historial de estadísticas
function clearStats() {
  if (confirm('¿Estás seguro de que quieres limpiar todo el historial de estadísticas? Esta acción no se puede deshacer.')) {
    chrome.runtime.sendMessage({ action: 'clearStats' }, (response) => {
      if (response && response.success) {
        loadDetailedStats();
        showStatus('🗑️ Historial limpiado exitosamente', 'success');
      }
    });
  }
}

// Reiniciar contador y guardar en historial
function resetStats() {
  if (confirm('¿Reiniciar el contador y guardar el tiempo actual en el historial?')) {
    chrome.runtime.sendMessage({ action: 'resetStats' }, (response) => {
      if (response && response.success) {
        loadStats();
        loadDetailedStats();
        showStatus('🔄 Contador reiniciado y guardado en historial', 'success');
      }
    });
  }
}

// Restaurar configuración por defecto
function resetToDefaults() {
  if (confirm('¿Estás seguro de que quieres restaurar la configuración por defecto? Esto eliminará todos tus cambios.')) {
    currentConfig = {
      sites: [
        "twitter.com",
        "reddit.com", 
        "facebook.com",
        "youtube.com",
        "tiktok.com",
        "instagram.com"
      ],
      interval: 10,
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
    
    updateUI();
    showStatus('✅ Configuración restaurada por defecto', 'success');
  }
} 