import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './views/LandingPage';
import { LoginPage } from './views/LoginPage';
import { RegisterPage } from './views/RegisterPage';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { StudentDashboard } from './views/StudentDashboard';
import { AcademicsView } from './views/AcademicsView';
import { AiAssistantView } from './views/AiAssistantView';
import { TestsView } from './views/TestsView';
import { CodingHubView } from './views/CodingHubView';
import { ResumeCareerView } from './views/ResumeCareerView';
import { TeacherDashboard } from './views/TeacherDashboard';
import { AdminDashboard } from './views/AdminDashboard';

/**
 * Authenticated Workspace Shell
 * Wraps protected views with navigation, modals, and responsive tab management.
 */
function DashboardShell({ initialTab = 'dashboard' }) {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync activeTab when initialTab or role prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

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
        if (role === 'teacher') return <TeacherDashboard />;
        if (role === 'admin') return <AdminDashboard />;
        return <StudentDashboard onNavigate={handleSelectTab} />;
    }
  };

  return (
    <div>
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <main>
        {renderCurrentView()}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <Routes>
      {/* =====================================================================
          Public Routes (No authentication required, zero PII exposure)
          ===================================================================== */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* =====================================================================
          Protected Student Workspace (/dashboard)
          ===================================================================== */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardShell initialTab="dashboard" />
          </ProtectedRoute>
        }
      />

      {/* =====================================================================
          Protected Faculty / Teacher Portal (/teacher)
          ===================================================================== */}
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DashboardShell initialTab="teacher_dashboard" />
          </ProtectedRoute>
        }
      />

      {/* =====================================================================
          Protected Administrator Console (/admin)
          ===================================================================== */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardShell initialTab="admin_dashboard" />
          </ProtectedRoute>
        }
      />

      {/* =====================================================================
          Fallback: Redirect unknown paths to public landing page
          ===================================================================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
