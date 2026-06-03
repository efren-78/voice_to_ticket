'''
services/llm.py
Análisis de incidentes usando OpenAI GPT.
'''

import json
import os
import openai
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("API_KEY")
client = None
if OPENAI_API_KEY:
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
else:
    print("WARNING: OPENAI_API_KEY no está configurada. Se usará un análisis local de respaldo.")

MODEL = "gpt-4o-mini"


def _analisis_local(texto_es: str) -> dict:
    texto = texto_es.lower()

    if any(keyword in texto for keyword in ["seguridad", "robo", "intrusión", "ataque", "amenaza", "acceso no autorizado"]):
        categoria = "Seguridad"
    elif any(keyword in texto for keyword in ["red", "wifi", "internet", "servidor", "cable", "switch", "router"]):
        categoria = "Técnico"
    elif any(keyword in texto for keyword in ["infraestructura", "plomería", "electricidad", "luz", "aire acondicionado", "techo", "pared"]):
        categoria = "Infraestructura"
    elif any(keyword in texto for keyword in ["rr.hh", "recurso humano", "empleado", "personal", "contratación", "vacaciones"]):
        categoria = "RR.HH."
    elif any(keyword in texto for keyword in ["operacional", "logística", "mantenimiento", "operación", "producción"]):
        categoria = "Operacional"
    else:
        categoria = "Otro"

    if any(keyword in texto for keyword in ["critica", "crítica", "urgente", "inoperable", "sin servicio", "caída total", "apagón"]):
        severidad = "critica"
    elif any(keyword in texto for keyword in ["falla", "fallo", "no funciona", "error grave", "intermitente", "degradación"]):
        severidad = "alta"
    elif any(keyword in texto for keyword in ["problema", "retraso", "anómalo", "parcial", "limitado"]):
        severidad = "media"
    else:
        severidad = "baja"

    resumen = " ".join(texto_es.split()[:25]).strip()
    if len(resumen) > 250:
        resumen = resumen[:250].rsplit(" ", 1)[0]

    return {
        "categoria": categoria,
        "severidad": severidad,
        "resumen": resumen or "Incidente procesado con información básica.",
    }


def analizar_incidente(texto_es: str) -> dict:
    '''
    Recibe texto en español y retorna dict con:
    - categoria : Técnico | Seguridad | Operacional | RR.HH. | Infraestructura | Otro
    - severidad : baja | media | alta | critica
    - resumen   : máximo 30 palabras
    '''
    if client is None:
        return _analisis_local(texto_es)

    prompt = """Eres un sistema de gestión de incidentes corporativos.
El texto ya está en español. Analízalo y responde ÚNICAMENTE con JSON válido
(sin bloques de código, sin explicaciones adicionales):
{
    "categoria": "<Técnico | Seguridad | Operacional | RR.HH. | Infraestructura | Otro>",
    "severidad": "<baja | media | alta | critica>",
    "resumen":   "<resumen del incidente en máximo 30 palabras>"
}""".strip()

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user",   "content": texto_es},
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content.strip()
        return json.loads(content)

    except json.JSONDecodeError as e:
        return _analisis_local(texto_es)
    except Exception:
        return _analisis_local(texto_es)
