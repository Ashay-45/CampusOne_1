import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogIn, UserPlus, LogOut, ShieldCheck, AlertCircle } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { user, login, register, logout, isAuthenticated } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password, role: 'student' });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>
              {isAuthenticated ? 'Active User Session' : tab === 'login' ? 'Sign In to CampusOne' : 'Create Student Account'}
            </h2>
            <p style={{ color: 'var(--mut)', fontSize: '0.85rem' }}>
              {isAuthenticated 
                ? 'Authenticated with MongoDB & JWT' 
                : 'Enter institutional credentials to continue'}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {isAuthenticated ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--sf)', borderRadius: 'var(--radius-md)', border: '1px solid var(--bd)', marginBottom: '20px' }}>
              <img src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt={user?.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>{user?.name}</h3>
                <div style={{ color: 'var(--mut)', fontSize: '0.85rem' }}>{user?.email}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <span className={`role-badge role-${user?.role || 'student'}`}>{user?.role || 'student'}</span>
                  <span className="badge badge-ac"><ShieldCheck size={12} style={{ marginRight: '4px' }} /> Verified JWT</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn btn-outline" 
                style={{ width: '100%' }}
                onClick={() => { logout(); onClose(); }}
              >
                <LogOut size={16} /> Sign Out Session
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid var(--bd)', paddingBottom: '8px' }}>
              <button
                type="button"
                className={`btn btn-sm ${tab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setTab('login'); setError(''); }}
              >
                <LogIn size={15} /> Sign In
              </button>
              <button
                type="button"
                className={`btn btn-sm ${tab === 'register' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setTab('register'); setError(''); }}
              >
                <UserPlus size={15} /> Student Registration
              </button>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(194, 65, 12, 0.1)', color: 'var(--bad)', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {tab === 'register' && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Aarav Sharma" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Institutional Email</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="you@campusone.edu" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="At least 6 characters" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Authenticating...' : tab === 'login' ? 'Sign In to CampusOne' : 'Register Student Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
