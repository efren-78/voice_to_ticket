'''
main.py
Punto de entrada de la API VoiceTicket.
'''
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import incidentes, configuracion, usuarios

app = FastAPI(
    title       = "VoiceTicket AI",
    description = "API para sistema multilingüe de reporte de incidentes con IA",
    version     = "1.0.0",
)

# ----- CORS -----
# Permite que el frontend React se comunique con la API durante desarrollo.
# En producción reemplaza "*" con el dominio real.
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["http://localhost:5173"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ----- Routers -----
app.include_router(incidentes.router, prefix="/api")
app.include_router(configuracion.router, prefix="/api")
app.include_router(usuarios.router, prefix="/api")


@app.get("/", tags=["Health"])
def health_check():
    '''Verifica que la API está corriendo.'''
    return {"status": "ok", "app": "VoiceTicket AI"}

# ------ Arranque -----
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
