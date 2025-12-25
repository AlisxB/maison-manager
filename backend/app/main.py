from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import (
    dashboard, condominium, audit, bylaws, 
    profile, notifications
)
from app.users import router as users_router
from app.users import auth as auth_router
from app.units import router as units_router
from app.financial import router as financial_router
from app.readings import router as readings_router
from app.occurrences import router as occurrences_router
from app.violations import router as violations_router
from app.announcements import router as announcements_router
from app.assets import router as inventory_router
from app.reservations import router as reservations_router
from app.documents import router as documents_router

from app.core.database import AsyncSessionLocal
from app.db.init_db import init_db
import logging

logger = logging.getLogger("uvicorn")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.on_event("startup")
async def startup_event():
    async with AsyncSessionLocal() as session:
        try:
            await init_db(session)
        except Exception as e:
            logger.error(f"Error initializing database: {e}")

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
app.include_router(auth_router.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users_router.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(units_router.router, prefix=f"{settings.API_V1_STR}/units", tags=["units"])
app.include_router(financial_router.router, prefix=f"{settings.API_V1_STR}/financial", tags=["financial"])
app.include_router(readings_router.router, prefix=f"{settings.API_V1_STR}/readings", tags=["readings"])
app.include_router(occurrences_router.router, prefix=f"{settings.API_V1_STR}/occurrences", tags=["occurrences"])
app.include_router(violations_router.router, prefix=f"{settings.API_V1_STR}/violations", tags=["violations"])
app.include_router(announcements_router.router, prefix=f"{settings.API_V1_STR}/announcements", tags=["announcements"])
app.include_router(inventory_router.router, prefix=f"{settings.API_V1_STR}/inventory", tags=["inventory"])
app.include_router(reservations_router.router, prefix=f"{settings.API_V1_STR}/reservations", tags=["reservations"])

# Legacy / Pending Refactor
# Reservations includes common-areas now
# app.include_router(common_areas.router, prefix=f"{settings.API_V1_STR}/common-areas", tags=["common-areas"])

app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["dashboard"])
app.include_router(condominium.router, prefix=f"{settings.API_V1_STR}/condominium", tags=["condominium"])
app.include_router(audit.router, prefix=f"{settings.API_V1_STR}/audit", tags=["audit"])
app.include_router(bylaws.router, prefix=f"{settings.API_V1_STR}/bylaws", tags=["bylaws"])
app.include_router(profile.router, prefix=f"{settings.API_V1_STR}/profile", tags=["profile"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])
app.include_router(documents_router.router, prefix=f"{settings.API_V1_STR}/documents", tags=["documents"])

@app.get("/")
def root():
    return {"message": "Maison Manager API - Status OK"}
