import React, { useState } from 'react';
import MainLayout from './layouts/MainLayout';
import AuthScreen from './components/auth/AuthScreen';

// Admin Components (Modularized)
import { AdminDashboard } from './components/admin/Dashboard';
import { AdminResidents } from './components/admin/Residents';
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

// Resident Components (Modularized)
import { ResidentDashboard } from './components/resident/Dashboard';
import { ResidentReservations } from './components/resident/Reservations';
import { ResidentAnnouncements } from './components/resident/Announcements';
import { ResidentNotifications } from './components/resident/Notifications';
import { ResidentReportIssue } from './components/resident/ReportIssue';
import { ResidentConsumption } from './components/resident/Consumption';
import { ResidentProfile } from './components/resident/Profile';

import { Role } from './types/index';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<Role>('ADMIN');
  const [currentView, setCurrentView] = useState<string>('admin_dashboard');

  const handleLogin = (selectedRole: Role) => {
    setRole(selectedRole);
    setCurrentView(selectedRole === 'ADMIN' ? 'admin_dashboard' : 'resident_dashboard');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole('ADMIN');
    setCurrentView('admin_dashboard');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'admin_dashboard': return <AdminDashboard />;
      case 'admin_readings': return <AdminReadings />;
      case 'admin_residents': return <AdminResidents />;
      case 'admin_requests': return <AdminRequests />;
      case 'admin_financial': return <AdminFinancial />;
      case 'admin_issues': return <AdminIssues />;
      case 'admin_notifications': return <AdminNotifications />;
      case 'admin_announcements': return <AdminAnnouncements />;
      case 'admin_reservations': return <AdminReservations />;
      case 'admin_inventory': return <AdminInventory />;
      case 'admin_reports': return <AdminReports />;
      case 'admin_settings': return <AdminSettings />;
      case 'admin_profile': return <AdminProfile />;
      
      case 'resident_dashboard': return <ResidentDashboard />;
      case 'resident_announcements': return <ResidentAnnouncements />;
      case 'resident_notifications': return <ResidentNotifications />;
      case 'resident_consumption': return <ResidentConsumption />;
      case 'resident_reservations': return <ResidentReservations />;
      case 'resident_report_issue': return <ResidentReportIssue />;
      case 'resident_profile': return <ResidentProfile />;
      
      default: return <div className="p-4 text-red-500">View not found: {currentView}</div>;
    }
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <MainLayout 
      role={role} 
      currentView={currentView} 
      onNavigate={setCurrentView}
      onLogout={handleLogout}
    >
      {renderContent()}
    </MainLayout>
  );
};

export default App;