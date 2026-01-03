from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit import AuditLog
import uuid
import json
from typing import Optional, Any

class AuditService:
    @staticmethod
    async def log(
        db: AsyncSession,
        action: str,
        table_name: str,
        record_id: str,
        actor_id: Optional[str] = None,
        old_data: Optional[dict] = None,
        new_data: Optional[dict] = None,
        ip_address: Optional[str] = None,
        condominium_id: Optional[str] = None
    ) -> AuditLog:
        """
        Create a system audit log entry.
        """
        # Ensure UUIDs if passed as strings (though SQLAlchemy handles this usually, validation helps)
        actor_uuid = uuid.UUID(str(actor_id)) if actor_id else None
        condo_uuid = uuid.UUID(str(condominium_id)) if condominium_id else None

        # new_id = uuid.uuid4()
        log_entry = AuditLog(
            id=uuid.uuid4(),
            actor_id=actor_uuid,
            action=action.upper(),
            table_name=table_name,
            record_id=str(record_id),
            old_data=old_data,
            new_data=new_data,
            ip_address=ip_address,
            condominium_id=condo_uuid
        )
        
        db.add(log_entry)
        # We don't commit here to allow the caller to commit as part of the transaction
        # But commonly logging might want to be independent? 
        # For simplicity in this structure, we assume caller manages transaction or we flush.
        # However, for safety, if the main action fails, we might logically NOT want the log, 
        # OR we might want the log of failure. 
        # Here we follow the "transactional log" approach: it saves if the action saves.
        
        return log_entry
