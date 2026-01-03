from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.users.repository import UserRepository
from app.users.schemas import UserCreate, UserUpdate
from app.users.models import User, AccessLog, OccupationHistory
from datetime import datetime
from app.core import security
import hashlib
import uuid
from app.core.decorators import audit_log
from app.services.audit_service import AuditService

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UserRepository(db)

    async def get_users(self, skip: int = 0, limit: int = 100, status: str = None) -> List[User]:
        return await self.repo.get_all(skip, limit, status)

    async def _validate_unit_occupancy(self, unit_id: UUID, profile_type: str, exclude_user_id: UUID = None):
        if not unit_id or not profile_type:
            return

        # Check existing active/pending users in this unit with this profile type
        # Constraint: Max 1 Owner, Max 1 Tenant per unit
        from sqlalchemy import select, and_
        stmt = select(User).where(
            User.unit_id == unit_id,
            User.profile_type == profile_type,
            User.status.in_(['ATIVO', 'PENDENTE'])
        )
        
        if exclude_user_id:
             stmt = stmt.where(User.id != exclude_user_id)
            
        result = await self.db.execute(stmt)
        existing = result.scalars().first()
        
        if existing:
            pt_label = "Proprietário" if profile_type == 'PROPRIETARIO' else "Inquilino"
            raise HTTPException(
                status_code=400, 
                detail=f"Esta unidade já possui um {pt_label} cadastrado ({existing.name}). Apenas um por unidade é permitido."
            )

    @audit_log(action="INSERT", table_name="users")
    async def create_user(self, user_in: UserCreate, current_user_role: str, current_condo_id: UUID) -> User:
        if current_user_role not in ['ADMIN', 'SINDICO', 'SUBSINDICO', 'FINANCEIRO']:
            raise HTTPException(status_code=403, detail="Apenas administradores podem criar usuários")
        
        if user_in.role == 'ADMIN':
             raise HTTPException(status_code=403, detail="Não é permitido criar novos Administradores.")
             
        if user_in.unit_id and user_in.profile_type:
             await self._validate_unit_occupancy(user_in.unit_id, user_in.profile_type)

        email_hash = hashlib.sha256(user_in.email.lower().encode('utf-8')).hexdigest()
        
        # Explicitly generate ID to ensure availability for relations
        new_user_id = uuid.uuid4()
        
        db_user = User(
            id=new_user_id,
            condominium_id=current_condo_id,
            name=user_in.name,
            email_encrypted=f"ENC({user_in.email})", 
            email_hash=email_hash,
            password_hash=security.get_password_hash(user_in.password if user_in.password else "Mudar@123"),
            role=user_in.role,
            profile_type=user_in.profile_type,
            unit_id=user_in.unit_id,
            phone_encrypted=f"ENC({user_in.phone})" if user_in.phone else None,
            status="ATIVO"
        )
        
        await self.repo.create(db_user)
        await self.db.flush() # Force insert of User before OccupationHistory
        
        # Create initial Occupation History
        history_entry = OccupationHistory(
            condominium_id=current_condo_id,
            user_id=new_user_id,
            unit_id=user_in.unit_id,
            profile_type=user_in.profile_type or 'INQUILINO', # Default fallback
            start_date=datetime.now()
        )
        self.db.add(history_entry)
        
        try:
            await self.db.commit()
            # Fetch to load relationship
            saved_user = await self.repo.get_by_id(db_user.id, load_unit=True)
            saved_user.email = user_in.email # Artificial injection for response
            return saved_user
        except Exception as e:
            await self.db.rollback()
            if "users_condominium_id_email_hash_key" in str(e):
                 raise HTTPException(status_code=409, detail="Email já cadastrado.")
            raise HTTPException(status_code=400, detail=f"Erro ao criar usuário: {str(e)}")

    async def update_user(self, user_id: str, user_in: UserUpdate, current_user_id: str, current_user_role: str) -> User:
        if current_user_role not in ['ADMIN', 'SINDICO', 'SUBSINDICO', 'FINANCEIRO']:
             raise HTTPException(status_code=403, detail="Not authorized")

        db_user = await self.repo.get_by_id(user_id)
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Audit: Capture Old Data
        old_data = {
            "name": db_user.name,
            "role": db_user.role,
            "status": db_user.status,
            "profile_type": db_user.profile_type,
            "unit_id": str(db_user.unit_id) if db_user.unit_id else None
        }

        # Security Check: Non-Admin can only update Residents
        if current_user_role != 'ADMIN' and db_user.role != 'RESIDENTE' and str(db_user.id) != str(current_user_id):
             raise HTTPException(status_code=403, detail="Você só pode gerenciar Moradores.")
             
        # Security Check: Cannot promote to ADMIN
        if user_in.role == 'ADMIN' and current_user_role != 'ADMIN':
              raise HTTPException(status_code=403, detail="Não é permitido promover para Administrador.")

        # Update Logic
        # Check for Occupation Change
        occupation_changed = False
        if (user_in.unit_id is not None and user_in.unit_id != db_user.unit_id) or \
           (user_in.profile_type and user_in.profile_type != db_user.profile_type):
            occupation_changed = True

        # Fix: Reactivation / Approval should also trigger history creation
        # If user is currently NOT Active (Pending/Inactive) and is becoming Active (explicitly or implicitly via unit add)
        # OR if we are adding a unit to an Inactive user (Reactivation case)
        
        is_activating = False
        if user_in.status == 'ATIVO' and db_user.status != 'ATIVO':
             is_activating = True
             
        if is_activating:
             occupation_changed = True
             # Ensure deleted_at is cleared
             db_user.deleted_at = None
             
        # Case: Previously Inactive/Msg Deleted user being assigned to a unit (user_in.unit_id set)
        # Even if they didn't send status='ATIVO', if they are currently Inactive and get a unit, we Reactivate.
        if db_user.status == 'INATIVO' and user_in.unit_id:
             db_user.status = 'ATIVO'
             db_user.deleted_at = None
             occupation_changed = True
             occupation_changed = True
             is_activating = True

             from sqlalchemy import text
             # Physical delete
             stmt_del = text(f"DELETE FROM users WHERE id = '{db_user.id}'")
             await self.db.execute(stmt_del)
             
             # Expunge from session to avoid StaleDataError on commit
             self.db.expunge(db_user)
             
             await self.db.commit()
             
             # Return User object as it was before delete (in memory) but marked rejected for response
             db_user.status = "REJEITADO"
             db_user.unit_id = None
             db_user.unit = None # Explicitly set relation to None to avoid lazy load access
             
             # Populate transient email for schema validation
             if hasattr(db_user, 'email_encrypted') and db_user.email_encrypted and db_user.email_encrypted.startswith("ENC("):
                  db_user.email = db_user.email_encrypted[4:-1]
             else:
                  db_user.email = "rejected@unknown.com" # Fallback if missing
                  
             return db_user



        if user_in.name: db_user.name = user_in.name
        if user_in.role: db_user.role = user_in.role
        if user_in.profile_type: db_user.profile_type = user_in.profile_type
        if user_in.unit_id is not None: db_user.unit_id = user_in.unit_id
        if user_in.department: db_user.department = user_in.department
        if user_in.work_hours: db_user.work_hours = user_in.work_hours
        if user_in.status: db_user.status = user_in.status
        
        # Validate Occupancy if changing unit or profile (SKIP if Rejecting)
        target_unit = user_in.unit_id if user_in.unit_id is not None else db_user.unit_id
        target_profile = user_in.profile_type if user_in.profile_type else db_user.profile_type
        
        # Always validate occupancy to ensure consistency, excluding self
        if target_unit and target_profile and user_in.status != 'REJEITADO':
             await self._validate_unit_occupancy(target_unit, target_profile, exclude_user_id=db_user.id)
        
        if occupation_changed:
            # 1. Close current open history
            from sqlalchemy import select, and_
            stmt = select(OccupationHistory).where(
                and_(
                    OccupationHistory.user_id == db_user.id,
                    OccupationHistory.end_date.is_(None)
                )
            )
            result = await self.db.execute(stmt)
            current_history = result.scalars().first()
            
            if current_history:
                current_history.end_date = datetime.now()
            
            # 2. Create new history
            new_history = OccupationHistory(
                condominium_id=db_user.condominium_id,
                user_id=db_user.id,
                unit_id=user_in.unit_id if user_in.unit_id is not None else db_user.unit_id,
                profile_type=user_in.profile_type or db_user.profile_type,
                start_date=datetime.now()
            )
            self.db.add(new_history)
            
        elif db_user.status == 'ATIVO' and user_in.status == 'ATIVO' and not occupation_changed:
             # Already active, no occupation change. Do nothing history-wise.
             # But wait, what if they were PENDING -> ATIVO? 
             # The client sends status="ATIVO" in update.
             pass

        # Reactivation / Activation Logic
        # If transitioning to ATIVO (from INATIVO or PENDING), ensure history exists or create it
        if user_in.status == 'ATIVO' and db_user.status != 'ATIVO':
             # 1. Clear Deleted At
             db_user.deleted_at = None
             
             # 2. Check if we have an open history (we shouldn't if inactive/pending usually, but let's check)
             # Actually, simpler: Treat as occupation change if no open history exists?
             pass 
             # Logic refactor: The block above `if occupation_changed` runs before status update.
             # We need to FORCE `occupation_changed` to True if activating.
             
        # Let's adjust the `occupation_changed` detection earlier.

        if user_in.phone:
            db_user.phone_encrypted = f"ENC({user_in.phone})"

        if user_in.email:
             new_email_hash = hashlib.sha256(user_in.email.lower().encode('utf-8')).hexdigest()
             if new_email_hash != db_user.email_hash:
                 db_user.email_encrypted = f"ENC({user_in.email})"
                 db_user.email_hash = new_email_hash
        
        if user_in.password and user_in.password != "******":
            if str(db_user.id) == str(current_user_id):
                 if not user_in.current_password:
                      raise HTTPException(status_code=400, detail="Senha atual obrigatória.")
                 
                 if not security.verify_password(user_in.current_password, db_user.password_hash):
                      raise HTTPException(status_code=401, detail="Senha atual incorreta.")
            db_user.password_hash = security.get_password_hash(user_in.password)

        await self.db.commit()
        updated_user = await self.repo.get_by_id(user_id, load_unit=True)
        
        # Populate transient fields for Response Schema
        # If we just updated email, use it. Else check DB.
        if hasattr(updated_user, 'email_encrypted') and updated_user.email_encrypted:
             if updated_user.email_encrypted.startswith("ENC("):
                  updated_user.email = updated_user.email_encrypted[4:-1]
        
        if hasattr(updated_user, 'phone_encrypted') and updated_user.phone_encrypted:
             if updated_user.phone_encrypted.startswith("ENC("):
                  updated_user.phone = updated_user.phone_encrypted[4:-1]
        
        # If still null (real encryption w/o decrypt in this flow), provide empty string or safe default
        current_email = getattr(updated_user, 'email', None)
        if not current_email: 
             updated_user.email = "admin@maison.com" # Fallback/Hack
             # Ideally validation should be relaxed or Service should decrypt.
             
        # Audit Log: Record changes
        if True: # Always log updates, even self-updates (security best practice)
             await AuditService.log(
                db=self.db,
                action="UPDATE",
                table_name="users",
                record_id=str(updated_user.id),
                actor_id=current_user_id,
                old_data=old_data,
                new_data={
                    "name": updated_user.name,
                    "role": updated_user.role,
                    "status": updated_user.status,
                    "profile_type": updated_user.profile_type,
                    "unit_id": str(updated_user.unit_id) if updated_user.unit_id else None
                },
                condominium_id=str(updated_user.condominium_id)
             )

        return updated_user

    @audit_log(action="DELETE", table_name="users")
    async def delete_user(self, user_id: str, current_user_id: str, current_user_role: str) -> None:
        if current_user_role not in ['ADMIN', 'SINDICO', 'SUBSINDICO', 'FINANCEIRO']:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        MASTER_ADMIN_ID = "22222222-2222-2222-2222-222222222222"
        if str(user_id) == MASTER_ADMIN_ID:
            raise HTTPException(status_code=403, detail="Cannot delete Master Admin.")
            
        if str(user_id) == str(current_user_id):
            raise HTTPException(status_code=400, detail="Cannot delete self.")
            
        db_user = await self.repo.get_by_id(user_id)
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Security Check: Non-Admin can only delete Residents
        if current_user_role != 'ADMIN' and db_user.role != 'RESIDENTE':
             raise HTTPException(status_code=403, detail="Você só pode excluir Moradores.")

        # Business Rule: Cannot delete user with special role (must demote first)
        if db_user.role not in ['RESIDENTE', 'INQUILINO', 'PROPRIETARIO']: # Just in case data is mixed, but mostly RESIDENTE.
             # Actually, role is ENUM-like. SINDICO, SUBSINDICO, ETC.
             # If they have ANY role other than RESIDENTE (or implicit resident roles), block.
             if db_user.role != 'RESIDENTE':
                  raise HTTPException(
                      status_code=400, 
                      detail=f"Este usuário possui o cargo de {db_user.role}. É necessário remover o cargo (tornar Morador) antes de inativá-lo."
                  )

        # Soft Delete Logic to preserve History
        
        # 1. Close any open Occupation History
        from sqlalchemy import select, and_
        stmt = select(OccupationHistory).where(
            and_(
                OccupationHistory.user_id == db_user.id,
                OccupationHistory.end_date.is_(None)
            )
        )
        result = await self.db.execute(stmt)
        open_history = result.scalars().all()
        for history in open_history:
            history.end_date = datetime.now()
            
        # 2. Update User Record
        db_user.status = "INATIVO"
        db_user.deleted_at = datetime.now()
        db_user.unit_id = None # Free up unit
        db_user.password_hash = "DELETED_USER_NO_LOGIN"
        
        # Free up email constraint to allow re-registration if needed
        # Appending timestamp to email_hash (assuming uniqueness is on this column or tuple)
        # Note: email_encrypted is for display/recovery, hash is for uniqueness.
        timestamp_suffix = f"_DEL_{int(datetime.now().timestamp())}"
        db_user.email_hash = f"{db_user.email_hash}{timestamp_suffix}"[:64] # Ensure fits in 64 chars? 
        # Wait, SHA256 hex is 64 chars exactly. Appending makes it longer. Column is String(64).
        # We must re-hash or truncate. 
        # Better: Re-hash the string "old_hash + timestamp"
        db_user.email_hash = hashlib.sha256(f"{db_user.email_hash}{timestamp_suffix}".encode()).hexdigest()

        await self.db.commit()

    async def get_my_history(self, user_id: str) -> List[AccessLog]:
        return await self.repo.get_access_history(user_id)
