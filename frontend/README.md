# Voice to Ticket - Frontend

Esta es la interfaz de usuario del sistema **Voice to Ticket**, construida con **React** y **Vite**. Permite a los operadores iniciar sesión, capturar incidentes por texto o por audio y visualizar el historial y las métricas del sistema.

---

## Características

- **Login y Registro** de usuarios.
- **Captura de incidentes por texto** con formulario reactivo.
- **Captura de incidentes por voz** mediante subida de audio web.
- **Dashboard** con historial de incidentes y estadísticas en tiempo real.
- **Soporte para audio** enviado al backend para transcripción y análisis.

---

## Requisitos

- Node.js 18+
- npm

---

## Instalación

```bash
cd frontend
npm install
```

---

## Ejecución

```bash
npm run dev
```

- La aplicación se sirve normalmente en `http://localhost:5173`.

---

## API consumida

El frontend usa la API del backend en `http://localhost:8000/api`.

- `POST /api/usuarios/registro` - Registrar nuevo usuario.
- `POST /api/usuarios/login` - Iniciar sesión.
- `POST /api/incidentes` - Crear incidente desde texto.
- `POST /api/incidentes/voz` - Crear incidente desde audio.
- `GET /api/incidentes` - Obtener la lista de incidentes.
- `GET /api/incidentes/stats` - Obtener métricas de dashboard.
- `GET /api/configuracion` - Obtener configuración actual.
- `PUT /api/configuracion` - Actualizar configuración de idioma.

---

## Estructura del frontend

```text
frontend/
├── public/                     # Archivos estáticos del navegador
├── src/
│   ├── api.js                  # Cliente HTTP hacia el backend
│   ├── App.jsx                 # Componente raíz de la aplicación
│   ├── App.css                 # Estilos específicos de la app
│   ├── index.css               # Estilos globales
│   ├── main.jsx                # Punto de entrada de React
│   ├── assets/                 # Recursos gráficos e imágenes
│   ├── components/             # Componentes reutilizables
│   │   ├── ConfiguracionForm.jsx
│   │   ├── Header.jsx
│   │   ├── Login.jsx
│   │   ├── NuevoReporteForm.jsx
│   │   ├── Sidebar.jsx
│   │   └── StatsCard.jsx
│   └── pages/
│       └── Dashboard.jsx       # Vista principal del panel
├── package.json                # Dependencias y scripts de npm
└── vite.config.js              # Configuración del bundler Vite
```

---

## Notas

- El frontend usa `localStorage` para guardar el token JWT devuelto por el backend.
- El endpoint de audio es `/api/incidentes/voz` y espera un campo `audio` tipo `UploadFile`.
- Si el backend cambia de puerto, actualiza `frontend/src/api.js` en `BASE_URL`.
