import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const demoPersonas = {
  student: {
    id: 'demo_std_01',
    name: 'Aarav Sharma',
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: 'aarav.sharma@campusone.edu',
    role: 'student',
    roll: 'CS-2023-042',
    division: 'B.Tech CSE - 6th Sem',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    cgpa: 8.84,
    attendanceRate: 88.5,
    streak: 14,
    ranking: 4
  },
  teacher: {
    id: 'demo_tch_01',
    name: 'Dr. Priya Raman',
    firstName: 'Priya',
    lastName: 'Raman',
    email: 'priya.raman@campusone.edu',
    role: 'teacher',
    employeeId: 'EMP-FAC-889',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    subjectsHandled: ['Data Structures & Algorithms', 'Database Systems', 'Distributed Computing'],
    totalClassesTaken: 142,
    activeBatches: 3
  },
  admin: {
    id: 'demo_adm_01',
    name: 'Campus Administrator',
    firstName: 'Admin',
    lastName: 'Office',
    email: 'admin@campusone.edu',
    role: 'admin',
    adminId: 'ADMIN-ROOT-01',
    department: 'Academic Administration',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    systemStatus: 'Optimal (100%)',
    totalUsers: 3420
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('campusone_token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('campusone_active_role') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusone_user');
    const savedToken = localStorage.getItem('campusone_token');
    if (saved && savedToken) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  
  // Only show initial loading state if a token exists and needs backend hydration
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('campusone_token')));
  const [isDemoMode, setIsDemoMode] = useState(false);

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
          setUser(res.user);
          setRole(res.user.role);
          setIsDemoMode(false);
          localStorage.setItem('campusone_user', JSON.stringify(res.user));
          localStorage.setItem('campusone_active_role', res.user.role);
        }
      } catch (err) {
        console.warn('Session expired or server unavailable:', err.message);
        if (isMounted) {
          setToken(null);
          setUser(null);
          setRole(null);
          setIsDemoMode(false);
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

  // Real backend login
  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    if (res?.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      setRole(res.user.role);
      setIsDemoMode(false);
      localStorage.setItem('campusone_token', res.token);
      localStorage.setItem('campusone_user', JSON.stringify(res.user));
      localStorage.setItem('campusone_active_role', res.user.role);
      return res;
    }
    throw new Error(res?.message || 'Login failed');
  };

  // Real backend registration (public registration assigns student)
  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res?.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      setRole(res.user.role);
      setIsDemoMode(false);
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
    } catch (e) {}
    setToken(null);
    setUser(null);
    setRole(null);
    setIsDemoMode(false);
    localStorage.removeItem('campusone_token');
    localStorage.removeItem('campusone_user');
    localStorage.removeItem('campusone_active_role');
  };

  // Explicit demo persona switch (UI ONLY preview)
  const switchDemoPersona = (targetRole) => {
    if (demoPersonas[targetRole]) {
      setRole(targetRole);
      setUser(demoPersonas[targetRole]);
      setIsDemoMode(true);
      setToken('demo_preview_token');
      localStorage.setItem('campusone_token', 'demo_preview_token');
      localStorage.setItem('campusone_active_role', targetRole);
      localStorage.setItem('campusone_user', JSON.stringify(demoPersonas[targetRole]));
    }
  };

  const isAuthenticated = Boolean((token && user) || isDemoMode);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        isDemoMode,
        isAuthenticated,
        login,
        register,
        logout,
        switchRole: switchDemoPersona
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
