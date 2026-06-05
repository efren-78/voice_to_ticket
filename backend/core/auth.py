'''
aut.py
Módulo de autenticación para el sistema de reportes de incidentes.
No se ejecuta directamente — se importa desde el programa principal.
Proporciona funciones para:
- Verificar contraseñas
- Generar tokens JWT
- Cargar usuarios desde un archivo JSON
- Validar tokens y obtener el usuario autenticado
'''

import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from pathlib import Path
import json

from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

# Config
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY no definido. Asegúrate de tener .env en backend/ con SECRET_KEY='tu_clave_secreta'."
    )
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/usuarios/login")

BASE_DIR = Path(__file__).parent
USERS_FILE = BASE_DIR / "data" / "users.json"

# Verifica una contraseña en texto plano contra un hash guardado.
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Genera un hash seguro para una contraseña antes de almacenarla.
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Crea un token JWT con datos de usuario y fecha de expiración.
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Carga la lista de usuarios desde una fuente persistente (archivo JSON)
# Retorna una lista de diccionarios de usuarios.
def _load_users() -> list[dict]:
    if USERS_FILE.exists():
        return json.loads(USERS_FILE.read_text(encoding="utf-8"))
    return []

# Busca un usuario por correo electrónico y retorna su registro.
def get_user_by_email(email: str) -> Optional[dict]:
    users = _load_users()
    for u in users:
        if u.get("email") == email:
            return u
    return None

# Valida el token JWT y retorna el usuario autenticado.
def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user
