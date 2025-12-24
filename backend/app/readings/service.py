from typing import List
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.readings.repository import ReadingRepository
from app.readings.schemas import WaterReadingCreate, GasReadingCreate, ElectricityReadingCreate, WaterReadingUpdate
from app.readings.models import ReadingWater, ReadingGas, ReadingElectricity
from app.financial.service import FinancialService
from app.financial.schemas import TransactionCreate
from decimal import Decimal
from datetime import date
# Need imports for Financial integration if auto-generating bills? 
# The original code had limited logic, mostly CRUD.
# Except for some "Integration with Financial Module" comments?
# Checked api/v1/readings.py -> No complex logic there, just CRUD.

class ReadingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ReadingRepository(db)

    def _check_admin(self, role: str):
        if role != 'ADMIN':
            raise HTTPException(status_code=403, detail="Not authorized")

    async def list_water(self, role: str, condo_id: UUID) -> List[ReadingWater]:
        self._check_admin(role)
        return await self.repo.get_water(condo_id)

    async def list_gas(self, role: str, condo_id: UUID) -> List[ReadingGas]:
        self._check_admin(role)
        return await self.repo.get_gas(condo_id)

    async def list_electricity(self, role: str, condo_id: UUID) -> List[ReadingElectricity]:
        self._check_admin(role)
        return await self.repo.get_electricity(condo_id)

    async def create_water(self, data: WaterReadingCreate, role: str, condo_id: UUID) -> ReadingWater:
        self._check_admin(role)
        
        # Check if already exists for this month/unit? 
        # Ignoring complex validation for now to match refactor scope.
        
        reading = ReadingWater(
            condominium_id=condo_id,
            **data.model_dump()
        )
        await self.repo.create_water(reading)
        await self.db.commit()
        return reading

    async def create_gas(self, data: GasReadingCreate, role: str, condo_id: UUID) -> ReadingGas:
        self._check_admin(role)
        reading = ReadingGas(condominium_id=condo_id, **data.model_dump())
        # Add to session but don't commit yet
        self.db.add(reading)
        
        # Create Expense Transaction
        financial_service = FinancialService(self.db)
        tx = await financial_service.create_transaction(
            TransactionCreate(
                type='DESPESA',
                description=f'Compra de Gás - {data.supplier}',
                amount=Decimal(str(data.total_price)),
                category='Gás',
                date=data.purchase_date,
                status='PENDENTE'
            ),
            role,
            condo_id
        )
        
        # Link Transaction
        reading.transaction_id = tx.id
        
        await self.db.commit()
        await self.db.refresh(reading)
        return reading

    async def create_electricity(self, data: ElectricityReadingCreate, role: str, condo_id: UUID) -> ReadingElectricity:
        self._check_admin(role)
        reading = ReadingElectricity(condominium_id=condo_id, **data.model_dump())
        self.db.add(reading)

        # Create Expense Transaction
        financial_service = FinancialService(self.db)
        tx = await financial_service.create_transaction(
            TransactionCreate(
                type='DESPESA',
                description=f'Conta de Luz - Vencimento {data.due_date}',
                amount=Decimal(str(data.total_value)),
                category='Energia Elétrica',
                date=data.due_date,
                status='PENDENTE'
            ),
            role,
            condo_id
        )
        
        # Link Transaction
        reading.transaction_id = tx.id

        await self.db.commit()
        await self.db.refresh(reading)
        return reading

    async def update_water(self, id: UUID, data: WaterReadingUpdate, role: str, condo_id: UUID) -> ReadingWater:
        self._check_admin(role)
        reading = await self.repo.get_water_by_id(id, condo_id)
        if not reading:
             raise HTTPException(status_code=404, detail="Reading not found")
             
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(reading, k, v)
            
        await self.db.commit()
        await self.db.refresh(reading)
        return reading

    async def delete_water(self, id: UUID, role: str, condo_id: UUID) -> None:
        self._check_admin(role)
        await self.repo.delete_water(id, condo_id)
        await self.db.commit()
