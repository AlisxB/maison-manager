from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import date, datetime

class DashboardFinancialStats(BaseModel):
    revenue: Decimal
    revenue_growth: float # Percentage growth vs last month
    expense: Decimal
    expense_growth: float
    balance: Decimal

class DashboardOccupancyStats(BaseModel):
    total_units: int
    occupied_units: int
    residents_count: int

class DashboardReadingStats(BaseModel):
    water_total: float
    water_growth: float
    gas_total: float
    gas_growth: float
    energy_total: float
    energy_growth: float

class DashboardChartData(BaseModel):
    name: str # Month name/label
    water: float
    gas: float
    energy: float

class DashboardRecentResident(BaseModel):
    id: str
    name: str
    unit: str
    start_date: str # Formatted date
    status: str

class DashboardPendingCounts(BaseModel):
    occurrences: int
    access_requests: int
    reservations: int

class DashboardStats(BaseModel):
    financial: DashboardFinancialStats
    occupancy: DashboardOccupancyStats
    readings: DashboardReadingStats
    charts: List[DashboardChartData]
    recent_residents: List[DashboardRecentResident]
    pending_counts: Optional[DashboardPendingCounts] = None
