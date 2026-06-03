'''
routers/configuracion.py
Endpoints para leer y actualizar la configuración del sistema.
'''

from fastapi import APIRouter, HTTPException
from models.schemas import ConfigRequest, ConfigResponse
from core.config import LANG_NOMBRES, SPEECH_CODES, load_config, save_config

router = APIRouter(prefix="/configuracion", tags=["Configuración"])


@router.get("", response_model=ConfigResponse)
def obtener_configuracion():
    '''Retorna la configuración actual del sistema.'''
    settings = load_config()
    if not settings:
        raise HTTPException(status_code=404, detail="No hay configuración guardada.")
    return ConfigResponse(**settings)


@router.put("", response_model=ConfigResponse)
def actualizar_configuracion(body: ConfigRequest):
    '''
    Actualiza el idioma del sistema.
    Recibe código ISO (ej. "es", "en") y guarda el settings completo.
    '''
    if body.idioma_iso not in LANG_NOMBRES:
        raise HTTPException(
            status_code=422,
            detail=f"Idioma no soportado. Opciones válidas: {list(LANG_NOMBRES.keys())}",
        )

    config = {
        "idioma_iso"   : body.idioma_iso,
        "idioma_nombre": LANG_NOMBRES[body.idioma_iso],
        "idioma_voz"   : SPEECH_CODES[body.idioma_iso],
    }
    save_config(config)
    return ConfigResponse(**config)