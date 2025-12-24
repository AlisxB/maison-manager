from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract, desc
from typing import List, Annotated
import datetime
# from dateutil.relativedelta import relativedelta # Removed to avoid dependency issue

from app.core import deps
from app.financial.models import Transaction
from app.units.models import Unit
from app.users.models import User
from app.readings.models import ReadingWater, ReadingGas, ReadingElectricity
from app.schemas.dashboard import (
    DashboardStats, DashboardFinancialStats, DashboardOccupancyStats, 
    DashboardReadingStats, DashboardChartData, DashboardRecentResident
)

router = APIRouter()

# Helper to subtract months
def subtract_months(dt, months):
    month = dt.month - months
    year = dt.year
    while month <= 0:
        month += 12
        year -= 1
    return dt.replace(year=year, month=month)

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    if current_user.role not in ['ADMIN', 'SYNDIC', 'FINANCIAL']: # Syndic can view too
         # For now restrict to authorized roles
         pass 

    today = datetime.date.today()
    current_month = today.month
    current_year = today.year
    
    last_month_date = subtract_months(today, 1)
    last_month = last_month_date.month
    last_month_year = last_month_date.year

    # --- Financial Stats ---
    async def get_financial_sum(month, year, tx_type):
        stmt = select(func.sum(Transaction.amount)).where(
            Transaction.condominium_id == current_user.condo_id,
            extract('month', func.timezone('America/Sao_Paulo', Transaction.date)) == month,
            extract('year', func.timezone('America/Sao_Paulo', Transaction.date)) == year,
            Transaction.type == tx_type
        )
        return (await db.execute(stmt)).scalar() or 0

    rev_curr = await get_financial_sum(current_month, current_year, 'income')
    rev_last = await get_financial_sum(last_month, last_month_year, 'income')
    exp_curr = await get_financial_sum(current_month, current_year, 'expense')
    exp_last = await get_financial_sum(last_month, last_month_year, 'expense')
    
    rev_growth = ((rev_curr - rev_last) / rev_last * 100) if rev_last > 0 else 0
    exp_growth = ((exp_curr - exp_last) / exp_last * 100) if exp_last > 0 else 0
    
    # Needs Total Balance (All time? Or just monthly balance? Dashboard says "Receita Total", usually means current month or YTD)
    # The mockup says "Receita Total", "Inquilinos", "Consumo...". 
    # Let's return Current Month Revenue as "Receita Total" for the card context of "+2.4% do ultimo mes"
    
    financial_stats = DashboardFinancialStats(
        revenue=rev_curr,
        revenue_growth=rev_growth,
        expense=exp_curr,
        expense_growth=exp_growth,
        balance=rev_curr - exp_curr # Monthly balance
    )

    # --- Occupancy Stats ---
    total_units_res = await db.execute(select(func.count(Unit.id)).where(Unit.condominium_id == current_user.condo_id))
    total_units = total_units_res.scalar() or 0
    
    residents_res = await db.execute(select(func.count(User.id)).where(User.condominium_id == current_user.condo_id, User.role == 'RESIDENTE', User.status == 'ATIVO'))
    residents_count = residents_res.scalar() or 0
    
    # Occupied units can be inferred if we have a status on Unit or count distinct units in Users
    # Let's assume residents_count is the proxy for "Inquilinos" card
    occupancy_stats = DashboardOccupancyStats(
        total_units=total_units,
        occupied_units=residents_count, # Simplification
        residents_count=residents_count
    )

    # --- Readings Stats ---
    # --- Readings Stats ---
    # Helper for Monthly Sum
    async def get_reading_sum(model, field, date_col, month, year):
        stmt = select(func.sum(field)).where(
            model.condominium_id == current_user.condo_id,
            extract('month', func.timezone('America/Sao_Paulo', date_col)) == month,
            extract('year', func.timezone('America/Sao_Paulo', date_col)) == year
        )
        return (await db.execute(stmt)).scalar() or 0

    # Water (m3) - Use reading_date
    water_curr = await get_reading_sum(ReadingWater, ReadingWater.value_m3, ReadingWater.reading_date, current_month, current_year)
    water_last = await get_reading_sum(ReadingWater, ReadingWater.value_m3, ReadingWater.reading_date, last_month, last_month_year)
    
    # Energy (kWh) - Use due_date (or should it be created_at? typically due_date for bills)
    energy_curr = await get_reading_sum(ReadingElectricity, ReadingElectricity.consumption_kwh, ReadingElectricity.due_date, current_month, current_year)
    energy_last = await get_reading_sum(ReadingElectricity, ReadingElectricity.consumption_kwh, ReadingElectricity.due_date, last_month, last_month_year)

    # Gas (KG -> proxy for consumption?)
    # Model has cylinders. sum(cylinder_1_kg + cylinder_2_kg...)?
    # Let's simplify and sum total_price for now or just 0 if unit mismatch.
    # Dashboard expects m3. Let's return 0 to avoid confusion or sum kg.
    # Let's sum KG for now as "consumption".
    async def get_gas_sum(month, year):
        stmt = select(func.sum(ReadingGas.cylinder_1_kg + ReadingGas.cylinder_2_kg + ReadingGas.cylinder_3_kg + ReadingGas.cylinder_4_kg)).where(
             ReadingGas.condominium_id == current_user.condo_id,
             extract('month', func.timezone('America/Sao_Paulo', ReadingGas.purchase_date)) == month,
             extract('year', func.timezone('America/Sao_Paulo', ReadingGas.purchase_date)) == year
        )
        return (await db.execute(stmt)).scalar() or 0

    gas_curr = await get_gas_sum(current_month, current_year)
    gas_last = await get_gas_sum(last_month, last_month_year)

    def calc_growth(curr, last):
        return ((curr - last) / last * 100) if last > 0 else 0

    readings_stats = DashboardReadingStats(
        water_total=float(water_curr), 
        water_growth=calc_growth(water_curr, water_last),
        gas_total=float(gas_curr), 
        gas_growth=calc_growth(gas_curr, gas_last),
        energy_total=float(energy_curr), 
        energy_growth=calc_growth(energy_curr, energy_last)
    )

    # --- Charts (Last 6 Months) ---
    charts = []
    
    # Helper for Monthly Sum (Reused from above if needed, or defined here)
    # We already have get_reading_sum and get_financial_sum available in scope or similar logic
    
    for i in range(5, -1, -1):
        d = subtract_months(today, i)
        m, y = d.month, d.year
        
        # Helper for TZ conversion
        # We assume 'America/Sao_Paulo' for this project context
        
        # Water
        w_stmt = select(func.sum(ReadingWater.value_m3)).where(
            ReadingWater.condominium_id == current_user.condo_id,
            extract('month', func.timezone('America/Sao_Paulo', ReadingWater.reading_date)) == m,
            extract('year', func.timezone('America/Sao_Paulo', ReadingWater.reading_date)) == y
        )
        w_val = (await db.execute(w_stmt)).scalar() or 0
        
        # Energy
        e_stmt = select(func.sum(ReadingElectricity.consumption_kwh)).where(
            ReadingElectricity.condominium_id == current_user.condo_id,
            extract('month', func.timezone('America/Sao_Paulo', ReadingElectricity.due_date)) == m,
            extract('year', func.timezone('America/Sao_Paulo', ReadingElectricity.due_date)) == y
        )
        e_val = (await db.execute(e_stmt)).scalar() or 0
        
        # Gas
        # Use previous logic or query directly
        g_stmt = select(func.sum(ReadingGas.cylinder_1_kg + ReadingGas.cylinder_2_kg + ReadingGas.cylinder_3_kg + ReadingGas.cylinder_4_kg)).where(
             ReadingGas.condominium_id == current_user.condo_id,
             extract('month', func.timezone('America/Sao_Paulo', ReadingGas.purchase_date)) == m,
             extract('year', func.timezone('America/Sao_Paulo', ReadingGas.purchase_date)) == y
        )
        g_val = (await db.execute(g_stmt)).scalar() or 0
        
        charts.append(DashboardChartData(
            name=d.strftime("%b"), # Short month name
            water=float(w_val),
            gas=float(g_val),
            energy=float(e_val)
        ))
    
    # --- Recent Residents ---
    recent_stmt = select(User).where(
        User.condominium_id == current_user.condo_id,
        User.role == 'RESIDENT',
        User.status == 'ATIVO'
    ).order_by(User.created_at.desc()).limit(5)
    
    recent_res = (await db.execute(recent_stmt)).scalars().all()
    
    # Need to fetch Unit names
    # Best way is to eager load, but for now let's query unit individually or rely on frontend?
    # Or join.
    recent_residents_list = []
    for r in recent_res:
        unit_name = "N/A"
        if r.unit_id:
            u_res = await db.get(Unit, r.unit_id)
            if u_res:
                unit_name = f"{u_res.block}-{u_res.number}" if u_res.block else u_res.number
        
        recent_residents_list.append(DashboardRecentResident(
            id=str(r.id),
            name=r.name,
            unit=unit_name,
            start_date=r.created_at.strftime("%d/%m/%Y"),
            status=r.status
        ))

    return DashboardStats(
        financial=financial_stats,
        occupancy=occupancy_stats,
        readings=readings_stats,
        charts=charts,
        recent_residents=recent_residents_list
    )
