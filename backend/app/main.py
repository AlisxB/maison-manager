from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, users, units, reservations
from app.api.v1 import auth, users, units, reservations, common_areas

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configuração de CORS
# Em produção, restritir origins para o domínio do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(units.router, prefix=f"{settings.API_V1_STR}/units", tags=["units"])
app.include_router(reservations.router, prefix=f"{settings.API_V1_STR}/reservations", tags=["reservations"])
app.include_router(common_areas.router, prefix=f"{settings.API_V1_STR}/common-areas", tags=["common-areas"])


@app.get("/")
def root():
    return {"message": "Maison Manager API - Status OK"}


