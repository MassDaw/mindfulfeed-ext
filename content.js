// Variables globales
let notificationElement = null;
let isNotificationVisible = false;

// Escuchar mensajes del background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showNotification') {
    showNotificationPopup(request.message);
  } else if (request.action === 'zenModeEnded') {
    showZenModeEndedNotification();
  }
});

// Verificar modo Zen al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  checkZenMode();
});

// Verificar modo Zen
function checkZenMode() {
  chrome.runtime.sendMessage({ action: 'checkZenMode' }, (response) => {
    if (response.zenMode && response.zenMode.active) {
      showZenModeWarning();
    }
  });
}

// Mostrar advertencia de modo Zen
function showZenModeWarning() {
  const overlay = document.createElement('div');
  overlay.id = 'zen-mode-overlay';
  overlay.className = 'zen-overlay';
  
  const modal = document.createElement('div');
  modal.id = 'zen-mode-modal';
  modal.className = 'zen-modal';
  modal.innerHTML = `
    <div class="zen-content">
      <div class="zen-header">
        <span class="zen-icon">🧘‍♀️</span>
        <span class="zen-title">Modo Zen Activo</span>
      </div>
      <div class="zen-message">
        Estás en modo enfoque. Respira hondo. ¿Seguro que quieres seguir navegando en este sitio?
      </div>
      <div class="zen-actions">
        <button class="zen-btn primary" id="zen-continue">Continuar</button>
        <button class="zen-btn secondary" id="zen-cancel">Cancelar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  document.body.appendChild(modal);
  
  setTimeout(() => {
    overlay.classList.add('show');
    modal.classList.add('show');
  }, 100);
  
  // Event listeners
  document.getElementById('zen-continue').addEventListener('click', () => {
    hideZenModeWarning();
  });
  
  document.getElementById('zen-cancel').addEventListener('click', () => {
    hideZenModeWarning();
    // Redirigir a una página neutral
    window.location.href = 'https://www.google.com';
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      hideZenModeWarning();
    }
  });
  
  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideZenModeWarning();
    }
  });
}

// Ocultar advertencia de modo Zen
function hideZenModeWarning() {
  const overlay = document.getElementById('zen-mode-overlay');
  const modal = document.getElementById('zen-mode-modal');
  
  if (overlay && modal) {
    overlay.classList.remove('show');
    modal.classList.remove('show');
    
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (modal.parentNode) modal.parentNode.removeChild(modal);
    }, 300);
  }
}

// Mostrar notificación de fin de modo Zen
function showZenModeEndedNotification() {
  const message = "¡Excelente! Has completado tu sesión de enfoque. 🎉 Tómate un descanso y celebra tu productividad.";
  showNotificationPopup(message);
}

// Crear y mostrar el popup de notificación
function showNotificationPopup(message) {
  if (isNotificationVisible) return;
  
  // Crear el overlay de fondo
  const overlay = document.createElement('div');
  overlay.id = 'stop-doomscrolling-overlay';
  overlay.className = 'notification-overlay';
  
  // Crear el elemento de notificación
  notificationElement = document.createElement('div');
  notificationElement.id = 'stop-doomscrolling-notification';
  notificationElement.className = 'notification-modal';
  notificationElement.innerHTML = `
    <div class="notification-content">
      <div class="notification-header">
        <div class="notification-title-section">
          <span class="notification-icon">⏰</span>
          <span class="notification-title">MindfulFeed</span>
        </div>
        <button class="notification-close" id="notification-close">×</button>
      </div>
      <div class="notification-message">
        ${message}
      </div>
      <div class="notification-actions">
        <button class="notification-btn primary" id="notification-ok">Entendido</button>
        <button class="notification-btn secondary" id="notification-ignore">Ignorar</button>
      </div>
    </div>
  `;
  
  // Agregar al DOM
  document.body.appendChild(overlay);
  document.body.appendChild(notificationElement);
  isNotificationVisible = true;
  
  // Animar entrada
  setTimeout(() => {
    overlay.classList.add('show');
    notificationElement.classList.add('show');
  }, 100);
  
  // Event listeners
  document.getElementById('notification-close').addEventListener('click', hideNotification);
  document.getElementById('notification-ok').addEventListener('click', hideNotification);
  document.getElementById('notification-ignore').addEventListener('click', hideNotification);
  
  // Cerrar con Escape
  document.addEventListener('keydown', handleKeydown);
  
  // Cerrar al hacer clic en el overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      hideNotification();
    }
  });
  
  // Auto-cerrar después de 30 segundos
  setTimeout(() => {
    if (isNotificationVisible) {
      hideNotification();
    }
  }, 30000);
}

// Ocultar notificación
function hideNotification() {
  if (!notificationElement || !isNotificationVisible) return;
  
  const overlay = document.getElementById('stop-doomscrolling-overlay');
  
  notificationElement.classList.remove('show');
  notificationElement.classList.add('hide');
  if (overlay) {
    overlay.classList.remove('show');
    overlay.classList.add('hide');
  }
  
  setTimeout(() => {
    if (notificationElement && notificationElement.parentNode) {
      notificationElement.parentNode.removeChild(notificationElement);
    }
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    notificationElement = null;
    isNotificationVisible = false;
  }, 300);
  
  // Remover event listeners
  document.removeEventListener('keydown', handleKeydown);
}

// Manejar teclas
function handleKeydown(event) {
  if (event.key === 'Escape') {
    hideNotification();
  }
}

// Limpiar al salir de la página
window.addEventListener('beforeunload', () => {
  if (notificationElement) {
    hideNotification();
  }
}); 