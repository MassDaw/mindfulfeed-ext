// Variables globales
let notificationElement = null;
let isNotificationVisible = false;

// Escuchar mensajes del background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showNotification') {
    showNotificationPopup(request.message);
  } else if (request.action === 'zenModeEnded') {
  showZenModeEndedNotification();
} else if (request.action === 'showZenModeBlocking') {
  showZenModeBlockingModal(request.url);
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
    // Desactivar modo Zen cuando el usuario acepta continuar
    chrome.runtime.sendMessage({ action: 'stopZenMode' });
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

// Mostrar modal de bloqueo del Modo Zen
function showZenModeBlockingModal(url) {
  console.log(`[MindfulFeed] Mostrando modal de bloqueo para: ${url}`);
  
  // Crear el overlay de fondo
  const overlay = document.createElement('div');
  overlay.id = 'zen-mode-blocking-overlay';
  overlay.className = 'zen-blocking-overlay';
  
  // Crear el modal de bloqueo
  const modal = document.createElement('div');
  modal.id = 'zen-mode-blocking-modal';
  modal.className = 'zen-blocking-modal';
  modal.innerHTML = `
    <div class="zen-blocking-content">
      <div class="zen-blocking-header">
        <span class="zen-blocking-icon">🧘‍♀️</span>
        <span class="zen-blocking-title">Modo Zen Activo</span>
      </div>
      <div class="zen-blocking-message">
        <p><strong>Estás en modo enfoque.</strong></p>
        <p>Respira hondo. ¿Seguro que quieres continuar navegando en sitios de distracción?</p>
        <p class="zen-blocking-url">${url}</p>
      </div>
      <div class="zen-blocking-actions">
        <button class="zen-blocking-btn cancel" id="zen-blocking-cancel">Cancelar</button>
        <button class="zen-blocking-btn continue" id="zen-blocking-continue">Continuar</button>
      </div>
    </div>
  `;
  
  // Agregar al DOM
  document.body.appendChild(overlay);
  document.body.appendChild(modal);
  
  // Animar entrada
  setTimeout(() => {
    overlay.classList.add('show');
    modal.classList.add('show');
  }, 100);
  
  // Event listeners
  document.getElementById('zen-blocking-cancel').addEventListener('click', () => {
    hideZenModeBlockingModal();
    // Redirigir a una página neutral
    window.location.href = 'https://www.google.com';
  });
  
  document.getElementById('zen-blocking-continue').addEventListener('click', () => {
    hideZenModeBlockingModal();
    // Desactivar modo Zen y permitir la navegación
    chrome.runtime.sendMessage({ action: 'stopZenMode' });
  });
  
  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideZenModeBlockingModal();
      window.location.href = 'https://www.google.com';
    }
  });
  
  // Cerrar al hacer clic en el overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      hideZenModeBlockingModal();
      window.location.href = 'https://www.google.com';
    }
  });
}

// Ocultar modal de bloqueo del Modo Zen
function hideZenModeBlockingModal() {
  const overlay = document.getElementById('zen-mode-blocking-overlay');
  const modal = document.getElementById('zen-mode-blocking-modal');
  
  if (overlay) {
    overlay.classList.remove('show');
    overlay.classList.add('hide');
  }
  
  if (modal) {
    modal.classList.remove('show');
    modal.classList.add('hide');
  }
  
  setTimeout(() => {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }, 300);
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
  document.getElementById('notification-ok').addEventListener('click', () => {
    console.log('[MindfulFeed] Usuario hizo clic en "Entendido"');
    hideNotification();
    // Solo cerrar la notificación, no pausar nada
    // El tracking continúa normalmente
  });
  
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