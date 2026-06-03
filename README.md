# Voice to Ticket 

El sistema permite a los operadores registrar incidencias de manera híbrida utilizando **texto** o **audio**, detecta automáticamente el idioma del texto, lo normaliza al español y lo procesa con IA, analiza el contexto y genera un ticket estructurado con una categoría técnica específica y un nivel de severidad priorizado.

---

## Arquitectura del Ecosistema

El proyecto está dividido en dos capas independientes que se comunican mediante una API REST:

1. **Frontend (React + Vite):** Interfaz de usuario intuitiva con un Dashboard dinámico
2. **Backend (FastAPI + Python):** Servidor central de alto rendimiento encargado de la autenticación de usuarios, persistencia en archivos JSON locales, traducción/reconocimiento de voz y la orquestación con los modelos lingüísticos avanzados de OpenAI.

```text
[ Cliente React ] ◄--- ( HTTP / JSON ) ---► [ Servidor FastAPI ] ◄---► [ OpenAI API ]
 (Puerto 5173)                                (Puerto 8000)             (GPT-4o-mini)
```

## Tecnologías Utilizadas
    - Frontend: React, Vite, Tailwind CSS, Lucide React (iconografía).
    - Backend: FastAPI, Pydantic, Uvicorn, OpenAI API (GPT-4o-mini), SpeechRecognition, pydub, langdetect, deep-translator.


## ¿Qué hace?

- Recibe incidencias en cualquier idioma (Español, Inglés, Alemán, Francés, entre otros)
- Detecta el idioma automáticamente sin consumir tokens
- Traduce al español como idioma base del sistema
- Clasifica la incidencia por **categoría** y **severidad** usando un LLM
- Genera un resumen estructurado listo para convertirse en ticket
- Guarda los reportes localmente en un archivo JSON
- Transcribe un audio a texto

## Requisitos
Tener instalado previamente:
```bash
Python 3.12.x
Microsoft C++ Build Tools
ffmpeg  (necesario para procesar .m4a y otros archivos de audio)
```
## Instalación

```bash
git clone https://github.com/efren-78/voice_to_ticket.git
```
## Inicializar el Backend y entorno 
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

```

# Configuración
La API Key de OpenAI **nunca** se escribe directamente en el código. Guárdala como variable de entorno:

```bash
# Linux / macOS
export OPENAI_API_KEY="sk-..."

# Windows (PowerShell)
$env:OPENAI_API_KEY="sk-..."
```

> Nota: el backend también puede procesar audio localmente y usa `pydub` + `ffmpeg` para convertir formatos como `.m4a`, `.mp3`, `.ogg` o `.flac` a WAV antes de transcribir.

# Enciende el servidor de desarrollo con Uvicorn:
```bash
uvicorn main:app --reload
```

## Inicializar el Frontend
Abre una nueva terminal y dirígete al directorio de la interfaz de usuario:
```bash
cd frontend
```

# Instala los paquetes y dependencias del ecosistema de Node:
```bash
npm install
```
# Inicia el servidor
```bash
npm run dev
```

## Estructura del proyecto

```
Voice_to_Ticket/
├── backend/                 # Servidor de la API y lógica de Inteligencia Artificial
│   ├── data/                # Archivos de persistencia local (incidents.json, users.json)
│   ├── models/              # Validaciones y contratos de datos con Pydantic
│   ├── routers/             # Enrutadores modulares (incidentes, usuarios, configuración)
│   ├── services/            # Módulos de servicios independientes (LLM, Voz, Traducción)
│   ├── main.py              # Punto de entrada de FastAPI y políticas de CORS
│   └── requirements.txt     # Dependencias del backend de Python
│
├── frontend/                # Interfaz Gráfica de Usuario (UI)
│   ├── public/              # Recursos estáticos del navegador
│   ├── src/                 # Código fuente de React
│   │   ├── components/      # Componentes modulares (Login, Formularios, Sidebar, Cards)
│   │   ├── pages/           # Vista principal de la aplicación (Dashboard)
│   │   ├── api.js           # Cliente HTTP Fetch centralizado hacia el puerto 8000
│   │   └── main.jsx         # Inicializador de la interfaz en el DOM
│   └── package.json         # Dependencias de npm y scripts de Vite
│
└── README.md                # Documentación general
```

## Decisiones de diseño del MVP

- El LLM **solo recibe texto en español**, lo que reduce el consumo de tokens en ~60-70% respecto a dejarle también la traducción.
- La detección y traducción corren con librerías gratuitas, por lo que el costo de la API de OpenAI aplica únicamente al análisis semántico.
- La persistencia en JSON es intencional para el MVP; la arquitectura objetivo usa AWS RDS.

## Arquitectura objetivo

El MVP es la primera iteración de un sistema más amplio que incluirá:

- **Frontend** React con soporte de voz y texto
- **Backend** FastAPI / AWS API Gateway
- **Speech-to-Text** con AWS Transcribe
- **Confidence Validator** para decidir si un reporte tiene suficiente información antes de crear el ticket
- **Otobo Ticketing System** como destino final de los reportes
- **AWS RDS** para persistencia y **AWS SQS** para manejo de cola de incidentes
