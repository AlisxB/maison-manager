from typing import Annotated, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core import deps
from app.models.all import Unit
from app.schemas.common import UnitRead, UnitCreate

router = APIRouter()

@router.get("/", response_model=List[UnitRead])
async def read_units(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    skip: int = 0,
    limit: int = 100
):
    """
    Listar unidades do condomínio atual (Filtrado via RLS).
    """
    result = await db.execute(select(Unit).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=UnitRead)
async def create_unit(
    unit_in: UnitCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    """
    Criar unidade. (Requer permissão de ADMIN na policy SQL ou check aqui)
    """
    # Exemplo de uso do context implícito:
    # Não definimos condominium_id manualmente aqui se o banco tivesse trigger,
    # mas o model exige. O backend ainda precisa preencher o FK, 
    # mas o RLS vai impedir se tentarmos inserir num condo diferente.
    
    # Check simples de role aqui também
    if current_user.role != 'ADMIN':
         # Em um mundo ideal Zero Trust, o INSERT falharia no banco com RLS Policy Check permission denied
         # Mas para melhor UX retornamos 403 antes
         from fastapi import HTTPException
         raise HTTPException(status_code=403, detail="Apenas admin")

    db_unit = Unit(
        condominium_id=current_user.condo_id,
        ...unit_in.model_dump()
    )
    db.add(db_unit)
    await db.commit()
    await db.refresh(db_unit)
    return db_unit
