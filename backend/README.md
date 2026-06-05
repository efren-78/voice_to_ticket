# Voice to Ticket - Backend

Este es el servidor del sistema **Voice to Ticket**, construido con **FastAPI**. Gestiona la autenticación, el procesamiento de texto y audio, la detección de idioma, la traducción, el análisis con IA y el almacenamiento local en archivos JSON.

---

## Funcionalidad principal

- **Autenticación de usuarios** mediante `/api/usuarios/registro` y `/api/usuarios/login`.
- **Registro de incidentes por texto** en `/api/incidentes`.
- **Registro de incidentes por audio** en `/api/incidentes/voz`.
- **Detección automática de idioma** y traducción al español.
- **Análisis semántico con IA** para extraer categoría, severidad y resumen.
- **Persistencia local** en `backend/data/incidents.json`.
- **Configuración de idioma** en `/api/configuracion`.

---

## Requisitos

- Python 3.12+
- Microsoft C++ Build Tools (Windows)
- `ffmpeg` instalado en el sistema

---

## Instalación y configuración

1. Entra al directorio del backend:

```bash
cd backend
```

2. Crea y activa un entorno virtual:

```bash
python -m venv venv
.\venv\Scripts\Activate.ps1
```

3. Instala las dependencias:

```bash
pip install -r requirements.txt
```

4. Configura la variable de entorno de OpenAI:

```powershell
$env:OPENAI_API_KEY="sk-tu_clave_aqui"
```

---

## Ejecución

```bash
python main.py
```

- La API se expone en `http://localhost:8000`.
- La documentación de Swagger está en `http://localhost:8000/docs`.

---

## Endpoints principales

### Usuarios

- `POST /api/usuarios/registro` - Registrar nuevo usuario.
- `POST /api/usuarios/login` - Iniciar sesión y obtener token.

### Incidentes

- `POST /api/incidentes` - Registrar un incidente desde texto.
- `POST /api/incidentes/voz` - Registrar un incidente desde un archivo de audio.
- `GET /api/incidentes` - Listar incidentes.
- `GET /api/incidentes/stats` - Obtener métricas para el dashboard.
- `GET /api/incidentes/{incidente_id}` - Obtener un incidente por ID.
- `PUT /api/incidentes/{incidente_id}/estado` - Actualizar el estado de un incidente.

### Configuración

- `GET /api/configuracion` - Obtener la configuración actual.
- `PUT /api/configuracion` - Actualizar el idioma del sistema.

---

## Estructura del código

```text
backend/
├── core/
│   ├── auth.py                # Autenticación y dependencias de seguridad
│   └── config.py              # Carga y guarda de configuración
├── data/
│   ├── incidents.json         # Reportes guardados localmente
│   ├── settings.json          # Configuración de idioma y voz
│   └── users.json             # Usuarios registrados
├── models/
│   └── schemas.py             # Definición de esquemas Pydantic
├── routers/
│   ├── configuracion.py       # Endpoints para configuración de idioma
│   ├── incidentes.py          # Endpoints de incidentes y transcripción de audio
│   └── usuarios.py            # Endpoints de registro y login
├── services/
│   ├── llm.py                 # Integración con OpenAI
│   ├── traduccion.py          # Detección y traducción de idiomas
│   └── voz.py                 # Lógica de transcripción de audio
├── main.py                    # Aplicación FastAPI y CORS
└── requirements.txt           # Dependencias del backend
```
