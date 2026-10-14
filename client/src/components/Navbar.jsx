import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Compass, 
  Sun, 
  Moon, 
  Bell, 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  Code, 
  FileText, 
  Bot, 
  Users, 
  Shield, 
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ activeTab, onSelectTab, onOpenRoleModal, onOpenAuthModal }) => {
  const { user, role } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const studentTabs = [
    { id: 'dashboard', label: 'Overview', icon: <Compass size={17} /> },
    { id: 'academics', label: 'Academics', icon: <BookOpen size={17} /> },
    { id: 'tests', label: 'Assessments', icon: <CheckCircle size={17} /> },
    { id: 'coding', label: 'Code Hub', icon: <Code size={17} /> },
    { id: 'career', label: 'Resume & Career', icon: <FileText size={17} /> },
    { id: 'ai', label: 'AI Mentor', icon: <Bot size={17} /> },
  ];

  const teacherTabs = [
    { id: 'teacher_dashboard', label: 'Faculty Hub', icon: <GraduationCap size={17} /> },
    { id: 'academics', label: 'Attendance Roster', icon: <CheckCircle size={17} /> },
    { id: 'tests', label: 'Exam Bank', icon: <BookOpen size={17} /> },
    { id: 'ai', label: 'Curriculum AI', icon: <Bot size={17} /> },
  ];

  const adminTabs = [
    { id: 'admin_dashboard', label: 'Admin Center', icon: <Shield size={17} /> },
    { id: 'academics', label: 'Curriculum & Batches', icon: <Layers size={17} /> },
    { id: 'tests', label: 'Institute Metrics', icon: <BookOpen size={17} /> },
  ];

  let currentTabs = studentTabs;
  if (role === 'teacher') currentTabs = teacherTabs;
  if (role === 'admin') currentTabs = adminTabs;

  return (
    <header className="navbar-wrapper">
      <div className="navbar">
        {/* Logo */}
        <div className="nav-logo" onClick={() => onSelectTab(role === 'student' ? 'dashboard' : role === 'teacher' ? 'teacher_dashboard' : 'admin_dashboard')}>
          <div className="nav-logo-icon">
            <Sparkles size={18} />
          </div>
          <span>Campus<i>One</i></span>
        </div>

        {/* Tab Navigation */}
        <nav className="nav-links">
          {currentTabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="nav-actions">
          {/* Quick Role Switcher Pill */}
          <button 
            className={`role-badge role-${role}`}
            onClick={onOpenRoleModal}
            title="Switch User Role"
          >
            <span>{role}</span>
            <ChevronDown size={14} />
          </button>

          {/* Theme Toggle Button */}
          <button 
            className="icon-btn" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notification Button */}
          <div style={{ position: 'relative' }}>
            <button 
              className="icon-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Bell size={18} />
              <span className="badge-dot" />
            </button>

            {showNotifications && (
              <div 
                className="glass-card" 
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '300px',
                  padding: '16px',
                  zIndex: 60,
                  boxShadow: 'var(--sh-lg)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '0.95rem' }}>Notifications</h4>
                  <span className="badge badge-ac">3 New</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                  <div style={{ padding: '8px', background: 'var(--bd)', borderRadius: '8px' }}>
                    <strong>DBMS Midterm Quiz</strong> scheduled for tomorrow at 10:00 AM.
                  </div>
                  <div style={{ padding: '8px', background: 'var(--bd)', borderRadius: '8px' }}>
                    <strong>Attendance Alert:</strong> Operating Systems is at 74% (Needs +1 class).
                  </div>
                  <div style={{ padding: '8px', background: 'var(--bd)', borderRadius: '8px' }}>
                    <strong>New DSA challenge:</strong> Dynamic Programming milestone opened.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Chip */}
          <div 
            onClick={onOpenAuthModal}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              padding: '3px 10px 3px 4px',
              borderRadius: '999px',
              border: '1px solid var(--bd)',
              background: 'var(--sf)'
            }}
            title="Profile & Settings"
          >
            <img 
              src={user.avatar} 
              alt={user.name} 
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.firstName || user.name}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
