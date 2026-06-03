'''
config.py
Módulo de configuración del sistema de reportes de incidentes.
No se ejecuta directamente — se importa desde el programa principal.
'''

import json
from pathlib import Path

# ----- Archivos -----
BASE_DIR      = Path(__file__).resolve().parent.parent
SETTINGS_FILE = BASE_DIR / "data" / "settings.json"

# ----- Idiomas disponibles -----
# Nombres legibles para mostrar al usuario
LANG_NOMBRES = {
    "es": "Español",
    "en": "Inglés",
    "fr": "Francés",
    "de": "Alemán",
    "pt": "Portugués",
    "it": "Italiano",
    "zh": "Chino",
    "ja": "Japonés",
    "ru": "Ruso",
    "ko": "Coreano",
    "nl": "Holandés",
    "pl": "Polaco",
    "tr": "Turco",
    "hi": "Hindi",
    "ar": "Árabe",
}

# Códigos que entiende recognize_google() de SpeechRecognition
SPEECH_CODES = {
    "es": "es-MX",
    "en": "en-US",
    "fr": "fr-FR",
    "de": "de-DE",
    "pt": "pt-BR",
    "it": "it-IT",
    "zh": "zh-CN",
    "ja": "ja-JP",
    "ru": "ru-RU",
    "ko": "ko-KR",
    "nl": "nl-NL",
    "pl": "pl-PL",
    "tr": "tr-TR",
    "hi": "hi-IN",
    "ar": "ar-SA",
}

# ----- Valores por defecto -----
CONFIG_DEFAULT = {
    "idioma_iso"   : "es",
    "idioma_nombre": "Español",
    "idioma_voz"   : "es-MX",
}


# ----- Persistencia -----

# Lee el JSON existente y retorna el diccionario o retorna lista vacía si no hay archivo.
def load_config() -> dict:
    '''
    Lee settings.json y retorna la configuración.
    Si el archivo no existe, retorna la configuración por defecto.
    '''
    if SETTINGS_FILE.exists():
        return json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
    return CONFIG_DEFAULT.copy()

# Escribe la configuración al archivo JSON.
def save_config(config: dict) -> None:
    SETTINGS_FILE.write_text(
        json.dumps(config, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


# ----- Configuración interactiva -----

# Muestra un menú para que el usuario elija su idioma, valida la entrada y guarda la configuración.
def configurar() -> dict:
    print("\n" + "═" * 60)
    print("  CONFIGURACIÓN — Idioma del sistema")
    print("═" * 60)
    print("  Selecciona el idioma en que dictarás los incidentes:\n")

    # Construir lista indexada desde el diccionario
    idiomas = list(LANG_NOMBRES.items())   # [("es", "Español"), ("en", "Inglés"), ...]
    for i, (codigo, nombre) in enumerate(idiomas, start=1):
        print(f"  [{i:2}] {nombre}")

    print()

    # Leer y validar elección
    while True:
        eleccion = input("  Opción: ").strip()
        if eleccion.isdigit() and 1 <= int(eleccion) <= len(idiomas):
            break
        print(f"  [!] Elige un número entre 1 y {len(idiomas)}.")

    # Extraer los valores correspondientes
    codigo_iso, nombre = idiomas[int(eleccion) - 1]
    speech_code        = SPEECH_CODES[codigo_iso]

    # Construir y guardar configuración
    config = {
        "idioma_iso"   : codigo_iso,
        "idioma_nombre": nombre,
        "idioma_voz"   : speech_code,
    }
    save_config(config)

    print(f"\n  Idioma configurado: {nombre} ({speech_code})")
    print("─" * 60)

    return config