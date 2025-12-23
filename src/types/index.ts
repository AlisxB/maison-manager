
import { LucideIcon } from 'lucide-react';

export type Role = 'ADMIN' | 'RESIDENTE';

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
  status: 'ATIVO' | 'PENDENTE' | 'INATIVO';
  type: 'PROPRIETARIO' | 'INQUILINO';
  startDate: string;
  balance: number;
}

export interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  unit: string;
  date: string;
  status: 'PENDENTE';
  type: 'PROPRIETARIO' | 'INQUILINO';
  phone?: string;
  cpf?: string;
  moveInDate?: string;
  observations?: string;
}

export interface Transaction {
  id: string;
  description: string;
  type: 'RECEITA' | 'DESPESA';
  category: string;
  date: string; // YYYY-MM-DD
  amount: number;
  status: 'PAGO' | 'PENDENTE';
  observation?: string;
}

export interface Issue {
  id: string;
  title: string;
  category: 'Manutenção' | 'Segurança' | 'Barulho' | 'Outro';
  status: 'ABERTO' | 'EM ANDAMENTO' | 'RESOLVIDO' | 'FECHADO';
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
  status: 'PENDENTE' | 'CONFIRMADO' | 'REJEITADO' | 'CANCELADO' | 'BLOQUEADO';
  residentName: string;
  unit?: string;
}

export interface Infraction {
  id: string;
  residentId: string;
  residentName: string;
  type: 'ADVERTENCIA' | 'MULTA';
  date: string;
  time: string;
  reason: string;
  value?: number;
  status: 'ABERTO' | 'PAGO' | 'RESOLVIDO' | 'RECORRIDO';
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
