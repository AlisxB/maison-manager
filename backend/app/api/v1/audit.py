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
    allowed_roles = ['ADMIN', 'SINDICO']
    if current_user.role not in allowed_roles:
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
        AND u.role IN ('ADMIN', 'SINDICO', 'SUBSINDICO', 'FINANCEIRO', 'PORTEIRO', 'CONSELHO')
        -- Filter out 'Self-Service' actions (where Admin acts as Resident for themselves)
        AND NOT (
            -- Tables where user_id is the target
            (al.table_name IN ('reservations', 'occurrences', 'pets', 'vehicles') AND (
                (al.new_data->>'user_id' = al.actor_id::text) OR 
                (al.old_data->>'user_id' = al.actor_id::text)
            ))
            OR
            -- Users table (editing self)
            (al.table_name = 'users' AND al.record_id::text = al.actor_id::text)
        )
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
        unit_ids_to_fetch = set()
        
        sensitive_keys = ['email_encrypted', 'phone_encrypted', 'cpf_encrypted', 'cnpj_encrypted']

        def process_val(val):
            if not val or not isinstance(val, str):
                return None, None
            if val.startswith("ENC("):
                # Mode 1: ENC(...)
                return "LOCAL", val[4:-1]
            elif val.startswith("\\x") or val.startswith("x"): 
                # Mode 2: Potential DB encryption
                return "DB", val
            return None, None

        # First pass: Identify local vs db AND unit_ids
        for row in rows:
            for data in [row.get('old_data'), row.get('new_data')]:
                if not data: continue
                # CRITICAL: Fix for 500 error.
                if not isinstance(data, dict): continue
                
                # Check for sensitive keys
                for key in sensitive_keys:
                    if key in data:
                        mode, res = process_val(data[key])
                        if mode == "LOCAL":
                            decrypted_map[data[key]] = res
                        elif mode == "DB":
                            encrypted_values_for_db.add(res)
                
                # Check for unit_id
                if 'unit_id' in data and data['unit_id']:
                    try:
                        # Append to set
                        unit_ids_to_fetch.add(str(data['unit_id']))
                    except:
                        pass

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
                 res_decrypt = await db.execute(text(decrypt_query), {"vals": vals_list})
                 for r in res_decrypt:
                     decrypted_map[r[0]] = r[1]
            except Exception as e:
                print(f"DB Decryption error in audit: {e}")
                pass
        
        # Batch Fetch Units
        unit_map = {}
        if unit_ids_to_fetch:
             u_list = list(unit_ids_to_fetch)
             # Cast to UUID[] if necessary or rely on postgres casting from text
             unit_query = """
                SELECT id, block, number FROM units WHERE id::text = ANY(:uids)
             """
             try:
                 res_units = await db.execute(text(unit_query), {"uids": u_list})
                 for u in res_units:
                     # Create readable label: "Block A - 101" or just "101"
                     label = f"{u.number}"
                     if u.block:
                         label = f"Bloco {u.block} - {u.number}"
                     unit_map[str(u.id)] = label
             except Exception as eu:
                 print(f"Unit fetch error: {eu}")
        
        # Batch Fetch Common Areas (New Enrichment)
        ca_ids_to_fetch = set()
        # Batch Fetch Target Users (New Enrichment for Violations, Reservations)
        target_user_ids = set()
        
        for row in rows:
            for data in [row.get('old_data'), row.get('new_data')]:
                if not data or not isinstance(data, dict): continue
                
                # Check for Common Areas
                if 'common_area_id' in data and data['common_area_id']:
                    ca_ids_to_fetch.add(str(data['common_area_id']))
                
                # Check for Target Users (Residents in violations, creators of reservations)
                if 'resident_id' in data and data['resident_id']:
                    target_user_ids.add(str(data['resident_id']))
                if 'user_id' in data and data['user_id']:
                    target_user_ids.add(str(data['user_id']))
                if 'created_by' in data and data['created_by']:
                    target_user_ids.add(str(data['created_by']))
        
        ca_map = {}
        if ca_ids_to_fetch:
            ca_list = list(ca_ids_to_fetch)
            ca_query = "SELECT id, name FROM common_areas WHERE id::text = ANY(:cids)"
            try:
                res_ca = await db.execute(text(ca_query), {"cids": ca_list})
                for ca in res_ca:
                     ca_map[str(ca.id)] = ca.name
            except Exception as eca:
                 print(f"CA fetch error: {eca}")

        user_map = {}
        if target_user_ids:
            tu_list = list(target_user_ids)
            # Fetch names and unit info for context
            tu_query = """
                SELECT u.id, u.name, un.block, un.number 
                FROM users u 
                LEFT JOIN units un ON u.unit_id = un.id 
                WHERE u.id::text = ANY(:uids)
            """
            try:
                res_tu = await db.execute(text(tu_query), {"uids": tu_list})
                for tu in res_tu:
                     # Store as dict to allow splitting fields
                     unit_label = None
                     if tu.number:
                         unit_label = f"{tu.number}"
                         if tu.block: unit_label = f"{tu.block} - {unit_label}"
                     
                     user_map[str(tu.id)] = {
                         "name": tu.name,
                         "unit": unit_label
                     }
            except Exception as etu:
                 print(f"Target User fetch error: {etu}")

        # Reconstruct response objects
        final_rows = []
        for row in rows:
            row_dict = dict(row)
            
            # Helper to inject data
            def enrich_data(data_dict):
                if not isinstance(data_dict, dict): return data_dict
                new_d = dict(data_dict)
                
                # 1. Decrypt
                for k in sensitive_keys:
                    if k in new_d and new_d[k] in decrypted_map:
                        simple_key = k.replace("_encrypted", "")
                        new_d[simple_key] = decrypted_map[new_d[k]]
                
                # 2. Inject Unit Name
                if 'unit_id' in new_d and new_d['unit_id']:
                    uid_str = str(new_d['unit_id'])
                    if uid_str in unit_map:
                        new_d['unidade'] = unit_map[uid_str]
                
                # 3. Inject Common Area Name
                if 'common_area_id' in new_d and new_d['common_area_id']:
                    ca_str = str(new_d['common_area_id'])
                    if ca_str in ca_map:
                        new_d['area_comum'] = ca_map[ca_str]

                # 4. Inject Target User Name (Split Name and Unit)
                # Helper to inject user fields
                def inject_user_info(id_key, prefix_name, prefix_unit):
                    if id_key in new_d and new_d[id_key]:
                        uid_str = str(new_d[id_key])
                        if uid_str in user_map:
                            info = user_map[uid_str]
                            new_d[prefix_name] = info['name']
                            if info['unit']:
                                new_d[prefix_unit] = info['unit']

                # For resident_id
                inject_user_info('resident_id', 'morador_alvo_nome', 'morador_alvo_unidade')
                
                # For user_id (Generic or Requester)
                inject_user_info('user_id', 'solicitante_nome', 'solicitante_unidade')
                
                # For created_by
                inject_user_info('created_by', 'criado_por_nome', 'criado_por_unidade')

                # 5. Inject Actor Name
                if 'actor_name' in row_dict and row_dict['actor_name']:
                     new_d['responsavel_acao'] = row_dict['actor_name']

                return new_d

            if row_dict.get('old_data'):
                row_dict['old_data'] = enrich_data(row_dict['old_data'])

            if row_dict.get('new_data'):
                row_dict['new_data'] = enrich_data(row_dict['new_data'])
                
            final_rows.append(row_dict)
        
        return final_rows

    except Exception as general_e:
        print(f"CRITICAL: Failed to process audit logs decryption: {general_e}")
        return [dict(row) for row in rows]
