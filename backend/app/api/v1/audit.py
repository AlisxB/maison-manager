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
    
    # Process rows to decrypt sensitive data
    # We support two modes:
    # 1. "ENC(...)" -> Simple string masking used by Service: Decrypt by stripping.
    # 2. Real pgp_sym_encrypt -> Decrypt via DB (must resemble hex output).
    
    try:
        encrypted_values_for_db = set()
        decrypted_map = {}
        
        sensitive_keys = ['email_encrypted', 'phone_encrypted', 'cpf_encrypted', 'cnpj_encrypted']

        def process_val(val):
            if not val or not isinstance(val, str):
                return None, None
            if val.startswith("ENC("):
                # Mode 1: ENC(...)
                return "LOCAL", val[4:-1]
            elif val.startswith("\\x") or val.startswith("x"): 
                # Mode 2: Potential DB encryption (Hex Bytea in Postgres usually starts with \x)
                return "DB", val
            return None, None # Treat as plain text or invalid for decryption

        # First pass: Identify local vs db
        for row in rows:
            for data in [row.get('old_data'), row.get('new_data')]:
                if not data: continue
                # CRITICAL: Fix for 500 error. Data might be a List or String in some legacy cases.
                if not isinstance(data, dict): continue
                
                for key in sensitive_keys:
                    if key in data:
                        mode, res = process_val(data[key])
                        if mode == "LOCAL":
                            decrypted_map[data[key]] = res
                        elif mode == "DB":
                            encrypted_values_for_db.add(res)

        # Batch decrypt DB values
        if encrypted_values_for_db:
            vals_list = list(encrypted_values_for_db)
            decrypt_query = """
                SELECT 
                    val as original,
                    pgp_sym_decrypt(val::bytea, current_setting('app.current_user_key')) as decrypted
                FROM unnest(:vals::text[]) as val
            """
            try:
                # Use execute directly
                 res_decrypt = await db.execute(text(decrypt_query), {"vals": vals_list})
                 for r in res_decrypt:
                     decrypted_map[r[0]] = r[1]
            except Exception as e:
                # Log this internally, but don't crash
                print(f"DB Decryption error in audit: {e}")
                pass

        # Reconstruct response objects
        final_rows = []
        for row in rows:
            row_dict = dict(row)
            
            # Inject decrypted fields
            if row_dict.get('old_data'):
                # Ensure it's a dict before copy/modify
                if isinstance(row_dict['old_data'], dict):
                    od = dict(row_dict['old_data'])
                    for k in sensitive_keys:
                        if k in od and od[k] in decrypted_map:
                            simple_key = k.replace("_encrypted", "")
                            od[simple_key] = decrypted_map[od[k]]
                    row_dict['old_data'] = od

            if row_dict.get('new_data'):
                if isinstance(row_dict['new_data'], dict):
                    nd = dict(row_dict['new_data'])
                    for k in sensitive_keys:
                        if k in nd and nd[k] in decrypted_map:
                             simple_key = k.replace("_encrypted", "")
                             nd[simple_key] = decrypted_map[nd[k]]
                    row_dict['new_data'] = nd
                
            final_rows.append(row_dict)
        
        return final_rows

    except Exception as general_e:
        print(f"CRITICAL: Failed to process audit logs decryption: {general_e}")
        # Build Safe Fallback: Return raw rows
        return [dict(row) for row in rows]
