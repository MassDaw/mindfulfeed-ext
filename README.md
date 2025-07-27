# ⏰ MindfulFeed - Extensión de Chrome

Una extensión de Chrome que te ayuda a controlar el tiempo que pasas en redes sociales mostrando mensajes motivacionales amigables.

## 🚀 Características

- **Cronómetro visual**: Badge en el ícono que muestra minutos activos en tiempo real
- **Estadísticas diarias**: Seguimiento del tiempo total de navegación por día
- **📊 Historial detallado**: Estadísticas por sitio de los últimos 7 días
- **📈 Exportación CSV**: Descarga tus datos para análisis externo
- **🧘‍♀️ Modo Zen**: Bloqueo temporal de sitios monitoreados para sesiones de enfoque
- **Detección automática**: Monitorea automáticamente cuando visitas sitios de redes sociales
- **Notificaciones centradas**: Modal elegante que aparece en el centro de la pantalla
- **Sistema de categorías**: 4 categorías predefinidas con 40 mensajes únicos
- **Gestión avanzada de mensajes**: 
  - Activar/desactivar categorías completas
  - Agregar, editar y eliminar mensajes individuales
  - Crear categorías personalizadas
  - Renombrar y eliminar categorías
- **Configuración personalizable**: 
  - Selecciona qué sitios monitorear
  - Ajusta el intervalo de notificación (1-60 minutos)
  - Personaliza completamente los mensajes
- **Interfaz moderna**: Diseño limpio, responsive y fácil de usar
- **Sin permisos innecesarios**: Solo accede a los sitios que configures
- **Migración automática**: Compatible con configuraciones anteriores

## 📋 Sitios monitoreados por defecto

- Twitter
- Reddit
- Facebook
- YouTube
- TikTok
- Instagram
- LinkedIn
- Pinterest
- Snapchat
- Discord

## 🛠️ Instalación

### Método 1: Instalación desde Chrome Web Store (Recomendado)
1. Ve a la [Chrome Web Store](https://chrome.google.com/webstore)
2. Busca "MindfulFeed"
3. Haz clic en "Agregar a Chrome"

### Método 2: Instalación manual (Modo desarrollador)
1. Descarga o clona este repositorio
2. Abre Chrome y ve a `chrome://extensions/`
3. Activa el "Modo desarrollador" en la esquina superior derecha
4. Haz clic en "Cargar descomprimida"
5. Selecciona la carpeta del proyecto

## 🎯 Cómo usar

### Configuración inicial
1. Haz clic en el ícono de la extensión en la barra de herramientas
2. Revisa las estadísticas de tiempo de navegación en la pestaña "Principal"
3. Ve a la pestaña "📊 Estadísticas" para revisar tu historial detallado
4. Configura los sitios que quieres monitorear
5. Ajusta el intervalo de notificación (por defecto: 10 minutos)
6. Personaliza los mensajes motivacionales
7. Configura el modo Zen si lo deseas
8. Haz clic en "Guardar configuración"

### Uso diario
- **Cronómetro visual**: El badge en el ícono muestra los minutos activos en tiempo real
- **Estadísticas**: Ve tu tiempo total de navegación en la pestaña "Principal"
- **Historial detallado**: Revisa tu actividad por sitio en la pestaña "📊 Estadísticas"
- **Exportación**: Descarga tus datos como CSV para análisis externo
- **Notificaciones**: Cada N minutos aparecerá una notificación amigable
- **Modo Zen**: Activa sesiones de enfoque para bloquear temporalmente los sitios
- **Monitoreo continuo**: La extensión sigue funcionando hasta que cambies de pestaña

## ⚙️ Configuración

### Activar/Desactivar
- Usa el toggle principal en el popup para activar o desactivar la extensión

### Sitios a monitorear
- Marca/desmarca los sitios que quieres monitorear
- Los cambios se aplican inmediatamente

### Intervalo de notificación
- Ajusta el tiempo entre notificaciones (1-60 minutos)
- El valor por defecto es 10 minutos

### 📊 Estadísticas y seguimiento
- **Tiempo diario**: Ve cuántos minutos has pasado en sitios monitoreados hoy
- **Sesión actual**: Tiempo activo en la pestaña actual
- **Cronómetro visual**: Badge en el ícono que se actualiza cada minuto
- **Colores del badge**: 
  - 🔴 Rojo: Tiempo activo en sitios monitoreados
  - 🟢 Verde: Modo Zen activo (tiempo restante)

### 📈 Historial detallado (Pestaña Estadísticas)
- **Historial de 7 días**: Ve tu actividad por sitio y fecha
- **Tabla organizada**: Fecha, sitio visitado, tiempo total
- **Ordenamiento**: Los datos más recientes aparecen primero
- **Exportación CSV**: Descarga tus datos para análisis externo
- **Limpieza automática**: Se mantienen solo los últimos 7 días
- **Limpieza manual**: Botón para borrar todo el historial

### 🧘‍♀️ Modo Zen
- **Sesiones de enfoque**: Bloquea temporalmente el acceso a sitios monitoreados
- **Duración personalizable**: Configura sesiones de 5 a 120 minutos
- **Modal de confirmación**: Al intentar acceder a sitios bloqueados
- **Tiempo restante**: Contador en tiempo real en el popup
- **Finalización automática**: Notificación cuando termina la sesión

### Mensajes personalizados
La extensión incluye 4 categorías predefinidas de mensajes:

#### Categorías disponibles:
- **😄 Humor Nerd**: Mensajes divertidos con referencias tecnológicas
- **💪 Motivacional**: Frases inspiradoras y motivacionales
- **🤔 Filosófico**: Reflexiones profundas sobre el tiempo y la atención
- **🧘‍♀️ Mindfulness**: Mensajes de atención plena y consciencia

#### Gestión de categorías:
- **Activar/Desactivar**: Usa el toggle junto al nombre de la categoría
- **Expandir/Contraer**: Haz clic en el encabezado de la categoría
- **Renombrar**: Haz clic en "✏️ Renombrar"
- **Eliminar**: Haz clic en "🗑️ Eliminar categoría"

#### Gestión de mensajes:
- **Agregar**: Haz clic en "+ Agregar mensaje" dentro de cada categoría
- **Editar**: Haz clic en el ícono ✏️ junto al mensaje
- **Eliminar**: Haz clic en el ícono 🗑️ junto al mensaje

#### Crear categorías personalizadas:
- Haz clic en "+ Nueva categoría" para crear tu propia categoría
- Personaliza el nombre y agrega tus propios mensajes

## 🎨 Personalización

### Categorías y mensajes por defecto

#### 😄 Humor Nerd (10 mensajes)
- "Error 404: Vida real no encontrada. Reiniciando... 🔄"
- "Tu CPU cerebral necesita un break. Ctrl+Alt+Delete recomendado 🖥️"
- "Stack overflow de contenido. Memory leak detectado 💾"
- "¿Sabías que los gatos tienen 9 vidas? Tú solo tienes 24 horas al día 😸"
- "Loading... Cargando motivación... 99% fallido 😅"
- "Bug report: Scroll infinito detectado. Patch recomendado 🐛"
- "Tu atención está en modo debug. Breakpoint establecido 🔍"
- "404: Productividad no encontrada en esta página 🚫"
- "Warning: Tiempo de pantalla excede límites recomendados ⚠️"
- "Exception thrown: Life balance not found 🎯"

#### 💪 Motivacional (10 mensajes)
- "¿Has notado que el tiempo vuela cuando estás aquí? 🌟"
- "Tu futuro yo te agradecerá por este descanso 💪"
- "Hay un mundo real esperándote ahí fuera ✨"
- "Cada minuto aquí es un minuto menos para tus sueños 🎯"
- "¿Qué tal si haces algo que realmente te haga feliz? 😊"
- "Tu cerebro necesita descansos, no más contenido 📱"
- "La vida es demasiado corta para perderla en scroll infinito ⏰"
- "¿Recuerdas esa cosa que querías aprender? Ahora es el momento 🚀"
- "Tu atención es valiosa, no la regales 🎁"
- "Un pequeño paso hacia afuera, un gran paso hacia adelante 👣"

#### 🤔 Filosófico (10 mensajes)
- "¿Qué es el tiempo sino la percepción de cambio? 🤔"
- "En el infinito scroll, ¿buscamos contenido o sentido? 🧘"
- "El presente es el único momento que realmente existe ⏳"
- "¿Somos dueños de nuestra atención o esclavos del algoritmo? 🤖"
- "La sabiduría comienza cuando reconocemos nuestros patrones 🧠"
- "Cada elección moldea el futuro que construimos 🏗️"
- "¿Qué historia quieres contar con tu tiempo? 📖"
- "La consciencia es el primer paso hacia la transformación 🌱"
- "En la quietud encontramos la claridad que buscamos 🕯️"
- "El verdadero poder está en decidir dónde enfocar tu energía ⚡"

#### 🧘‍♀️ Mindfulness (10 mensajes)
- "Respira profundamente. ¿Qué sientes en este momento? 🌬️"
- "Observa tus pensamientos sin juzgarlos 🧘‍♀️"
- "Este momento es perfecto tal como es ✨"
- "Conecta con tu respiración. Estás aquí, ahora 🌿"
- "Permítete estar presente sin agenda 📝"
- "La paz está disponible en cada respiración 🕊️"
- "Observa la impermanencia de cada momento 🌊"
- "Tu cuerpo te está hablando. ¿Lo estás escuchando? 👂"
- "La atención plena es el regalo que te das a ti mismo 🎁"
- "En la quietud, encuentra tu verdadera naturaleza 🌟"

## 🔧 Permisos

La extensión solicita los siguientes permisos:

- **storage**: Para guardar tu configuración
- **activeTab**: Para detectar la pestaña activa
- **tabs**: Para monitorear cambios de pestaña
- **host_permissions**: Solo para los sitios que configures

## 🐛 Solución de problemas

### La extensión no funciona
1. Verifica que esté activada en el popup
2. Asegúrate de haber guardado la configuración
3. Revisa que los sitios estén marcados en la lista

### No aparecen notificaciones
1. Verifica que el intervalo no sea muy largo
2. Asegúrate de estar en un sitio monitoreado
3. Revisa que haya al menos un mensaje configurado

### Error al guardar configuración
1. Asegúrate de tener al menos un sitio seleccionado
2. Verifica que haya al menos un mensaje
3. El intervalo debe estar entre 1 y 60 minutos

## 📝 Notas técnicas

- **Manifest V3**: Utiliza la versión más reciente del manifiesto de Chrome
- **Service Worker**: El background script usa un service worker para mejor rendimiento
- **Storage Sync**: La configuración se sincroniza entre dispositivos
- **Responsive**: Las notificaciones se adaptan a diferentes tamaños de pantalla

## 🤝 Contribuir

¿Tienes ideas para mejorar la extensión? ¡Las contribuciones son bienvenidas!

1. Haz fork del repositorio
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Abre un Pull Request

## 📄 Licencia y Documentos Legales

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

### Documentos Legales
- **[Política de Privacidad](PRIVACY_POLICY.md)**: Información sobre cómo manejamos tus datos
- **[Términos de Servicio](TERMS_OF_SERVICE.md)**: Términos y condiciones de uso de la extensión

**Importante**: Al usar esta extensión, aceptas los términos de servicio y política de privacidad.

## 🙏 Agradecimientos

- Inspirado en la necesidad de reducir el tiempo en redes sociales
- Diseño inspirado en principios de UX modernos
- Mensajes motivacionales creados con el objetivo de ser amigables y efectivos

## ☕ Apoyo al proyecto

Si esta extensión te ha ayudado a mejorar tu productividad y reducir el tiempo en redes sociales, considera apoyar el proyecto:

[☕ Buy Me a Coffee](https://coff.ee/freeextensions)

Tu apoyo ayuda a mantener y mejorar la extensión para todos los usuarios.

---

**¡Recuerda: Tu tiempo es valioso! ⏰✨** 