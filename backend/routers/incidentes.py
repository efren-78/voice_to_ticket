'''
routers/incidentes.py
Endpoints para registro, consulta y estadísticas de incidentes.
'''

import asyncio
import json
import uuid
from datetime import datetime, timedelta
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File, Query, Depends
from typing import Optional

from models.schemas import (
    IncidenteTextRequest,
    IncidenteResponse,
    IncidenteStatusUpdateRequest,
    StatsResponse,
)
from services.llm        import analizar_incidente
from services.traduccion import detectar_idioma, traducir_a_espanol
from services.voz        import transcribir_audio
from core.auth                import get_current_user
from core.config              import LANG_NOMBRES, load_config

router  = APIRouter(prefix="/incidentes", tags=["Incidentes"])
BASE_DIR = Path(__file__).parent.parent 
DB_FILE  = BASE_DIR / "data" / "incidents.json"

# ----- Persistencia local -----

def _cargar() -> list[dict]:
    if DB_FILE.exists():
        return json.loads(DB_FILE.read_text(encoding="utf-8"))
    return []


def _guardar(incidentes: list[dict]) -> None:
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)
    DB_FILE.write_text(
        json.dumps(incidentes, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


async def _cargar_async() -> list[dict]:
    return await asyncio.to_thread(_cargar)


async def _guardar_async(incidentes: list[dict]) -> None:
    await asyncio.to_thread(_guardar, incidentes)


async def detectar_idioma_async(texto: str) -> str:
    return await asyncio.to_thread(detectar_idioma, texto)


async def traducir_a_espanol_async(texto: str, idioma_origen: str) -> str:
    return await asyncio.to_thread(traducir_a_espanol, texto, idioma_origen)


async def analizar_incidente_async(texto_es: str) -> dict:
    return await asyncio.to_thread(analizar_incidente, texto_es)


# ----- Pipeline compartido -----

async def _procesar_y_guardar(texto: str, fuente: str, voz_meta: dict | None = None) -> dict:
    '''
    Pipeline común para texto escrito y voz:
    detectar idioma → traducir → analizar → guardar → retornar incidente.
    '''
    settings      = load_config()
    idioma_codigo = settings.get("idioma_iso", "es") if fuente == "voz" else await detectar_idioma_async(texto)
    idioma_nombre = LANG_NOMBRES.get(idioma_codigo, idioma_codigo.upper())

    texto_es = await traducir_a_espanol_async(texto, idioma_codigo)
    analisis = await analizar_incidente_async(texto_es)

    incidente = {
        "id"            : str(uuid.uuid4())[:8],
        "timestamp"     : datetime.now().isoformat(timespec="seconds"),
        "fuente"        : fuente,
        "texto_original": texto,
        "voz_duracion"  : voz_meta.get("duracion") if voz_meta else None,
        "voz_status"    : voz_meta.get("status")   if voz_meta else None,
        "idioma_codigo" : idioma_codigo,
        "idioma_nombre" : idioma_nombre,
        "texto_es"      : texto_es,
        "categoria"     : analisis.get("categoria", "Otro"),
        "severidad"     : analisis.get("severidad", "baja"),
        "estado"        : "Abierto",
        "resumen"       : analisis.get("resumen", "No fue posible generar resumen."),
    }

    incidentes = await _cargar_async()
    incidentes.append(incidente)
    await _guardar_async(incidentes)

    return incidente


# ----- Endpoints -----

@router.get("/stats", response_model=StatsResponse)
async def obtener_stats():
    '''Métricas para el Dashboard: total, resueltos, actividad semanal.'''
    incidentes  = await _cargar_async()
    total       = len(incidentes)
    resueltos   = sum(1 for i in incidentes if i.get("estado") == "Resuelto")
    hace_semana = datetime.now() - timedelta(days=7)
    esta_semana = sum(
        1 for i in incidentes
        if datetime.fromisoformat(i["timestamp"]) >= hace_semana
    )
    porcentaje = round((esta_semana / total * 100), 1) if total else 0.0

    return StatsResponse(
        total             = total,
        resueltos         = resueltos,
        esta_semana       = esta_semana,
        porcentaje_semana = porcentaje,
    )


@router.get("", response_model=list[IncidenteResponse])
async def listar_incidentes(
    severidad : Optional[str] = Query(None),
    categoria : Optional[str] = Query(None),
):
    '''Lista todos los incidentes. Acepta filtros opcionales por severidad y categoría.'''
    incidentes = await _cargar_async()

    if severidad:
        incidentes = [i for i in incidentes if i.get("severidad") == severidad]
    if categoria:
        incidentes = [i for i in incidentes if i.get("categoria") == categoria]

    return incidentes


@router.get("/{incidente_id}", response_model=IncidenteResponse)
async def obtener_incidente(incidente_id: str):
    '''Retorna el detalle de un incidente por su ID.'''
    incidentes = await _cargar_async()
    for inc in incidentes:
        if inc["id"] == incidente_id:
            return inc
    raise HTTPException(status_code=404, detail="Incidente no encontrado.")


@router.put("/{incidente_id}/estado", response_model=IncidenteResponse)
async def actualizar_estado_incidente(incidente_id: str, body: IncidenteStatusUpdateRequest, current_user: dict = Depends(get_current_user)):
    '''Actualiza el estado de un incidente por su ID.'''
    estados_validos = {"Abierto", "En Progreso", "Resuelto", "Cerrado"}

    if body.estado not in estados_validos:
        raise HTTPException(
            status_code=422,
            detail=f"Estado inválido. Opciones válidas: {sorted(estados_validos)}",
        )

    incidentes = await _cargar_async()
    for inc in incidentes:
        if inc["id"] == incidente_id:
            inc["estado"] = body.estado
            await _guardar_async(incidentes)
            return inc

    raise HTTPException(status_code=404, detail="Incidente no encontrado.")


@router.post("", response_model=IncidenteResponse, status_code=201)
async def registrar_por_texto(body: IncidenteTextRequest):
    '''Registra un incidente a partir de texto escrito.'''
    if not body.texto.strip():
        raise HTTPException(status_code=422, detail="El texto no puede estar vacío.")
    return await _procesar_y_guardar(body.texto.strip(), fuente="teclado")


@router.post("/voz", response_model=IncidenteResponse, status_code=201)
async def registrar_por_voz(audio: UploadFile = File(...)):
    '''
    Registra un incidente a partir de un archivo de audio.
    El frontend envía el audio grabado desde el navegador (webm/mp4/wav).
    '''
    settings    = load_config()
    idioma_voz  = settings.get("idioma_voz", "es-MX")
    audio_bytes = await audio.read()

    resultado = await asyncio.to_thread(transcribir_audio, audio_bytes, idioma_voz, audio.filename)

    if resultado["status"] != "success" or not resultado["texto"]:
        raise HTTPException(
            status_code=422,
            detail=f"No se pudo transcribir el audio: {resultado.get('error', 'audio no reconocido')}",
        )

    voz_meta = {"status": resultado["status"], "duracion": None}
    return await _procesar_y_guardar(resultado["texto"], fuente="voz", voz_meta=voz_meta)