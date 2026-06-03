'''
services/voz.py
Transcripción de audio a texto usando SpeechRecognition y Google Web Speech API.
El audio llega como bytes desde el navegador via HTTP (webm/wav/mp4).
Gratuito — no consume tokens de OpenAI.
'''

import io
from pathlib import Path
import speech_recognition as sr

try:
    from pydub import AudioSegment
    _PYDUB_AVAILABLE = True
except ImportError:
    _PYDUB_AVAILABLE = False


def _convertir_a_wav(audio_bytes: bytes, filename: str) -> io.BytesIO:
    extension = Path(filename).suffix.lower().lstrip('.')
    entrada = io.BytesIO(audio_bytes)

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
        return salida
    except Exception as e:
        raise RuntimeError(
            f"No se pudo convertir el audio a WAV: {e}"
        ) from e


def transcribir_audio(audio_bytes: bytes, idioma_voz: str = "es-MX", filename: str = "audio") -> dict:
    '''
    Recibe bytes de audio enviados desde el navegador y retorna dict con:
    - status : success | error | no_entendido
    - texto  : transcripción resultante
    - error  : descripción del error (solo si status != success)

    Esta versión usa io.BytesIO para evitar crear archivos temporales en disco.
    Admite archivos WAV/AIFF/FLAC directamente y convierte otros formatos
    como M4A/MP3/OGG a WAV usando pydub + ffmpeg cuando está disponible.
    '''
    try:
        audio_file = _convertir_a_wav(audio_bytes, filename)
        recognizer = sr.Recognizer()
        recognizer.dynamic_energy_threshold = True

        with sr.AudioFile(audio_file) as source:
            audio = recognizer.record(source)

        texto = recognizer.recognize_google(audio, language=idioma_voz)

        return {
            "status": "success",
            "texto": texto.strip(),
        }

    except sr.UnknownValueError:
        return {
            "status": "no_entendido",
            "texto" : "",
            "error" : "El audio no pudo ser reconocido.",
        }

    except sr.RequestError as e:
        return {
            "status": "error",
            "texto" : "",
            "error" : f"Error al contactar Google Speech: {e}",
        }

    except Exception as e:
        return {
            "status": "error",
            "texto" : "",
            "error" : str(e),
        }
