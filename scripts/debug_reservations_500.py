import asyncio
import os
import sys

# Ajusta path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

from sqlalchemy import select
from sqlalchemy.orm import joinedload
from backend.app.core import database
from backend.app.models.all import Reservation, User, CommonArea
from sqlalchemy import text

async def debug_reservations_query():
    print("Iniciando debug de query de reservas...")
    
    # 1. Simular Contexto RLS
    CONDO_ID = '11111111-1111-1111-1111-111111111111'
    USER_ID = '22222222-2222-2222-2222-222222222222'
    ROLE = 'ADMIN'

    async with database.AsyncSessionLocal() as session:
        try:
            print("Configurando RLS Context...")
            await session.execute(
                text("SELECT set_config('app.current_user_id', :uid, false), set_config('app.current_condo_id', :cid, false), set_config('app.current_role', :role, false)"),
                {"uid": USER_ID, "cid": CONDO_ID, "role": ROLE}
            )
            
            print("Executando Query de Reservas...")
            stmt = select(Reservation)
            result = await session.execute(stmt)
            reservations = result.scalars().all()
            
            print(f"Reservas encontradas: {len(reservations)}")
            for r in reservations:
                print(f"  - ID: {r.id}")
                print(f"    Start: {r.start_time}")
                print(f"    End: {r.end_time}")
                print(f"    Status: {r.status}")
                # Trigger Pydantic validation simulation (accessing fields)
                
            print("Sucesso SQL. O erro 500 deve ser no Pydantic Response Model.")
            
        except Exception as e:
            print("\n[ERRO NA QUERY OU RLS]")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_reservations_query())
