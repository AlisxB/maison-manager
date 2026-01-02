from datetime import timedelta
from typing import Annotated, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import asyncio
import urllib.request
import json

from app.core import security, deps, config
from app.users.models import User, AccessLog
from app.units.models import Unit
from app.users.schemas import UserRead, UserRegister

router = APIRouter()

@router.post("/login", response_model=None)
async def login_access_token(
    response: Response,
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(deps.get_db_no_context)]
) -> Any:
    # Use Repository directly or Service? Service usually. 
    # But Auth logic is specific.
    # We need to find user by Email (which is encrypted or hashed).
    
    # Logic: Hash input email -> search email_hash -> verify password -> return token
    import hashlib
    email_hash = hashlib.sha256(form_data.username.lower().encode('utf-8')).hexdigest()
    
    from sqlalchemy.orm import selectinload
    stmt = select(User).options(selectinload(User.unit)).where(User.email_hash == email_hash).where(User.deleted_at == None)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if user.status != 'ATIVO':
         raise HTTPException(status_code=400, detail="User account is inactive or pending approval.")

    access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Include Condo ID and Role in Token claims for Stateless Auth / RLS
    access_token = security.create_access_token(
        subject=str(user.id), 
        claims={
            "condo_id": str(user.condominium_id),
            "role": user.role,
            "name": user.name,
            "unit": f"{user.unit.block} - {user.unit.number}" if user.unit else None
        },
        expires_delta=access_token_expires
    )
    
    response.set_cookie(
        key="access_token",
        value=f"{access_token}",
        httponly=True,
        secure=False, # Set True in Production (HTTPS)
        samesite="lax",
        max_age=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    # --- Access Log & GeoIP (Async) ---
    try:
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent", "Unknown")

        def get_location(ip):
            if not ip:
                return "Desconhecido"
            
            # Check for Localhost and Private IPs
            # 10.x.x.x, 192.168.x.x, 172.16-31.x.x
            is_private = (
                ip in ["127.0.0.1", "::1", "localhost"] or
                ip.startswith("10.") or
                ip.startswith("192.168.") or
                (ip.startswith("172.") and 16 <= int(ip.split('.')[1]) <= 31)
            )
            
            if is_private:
                return "Rede Local"

            try:
                # Using ip-api.com (Free, no-auth limit 45/min)
                url = f"http://ip-api.com/json/{ip}"
                # Run blocking I/O in thread
                resp = urllib.request.urlopen(url, timeout=2)
                data = json.loads(resp.read().decode())
                if data.get("status") == "success":
                    return f"{data.get('city', '')} - {data.get('region', '')}"
                else:
                    print(f"GeoIP Failed for {ip}: {data}")
            except Exception as e:
                print(f"GeoIP Error for {ip}: {e}")
            return "Desconhecido"

        # Execute GeoIP lookup in thread to not block event loop
        location = await asyncio.to_thread(get_location, client_ip)

        log_entry = AccessLog(
            condominium_id=user.condominium_id,
            user_id=user.id,
            ip_address=client_ip,
            user_agent=user_agent,
            location=location
        )
        db.add(log_entry)
        await db.commit()
    
    except Exception as e:
        print(f"Access Log Error: {e}")
        await db.rollback()
        # Continue login process even if logging fails
    # ----------------------------------
    
    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": form_data.username,
            "role": user.role,
            "condo_id": user.condominium_id
        }
    }

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", httponly=True, samesite="lax")
    return {"message": "Logged out successfully"}

@router.post("/register", response_model=UserRead)
async def register_public(
    user_in: UserRegister,
    db: Annotated[AsyncSession, Depends(deps.get_db_no_context)]
):
    # Public registration for new residents
    # Check if unit exists? Check defaults?
    # This logic was likely in api/v1/auth.py. We replicate simplified here.
    
    # Just forward to specific logic or create manually 
    # For now, simplistic implementation to match previous one
    
    # 1. Check duplicate
    import hashlib
    email_hash = hashlib.sha256(user_in.email.lower().encode('utf-8')).hexdigest()
    stmt = select(User).where(User.email_hash == email_hash)
    result = await db.execute(stmt)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Get Unit to derive Condominium ID
    stmt_unit = select(Unit).where(Unit.id == user_in.unit_id)
    result_unit = await db.execute(stmt_unit)
    unit = result_unit.scalars().first()
    
    if not unit:
        raise HTTPException(status_code=400, detail="Unit not found")
        
    # 3. Create User
    # We must encrypt sensitive fields using the app encryption key
    # Using SQL expression for encryption to ensure consistency with DB functions
    from sqlalchemy import text
    
    # Generate Password Hash
    password_hash = security.get_password_hash(user_in.password)
    
    # Phone Hash for uniqueness checks (if needed) or searching
    phone_clean = ''.join(filter(str.isdigit, user_in.phone))
    phone_hash = hashlib.sha256(phone_clean.encode('utf-8')).hexdigest()
    
    # Prepare Insert Statement using raw SQL for PGCrypto functions
    # This is safer/easier than ensuring matching logic in Python
    insert_query = text("""
        INSERT INTO users (
            condominium_id, unit_id, name,
            email_encrypted, email_hash,
            phone_encrypted, phone_hash,
            password_hash,
            role, profile_type, status
        ) VALUES (
            :condo_id, :unit_id, :name,
            :email, :email_hash,
            :phone, :phone_hash,
            :password_hash,
            'RESIDENTE', :profile_type, 'PENDENTE'
        ) RETURNING id, status, created_at, role
    """)
    
    result = await db.execute(insert_query, {
        "condo_id": unit.condominium_id,
        "unit_id": unit.id,
        "name": user_in.name,
        "email": f"ENC({user_in.email.lower()})",
        "email_hash": email_hash,
        "phone": f"ENC({user_in.phone})",
        "phone_hash": phone_hash,
        "password_hash": password_hash,
        "profile_type": user_in.profile_type or 'INQUILINO'
    })
    
    new_user = result.mappings().first()
    await db.commit()
    
    # Return UserRead compatible structure
    # Since we don't have the full object with decryption, we construct it manually
    return {
        "id": new_user.id,
        "name": user_in.name,
        "email": user_in.email, # Return provided email
        "role": new_user.role,
        "profile_type": user_in.profile_type or 'INQUILINO',
        "unit_id": unit.id,
        "status": new_user.status,
        "created_at": new_user.created_at,
        "phone": user_in.phone,
        # Unit object (optional in response, might help frontend)
        # "unit": ...
    }

@router.get("/units", response_model=list[dict])
async def get_public_units(
    db: Annotated[AsyncSession, Depends(deps.get_db_no_context)]
):
    """
    Get list of all units for public registration.
    """
    stmt = select(Unit).order_by(Unit.block, Unit.number)
    result = await db.execute(stmt)
    units = result.scalars().all()
    
    return [
        {
            "id": str(u.id),
            "condominium_id": str(u.condominium_id),
            "block": u.block,
            "number": u.number,
            "type": u.type
        }
        for u in units
    ]
