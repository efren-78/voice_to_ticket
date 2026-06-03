'''
models/schemas.py
Modelos Pydantic para validación de entrada y salida de la API.
'''

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ----- Requests (lo que llega del frontend) -----

# Cuerpo para registrar un incidente por texto escrito.
class IncidenteTextRequest(BaseModel):
    texto: str

# Cuerpo para actualizar el idioma del sistema.
class ConfigRequest(BaseModel):
    idioma_iso: str

# ----- Responses (lo que retorna la API) -----
class IncidenteResponse(BaseModel):
    id             : str
    timestamp      : str
    fuente         : str = "teclado"        # default para registros antiguos
    texto_original : str
    voz_duracion   : Optional[float] = None
    voz_status     : Optional[str]   = None
    idioma_codigo  : str
    idioma_nombre  : str
    texto_es       : str
    categoria      : str
    severidad      : str
    estado         : str = "Abierto"
    resumen        : str

# Modelo para actualizar el estado de un incidente.
class IncidenteStatusUpdateRequest(BaseModel):
    estado: str

# Métricas para el Dashboard.
class StatsResponse(BaseModel):
    total          : int
    resueltos      : int
    esta_semana    : int
    porcentaje_semana: float

# Configuración actual del sistema.
class ConfigResponse(BaseModel):
    idioma_iso    : str
    idioma_nombre : str
    idioma_voz    : str
    
# Datos que llegan del frontend para registrarse
class UsuarioRegisterRequest(BaseModel):
    nombre   : str
    email    : str
    password : str
    rol      : str = "empleado"  # puede ser: administrador, empleado, soporte

# Datos que llegan para iniciar sesión
class LoginRequest(BaseModel):
    email    : str
    password : str

# Lo que responde la API cuando todo sale bien
class UsuarioResponse(BaseModel):
    id       : str
    nombre   : str
    email    : str
    rol      : str
    status   : str = "activo"