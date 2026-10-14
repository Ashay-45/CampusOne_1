import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import { Shield, Users, Server, Building2, Activity, UserPlus, CheckCircle, Database, Lock, X, RefreshCw } from 'lucide-react';

const fallbackUsers = [
  { id: 'usr_01', name: 'Aarav Sharma', email: 'aarav.sharma@campusone.edu', role: 'student', dept: 'CSE', status: 'Active' },
  { id: 'usr_02', name: 'Dr. Priya Raman', email: 'priya.raman@campusone.edu', role: 'teacher', dept: 'CSE', status: 'Active' },
  { id: 'usr_03', name: 'Aanchal Kapoor', email: 'aanchal.k@campusone.edu', role: 'student', dept: 'ECE', status: 'Active' },
  { id: 'usr_04', name: 'Prof. K. Verma', email: 'k.verma@campusone.edu', role: 'teacher', dept: 'IT', status: 'Active' },
  { id: 'usr_05', name: 'Aditya Deshmukh', email: 'aditya.d@campusone.edu', role: 'student', dept: 'CSE', status: 'Active' }
];

const fallbackDepts = [
  { name: 'Computer Science & Eng', students: 840, avgCgpa: 8.42, placementRate: '94%', compliant: '89%' },
  { name: 'Electronics & Communication', students: 620, avgCgpa: 8.15, placementRate: '88%', compliant: '82%' },
  { name: 'Information Technology', students: 510, avgCgpa: 8.28, placementRate: '91%', compliant: '86%' },
  { name: 'Mechanical Engineering', students: 480, avgCgpa: 7.92, placementRate: '80%', compliant: '79%' }
];

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState(fallbackUsers);
  const [departments, setDepartments] = useState(fallbackDepts);
  const [metrics, setMetrics] = useState({
    totalStudents: '3,420',
    totalFaculty: '148',
    placementConversions: '89.4%',
    infrastructureHealth: '100% (Optimal)'
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('student');
  const [newDept, setNewDept] = useState('CSE');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, metricsRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getMetrics()
      ]);

      if (usersRes?.success && Array.isArray(usersRes.users) && usersRes.users.length > 0) {
        setUsersList(usersRes.users);
      }
      if (metricsRes?.success && metricsRes.stats) {
        setMetrics({
          totalStudents: String(metricsRes.stats.totalStudents),
          totalFaculty: String(metricsRes.stats.totalFaculty),
          placementConversions: metricsRes.stats.placementConversions,
          infrastructureHealth: metricsRes.stats.infrastructureHealth
        });
        if (Array.isArray(metricsRes.stats.departments)) {
          setDepartments(metricsRes.stats.departments);
        }
      }
    } catch (e) {
      console.warn('Could not load remote admin metrics, using institutional cached state:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await adminAPI.toggleUserStatus(userId);
      if (res?.success) {
        setUsersList(prev => prev.map(u => {
          if (u.id !== userId) return u;
          return { ...u, status: res.isActive ? 'Active' : 'Inactive' };
        }));
        setToast(`✅ ${res.message}`);
      }
    } catch (err) {
      setToast('⚠️ ' + err.message);
    } finally {
      setTimeout(() => setToast(''), 4000);
    }
  };

  const handleProvisionUser = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;

    try {
      const res = await adminAPI.provisionUser({
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
        department: newDept
      });
      if (res?.success) {
        setUsersList(prev => [res.user, ...prev]);
        setToast(`✅ User ${newName} (${newRole}) provisioned and persisted in MongoDB.`);
      }
      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
    } catch (err) {
      setToast('⚠️ ' + err.message);
    } finally {
      setTimeout(() => setToast(''), 4000);
    }
  };

  return (
    <div className="container page-wrapper">
      {/* Header */}
      <div 
        className="glass-card" 
        style={{ 
          marginBottom: '24px', 
          background: 'radial-gradient(ellipse at 85% 0%, rgba(194, 65, 12, 0.16), transparent 70%), var(--sf)' 
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-bad">Institutional Administration</span>
              <span style={{ fontSize: '0.84rem', color: 'var(--mut)' }}>Campus Central Governance</span>
            </div>
            <h1 style={{ fontSize: '1.9rem', marginBottom: '4px' }}>
              System Governance & Control Center 🛡️
            </h1>
            <p style={{ color: 'var(--mut)', fontSize: '0.94rem' }}>
              Institution-wide user provisioning, department health metrics, and infrastructure security.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={fetchAdminData}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <UserPlus size={16} /> Provision New Account
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{ padding: '12px 18px', background: 'var(--ac-glow)', color: 'var(--ac)', borderRadius: 'var(--radius-md)', border: '1px solid var(--ac)', marginBottom: '18px', fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {/* Institutional Top Metrics */}
      <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
        <div className="glass-card stat-card">
          <span className="stat-label">Enrolled Students</span>
          <div className="stat-value">{metrics.totalStudents}</div>
          <span className="stat-change positive">Across 6 Departments</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Faculty Members</span>
          <div className="stat-value">{metrics.totalFaculty}</div>
          <span className="stat-change positive">100% Active Load</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Placement Conversions</span>
          <div className="stat-value">{metrics.placementConversions}</div>
          <span className="stat-change positive">+4.2% vs Last Year</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Infrastructure Health</span>
          <div className="stat-value" style={{ color: 'var(--ac)' }}>{metrics.infrastructureHealth}</div>
          <span className="stat-change positive">Zero Outages</span>
        </div>
      </div>

      {/* Main Grid: User Table & Dept Metrics */}
      <div className="grid-2-1">
        {/* User Registry */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Active User Registry</h3>
            <span style={{ color: 'var(--mut)', fontSize: '0.85rem' }}>Total Accounts: {usersList.length}</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bd)', color: 'var(--mut)' }}>
                  <th style={{ padding: '8px 10px' }}>User</th>
                  <th style={{ padding: '8px 10px' }}>Role</th>
                  <th style={{ padding: '8px 10px' }}>Dept</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                  <th style={{ padding: '8px 10px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--bd)' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--mut)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${u.role === 'student' ? 'badge-ac' : u.role === 'teacher' ? 'badge-hi' : 'badge-bad'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: 'var(--mut)' }}>{u.dept}</td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${u.status === 'Active' ? 'badge-ac' : 'badge-bad'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                        onClick={() => handleToggleStatus(u.id)}
                      >
                        {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Department Analytics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {departments.map((d, i) => (
                <div key={i} style={{ padding: '12px', background: 'var(--sf-solid)', borderRadius: 'var(--radius-md)', border: '1px solid var(--bd)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '4px' }}>{d.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '0.78rem', color: 'var(--mut)' }}>
                    <div>Avg GPA: <strong style={{ color: 'var(--ink)' }}>{d.avgCgpa}</strong></div>
                    <div>Placement: <strong style={{ color: 'var(--ac)' }}>{d.placementRate}</strong></div>
                    <div>Attendance: <strong style={{ color: 'var(--hi)' }}>{d.compliant}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Provision Account Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Provision Institutional Account</h3>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleProvisionUser}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Dr. Rajesh Kumar" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Official Email</label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="rajesh.kumar@campusone.edu" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Temporary Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="Min 6 characters" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Account Role</label>
                  <select className="input-field" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="teacher">Faculty / Instructor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Department</label>
                  <select className="input-field" value={newDept} onChange={(e) => setNewDept(e.target.value)}>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="IT">IT</option>
                    <option value="MECH">MECH</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Create Verified Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
