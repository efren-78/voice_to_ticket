import json
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from passlib.exc import UnknownHashError
from models.schemas import UsuarioRegisterRequest, LoginRequest, UsuarioResponse
from core.auth import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])
BASE_DIR = Path(__file__).parent.parent
USERS_FILE = BASE_DIR / "data" / "users.json"

# --- Persistencia local ---
def _cargar_usuarios() -> list[dict]:
    if USERS_FILE.exists():
        return json.loads(USERS_FILE.read_text(encoding="utf-8"))
    return []

def _guardar_usuarios(usuarios: list[dict]) -> None:
    USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    USERS_FILE.write_text(
        json.dumps(usuarios, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

# --- Endpoints ---

@router.post("/registro", response_model=UsuarioResponse, status_code=201)
def registrar_usuario(body: UsuarioRegisterRequest):
    '''Registra un nuevo usuario en el sistema si el email no existe.'''
    usuarios = _cargar_usuarios()
    
    # Validar si el correo ya está registrado
    if any(u["email"] == body.email.lower().strip() for u in usuarios):
        raise HTTPException(
            status_code=400, 
            detail="El correo electrónico ya está registrado."
        )
    
    # Crear la estructura del nuevo usuario con password hasheada
    nuevo_usuario = {
        "id": str(uuid.uuid4())[:8],
        "nombre": body.nombre.strip(),
        "email": body.email.lower().strip(),
        "password": get_password_hash(body.password),
        "rol": body.rol
    }
    
    usuarios.append(nuevo_usuario)
    _guardar_usuarios(usuarios)
    
    return nuevo_usuario

@router.post("/login")
def login_usuario(body: LoginRequest):
    '''Valida las credenciales de acceso del usuario y retorna un token JWT.'''
    usuarios = _cargar_usuarios()

    for u in usuarios:
        if u["email"] == body.email.lower().strip():
            try:
                password_ok = verify_password(body.password, u["password"])
            except UnknownHashError:
                password_ok = body.password == u["password"]

            if password_ok:
                # Migrar contraseña antigua en texto plano a hash si hace falta
                if not u["password"].startswith("$"):
                    u["password"] = get_password_hash(body.password)
                    _guardar_usuarios(usuarios)

                access_token = create_access_token({"sub": u["email"], "id": u["id"]})
                user_public = {k: v for k, v in u.items() if k != "password"}
                return {"access_token": access_token, "token_type": "bearer", "user": user_public}
            break

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Correo o contraseña incorrectos."
    )