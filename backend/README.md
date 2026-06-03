# Voice to Ticket - Backend

Este es el servidor del sistema **Voice to Ticket**, construido sobre **FastAPI**. Se encarga de la autenticación de usuarios, el procesamiento lingüístico de las incidencias, la transcripción de archivos de audio y la estructuración del ticket mediante IA.

## ¿Qué hace?

- **Gestión de Sesiones (`/api/usuarios`):** Proporciona endpoints seguros para el registro e inicio de sesión de operadores del sistema.
- **Procesamiento Lingüístico de Incidencias (`/api/incidentes`):**
  - **Identificación:** Ejecuta algoritmos locales de detección de idioma.
  - **Normalización:** Convierte el texto de origen a idioma Español de forma local y gratuita.
  - **Extracción:** Envía el texto limpio a `gpt-4o-mini` para extraer de manera estructurada una **categoría** técnica y un nivel de **severidad** (Baja, Media, Alta, Crítica).
- **Servicio de Audio / Speech-to-Text:** Expone un endpoint multi-part (`/transcribir`) que acepta transmisiones de archivos de audio, convirtiéndolos en cadenas de texto legibles.
- **Motor de Almacenamiento Local:** Gestiona la lectura y escritura asíncrona de archivos JSON en disco para simular operaciones de base de datos relacional.

---

## Requisitos 
```bash
Python 3.12.x
Microsoft C++ Build Tools
ffmpeg  # requerido para convertir M4A y otros archivos de audio
```
## Instalación y Configuración

1. Ingresa al directorio del backend:
   ```bash
   cd backend
   ```
2. Configura un entorno virtual:
    ```bash
    python -m venv venv
    # Activar en Linux/macOS:
    source venv/bin/activate
    # Activar en Windows (PowerShell):
    .\venv\Scripts\Activate.ps1

3. Instala dependencias
    ```bash
    pip install -r requirements.txt
    ```

4. Variable de entorno 
    # Linux / macOS
    export OPENAI_API_KEY="sk-tu_clave_aqui"
    
    # Windows (PowerShell)
    $env:OPENAI_API_KEY="sk-tu_clave_aqui"   

## Ejecución 
    ```bash
    uvicorn main:app --reload
    ```

## Endpoints Principales
    # Autenticación (/api/usuarios)
        POST /api/usuarios/registro - Registro de nuevos operadores/usuarios.

        POST /api/usuarios/login - Inicio de sesión y obtención de tokens de acceso.

    # Incidentes (/api/incidentes)
        POST /api/incidentes/ - Registrar nuevo incidente (procesa texto, detecta idioma, traduce y clasifica).

        GET /api/incidentes/ - Listar todos los incidentes estructurados almacenados en el JSON local.

        POST /api/incidentes/transcribir - Endpoint especializado para recibir archivos de audio (.mp3, .wav, .m4a, .ogg, .flac) y retornar su transcripción de texto.

## Estructura Detallada del Código

```text
backend/
├── data/
│   ├── incidents.json          # Almacena el histórico de reportes ya estructurados
│   └── settings.json           # Guarda los estados y configuraciones operativas del sistema
│   └── users.json           # Guarda los usuarios registrados
│
├── models/
│   └── schemas.py              # Modelos Pydantic que validan la estructura estricta del JSON y payloads
│
├── routers/
│   ├── configuracion.py        # Endpoints para modificar parámetros del sistema en caliente
│   ├── incidentes.py           # Endpoints de creación, listado y transcripción de audios
│   └── usuarios.py             # Endpoints de registro, login y middleware de autenticación
│
├── services/
│   ├── llm.py                  # Integración con la API de OpenAI y esquemas de salida (JSON Mode)
│   ├── traduccion.py           # Motores locales de detección de lenguaje y traducción al español
│   └── voz.py                  # Lógica de manipulación de archivos multimedia y Speech-to-Text
│
├── config.py                   # Inicialización de variables de entorno y constantes globales
├── main.py                     # Instanciación de FastAPI, configuración de CORS y enrutamiento maestro
└── README.md                