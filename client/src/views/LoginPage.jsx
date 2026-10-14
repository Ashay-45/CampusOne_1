import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, CheckCircle, Shield } from 'lucide-react';

export const LoginPage = () => {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to rightful dashboard
  React.useEffect(() => {
    if (isAuthenticated && role) {
      const destination = location.state?.from?.pathname || (
        role === 'teacher' ? '/teacher' : role === 'admin' ? '/admin' : '/dashboard'
      );
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, role, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both your institutional email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password);
      const userRole = res?.user?.role || 'student';
      if (userRole === 'teacher') navigate('/teacher');
      else if (userRole === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (presetEmail) => {
    setEmail(presetEmail);
    setPassword('Campus@2024');
    setError('');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
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

        <h1 className="auth-title" style={{ textAlign: 'center' }}>Welcome Back</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center' }}>
          Enter your institutional credentials to access your academic workspace.
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

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="login-email">Institutional Email</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                className="input-field"
                placeholder="name@campusone.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="input-field"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
            disabled={isLoading}
            id="login-submit-btn"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Quick Demo Personas Helper */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--bd)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--mut)', letterSpacing: '0.05em' }}>
              Evaluation Personas
            </span>
            <span className="badge badge-ac" style={{ fontSize: '0.72rem' }}>Quick Fill</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickFill('aarav.sharma@campusone.edu', 'student')}
              title="Fill Student Credentials"
              style={{ fontSize: '0.75rem', padding: '6px 8px' }}
            >
              Student
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickFill('priya.raman@campusone.edu', 'teacher')}
              title="Fill Teacher Credentials"
              style={{ fontSize: '0.75rem', padding: '6px 8px' }}
            >
              Teacher
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickFill('admin@campusone.edu', 'admin')}
              title="Fill Administrator Credentials"
              style={{ fontSize: '0.75rem', padding: '6px 8px' }}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Links to Register & Home */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--mut)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--ac)', fontWeight: 600 }}>
            Create one here
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

export default LoginPage;
