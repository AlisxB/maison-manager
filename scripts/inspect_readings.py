
import asyncio
from sqlalchemy import select
from app.core.database import async_session_factory
from app.models.all import ReadingWater, ReadingElectricity

async def inspect_data():
    async with async_session_factory() as db:
        print("--- WATER READINGS ---")
        stmt = select(ReadingWater).order_by(ReadingWater.created_at.desc()).limit(10)
        readings = (await db.execute(stmt)).scalars().all()
        for r in readings:
            print(f"Date: {r.reading_date}, Value: {r.value_m3}")

        print("\n--- ELECTRICITY READINGS ---")
        stmt = select(ReadingElectricity).order_by(ReadingElectricity.created_at.desc()).limit(10)
        readings = (await db.execute(stmt)).scalars().all()
        for r in readings:
            print(f"Due: {r.due_date}, Consumption: {r.consumption_kwh}, Total: {r.total_value}")

if __name__ == "__main__":
    asyncio.run(inspect_data())
