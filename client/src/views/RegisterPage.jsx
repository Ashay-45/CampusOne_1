import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  GraduationCap, 
  BookOpen, 
  Shield, 
  Check 
} from 'lucide-react';

export const RegisterPage = () => {
  const { register, isAuthenticated, role: activeRole } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('student');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: 'Computer Science & Engineering',
    roll: '',
    employeeId: '',
    adminSecret: 'CAMPUS2026'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to rightful dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      if (activeRole === 'teacher') navigate('/teacher', { replace: true });
      else if (activeRole === 'admin') navigate('/admin', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, activeRole, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please complete all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        role: selectedRole,
        roll: selectedRole === 'student' ? (formData.roll || `CS-2024-${Math.floor(Math.random() * 900 + 100)}`) : undefined,
        employeeId: selectedRole === 'teacher' ? (formData.employeeId || `EMP-FAC-${Math.floor(Math.random() * 900 + 100)}`) : undefined,
        adminSecret: selectedRole === 'admin' ? formData.adminSecret : undefined
      });

      const userRole = res?.user?.role || selectedRole;
      if (userRole === 'teacher') {
        navigate('/teacher');
      } else if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleConfigs = [
    {
      id: 'student',
      label: 'Student',
      icon: <GraduationCap size={16} />,
      badge: 'Academic Hub',
      desc: 'Attendance tracking, course schedules, Code Hub sandbox, assessments, and ATS career portfolio.'
    },
    {
      id: 'teacher',
      label: 'Teacher / Faculty',
      icon: <BookOpen size={16} />,
      badge: 'Faculty Portal',
      desc: 'Class attendance rosters, session marking, assessment authoring, and student performance matrices.'
    },
    {
      id: 'admin',
      label: 'Administrator',
      icon: <Shield size={16} />,
      badge: 'System Admin',
      desc: 'Institutional metrics, department administration, user provisioning, and compliance oversight.'
    }
  ];

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div className="landing-logo-badge" style={{ width: '32px', height: '32px' }}>
              <Sparkles size={18} />
            </div>
            <span style={{ fontFamily: 'Bricolage Grotesque, serif', fontWeight: 800, fontSize: '1.4rem', color: 'var(--ink)' }}>
              Campus<i>One</i>
            </span>
          </Link>
        </div>

        <h1 className="auth-title" style={{ textAlign: 'center' }}>Create Your Account</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center' }}>
          Select your institutional role to access your dedicated workspace.
        </p>

        {/* Role Selector Tabs */}
        <div style={{ marginBottom: '22px' }}>
          <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>
            Select Account Role
          </label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '8px',
            background: 'var(--bg)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--bd)'
          }}>
            {roleConfigs.map((r) => {
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleChange(r.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: isSelected ? 'var(--ac)' : 'transparent',
                    color: isSelected ? '#FFFFFF' : 'var(--mut)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    transition: 'all 0.15s ease'
                  }}
                  id={`role-select-${r.id}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {r.icon}
                    <span>{r.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Role Description */}
          <div style={{ 
            marginTop: '10px', 
            padding: '10px 14px', 
            background: 'var(--sf)', 
            border: '1px solid var(--bd)', 
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            color: 'var(--mut)',
            lineHeight: 1.45
          }}>
            <strong style={{ color: 'var(--ink)' }}>
              {roleConfigs.find(r => r.id === selectedRole)?.label}:
            </strong>{' '}
            {roleConfigs.find(r => r.id === selectedRole)?.desc}
          </div>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bad-subtle)',
            color: 'var(--bad)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            border: '1px solid rgba(194, 65, 12, 0.2)'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="reg-firstName">First Name</label>
              <input
                id="reg-firstName"
                name="firstName"
                type="text"
                className="input-field"
                placeholder={selectedRole === 'teacher' ? 'Priya' : selectedRole === 'admin' ? 'System' : 'Aarav'}
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="reg-lastName">Last Name</label>
              <input
                id="reg-lastName"
                name="lastName"
                type="text"
                className="input-field"
                placeholder={selectedRole === 'teacher' ? 'Raman' : selectedRole === 'admin' ? 'Admin' : 'Sharma'}
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="reg-email">Institutional Email</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="input-field"
              placeholder={
                selectedRole === 'teacher' 
                  ? 'priya.raman@campusone.edu' 
                  : selectedRole === 'admin' 
                    ? 'admin@campusone.edu' 
                    : 'aarav.sharma@campusone.edu'
              }
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          {/* Role-Specific Secondary Fields */}
          {selectedRole === 'student' && (
            <div className="input-group">
              <label className="input-label" htmlFor="reg-roll">Roll Number (Optional)</label>
              <input
                id="reg-roll"
                name="roll"
                type="text"
                className="input-field"
                placeholder="CS-2024-042"
                value={formData.roll}
                onChange={handleChange}
              />
            </div>
          )}

          {selectedRole === 'teacher' && (
            <div className="input-group">
              <label className="input-label" htmlFor="reg-employeeId">Faculty Employee ID (Optional)</label>
              <input
                id="reg-employeeId"
                name="employeeId"
                type="text"
                className="input-field"
                placeholder="EMP-FAC-102"
                value={formData.employeeId}
                onChange={handleChange}
              />
            </div>
          )}

          {selectedRole === 'admin' && (
            <div className="input-group">
              <label className="input-label" htmlFor="reg-adminSecret">Institutional Passkey</label>
              <input
                id="reg-adminSecret"
                name="adminSecret"
                type="text"
                className="input-field"
                placeholder="CAMPUS2026"
                value={formData.adminSecret}
                onChange={handleChange}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--mut)', marginTop: '4px' }}>
                Default passkey: <code>CAMPUS2026</code>
              </span>
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="reg-department">Academic Department</label>
            <select
              id="reg-department"
              name="department"
              className="input-field"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Data Science & AI">Data Science & AI</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              className="input-field"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px', padding: '12px' }}
            disabled={isLoading}
            id="register-submit-btn"
          >
            {isLoading ? 'Creating Account...' : `Register as ${selectedRole.toUpperCase()}`}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--mut)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--ac)', fontWeight: 600 }}>
            Sign in here
          </Link>
        </div>

        <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '0.82rem' }}>
          <Link to="/" style={{ color: 'var(--mut)', textDecoration: 'none' }}>
            &larr; Back to Public Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
