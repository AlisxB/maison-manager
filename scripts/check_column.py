
import asyncio
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app.core.database import engine
from sqlalchemy import text

async def check_columns():
    async with engine.begin() as conn:
        print("Checking columns in 'occurrences' table:")
        result = await conn.execute(text(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'occurrences'"
        ))
        rows = result.all()
        found = False
        for row in rows:
            print(f"- {row.column_name} ({row.data_type})")
            if row.column_name == 'is_anonymous':
                found = True
        
        if found:
            print("\nSUCCESS: 'is_anonymous' column FOUND.")
        else:
            print("\nFAILURE: 'is_anonymous' column NOT FOUND.")

if __name__ == "__main__":
    asyncio.run(check_columns())
