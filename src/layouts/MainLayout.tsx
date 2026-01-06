import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Bell,
  BellRing,
  Home,
  User,
  LogOut,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { Role } from '../types';
import { ADMIN_NAV, RESIDENT_NAV } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useCondominium } from '../context/CondominiumContext';
import { NotificationService, Notification } from '../services/notificationService';
import { DashboardService, DashboardStats } from '../services/dashboardService';

interface LayoutProps {
  children: React.ReactNode;
  role: Role;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const MainLayout: React.FC<LayoutProps> = ({
  children,
  role,
  currentView,
  onNavigate,
  onLogout
}) => {
  const { user } = useAuth();
  const { condominium } = useCondominium();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasNew, setHasNew] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      NotificationService.getAll()
        .then(data => {
          setNotifications(data);
          if (data.some(note => !note.read)) {
            setHasNew(true);
          }
        })
        .catch(err => console.error("Failed to fetch notifications", err));
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `Há ${minutes} min`;
    if (hours < 24) return `Há ${hours} horas`;
    return `Há ${days} dias`;
  };

  const handleNotificationClick = (note: Notification) => {
    if (note.link) {
      let view = note.link;
      
      // Handle both resident and admin paths logic
      if (view.startsWith('/resident/')) {
        view = view.replace('/resident/', 'resident_');
      } else if (view.startsWith('/admin/')) {
        view = view.replace('/admin/', 'admin_');
      } else {
        view = view.replace('/', '');
      }
      
      // Remove any leading slashes
      view = view.replace(/^\//, '');

      onNavigate(view);
    }
    setIsNotificationsOpen(false);
  };

  const handleOpenNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen) {
      setHasNew(false);
      if (hasNew) {
        NotificationService.markAllAsRead().catch(console.error);
        // Visually mark as read immediately to match backend state
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    }
    setIsProfileMenuOpen(false);
  }

  const [pendingCounts, setPendingCounts] = useState({ occurrences: 0, access_requests: 0, reservations: 0 });

  useEffect(() => {
    const adminRoles = ['ADMIN', 'SINDICO', 'SUBSINDICO', 'CONSELHO', 'PORTEIRO', 'FINANCEIRO'];
    if (user && adminRoles.includes(role)) {
      DashboardService.getStats().then(stats => {
        if (stats.pending_counts) {
          setPendingCounts(stats.pending_counts);
        }
      }).catch(err => console.error("Error fetching badges", err));
    }
  }, [user, role, currentView]); // Refresh when view changes to update counts? Might be too heavy. Maybe just on mount and periodic? keeping simple for now.

  const adminRoles = ['ADMIN', 'SINDICO', 'SUBSINDICO', 'CONSELHO', 'PORTEIRO', 'FINANCEIRO'];

  // Determine if we should show Admin or Resident Sidebar
  // If the user is on a Resident View, show Resident Sidebar regardless of their actual Role.
  // Otherwise, fallback to their Role capabilities.
  const isResidentView = currentView.startsWith('resident_');
  const showAdminSidebar = adminRoles.includes(role) && !isResidentView;

  const navItems = showAdminSidebar ? ADMIN_NAV : RESIDENT_NAV;
  const sidebarBg = showAdminSidebar ? 'bg-[#1e3a3a]' : 'bg-emerald-900';
  const sidebarText = 'text-slate-300';
  const activeItemBg = showAdminSidebar ? 'bg-[#264949] text-white border-l-4 border-yellow-500' : 'bg-emerald-800 text-white';
  const hoverItemBg = showAdminSidebar ? 'hover:bg-[#264949] hover:text-white' : 'hover:bg-emerald-800 hover:text-white';

  const getBadge = (view: string) => {
    // Badges are for Admin items mostly
    if (!showAdminSidebar) return null;

    let count = 0;
    if (view === 'admin_issues') count = pendingCounts.occurrences;
    if (view === 'admin_requests') count = pendingCounts.access_requests;
    if (view === 'admin_reservations') count = pendingCounts.reservations;

    if (count > 0) {
      return (
        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {count}
        </span>
      );
    }
    return null;
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-slate-900 shadow-lg ${showAdminSidebar ? 'bg-yellow-500' : 'bg-white'}`}>
          <Home size={24} fill="currentColor" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {condominium?.sidebar_title || condominium?.name || 'Maison Manager'}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-0 py-2 custom-scrollbar">
        <nav className="space-y-0.5">
          {navItems.filter(item => !item.allowedRoles || item.allowedRoles.includes(role)).map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.view);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors duration-150
                  ${isActive ? `${activeItemBg}` : `${sidebarText} ${hoverItemBg}`}`}
              >
                <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span className="flex-1 text-left">{item.label}</span>
                {getBadge(item.view)}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={`p-6 border-t ${showAdminSidebar ? 'border-[#2a4a4a]' : 'border-emerald-800'}`}>
        <button onClick={onLogout} className="flex items-center gap-3 w-full group transition-colors">
          <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white border border-slate-600 group-hover:border-yellow-500 transition-colors">
            <span className="font-medium">N</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-slate-300 group-hover:text-white">Sair</span>
            <span className="text-xs text-slate-500">v2.0.0</span>
          </div>
        </button>
      </div>
    </div>
  );

  const getRoleLabel = (role: string) => {
    const map: Record<string, string> = {
      'ADMIN': 'Administrador',
      'SINDICO': 'Síndico',
      'SUBSINDICO': 'Sub-síndico',
      'CONSELHO': 'Conselho',
      'PORTEIRO': 'Portaria',
      'FINANCEIRO': 'Financeiro',
      'RESIDENT': 'Morador',
      'RESIDENTE': 'Morador'
    };
    return map[role] || role;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 ${sidebarBg} transform transition-transform duration-200 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <NavContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-8 py-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md"
            >
              <Menu size={24} />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-6">
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={handleOpenNotifications}
                  className={`relative p-2 transition-colors rounded-full hover:bg-slate-100 ${isNotificationsOpen ? 'bg-slate-100 text-slate-800' : 'text-slate-400'}`}
                >
                  {hasNew ? <BellRing size={20} className="text-indigo-600" /> : <Bell size={20} />}
                  {hasNew && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800">Notificações</h3>
                      <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700">Marcar todas</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? notifications.map((note) => (
                        <div key={note.id} onClick={() => handleNotificationClick(note)} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!note.read ? 'bg-indigo-50/30' : ''}`}>
                          <div className="flex justify-between items-start">
                            <h4 className={`text-sm ${!note.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{note.title}</h4>
                            {!note.read && <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shrink-0"></span>}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{timeAgo(note.created_at)}</p>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-slate-400 text-sm">Nenhuma notificação recente.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => { setIsProfileMenuOpen(!isProfileMenuOpen); setIsNotificationsOpen(false); }}
                  className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium shadow-sm ring-2 ring-white">
                    {user?.name?.charAt(0) || (showAdminSidebar ? 'A' : 'M')}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-slate-700 leading-none">
                      {user?.name || (showAdminSidebar ? 'Administrador' : 'Morador')}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {showAdminSidebar ? getRoleLabel(role) : (user?.unit ? `Unidade ${user.unit}` : 'Residente')}
                    </p>
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          if (role === 'RESIDENT' || role === 'RESIDENTE' || !showAdminSidebar) onNavigate('resident_profile');
                          else if (showAdminSidebar) onNavigate('admin_profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
                      >
                        <User size={16} />
                        Meu Perfil
                      </button>

                    </div>
                    <div className="h-px bg-slate-100 my-1 mx-2"></div>
                    <div className="p-2">
                      <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut size={16} />
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50">
          {children}
        </main>

        <footer className="py-4 px-8 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4 flex-shrink-0">
          <p>&copy; 2025 Maison Manager. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <button onClick={() => onNavigate('privacy_policy')} className="hover:text-slate-600 transition-colors">Política de Privacidade</button>
            <button onClick={() => onNavigate('terms_of_use')} className="hover:text-slate-600 transition-colors">Termos de Uso</button>
            <span className="flex items-center gap-1"><ShieldCheck size={12} /> LGPD Compliant</span>
          </div>
        </footer>
      </div >
    </div >
  );
};

export default MainLayout;