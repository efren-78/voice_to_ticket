# Voice to Ticket - Frontend

Esta es la interfaz de usuario (UI) para el sistema **Voice to Ticket**. Desarrollada con **React** y potenciada con **Vite** para un entorno de desarrollo ultrarrápido. Permite a los usuarios registrar incidencias y visualizar el estado y la severidad de los tickets generados en tiempo real.

## ¿Qué hace?

- **Portal de Acceso:** Controla el flujo de seguridad mediante pantallas dedicadas a Login y Registro de usuarios, conectándose a los módulos de autenticación del backend.
- **Captura Híbrida de Incidentes:**
  - **Modo Texto:** Formulario clásico con campos reactivos para redactar los problemas directamente.
  - **Modo Archivo:** Input de archivos integrado que acepta la carga manual de notas de voz en formatos estándar como `.wav`, `.mp3` y `.m4a`.
- **Visualizador en Tiempo Real:** Renderiza las respuestas estructuradas por el backend (Categoría calculada, Severidad con códigos de color e incidentes en formato de tarjetas legibles).

---

## Requisitos 
- **Node.js** (Versión 18 o superior recomendada)
- **npm** o **yarn**

## Instalación y Configuración

1. Ingresa al directorio del frontend:
   ```bash
   cd frontend
   ```

2. Instala los módulos y dependencias del proyecto:
    ```bash
    npm install 
    ```

## Ejecución 
    ```bash
    npm run dev
    ```

## Endpoints Consumidos (Backend)
El frontend se comunica con el backend (por defecto en el puerto 8000) a través de las siguientes rutas principales:

# Autenticación (/api/usuarios)
POST /api/usuarios/registro - Registro de nuevos operadores/usuarios.

POST /api/usuarios/login - Inicio de sesión y obtención de tokens de acceso.

# Incidentes (/api/incidentes)
POST /api/incidentes/ - Registrar nuevo incidente (procesa texto, detecta idioma, traduce y clasifica).

GET /api/incidentes/ - Listar todos los incidentes estructurados almacenados.

POST /api/incidentes/transcribir - Endpoint especializado para recibir archivos de audio (`.wav`, `.mp3`, `.m4a`, etc.) y retornar su transcripción de texto.

## Estructura Detallada del Código
```
Frontend/
├── public/                     # Recursos estáticos de la aplicación
├── src/
│   ├── assets/                 # Recursos gráficos e imágenes del sistema
│   │   ├── hero.png            # Ilustración del panel de acceso
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── components/             # Componentes modulares y reutilizables de la UI
│   │   ├── ConfiguracionForm.jsx # Panel selectivo de idiomas de traducción y dictado
│   │   ├── Header.jsx          # Barra superior del Dashboard con datos de sesión
│   │   ├── Login.jsx           # Formulario principal de acceso y validación
│   │   ├── NuevoReporteForm.jsx # Módulo de captura dual (Caja de texto / Grabadora de micrófono)
│   │   ├── Sidebar.jsx         # Menú lateral de navegación entre pestañas y vistas
│   │   └── StatsCard.jsx       # Tarjetas de visualización de estadísticas numéricas
│   │
│   ├── pages/                  # Vistas o pantallas principales del sistema
│   │   └── Dashboard.jsx       # Consola maestra que orquesta el historial y las métricas
│   │
│   ├── api.js                  # Orquestador central de peticiones HTTP Fetch hacia el puerto 8000
│   ├── App.css                 # Estilos específicos del componente raíz
│   ├── App.jsx                 # Manejador central de estados globales y conmutador de vistas
│   ├── index.css               # Estilos globales y configuraciones base del diseño
│   └── main.jsx                # Punto de entrada de React que inicializa la UI en el DOM
│
├── package.json                # Dependencias, paquetes y scripts del entorno (Vite, Lucide React, etc.)
├── vite.config.js              # Configuración del empaquetador y compilador Vite
└── README.md                   # Documentación técnica del frontend
```