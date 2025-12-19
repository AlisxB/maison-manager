from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, users, units, reservations, common_areas, readings, financial, dashboard, inventory, condominium, audit, bylaws, violations, occurrences

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
app.include_router(readings.router, prefix=f"{settings.API_V1_STR}/readings", tags=["readings"])
app.include_router(financial.router, prefix=f"{settings.API_V1_STR}/financial", tags=["financial"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["dashboard"])
app.include_router(inventory.router, prefix=f"{settings.API_V1_STR}/inventory", tags=["inventory"])
app.include_router(condominium.router, prefix=f"{settings.API_V1_STR}/condominium", tags=["condominium"])
app.include_router(audit.router, prefix=f"{settings.API_V1_STR}/audit", tags=["audit"])
app.include_router(bylaws.router, prefix=f"{settings.API_V1_STR}/bylaws", tags=["bylaws"])
app.include_router(violations.router, prefix=f"{settings.API_V1_STR}/violations", tags=["violations"])
app.include_router(occurrences.router, prefix=f"{settings.API_V1_STR}/occurrences", tags=["occurrences"])


@app.get("/")
def root():
    return {"message": "Maison Manager API - Status OK"}
