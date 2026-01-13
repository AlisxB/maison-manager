import React, { useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import AuthScreen from './components/auth/AuthScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CondominiumProvider } from './context/CondominiumContext';
import { Role } from './types/index';
import { RoleSelectionScreen } from './components/common/RoleSelectionScreen';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Admin Components (Modularized)
import { AdminDashboard } from './components/admin/Dashboard';
import { AdminResidents } from './components/admin/Residents';
import { AdminUnits } from './components/admin/Units';
import { AdminReadings } from './components/admin/Readings';
import { AdminRequests } from './components/admin/Requests';
import { AdminFinancial } from './components/admin/Financial';
import { AdminIssues } from './components/admin/Issues';
import { AdminNotifications } from './components/admin/Notifications';
import { AdminAnnouncements } from './components/admin/Announcements';
import { AdminReservations } from './components/admin/Reservations';
import { AdminInventory } from './components/admin/Inventory';
import { AdminReports } from './components/admin/Reports';
import { AdminSettings } from './components/admin/Settings';
import { AdminProfile } from './components/admin/Profile';
import { ViolationsView } from './components/admin/ViolationsView';

// Resident Components (Modularized)
import { ResidentDashboard } from './components/resident/Dashboard';
import { ResidentReservations } from './components/resident/Reservations';
import { ResidentAnnouncements } from './components/resident/Announcements';
import { ResidentNotifications } from './components/resident/Notifications';
import { ResidentReportIssue } from './components/resident/ReportIssue';
import { ResidentIssues } from './components/resident/Issues';
// ... imports
import { ResidentConsumption } from './components/resident/Consumption';
import { ResidentProfile } from './components/resident/Profile';
import { ResidentFinancial } from './components/resident/MyFinancials';
import { ResidentDocuments } from './components/resident/Documents';
import { AdminDocuments } from './components/admin/Documents';
import { PrivacyPolicy } from './components/common/PrivacyPolicy';
import { TermsOfUse } from './components/common/TermsOfUse';
import { PublicReport } from './pages/PublicReport';

const AppContent: React.FC = () => {
  const { signed, user, signOut, loading } = useAuth();
  const [currentView, setCurrentView] = React.useState<string>('admin_dashboard');
  const [previousView, setPreviousView] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'ADMIN' | 'RESIDENT'>('ADMIN');

  // Verifica se é uma URL de Relatório Financeiro Público
  const isPublicReport = window.location.pathname.includes('/relatorio-financeiro/');

  if (isPublicReport) {
    return <PublicReport />;
  }

  const hasRedirected = React.useRef(false);

  useEffect(() => {
    if (user) {
      if (!hasRedirected.current) {
        if (user.role === 'ADMIN') {
          setCurrentView('admin_dashboard');
          setViewMode('ADMIN');
        } else if (['SINDICO', 'SUBSINDICO', 'CONSELHO', 'FINANCEIRO', 'PORTEIRO'].includes(user.role)) {
          // Usuários com múltiplos papéis (ex: Síndico) podem escolher o perfil de acesso
          setCurrentView('role_selection');
        } else {
          // Residentes padrão vão direto para o painel do morador
          setCurrentView('resident_dashboard');
          setViewMode('RESIDENT');
        }
        hasRedirected.current = true;
      }
    } else {
      hasRedirected.current = false;
    }
  }, [user]);

  // Intercepta a navegação para atualizar o Modo de Visualização e salvar histórico
  const handleNavigate = (view: string) => {
    // Atualiza o Contexto (View Mode) baseado no destino
    if (view.startsWith('admin_')) {
      setViewMode('ADMIN');
    } else if (view.startsWith('resident_')) {
      setViewMode('RESIDENT');
    }

    // Salva o histórico apenas para páginas institucionais neutras
    if (view === 'privacy_policy' || view === 'terms_of_use') {
      setPreviousView(currentView);
    }
    setCurrentView(view);
  };

  const handleBack = () => {
    if (previousView) {
      setCurrentView(previousView);
      setPreviousView(null);
    } else {
      // Fallback de segurança baseado no papel do usuário
      if (user?.role === 'ADMIN') setCurrentView('admin_dashboard');
      else if (user?.role === 'RESIDENTE') setCurrentView('resident_dashboard');
      else setCurrentView('role_selection');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'role_selection': return <RoleSelectionScreen onSelect={handleNavigate} />;
      
      // Admin Views
      case 'admin_dashboard': return <AdminDashboard />;
      case 'admin_units': return <AdminUnits />;
      case 'admin_readings': return <AdminReadings />;
      case 'admin_residents': return <AdminResidents />;
      case 'admin_requests': return <AdminRequests />;
      case 'admin_financial': return <AdminFinancial />;
      case 'admin_issues': return <AdminIssues />;
      case 'admin_violations': return <ViolationsView />;
      case 'admin_notifications': return <AdminNotifications />;
      case 'admin_announcements': return <AdminAnnouncements />;
      case 'admin_reservations': return <AdminReservations />;
      case 'admin_inventory': return <AdminInventory />;
      case 'admin_reports': return <AdminReports />;
      case 'admin_settings': return <AdminSettings />;
      case 'admin_profile': return <AdminProfile />;
      case 'admin_documents': return <AdminDocuments />;

      // Resident Views
      case 'resident_dashboard': return <ResidentDashboard onNavigate={handleNavigate} />;
      case 'resident_announcements': return <ResidentAnnouncements />;
      case 'resident_notifications': return <ResidentNotifications />;
      case 'resident_documents': return <ResidentDocuments />;
      case 'resident_consumption': return <ResidentConsumption />;
      case 'resident_reservations': return <ResidentReservations />;
      case 'resident_report_issue': return <ResidentReportIssue />;
      case 'resident_issues': return <ResidentIssues />;
      case 'resident_profile': return <ResidentProfile />;
      case 'resident_financial': return <ResidentFinancial />;
      
      // Public / Neutral Views
      case 'privacy_policy': return <PrivacyPolicy onBack={handleBack} />;
      case 'terms_of_use': return <TermsOfUse onBack={handleBack} />;

      default: return <div className="p-4 text-red-500">View not found: {currentView}</div>;
    }
  };

  if (!signed || !user) {
    // Tela de Autenticação para usuários não logados
    return <AuthScreen />;
  }

  if (currentView === 'role_selection') {
    return <RoleSelectionScreen onSelect={handleNavigate} />;
  }

  return (
    <MainLayout
      role={user.role}
      currentView={currentView}
      viewMode={viewMode}
      onNavigate={handleNavigate}
      onLogout={signOut}
    >
      {renderContent()}
    </MainLayout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CondominiumProvider>
          <AppContent />
        </CondominiumProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;