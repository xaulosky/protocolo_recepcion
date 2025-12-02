# Manual de Recepción Cialo v3.1

Aplicación web para gestión de protocolos de recepción, guiones técnicos y políticas de pago de Clínica Cialo.

## 📁 Estructura del Proyecto

```
protocolo_recepcion/
├── index.html                  # Archivo HTML principal
├── css/
│   └── styles.css             # Estilos personalizados
├── js/
│   ├── app.js                 # Orquestador principal de la aplicación
│   ├── data.js                # Datos estáticos (protocolos, guiones, políticas)
│   ├── state.js               # Gestión de estado global
│   └── components/
│       ├── Header.js          # Componente de encabezado
│       ├── SearchBar.js       # Componente de búsqueda
│       ├── TabNavigation.js   # Componente de navegación por pestañas
│       ├── ProtocolBase.js    # Componente de protocolos base
│       ├── GuionesContent.js  # Componente de guiones técnicos
│       ├── PagosContent.js    # Componente de políticas de pago
│       └── SearchResults.js   # Componente de resultados de búsqueda
└── README.md                   # Este archivo
```

## 🚀 Características

- **Búsqueda en tiempo real**: Busca en todos los protocolos, guiones y políticas
- **Navegación por pestañas**: Organización clara del contenido
- **Filtros por categoría**: En la sección de guiones técnicos
- **Diseño responsive**: Funciona en móvil y desktop
- **Arquitectura modular**: Código organizado en componentes reutilizables

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos y animaciones
- **JavaScript ES6+**: Módulos y programación orientada a objetos
- **Tailwind CSS**: Framework de utilidades CSS
- **Lucide Icons**: Iconografía moderna

## 📋 Componentes

### Header.js
Renderiza el encabezado de la aplicación con título y subtítulo.

### SearchBar.js
Barra de búsqueda con funcionalidad de filtrado en tiempo real y botón para limpiar.

### TabNavigation.js
Sistema de pestañas para navegar entre:
- Protocolo Base
- Guiones Técnicos
- Pagos y Citas

### ProtocolBase.js
Muestra los 14 protocolos obligatorios de recepción con numeración y formato claro.

### GuionesContent.js
Presenta guiones técnicos organizados por categorías:
- Gestión
- Estética
- Corporal
- Nutrición
- Médica

### PagosContent.js
Muestra políticas de pago y plantillas de mensajes de confirmación.

### SearchResults.js
Renderiza resultados de búsqueda con resaltado del tipo de contenido.

## 🔧 Gestión de Estado

El archivo `state.js` implementa un patrón de gestión de estado centralizado:

```javascript
// Obtener estado actual
const state = appState.getState();

// Actualizar estado
appState.setActiveTab('guiones');
appState.setScriptCategory('Estetica');
appState.setSearchTerm('InBody');

// Suscribirse a cambios
appState.subscribe((newState) => {
    console.log('Estado actualizado:', newState);
});
```

## 📊 Datos

Todos los datos están centralizados en `data.js`:

- **protocolRules**: 14 protocolos base obligatorios
- **paymentPolicies**: Políticas de pago y cobro
- **scriptsData**: Guiones técnicos por categoría

## 🎨 Estilos

Los estilos personalizados en `css/styles.css` incluyen:
- Fuente Inter de Google Fonts
- Ocultación de scrollbar con funcionalidad preservada
- Animación fade-in para transiciones suaves

## 🌐 Uso

### Opción 1: Servidor Local (Recomendado)

Para evitar problemas de CORS, ejecuta la aplicación con un servidor local:

**Windows:**
```bash
# Haz doble clic en servidor.bat
# O ejecuta en PowerShell:
python -m http.server 8000
```

Luego abre tu navegador en: `http://localhost:8000`

**Mac/Linux:**
```bash
python3 -m http.server 8000
```

### Opción 2: Abrir directamente

También puedes abrir `index.html` directamente en tu navegador (puede tener limitaciones en algunos navegadores por políticas CORS).

### Navegación

1. Usa la barra de búsqueda para encontrar información específica
2. Navega por las pestañas para explorar diferentes secciones
3. En Guiones Técnicos, filtra por categoría según necesites

## 🔍 Búsqueda

La búsqueda funciona en:
- Títulos de protocolos
- Contenido de protocolos
- Títulos de guiones
- Contenido de guiones
- Políticas de pago

Ejemplos de búsqueda:
- "InBody" - Encuentra el guión de examen InBody
- "Tatuaje" - Encuentra el guión de eliminación de tatuajes
- "Cancelación" - Encuentra políticas y protocolos relacionados

## 📝 Mantenimiento

### Agregar un nuevo protocolo
Edita `js/data.js` y agrega un objeto al array `protocolRules`:

```javascript
{ 
    number: "15", 
    title: "Nuevo Protocolo", 
    content: "Descripción del protocolo..." 
}
```

### Agregar un nuevo guión
Edita `js/data.js` y agrega un objeto a la categoría correspondiente en `scriptsData`:

```javascript
Estetica: [
    // ... guiones existentes
    { 
        title: "Nuevo Tratamiento", 
        content: "Guión del tratamiento...",
        note: "Nota opcional" 
    }
]
```

### Agregar una nueva categoría de guiones
1. Agrega la categoría en `js/data.js`
2. Actualiza el objeto `categoryLabels` en `js/components/GuionesContent.js`

## 🐛 Debugging

Para depurar la aplicación:

1. Abre las DevTools del navegador (F12)
2. Revisa la consola para errores
3. Usa breakpoints en los archivos JS
4. Verifica el estado actual: `console.log(appState.getState())`

## 📱 Compatibilidad

- ✅ Chrome/Edge (últimas versiones)
- ✅ Firefox (últimas versiones)
- ✅ Safari (últimas versiones)
- ✅ Dispositivos móviles (iOS/Android)

## 📄 Licencia

Uso interno de Clínica Cialo.

---

**Versión**: 3.1  
**Última actualización**: Diciembre 2025
