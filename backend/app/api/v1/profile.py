from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
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
    id: UUID
    class Config:
        from_attributes = True

class PetCreate(BaseModel):
    name: str
    type: str # 'Cachorro', 'Gato', etc.
    breed: str

class PetRead(PetCreate):
    id: UUID
    class Config:
        from_attributes = True

class ProfileRead(BaseModel):
    id: UUID
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
    # Fetch full user with relationships AND decrypted fields
    query = select(
        User,
        text("pgp_sym_decrypt(email_encrypted::bytea, current_setting('app.current_user_key')) as decrypted_email"),
        text("pgp_sym_decrypt(phone_encrypted::bytea, current_setting('app.current_user_key')) as decrypted_phone")
    ).options(
        selectinload(User.unit),
        selectinload(User.vehicles),
        selectinload(User.pets)
    ).where(User.id == current_user.user_id)
    
    result = await db.execute(query)
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
        
    user, decrypted_email, decrypted_phone = row
    
    # Handle optional Manual/Mock encryption (fallback)
    # If the DB decryption failed (returns null) or wasn't needed? 
    # Actually pgp_sym_decrypt throws error if key is wrong.
    # If explicit null check needed:
    
    final_email = decrypted_email if decrypted_email else user.email_encrypted
    if final_email and final_email.startswith("ENC("): # Fallback for mock data
         final_email = final_email[4:-1]
         
    final_phone = decrypted_phone if decrypted_phone else user.phone_encrypted
    if final_phone and final_phone.startswith("ENC("):
         final_phone = final_phone[4:-1]

    return ProfileRead(
        id=user.id,
        name=user.name,
        email=final_email if final_email else "",
        phone=final_phone,
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
