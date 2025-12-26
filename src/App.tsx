import React, { useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import AuthScreen from './components/auth/AuthScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CondominiumProvider } from './context/CondominiumContext';
import { Role } from './types/index';

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

const AppContent: React.FC = () => {
  const { signed, user, signOut, loading } = useAuth();
  const [currentView, setCurrentView] = React.useState<string>('admin_dashboard');

  useEffect(() => {
    if (user) {
      // Redirecionar para dashboard correto baseado no ROL do token
      setCurrentView(user.role === 'ADMIN' ? 'admin_dashboard' : 'resident_dashboard');
    }
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  const renderContent = () => {
    switch (currentView) {
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

      case 'resident_dashboard': return <ResidentDashboard onNavigate={setCurrentView} />;
      case 'resident_announcements': return <ResidentAnnouncements />;
      case 'resident_notifications': return <ResidentNotifications />;
      case 'resident_documents': return <ResidentDocuments />;
      case 'resident_consumption': return <ResidentConsumption />;
      case 'resident_reservations': return <ResidentReservations />;
      case 'resident_report_issue': return <ResidentReportIssue />;
      case 'resident_issues': return <ResidentIssues />;
      case 'resident_profile': return <ResidentProfile />;
      case 'resident_financial': return <ResidentFinancial />;
      case 'privacy_policy': return <PrivacyPolicy onBack={() => setCurrentView(user.role === 'ADMIN' ? 'admin_dashboard' : 'resident_dashboard')} />;
      case 'terms_of_use': return <TermsOfUse onBack={() => setCurrentView(user.role === 'ADMIN' ? 'admin_dashboard' : 'resident_dashboard')} />;

      default: return <div className="p-4 text-red-500">View not found: {currentView}</div>;
    }
  };

  if (!signed || !user) {
    // AuthScreen agora vai usar o hook useAuth internamente ou passar a função, 
    // mas idealmente AuthScreen chama o serviço de login e usa o contexto.
    return <AuthScreen />;
  }

  return (
    <MainLayout
      role={user.role}
      currentView={currentView}
      onNavigate={setCurrentView}
      onLogout={signOut}
    >
      {renderContent()}
    </MainLayout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CondominiumProvider>
        <AppContent />
      </CondominiumProvider>
    </AuthProvider>
  );
};

export default App;