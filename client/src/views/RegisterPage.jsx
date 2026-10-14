import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';

export const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: 'Computer Science & Engineering'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
      // Phase 4: Public registration always registers as student. Privileged roles require backend admin creation.
      await register({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        role: 'student'
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
          Get started with your personalized student academic workspace.
        </p>

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

        {/* Security / RBAC Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          padding: '10px 12px',
          background: 'var(--bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--bd)',
          fontSize: '0.8rem',
          color: 'var(--mut)',
          marginBottom: '20px'
        }}>
          <ShieldAlert size={16} color="var(--ac)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            Public registration creates a <strong>Student Account</strong>. Faculty and administrative roles are provisioned exclusively by institution administrators.
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="reg-firstName">First Name</label>
              <input
                id="reg-firstName"
                name="firstName"
                type="text"
                className="input-field"
                placeholder="Aarav"
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
                placeholder="Sharma"
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
              placeholder="aarav.sharma@campusone.edu"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

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
            {isLoading ? 'Creating Account...' : 'Create Account'}
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
