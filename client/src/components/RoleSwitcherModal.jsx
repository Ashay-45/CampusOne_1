import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, BookOpen, Shield, Check, X } from 'lucide-react';

export const RoleSwitcherModal = ({ isOpen, onClose, onSelectTab }) => {
  const { role, switchRole } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const roles = [
    {
      id: 'student',
      title: 'Student Persona',
      name: 'Aarav Sharma',
      desc: 'B.Tech CSE — 6th Semester. Access attendance calculator, assessments, coding hub, ATS resume builder and AI copilot.',
      badge: 'Academic & Career Hub',
      icon: <GraduationCap size={24} />,
      color: 'var(--ac)',
      targetTab: 'dashboard',
      route: '/dashboard'
    },
    {
      id: 'teacher',
      title: 'Faculty / Teacher Persona',
      name: 'Dr. Priya Raman',
      desc: 'Department of Computer Science. Take class attendance, configure question banks, evaluate student performance, and view risk matrices.',
      badge: 'Instructor & Evaluator',
      icon: <BookOpen size={24} />,
      color: 'var(--hi)',
      targetTab: 'teacher_dashboard',
      route: '/teacher'
    },
    {
      id: 'admin',
      title: 'Administrator Persona',
      name: 'Campus Administrator',
      desc: 'Institutional Administration. Manage departments, batches, faculty workloads, system metrics and student records.',
      badge: 'System Governance',
      icon: <Shield size={24} />,
      color: 'var(--bad)',
      targetTab: 'admin_dashboard',
      route: '/admin'
    }
  ];

  const handleSelectRole = (r) => {
    switchRole(r.id);
    if (onSelectTab) onSelectTab(r.targetTab);
    navigate(r.route);
    onClose();
  };


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Switch Campus Role</h2>
            <p style={{ color: 'var(--mut)', fontSize: '0.88rem' }}>
              Experience CampusOne from each persona's vantage point.
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {roles.map((r) => {
            const isCurrent = role === r.id;
            return (
              <div
                key={r.id}
                onClick={() => handleSelectRole(r)}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: isCurrent ? `2px solid ${r.color}` : '1px solid var(--bd)',
                  background: isCurrent ? 'rgba(31, 122, 107, 0.08)' : 'var(--sf)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  transition: 'all 0.18s ease'
                }}
              >
                <div 
                  style={{ 
                    width: '46px', 
                    height: '46px', 
                    borderRadius: '12px', 
                    background: isCurrent ? r.color : 'var(--bd)', 
                    color: isCurrent ? '#fff' : 'var(--ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {r.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{r.title}</span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>{r.name}</span>
                    </div>
                    {isCurrent && (
                      <span className="badge badge-ac" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={12} /> Active
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--mut)', fontSize: '0.86rem', lineHeight: 1.4 }}>
                    {r.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '22px', textAlign: 'right' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
