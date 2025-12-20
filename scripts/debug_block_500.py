import asyncio
import os
import sys
from datetime import datetime
from uuid import uuid4

sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

from sqlalchemy import text
from backend.app.core import database
from backend.app.models.all import Reservation

async def debug_block_insert():
    print("Iniciando debug de INSERT de Bloqueio...")
    
    # 1. Simular Contexto RLS de Admin
    CONDO_ID = '11111111-1111-1111-1111-111111111111'
    USER_ID = '22222222-2222-2222-2222-222222222222' # Super Admin
    AREA_ID = 'eb2db5af-36c4-4e32-9474-553309e7b53b' # Festas (do seed)
    ROLE = 'ADMIN'

    async with database.AsyncSessionLocal() as session:
        try:
            print("Configurando RLS Context...")
            await session.execute(
                text("SELECT set_config('app.current_user_id', :uid, false), set_config('app.current_condo_id', :cid, false), set_config('app.current_role', :role, false)"),
                {"uid": USER_ID, "cid": CONDO_ID, "role": ROLE}
            )
            
            print("Tentando criar Reserva BLOQUEADA...")
            db_res = Reservation(
                id=uuid4(),
                condominium_id=CONDO_ID,
                user_id=USER_ID,
                common_area_id=AREA_ID,
                start_time=datetime.now(),
                end_time=datetime.now(),
                status="BLOCKED",
                reason="Debug Block"
            )
            
            session.add(db_res)
            await session.commit()
            print("SUCESSO: Reserva criada.")
            
        except Exception as e:
            print("\n[ERRO NO INSERT]")
            import traceback
            traceback.print_exc()
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(debug_block_insert())
