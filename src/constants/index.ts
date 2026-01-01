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
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { NavItem } from '../types';

export const ADMIN_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, view: 'admin_dashboard', allowedRoles: ['ADMIN', 'SINDICO', 'SUBSINDICO', 'CONSELHO', 'FINANCEIRO'] },
  { id: 'units', label: 'Unidades', icon: Building, view: 'admin_units', allowedRoles: ['ADMIN', 'SINDICO'] },
  { id: 'readings', label: 'Leituras', icon: BarChart3, view: 'admin_readings', allowedRoles: ['ADMIN', 'SINDICO', 'SUBSINDICO'] },
  { id: 'residents', label: 'Moradores', icon: Users, view: 'admin_residents', allowedRoles: ['ADMIN', 'SINDICO', 'SUBSINDICO', 'PORTEIRO'] },
  { id: 'requests', label: 'Solicitações', icon: ClipboardList, view: 'admin_requests', allowedRoles: ['ADMIN', 'SINDICO'] },
  { id: 'financial', label: 'Financeiro', icon: Landmark, view: 'admin_financial', allowedRoles: ['ADMIN', 'SINDICO', 'CONSELHO', 'FINANCEIRO'] },
  { id: 'incidents', label: 'Intercorrências', icon: ShieldAlert, view: 'admin_issues', allowedRoles: ['ADMIN', 'SINDICO', 'SUBSINDICO', 'PORTEIRO'] },
  { id: 'incidents_violations', label: 'Multas e Infrações', icon: AlertTriangle, view: 'admin_violations', allowedRoles: ['ADMIN', 'SINDICO'] },
  { id: 'announcements', label: 'Avisos', icon: Megaphone, view: 'admin_announcements', allowedRoles: ['ADMIN', 'SINDICO', 'SUBSINDICO'] },
  { id: 'reservations', label: 'Gerenciar Reservas', icon: CalendarDays, view: 'admin_reservations', allowedRoles: ['ADMIN', 'SINDICO', 'SUBSINDICO'] },
  { id: 'documents', label: 'Documentos', icon: FolderOpen, view: 'admin_documents', allowedRoles: ['ADMIN', 'SINDICO', 'CONSELHO'] },
  { id: 'inventory', label: 'Estoque', icon: Package, view: 'admin_inventory', allowedRoles: ['ADMIN', 'SINDICO'] },
  { id: 'reports', label: 'Relatórios', icon: FileText, view: 'admin_reports', allowedRoles: ['ADMIN', 'SINDICO', 'SUBSINDICO'] },
  { id: 'admins', label: 'Administração', icon: ShieldCheck, view: 'admin_settings', allowedRoles: ['ADMIN', 'SINDICO'] },
];

export const RESIDENT_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Meu Lar', icon: Home, view: 'resident_dashboard' },
  { id: 'announcements', label: 'Avisos', icon: Megaphone, view: 'resident_announcements' },
  { id: 'documents', label: 'Documentos', icon: FolderOpen, view: 'resident_documents' },
  { id: 'notifications', label: 'Minhas Notificações', icon: Bell, view: 'resident_notifications' },
  { id: 'financial', label: 'Minhas Finanças', icon: Landmark, view: 'resident_financial' },
  { id: 'consumption', label: 'Consumo', icon: BarChart3, view: 'resident_consumption' },
  { id: 'reservations', label: 'Reservas', icon: Calendar, view: 'resident_reservations' },
  { id: 'report_issue', label: 'Notificar Intercorrência', icon: ShieldAlert, view: 'resident_report_issue' },
];