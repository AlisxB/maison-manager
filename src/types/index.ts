
import { LucideIcon } from 'lucide-react';

export type Role = 'ADMIN' | 'RESIDENT';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  view: string;
}

export interface Resident {
  id: string;
  name: string;
  unit: string;
  email: string;
  phone: string;
  status: 'Ativo' | 'Pendente' | 'Inativo';
  type: 'Proprietário' | 'Inquilino';
  startDate: string;
  balance: number;
}

export interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  unit: string;
  date: string;
  status: 'Pendente';
  type: 'Proprietário' | 'Inquilino';
  phone?: string;
  cpf?: string;
  moveInDate?: string;
  observations?: string;
}

export interface Transaction {
  id: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  date: string; // YYYY-MM-DD
  amount: number;
  status: 'paid' | 'pending';
  observation?: string;
}

export interface Issue {
  id: string;
  title: string;
  category: 'Maintenance' | 'Security' | 'Noise' | 'Other';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  date: string;
  reportedBy: string;
  unit: string;
  description?: string;
  adminResponse?: string;
}

export interface FinancialRecord {
  month: string;
  revenue: number;
  expenses: number;
}

export interface Reservation {
  id: string;
  area: string;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'BLOCKED';
  residentName: string;
  unit?: string;
}

export interface Infraction {
  id: string;
  residentId: string;
  residentName: string;
  type: 'WARNING' | 'FINE';
  date: string;
  time: string;
  reason: string;
  value?: number;
  status: 'OPEN' | 'PAID' | 'RESOLVED' | 'SENT';
  article?: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  type: 'Aviso' | 'Urgente' | 'Evento' | 'Manutenção';
  date: string;
  sentViaWhatsapp: boolean;
  targetAudience: 'Todos os moradores' | 'Apenas Proprietários' | 'Apenas Inquilinos';
}

export interface BlockedDate {
  date: number; // Day of the month for the simulated calendar
  month: string;
  year: number;
  reason: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minLevel: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
}

export interface SystemLog {
  id: string;
  adminName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'SECURITY';
  module: string;
  description: string;
  timestamp: string;
  ip: string;
}
