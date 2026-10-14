import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { academicsAPI } from '../services/api';
import { GraduationCap, Users, CheckSquare, AlertTriangle, BookOpen, Plus, Save, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

const defaultRoster = [
  { id: 'std_01', roll: 'CS-2023-040', name: 'Aakash Mehta', currentAttendance: 85, status: 'present' },
  { id: 'std_02', roll: 'CS-2023-041', name: 'Aanchal Kapoor', currentAttendance: 72, status: 'absent' },
  { id: 'std_03', roll: 'CS-2023-042', name: 'Aarav Sharma', currentAttendance: 88, status: 'present' },
  { id: 'std_04', roll: 'CS-2023-043', name: 'Aditya Deshmukh', currentAttendance: 68, status: 'absent' },
  { id: 'std_05', roll: 'CS-2023-044', name: 'Bhavna Joshi', currentAttendance: 92, status: 'present' },
  { id: 'std_06', roll: 'CS-2023-045', name: 'Chirag Reddy', currentAttendance: 74, status: 'present' }
];

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [selectedBatch, setSelectedBatch] = useState('CS-6A');
  const [roster, setRoster] = useState(defaultRoster);
  const [notification, setNotification] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const res = await academicsAPI.getBatchRoster(selectedBatch);
      if (res?.success && Array.isArray(res.students) && res.students.length > 0) {
        setRoster(res.students.map(s => ({
          id: s._id || s.id,
          roll: s.roll,
          name: s.name,
          currentAttendance: s.currentAttendance || 85,
          status: 'present'
        })));
      }
    } catch (e) {
      console.warn('Could not fetch remote batch roster, keeping active batch:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [selectedBatch]);

  const toggleStudent = (id) => {
    setRoster(prev => prev.map(s => {
      if (s.id !== id) return s;
      return { ...s, status: s.status === 'present' ? 'absent' : 'present' };
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const res = await academicsAPI.markAttendance({
        subjectCode: 'CS-601',
        batch: selectedBatch,
        topic: 'Data Structures - Tree Balancing & Graphs',
        sessionType: 'lecture',
        records: roster.map(s => ({
          studentId: s.id,
          status: s.status
        }))
      });

      if (res?.success) {
        setNotification(`✅ Attendance persisted to MongoDB! Session ID: ${res.session?.id ? res.session.id.slice(-6) : 'Verified'} (${res.summary?.present || 0} Present, ${res.summary?.absent || 0} Absent).`);
      } else {
        throw new Error(res?.message || 'Failed to persist session');
      }
    } catch (err) {
      setNotification(`⚠️ ${err.message || 'Error saving attendance to server'}`);
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(''), 5000);
    }
  };

  const atRiskStudents = roster.filter(r => r.currentAttendance < 75);

  return (
    <div className="container page-wrapper">
      {/* Header */}
      <div 
        className="glass-card" 
        style={{ 
          marginBottom: '24px', 
          background: 'radial-gradient(ellipse at 85% 0%, rgba(232, 163, 23, 0.18), transparent 70%), var(--sf)' 
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-hi">Faculty Portal</span>
              <span style={{ fontSize: '0.84rem', color: 'var(--mut)' }}>{user?.department || 'Computer Science & Engineering'}</span>
            </div>
            <h1 style={{ fontSize: '1.9rem', marginBottom: '4px' }}>
              Welcome, {user?.name || 'Faculty Member'} 🎓
            </h1>
            <p style={{ color: 'var(--mut)', fontSize: '0.94rem' }}>
              Primary Handled Subjects: Data Structures & Algorithms (CS-601), Database Systems (CS-602)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={handleSaveAttendance} disabled={saving}>
              <Save size={16} /> {saving ? 'Persisting...' : 'Save Active Roster'}
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <div style={{ padding: '12px 18px', background: 'var(--ac-glow)', color: 'var(--ac)', borderRadius: 'var(--radius-md)', border: '1px solid var(--ac)', marginBottom: '20px', fontWeight: 600 }}>
          {notification}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
        <div className="glass-card stat-card">
          <span className="stat-label">Total Lectures Conducted</span>
          <div className="stat-value">142</div>
          <span className="stat-change positive">98% on-schedule</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Active Student Batches</span>
          <div className="stat-value">3 Batches</div>
          <span style={{ fontSize: '0.82rem', color: 'var(--mut)' }}>184 Enrolled Students</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">At-Risk Attendance (&lt;75%)</span>
          <div className="stat-value" style={{ color: 'var(--bad)' }}>{atRiskStudents.length} Students</div>
          <span className="stat-change danger">Requires Notice</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Pending Lab Submissions</span>
          <div className="stat-value">14</div>
          <span className="stat-change warning">Lab 4 Review Due</span>
        </div>
      </div>

      {/* Main Grid: Roster & At-Risk Panel */}
      <div className="grid-2-1">
        {/* Attendance Roster Marker */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Live Session Attendance Marker</h3>
              <span style={{ color: 'var(--mut)', fontSize: '0.85rem' }}>Subject: CS-601 • Hall 302 • Batch {selectedBatch}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                className="input-field" 
                value={selectedBatch} 
                onChange={(e) => setSelectedBatch(e.target.value)}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                <option value="CS-6A">Batch CS-6A</option>
                <option value="CS-6B">Batch CS-6B</option>
                <option value="CS-6C">Batch CS-6C</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {roster.map((s) => {
              const isPresent = s.status === 'present';
              return (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--bd)',
                    background: isPresent ? 'var(--sf-solid)' : 'rgba(194, 65, 12, 0.06)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.94rem' }}>{s.name}</span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.74rem' }}>{s.roll}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: s.currentAttendance < 75 ? 'var(--bad)' : 'var(--mut)', marginTop: '2px' }}>
                      Historical Attendance: <strong>{s.currentAttendance}%</strong>
                    </div>
                  </div>

                  <button
                    className={`btn btn-sm ${isPresent ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      background: isPresent ? 'var(--ac)' : 'var(--bad)',
                      color: '#fff',
                      minWidth: '95px'
                    }}
                    onClick={() => toggleStudent(s.id)}
                  >
                    {isPresent ? '✓ Present' : '✗ Absent'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* At-Risk Intervention Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <AlertTriangle size={18} style={{ color: 'var(--bad)' }} />
              <h3 style={{ fontSize: '1.15rem' }}>Attendance Deficiency Alerts</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '14px' }}>
              Students below the 75% statutory University threshold in CS-601.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {atRiskStudents.map((s) => (
                <div key={s.id} style={{ padding: '10px 12px', background: 'var(--sf-solid)', borderRadius: '8px', border: '1px solid var(--bd)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{s.name}</strong>
                    <span style={{ color: 'var(--bad)', fontWeight: 700, fontSize: '0.88rem' }}>{s.currentAttendance}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--mut)' }}>Needs 3 consecutive attendances</span>
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                      Send Alert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
