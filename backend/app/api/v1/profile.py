from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core import deps
from app.users.models import User
from app.vehicles.models import Vehicle
from app.pets.models import Pet
from pydantic import BaseModel, UUID4
from uuid import UUID

router = APIRouter()

# Schemas (Internal for this module for simplicity, or move to app/schemas)
class VehicleCreate(BaseModel):
    model: str
    color: str
    plate: str

class VehicleRead(VehicleCreate):
    id: UUID4
    class Config:
        from_attributes = True

class PetCreate(BaseModel):
    name: str
    type: str # 'Cachorro', 'Gato', etc.
    breed: str

class PetRead(PetCreate):
    id: UUID4
    class Config:
        from_attributes = True

class ProfileRead(BaseModel):
    id: UUID4
    name: str
    email: str
    phone: str | None = None
    unit_block: str | None = None
    unit_number: str | None = None
    role: str
    profile_type: str | None = None
    vehicles: List[VehicleRead] = []
    pets: List[PetRead] = []
    
    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    phone: str | None = None

# Endpoints

@router.get("/me", response_model=ProfileRead)
async def get_my_profile(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    # Fetch full user with relationships
    query = select(User).options(
        selectinload(User.unit),
        selectinload(User.vehicles),
        selectinload(User.pets)
    ).where(User.id == current_user.user_id)
    
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Manual mapping to flatten Unit structure if needed, or stick to schema
    # Helper to decrypt phone/email if needed (mocked for now as per users.py style)
    phone_val = user.phone_encrypted
    if phone_val and phone_val.startswith("ENC("):
         phone_val = phone_val[4:-1]
         
    email_val = user.email_encrypted
    if email_val and email_val.startswith("ENC("):
         email_val = email_val[4:-1]
         
    return ProfileRead(
        id=user.id,
        name=user.name,
        email=email_val,
        phone=phone_val,
        unit_block=user.unit.block if user.unit else None,
        unit_number=user.unit.number if user.unit else None,
        role=user.role,
        profile_type=user.profile_type,
        vehicles=user.vehicles,
        pets=user.pets
    )

@router.patch("/me", response_model=ProfileRead)
async def update_my_profile(
    profile_update: ProfileUpdate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    user = await db.get(User, current_user.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Updating Phone (simulating encryption)
    if profile_update.phone is not None:
        user.phone_encrypted = f"ENC({profile_update.phone})"
        # user.phone_hash = hash... implicit
        
    await db.commit()
    
    # Reload for response
    return await get_my_profile(db, current_user)


# Vehicle Management
@router.post("/vehicles", response_model=VehicleRead)
async def add_vehicle(
    vehicle_in: VehicleCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    new_vehicle = Vehicle(
        condominium_id=current_user.condo_id,
        user_id=current_user.user_id,
        **vehicle_in.model_dump()
    )
    db.add(new_vehicle)
    await db.commit()
    await db.refresh(new_vehicle)
    return new_vehicle

@router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: UUID,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    vehicle = await db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    if str(vehicle.user_id) != str(current_user.user_id) and current_user.role != 'ADMIN':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    await db.delete(vehicle)
    await db.commit()
    return {"message": "Vehicle deleted"}

# Pet Management
@router.post("/pets", response_model=PetRead)
async def add_pet(
    pet_in: PetCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    new_pet = Pet(
        condominium_id=current_user.condo_id,
        user_id=current_user.user_id,
        **pet_in.model_dump()
    )
    db.add(new_pet)
    await db.commit()
    await db.refresh(new_pet)
    return new_pet

@router.delete("/pets/{pet_id}")
async def delete_pet(
    pet_id: UUID,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    pet = await db.get(Pet, pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
        
    if str(pet.user_id) != str(current_user.user_id) and current_user.role != 'ADMIN':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    await db.delete(pet)
    await db.commit()
    return {"message": "Pet deleted"}
