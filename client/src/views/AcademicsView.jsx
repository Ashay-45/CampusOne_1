import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { academicsAPI } from '../services/api';
import { BookOpen, CheckCircle, AlertTriangle, UserCheck, Plus, Sparkles, Filter, RefreshCw, AlertCircle } from 'lucide-react';

const fallbackSubjects = [
  { id: 'sub_1', code: 'CS-601', name: 'Data Structures & Algorithms', faculty: 'Dr. Priya Raman', conducted: 32, attended: 30, credits: 4, syllabus: 82, room: 'Hall 302', rate: 93.8, safeBunks: 8, deficit: 0 },
  { id: 'sub_2', code: 'CS-602', name: 'Database Management Systems', faculty: 'Prof. K. Verma', conducted: 28, attended: 25, credits: 4, syllabus: 78, room: 'Lab 4', rate: 89.3, safeBunks: 5, deficit: 0 },
  { id: 'sub_3', code: 'CS-603', name: 'Operating Systems & Concurrency', faculty: 'Dr. S. Nair', conducted: 30, attended: 22, credits: 3, syllabus: 70, room: 'Hall 205', rate: 73.3, safeBunks: 0, deficit: 1 },
  { id: 'sub_4', code: 'CS-604', name: 'Full-Stack Web Engineering', faculty: 'Prof. M. Sen', conducted: 26, attended: 25, credits: 3, syllabus: 90, room: 'Software Lab 2', rate: 96.2, safeBunks: 7, deficit: 0 },
  { id: 'sub_5', code: 'CS-605', name: 'Machine Learning Foundations', faculty: 'Dr. Ananya Roy', conducted: 24, attended: 20, credits: 3, syllabus: 65, room: 'Hall 108', rate: 83.3, safeBunks: 2, deficit: 0 }
];

export const AcademicsView = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState(fallbackSubjects);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await academicsAPI.getSubjects();
      if (res?.success && Array.isArray(res.subjects) && res.subjects.length > 0) {
        setSubjects(res.subjects);
      } else {
        setSubjects(fallbackSubjects);
      }
    } catch (err) {
      console.warn('Academics subjects fetch error:', err.message);
      setError(err.message);
      setSubjects(fallbackSubjects);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [user]);

  const handleSimulateAttendance = (id, type) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== id) return s;
      const newConducted = s.conducted + 1;
      const newAttended = type === 'attend' ? s.attended + 1 : s.attended;
      const newRate = Number(((newAttended / newConducted) * 100).toFixed(1));
      const newSafeBunks = Math.max(0, Math.floor((newAttended / 0.75) - newConducted));
      const newDeficit = Math.max(0, Math.ceil((0.75 * newConducted - newAttended) / 0.25));

      return {
        ...s,
        conducted: newConducted,
        attended: newAttended,
        rate: newRate,
        safeBunks: newSafeBunks,
        deficit: newDeficit
      };
    }));
  };

  const totalConducted = subjects.reduce((sum, s) => sum + s.conducted, 0);
  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const overallRate = totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(1) : '88.5';

  return (
    <div className="container page-wrapper">
      {/* Network Notice */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'rgba(232, 163, 23, 0.12)', border: '1px solid var(--hi)', borderRadius: 'var(--radius-md)', marginBottom: '18px', color: 'var(--ink)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
            <AlertCircle size={16} style={{ color: 'var(--hi)' }} />
            <span>Operating in cached roster view ({error}).</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchSubjects}>
            <RefreshCw size={12} /> Refresh Live Courses
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.85rem' }}>Academics & Attendance Roster</h1>
          </div>
          <p style={{ color: 'var(--mut)', fontSize: '0.92rem' }}>
            Semester VI • Computer Science & Engineering • {subjects.length} Registered Courses
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="glass-surface" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--mut)' }}>Combined Attendance:</span>
            <strong style={{ fontSize: '1.1rem', color: Number(overallRate) >= 75 ? 'var(--ac)' : 'var(--bad)' }}>
              {overallRate}%
            </strong>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {subjects.map((sub) => {
          const rate = sub.rate || ((sub.attended / sub.conducted) * 100).toFixed(1);
          const isWarning = Number(rate) < 75;

          return (
            <div key={sub.id} className="glass-card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-neutral">{sub.code}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--mut)' }}>{sub.credits} Credits • {sub.room}</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{sub.name}</h3>
                  <div style={{ color: 'var(--mut)', fontSize: '0.86rem' }}>
                    Instructor: <strong>{sub.faculty}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {/* Attendance Stat */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isWarning ? 'var(--bad)' : 'var(--ac)', lineHeight: 1 }}>
                      {rate}%
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--mut)', marginTop: '2px' }}>
                      {sub.attended} of {sub.conducted} classes
                    </div>
                  </div>

                  {/* Attendance Simulator Controls */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => handleSimulateAttendance(sub.id, 'attend')}
                      title="Simulate Attend Session"
                    >
                      + Attended
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => handleSimulateAttendance(sub.id, 'miss')}
                      title="Simulate Miss Session"
                      style={{ color: 'var(--bad)' }}
                    >
                      + Missed
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress & Metrics Strip */}
              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', gap: '20px', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--mut)', marginBottom: '5px' }}>
                    <span>Syllabus Completion ({sub.syllabus}%)</span>
                    <span>Attendance Bar ({rate}%)</span>
                  </div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${rate}%`, 
                        background: isWarning ? 'var(--bad)' : 'linear-gradient(90deg, var(--ac), var(--hi))' 
                      }} 
                    />
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', padding: '6px 12px', background: 'var(--sf-solid)', borderRadius: '8px', border: '1px solid var(--bd)' }}>
                  <span style={{ color: 'var(--mut)' }}>Margin: </span>
                  <strong>{sub.safeBunks > 0 ? `${sub.safeBunks} safe to miss` : '0 missable'}</strong>
                </div>

                <div style={{ fontSize: '0.82rem', padding: '6px 12px', background: 'var(--sf-solid)', borderRadius: '8px', border: '1px solid var(--bd)' }}>
                  <span style={{ color: 'var(--mut)' }}>Deficit: </span>
                  <strong style={{ color: sub.deficit > 0 ? 'var(--bad)' : 'var(--ok)' }}>
                    {sub.deficit > 0 ? `Needs +${sub.deficit} classes` : 'Compliant'}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
