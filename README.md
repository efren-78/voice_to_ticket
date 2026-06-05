# Voice to Ticket

Voice to Ticket es un sistema de reporte de incidencias híbrido que permite capturar problemas por **texto** o **audio**, detectar el idioma original, traducirlo al español y generar un ticket estructurado con categoría técnica y nivel de severidad.

---

## Estructura del proyecto

El proyecto está dividido en dos carpetas principales:

- `backend/` - API REST construida con **FastAPI** y Python.
- `frontend/` - Interfaz web construida con **React** y **Vite**.

```text
voice_to_ticket/
├── backend/
│   ├── core/                 # Autenticación, configuración y utilidades compartidas
│   ├── data/                 # Persistencia local en JSON (incidents.json, users.json, settings.json)
│   ├── models/               # Esquemas Pydantic para validación de datos
│   ├── routers/              # Endpoints de la API (incidentes, usuarios, configuración)
│   ├── services/             # Lógica de negocio independiente (LLM, voz, traducción)
│   ├── main.py               # Entrada principal de FastAPI y configuración CORS
│   └── requirements.txt      # Dependencias del backend
├── frontend/
│   ├── public/               # Archivos estáticos del navegador
│   ├── src/                  # Código fuente de React
│   │   ├── api.js            # Cliente HTTP que consume la API del backend
│   │   ├── components/       # Componentes reutilizables de la UI
│   │   └── pages/            # Vistas principales (Dashboard)
│   ├── package.json          # Dependencias y scripts de npm
│   └── vite.config.js        # Configuración de Vite
└── README.md                 # Documentación general
```

---

## Tecnologías principales

- Backend: **FastAPI**, **Pydantic**, **Uvicorn**, **OpenAI API**, **pydub**, **langdetect**, **deep-translator**.
- Frontend: **React**, **Vite**, **Lucide React**.
- Comunicaciones: **HTTP/JSON** entre frontend y backend.

---

## Requisitos

- Python 3.12+
- Node.js 18+
- npm
- `ffmpeg` instalado en el sistema (para procesar audio en el backend)
- Variable de entorno `OPENAI_API_KEY` configurada para el backend

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/efren-78/voice_to_ticket.git
cd voice_to_ticket
```

### 2. Configurar y ejecutar el backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Configurar la clave de OpenAI:

```powershell
$env:OPENAI_API_KEY="sk-..."
```

Iniciar el backend:

```bash
python main.py
```

- API disponible en `http://localhost:8000`
- Documentación automática en `http://localhost:8000/docs`

### 3. Configurar y ejecutar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

- Frontend disponible en `http://localhost:5173`

---

## Endpoints principales

El frontend consume la API en `http://localhost:8000/api`.

- `POST /api/usuarios/registro` - Registrar nuevo usuario.
- `POST /api/usuarios/login` - Iniciar sesión y obtener token.
- `POST /api/incidentes` - Registrar incidente a partir de texto.
- `POST /api/incidentes/voz` - Registrar incidente a partir de audio.
- `GET /api/incidentes` - Listar incidentes.
- `GET /api/incidentes/stats` - Obtener métricas para dashboard.
- `GET /api/incidentes/{id}` - Obtener un incidente por su ID.
- `PUT /api/incidentes/{id}/estado` - Actualizar estado de incidente.
- `GET /api/configuracion` - Obtener configuración actual.
- `PUT /api/configuracion` - Actualizar idioma del sistema.

---

## Flujo general

1. El usuario inicia sesión desde el frontend.
2. Envía un reporte por texto o audio.
3. El backend detecta el idioma, traduce al español y lo analiza con IA.
4. El reporte se guarda en JSON local y se muestra en el dashboard.

---

## Notas

- La persistencia actual es local en archivos JSON para facilitar el desarrollo.
- El flujo de audio requiere `ffmpeg` para convertir y procesar formatos compatibles.
- La configuración de idioma se guarda en `backend/data/settings.json`.
