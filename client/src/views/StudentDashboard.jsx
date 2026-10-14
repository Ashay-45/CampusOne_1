import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { academicsAPI } from '../services/api';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  Award, 
  Sparkles, 
  ArrowRight,
  Flame,
  Zap,
  Target,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const StudentDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [targetAttendance, setTargetAttendance] = useState(75);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await academicsAPI.getStudentProfile();
      if (res?.success && res.profile) {
        setProfileData(res.profile);
      } else {
        throw new Error('Failed to load profile data');
      }
    } catch (err) {
      console.warn('Student profile fetch error:', err.message);
      setError(err.message);
      // Fallback to default student metrics
      setProfileData({
        cgpa: user?.cgpa || 8.84,
        totalClasses: 120,
        attendedClasses: 106,
        ranking: 4,
        streak: 14,
        timetable: [
          { time: '09:30 - 10:30 AM', subject: 'Data Structures & Algorithms', room: 'Hall 302', faculty: 'Dr. Priya Raman', status: 'completed' },
          { time: '10:45 - 11:45 AM', subject: 'Database Management Systems', room: 'Lab 4', faculty: 'Prof. K. Verma', status: 'ongoing' },
          { time: '01:30 - 02:30 PM', subject: 'Operating Systems & Concurrency', room: 'Hall 205', faculty: 'Dr. S. Nair', status: 'upcoming' },
          { time: '02:45 - 04:15 PM', subject: 'Full-Stack Web Engineering Lab', room: 'Software Lab 2', faculty: 'Prof. M. Sen', status: 'upcoming' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const totalClasses = profileData?.totalClasses || 120;
  const attendedClasses = profileData?.attendedClasses || 106;
  const currentPercentage = ((attendedClasses / totalClasses) * 100).toFixed(1);

  // Dynamic Bunk Math
  const safeMissableClasses = Math.max(0, Math.floor((attendedClasses / (targetAttendance / 100)) - totalClasses));
  const classesNeededIfDeficit = Math.max(0, Math.ceil((targetAttendance * totalClasses - 100 * attendedClasses) / (100 - targetAttendance)));

  const skillInsights = [
    { topic: 'SQL Joins & Grouping', mastery: 94, status: 'Mastered', color: 'var(--ac)' },
    { topic: 'Binary Search Trees', mastery: 86, status: 'Proficient', color: 'var(--ac)' },
    { topic: 'Dynamic Programming', mastery: 68, status: 'Needs Review', color: 'var(--bad)' },
    { topic: 'System Deadlocks (OS)', mastery: 74, status: 'Improving', color: 'var(--hi)' }
  ];

  return (
    <div className="container page-wrapper">
      {/* Network / Connection Alert */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'rgba(232, 163, 23, 0.12)', border: '1px solid var(--hi)', borderRadius: 'var(--radius-md)', marginBottom: '18px', color: 'var(--ink)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
            <AlertCircle size={16} style={{ color: 'var(--hi)' }} />
            <span>Could not connect to live backend profile. Operating in cached view ({error}).</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchProfile}>
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Top Welcome Banner */}
      <div 
        className="glass-card" 
        style={{ 
          marginBottom: '24px', 
          background: 'radial-gradient(ellipse at 80% 0%, var(--ac-glow), transparent 70%), var(--sf)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-ac">
                <Flame size={13} style={{ color: 'var(--hi)' }} /> {profileData?.streak || 14}-Day Study Streak
              </span>
              <span className="badge badge-neutral">{user?.division || profileData?.division || 'B.Tech CSE - 6th Sem'}</span>
            </div>
            <h1 style={{ fontSize: '1.9rem', marginBottom: '4px' }}>
              Welcome back, {user?.name || 'Student'}! 🚀
            </h1>
            <p style={{ color: 'var(--mut)', fontSize: '0.94rem' }}>
              Your academic standing is <strong style={{ color: 'var(--ac)' }}>Top 5%</strong> this semester. Next lecture starts in 20 minutes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={() => onNavigate('tests')}>
              <Zap size={16} /> Take Quick Quiz
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('ai')}>
              <Sparkles size={16} /> Ask AI Mentor
            </button>
          </div>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
        <div className="glass-card stat-card">
          <div className="stat-header">
            <span className="stat-label">Cumulative CGPA</span>
            <div className="stat-icon"><Award size={20} /></div>
          </div>
          <div>
            <div className="stat-value">{profileData?.cgpa || user?.cgpa || '8.84'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span className="stat-change positive"><TrendingUp size={12} /> +0.18</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--mut)' }}>Semester Rank #{profileData?.ranking || 4}</span>
            </div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-header">
            <span className="stat-label">Authoritative Attendance</span>
            <div className="stat-icon"><CheckCircle2 size={20} /></div>
          </div>
          <div>
            <div className="stat-value">{currentPercentage}%</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span className={`stat-change ${Number(currentPercentage) >= 75 ? 'positive' : 'danger'}`}>
                {Number(currentPercentage) >= 75 ? 'Safe Zone (>75%)' : 'Deficit Warning'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--mut)' }}>{attendedClasses} / {totalClasses} Sessions</span>
            </div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-header">
            <span className="stat-label">Assessments & Tests</span>
            <div className="stat-icon"><BookOpen size={20} /></div>
          </div>
          <div>
            <div className="stat-value">18 / 20</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span className="stat-change positive">91.4% Avg Score</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--mut)' }}>2 Pending</span>
            </div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-header">
            <span className="stat-label">Skill & Code Index</span>
            <div className="stat-icon"><Target size={20} /></div>
          </div>
          <div>
            <div className="stat-value">Level 4</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span className="stat-change positive">142 Solved</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--mut)' }}>Top 10% Batch</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 2-Column */}
      <div className="grid-2-1">
        {/* Left Column: Timetable & Attendance Calculator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Today's Timetable */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Today's Academic Schedule</h3>
                <span style={{ color: 'var(--mut)', fontSize: '0.85rem' }}>Monday, Semester VI — Core Sessions</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('academics')}>
                Full Calendar <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(profileData?.timetable || []).map((slot, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--bd)',
                    background: slot.status === 'ongoing' ? 'var(--ac-glow)' : 'var(--sf-solid)',
                    borderLeft: slot.status === 'ongoing' ? '4px solid var(--ac)' : '1px solid var(--bd)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ color: 'var(--mut)', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '5px', minWidth: '130px' }}>
                      <Clock size={14} /> {slot.time}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.98rem' }}>{slot.subject}</div>
                      <div style={{ color: 'var(--mut)', fontSize: '0.82rem' }}>
                        {slot.room} • {slot.faculty}
                      </div>
                    </div>
                  </div>

                  <div>
                    {slot.status === 'completed' && <span className="badge badge-ac">Attended</span>}
                    {slot.status === 'ongoing' && <span className="badge badge-hi">In Progress</span>}
                    {slot.status === 'upcoming' && <span className="badge badge-neutral">Scheduled</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Attendance Calculator */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Dynamic Attendance Projection & Bunk Margin</h3>
                <p style={{ color: 'var(--mut)', fontSize: '0.85rem' }}>
                  Simulate future attendance and see exactly how many sessions you can safely miss.
                </p>
              </div>
              <span className="badge badge-ac" style={{ fontSize: '0.88rem', padding: '4px 12px' }}>
                Current: {currentPercentage}%
              </span>
            </div>

            <div style={{ background: 'var(--sf-solid)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--bd)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Target Threshold: {targetAttendance}%</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--mut)' }}>Mandatory minimum: 75%</span>
              </div>
              <input 
                type="range" 
                min="65" 
                max="95" 
                value={targetAttendance} 
                onChange={(e) => setTargetAttendance(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--ac)', cursor: 'pointer', marginBottom: '16px' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(31, 122, 107, 0.1)', border: '1px solid var(--ac)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--mut)' }}>Safe to Bunk (at {targetAttendance}% target)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ac)' }}>
                    {safeMissableClasses} Lectures
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--mut)', marginTop: '2px' }}>
                    Without dropping below {targetAttendance}%
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--sf)', border: '1px solid var(--bd)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--mut)' }}>Deficit Protection</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: classesNeededIfDeficit > 0 ? 'var(--bad)' : 'var(--ok)' }}>
                    {classesNeededIfDeficit > 0 ? `${classesNeededIfDeficit} Needed` : 'Zero Deficit'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--mut)', marginTop: '2px' }}>
                    {classesNeededIfDeficit > 0 ? 'Consecutive attendances required' : 'Attendance in good standing'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Mentorship & Skill Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div 
            className="glass-card" 
            style={{ 
              background: 'linear-gradient(145deg, rgba(31, 122, 107, 0.12), rgba(232, 163, 23, 0.08)), var(--sf)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--ac)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem' }}>CampusOne AI Copilot</h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--ac)', fontWeight: 600 }}>Active Academic Coach</span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--ink)', marginBottom: '14px', lineHeight: 1.45 }}>
              "Your test accuracy in <strong>Dynamic Programming</strong> is at 68%. I've prepared targeted practice problems with hints to boost your placement readiness."
            </p>

            <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => onNavigate('ai')}>
              Open AI Mentor Session <ArrowRight size={14} />
            </button>
          </div>

          <div className="glass-card">
            <h4 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Knowledge Mastery Matrix</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {skillInsights.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{item.topic}</span>
                    <span style={{ color: item.color, fontWeight: 700 }}>{item.mastery}%</span>
                  </div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${item.mastery}%`,
                        background: item.mastery > 80 ? 'var(--ac)' : item.mastery > 70 ? 'var(--hi)' : 'var(--bad)'
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--bd)' }}>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => onNavigate('coding')}>
                Practice Weak Concepts <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
