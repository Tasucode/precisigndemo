import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppSidebar } from './components/layout/AppSidebar';
import { AppHeader } from './components/layout/AppHeader';
import { DashboardView } from './components/dashboard/DashboardView';
import { CreateRequestView } from './components/create/CreateRequestView';
import { ReviewSignView } from './components/review/ReviewSignView';
import { WorkflowSettingsView } from './components/settings/WorkflowSettingsView';
import { UserProfileView } from './components/profile/UserProfileView';

const MainLayout: React.FC = () => {
  const { activeView } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900">
      {/* Dark Navy Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <AppHeader />

        {/* Dynamic View Router */}
        <main className="flex-1 pb-16 overflow-y-auto">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'requests' && <DashboardView />}
          {activeView === 'create-request' && <CreateRequestView />}
          {activeView === 'review-sign' && <ReviewSignView />}
          {activeView === 'workflow-settings' && <WorkflowSettingsView />}
          {activeView === 'user-profile' && <UserProfileView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
