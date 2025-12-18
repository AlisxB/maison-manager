from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core import deps
from app.schemas.settings import AuditLogRead

router = APIRouter()

@router.get("/", response_model=List[AuditLogRead])
async def get_audit_logs(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)],
    limit: int = 50,
    table: Optional[str] = None,
    action: Optional[str] = None
):
    """
    Get system audit logs. RESTRICTED TO ADMIN.
    """
    if current_user.role != 'ADMIN':
        raise HTTPException(status_code=403, detail="Not authorized to view logs")
        
    # Construct query dynamically or use basic filtering
    # We join with users to get actor name if possible (users table)
    # Note: actor_id matches users.id
    
    query_str = """
        SELECT 
            al.id, al.actor_id, al.action, al.table_name, al.record_id, 
            al.old_data, al.new_data, al.ip_address, al.created_at,
            u.name as actor_name
        FROM audit_logs al
        LEFT JOIN users u ON al.actor_id = u.id
        WHERE al.condominium_id = :condo_id
    """
    
    params = {"condo_id": current_user.condo_id, "limit": limit}
    
    if table:
        query_str += " AND al.table_name = :table"
        params["table"] = table
    if action:
        query_str += " AND al.action = :action"
        params["action"] = action
        
    query_str += " ORDER BY al.created_at DESC LIMIT :limit"
    
    result = await db.execute(text(query_str), params)
    rows = result.mappings().all()
    
    return rows
