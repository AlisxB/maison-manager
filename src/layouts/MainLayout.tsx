import React, { useState } from 'react';
import { 
  Menu, 
  Bell,
  Home,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import { Role } from '../types';
import { ADMIN_NAV, RESIDENT_NAV } from '../constants';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const notifications = [
    { id: 1, title: 'Nova fatura disponível', time: 'Há 5 min', unread: true },
    { id: 2, title: 'Manutenção na piscina', time: 'Há 2 horas', unread: false },
    { id: 3, title: 'Encomenda recebida', time: 'Há 4 horas', unread: true },
  ];

  const navItems = role === 'ADMIN' ? ADMIN_NAV : RESIDENT_NAV;
  const sidebarBg = role === 'ADMIN' ? 'bg-[#1e3a3a]' : 'bg-emerald-900';
  const sidebarText = 'text-slate-300';
  const activeItemBg = role === 'ADMIN' ? 'bg-[#264949] text-white border-l-4 border-yellow-500' : 'bg-emerald-800 text-white';
  const hoverItemBg = role === 'ADMIN' ? 'hover:bg-[#264949] hover:text-white' : 'hover:bg-emerald-800 hover:text-white';

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-slate-900 shadow-lg ${role === 'ADMIN' ? 'bg-yellow-500' : 'bg-white'}`}>
          <Home size={24} fill="currentColor" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Maison</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-0 py-2 custom-scrollbar">
        <nav className="space-y-0.5">
          {navItems.map((item) => {
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
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={`p-6 border-t ${role === 'ADMIN' ? 'border-[#2a4a4a]' : 'border-emerald-800'}`}>
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
              <div className="relative">
                <button 
                  onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileMenuOpen(false); }}
                  className={`relative p-2 transition-colors rounded-full hover:bg-slate-100 ${isNotificationsOpen ? 'bg-slate-100 text-slate-800' : 'text-slate-400'}`}
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800">Notificações</h3>
                      <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700">Marcar todas</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((note) => (
                        <div key={note.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${note.unread ? 'bg-indigo-50/30' : ''}`}>
                          <div className="flex justify-between items-start">
                            <h4 className={`text-sm ${note.unread ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{note.title}</h4>
                            {note.unread && <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5"></span>}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{note.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

              <div className="relative">
                <button 
                  onClick={() => { setIsProfileMenuOpen(!isProfileMenuOpen); setIsNotificationsOpen(false); }}
                  className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium shadow-sm ring-2 ring-white">
                    {role === 'ADMIN' ? 'AD' : 'AF'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-slate-700 leading-none">
                      {role === 'ADMIN' ? 'Admin User' : 'Alice Freeman'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {role === 'ADMIN' ? 'Gestor' : 'Unidade 101'}
                    </p>
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 space-y-1">
                      <button 
                        onClick={() => {
                          if (role === 'RESIDENT') onNavigate('resident_profile');
                          else if (role === 'ADMIN') onNavigate('admin_profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
                      >
                        <User size={16} />
                        Meu Perfil
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
                        <Settings size={16} />
                        Configurações
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
      </div>
    </div>
  );
};

export default MainLayout;