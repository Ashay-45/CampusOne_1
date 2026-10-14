import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { AuthModal } from './components/AuthModal';
import { StudentDashboard } from './views/StudentDashboard';
import { AcademicsView } from './views/AcademicsView';
import { AiAssistantView } from './views/AiAssistantView';
import { TestsView } from './views/TestsView';
import { CodingHubView } from './views/CodingHubView';
import { ResumeCareerView } from './views/ResumeCareerView';
import { TeacherDashboard } from './views/TeacherDashboard';
import { AdminDashboard } from './views/AdminDashboard';

export function App() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync default tab when role changes if tab is role-specific
  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StudentDashboard onNavigate={handleSelectTab} />;
      case 'academics':
        return <AcademicsView />;
      case 'ai':
        return <AiAssistantView />;
      case 'tests':
        return <TestsView />;
      case 'coding':
        return <CodingHubView />;
      case 'career':
        return <ResumeCareerView />;
      case 'teacher_dashboard':
        return <TeacherDashboard />;
      case 'admin_dashboard':
        return <AdminDashboard />;
      default:
        return <StudentDashboard onNavigate={handleSelectTab} />;
    }
  };

  return (
    <div>
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <main>
        {renderCurrentView()}
      </main>

      {/* Modals */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSelectTab={handleSelectTab}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default App;
