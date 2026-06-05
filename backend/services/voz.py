'''
services/voz.py
Transcripción de audio a texto usando OpenAI Whisper.
El audio llega como bytes desde el navegador vía HTTP (webm/wav/mp4).
Requiere OPENAI_API_KEY configurada en el entorno o en .env.
Este módulo también intenta calcular la duración del audio cuando es posible.
'''

import io
import os
import wave
import aifc
from pathlib import Path

import openai
from dotenv import load_dotenv

load_dotenv()

# Crea el cliente de OpenAI si la clave está disponible.
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("API_KEY")
client = openai.OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

try:
    from pydub import AudioSegment
    _PYDUB_AVAILABLE = True
except ImportError:
    # pydub se usa sólo para leer formatos distintos a WAV/AIFF cuando están disponibles.
    _PYDUB_AVAILABLE = False

_SUPPORTED_EXTENSIONS = {
    "wav", "mp3", "mp4", "mpeg", "mpga", "m4a", "webm", "ogg", "aac", "flac", "wma", "aiff", "aif",
}

# Convierte el audio a WAV si es necesario para la transcripción local.
def _convertir_a_wav(audio_bytes: bytes, filename: str) -> io.BytesIO:
    extension = Path(filename).suffix.lower().lstrip('.')
    entrada = io.BytesIO(audio_bytes)

    # Si ya es un formato nativo compatible, devolvemos los bytes tal cual.
    if extension in {"wav", "aiff", "aif", "flac"}:
        entrada.seek(0)
        return entrada

    if not _PYDUB_AVAILABLE:
        raise RuntimeError(
            "Formato de audio no compatible localmente. Instala 'pydub' y asegúrate de tener ffmpeg."
        )

    try:
        if extension:
            segmento = AudioSegment.from_file(entrada, format=extension)
        else:
            segmento = AudioSegment.from_file(entrada)

        salida = io.BytesIO()
        segmento.export(salida, format="wav")
        salida.seek(0)
        salida.name = "audio.wav"
        return salida
    except Exception as e:
        raise RuntimeError(
            f"No se pudo convertir el audio a WAV: {e}"
        ) from e

# Crea un archivo en memoria a partir de los bytes de audio recibidos.
def _crear_o_archivo_audio(audio_bytes: bytes, filename: str) -> io.BytesIO:
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = filename if filename else "audio.wav"
    audio_file.seek(0)
    return audio_file

# Calcula la duración del audio en segundos a partir de los bytes y el nombre de archivo.
def _obtener_duracion_audio(audio_bytes: bytes, filename: str) -> float | None:
    extension = Path(filename).suffix.lower().lstrip('.')

    # Para WAV armamos la duración directamente con wave.
    if extension == "wav":
        try:
            with wave.open(io.BytesIO(audio_bytes), "rb") as audio_file:
                return audio_file.getnframes() / float(audio_file.getframerate())
        except Exception:
            return None

    if extension in {"aiff", "aif"}:
        try:
            with aifc.open(io.BytesIO(audio_bytes), "rb") as audio_file:
                return audio_file.getnframes() / float(audio_file.getframerate())
        except Exception:
            return None

    if not _PYDUB_AVAILABLE:
        return None

    try:
        entrada = io.BytesIO(audio_bytes)
        formato = extension if extension else None
        segmento = AudioSegment.from_file(entrada, format=formato)
        return len(segmento) / 1000.0
    except Exception:
        return None

# Lee la duración del audio desde un archivo en memoria sin consumir los bytes.
def _obtener_duracion_archivo(audio_file: io.BytesIO, filename: str) -> float | None:
    audio_file.seek(0)
    archivo_nombre = getattr(audio_file, "name", None) or filename
    original_bytes = audio_file.read()
    audio_file.seek(0)
    return _obtener_duracion_audio(original_bytes, archivo_nombre)


# Extrae el código de idioma que acepta Whisper de una cadena como 'es-MX'.
def _idioma_whisper(idioma_voz: str) -> str | None:
    if not idioma_voz:
        return None
    return idioma_voz.split("-")[0].lower()


'''
    Recibe bytes de audio enviados desde el navegador y retorna dict con:
    - status : success | error | no_entendido
    - texto  : transcripción resultante
    - error  : descripción del error (solo si status != success)

    Usa OpenAI Whisper para transcribir el audio.
'''
def transcribir_audio(audio_bytes: bytes, idioma_voz: str = "es-MX", filename: str = "audio") -> dict:
    if client is None:
        return {
            "status": "error",
            "texto": "",
            "error": "OPENAI_API_KEY no está configurada.",
        }

    extension = Path(filename).suffix.lower().lstrip('.')

    if extension in _SUPPORTED_EXTENSIONS:
        audio_file = _crear_o_archivo_audio(audio_bytes, filename)
    else:
        audio_file = _convertir_a_wav(audio_bytes, filename)

    duracion = _obtener_duracion_archivo(audio_file, filename)

    try:
        response = client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-1",
            language=_idioma_whisper(idioma_voz),
            temperature=0,
        )

        texto = getattr(response, "text", "").strip()
        if not texto:
            return {
                "status": "no_entendido",
                "texto": "",
                "duracion": duracion,
                "error": "No se obtuvo texto de la transcripción.",
            }

        return {
            "status": "success",
            "texto": texto,
            "duracion": duracion,
        }

    except openai.error.OpenAIError as e:
        return {
            "status": "error",
            "texto": "",
            "error": f"Error de OpenAI Whisper: {e}",
        }
    except Exception as e:
        return {
            "status": "error",
            "texto": "",
            "error": str(e),
        }
