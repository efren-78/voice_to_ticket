'''
services/traduccion.py
Detección de idioma y traducción al español.
'''

from langdetect import detect, LangDetectException
from deep_translator import GoogleTranslator

# Retorna el código ISO-639-1 del idioma detectado. "desconocido" si falla.
def detectar_idioma(texto: str) -> str:
    try:
        return detect(texto)
    except LangDetectException:
        return "desconocido"

# Traduce texto al español.
# Si el idioma origen ya es español, retorna el texto sin cambios.
def traducir_a_espanol(texto: str, idioma_origen: str) -> str:
    if idioma_origen == "es":
        return texto
    try:
        return GoogleTranslator(source=idioma_origen, target="es").translate(texto)
    except Exception as e:
        raise RuntimeError(f"Error de traducción: {e}")
