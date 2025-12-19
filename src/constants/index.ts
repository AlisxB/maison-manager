import {
  LayoutDashboard,
  Users,
  BarChart3,
  ClipboardList,
  Landmark,
  ShieldAlert,
  AlertCircle,
  Megaphone,
  CalendarDays,
  Package,
  FileText,
  ShieldCheck,
  Home,
  Calendar,
  Bell,
  Building,
  AlertTriangle
} from 'lucide-react';
import { NavItem } from '../types';

export const ADMIN_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, view: 'admin_dashboard' },
  { id: 'readings', label: 'Leituras', icon: BarChart3, view: 'admin_readings' },
  { id: 'residents', label: 'Moradores', icon: Users, view: 'admin_residents' },
  { id: 'requests', label: 'Solicitações', icon: ClipboardList, view: 'admin_requests' },
  { id: 'financial', label: 'Financeiro', icon: Landmark, view: 'admin_financial' },
  { id: 'incidents', label: 'Intercorrências', icon: ShieldAlert, view: 'admin_issues' },
  { id: 'incidents_violations', label: 'Multas e Infrações', icon: AlertTriangle, view: 'admin_violations' },
  { id: 'announcements', label: 'Avisos', icon: Megaphone, view: 'admin_announcements' },
  { id: 'reservations', label: 'Gerenciar Reservas', icon: CalendarDays, view: 'admin_reservations' },
  { id: 'inventory', label: 'Estoque', icon: Package, view: 'admin_inventory' },
  { id: 'reports', label: 'Relatórios', icon: FileText, view: 'admin_reports' },
  { id: 'admins', label: 'Administradores', icon: ShieldCheck, view: 'admin_settings' },
];

export const RESIDENT_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Meu Lar', icon: Home, view: 'resident_dashboard' },
  { id: 'announcements', label: 'Avisos', icon: Megaphone, view: 'resident_announcements' },
  { id: 'notifications', label: 'Minhas Notificações', icon: Bell, view: 'resident_notifications' },
  { id: 'consumption', label: 'Consumo', icon: BarChart3, view: 'resident_consumption' },
  { id: 'reservations', label: 'Reservas', icon: Calendar, view: 'resident_reservations' },
  { id: 'report_issue', label: 'Notificar Intercorrência', icon: ShieldAlert, view: 'resident_report_issue' },
];