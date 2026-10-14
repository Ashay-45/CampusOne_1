import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('campusone_token') || null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  
  // Loading state remains true until the session is hydrated & verified with the backend
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('campusone_token')));

  // Hydrate session from backend on startup if token exists
  useEffect(() => {
    let isMounted = true;
    const storedToken = localStorage.getItem('campusone_token');

    if (!storedToken) {
      setLoading(false);
      return;
    }

    const hydrateSession = async () => {
      try {
        const res = await authAPI.getMe(storedToken);
        if (isMounted && res?.success && res.user) {
          // Strictly trust only server-verified role and profile
          setUser(res.user);
          setRole(res.user.role);
          localStorage.setItem('campusone_user', JSON.stringify(res.user));
          localStorage.setItem('campusone_active_role', res.user.role);
        } else {
          throw new Error('Invalid user session');
        }
      } catch (err) {
        console.warn('Session verification failed or server unavailable:', err.message);
        if (isMounted) {
          setToken(null);
          setUser(null);
          setRole(null);
          localStorage.removeItem('campusone_token');
          localStorage.removeItem('campusone_user');
          localStorage.removeItem('campusone_active_role');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Backend login - role is derived exclusively from server response
  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    if (res?.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      setRole(res.user.role);
      localStorage.setItem('campusone_token', res.token);
      localStorage.setItem('campusone_user', JSON.stringify(res.user));
      localStorage.setItem('campusone_active_role', res.user.role);
      return res;
    }
    throw new Error(res?.message || 'Authentication failed');
  };

  // Backend registration - public registration assigns student role exclusively
  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res?.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      setRole(res.user.role);
      localStorage.setItem('campusone_token', res.token);
      localStorage.setItem('campusone_user', JSON.stringify(res.user));
      localStorage.setItem('campusone_active_role', res.user.role);
      return res;
    }
    throw new Error(res?.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // Best-effort logout notification
    }
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('campusone_token');
    localStorage.removeItem('campusone_user');
    localStorage.removeItem('campusone_active_role');
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
