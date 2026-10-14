// CampusOne API Service Layer
// Uses centralized apiClient for transport and provides structured domain APIs.

import { apiClient } from './apiClient';
import { demoQuestions, demoCodingProblems } from './demoData';

// Re-export demo catalogs for development / component testing
export const mockQuestions = demoQuestions;
export const mockCodingProblems = demoCodingProblems;

// -------------------------------------------------------------
// System & Diagnostic API
// -------------------------------------------------------------
export const systemAPI = {
  getHealth: async () => {
    return await apiClient('/health');
  }
};

// Backward-compatible alias
export const getHealth = systemAPI.getHealth;

// -------------------------------------------------------------
// Authentication API
// -------------------------------------------------------------
export const authAPI = {
  login: async (email, password) => {
    return await apiClient('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  },

  register: async (userData) => {
    return await apiClient('/auth/register', {
      method: 'POST',
      body: userData
    });
  },

  getMe: async (token) => {
    return await apiClient('/auth/me', {
      method: 'GET',
      token
    });
  },

  logout: async () => {
    try {
      return await apiClient('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Local cleanup even if server is unreachable
      return { success: true };
    }
  }
};

// -------------------------------------------------------------
// Academic & Attendance API
// -------------------------------------------------------------
export const academicsAPI = {
  getSubjects: async () => {
    return await apiClient('/academics/subjects');
  },

  getStudentProfile: async () => {
    return await apiClient('/academics/student-profile');
  },

  getBatchRoster: async (batch = 'CS-6A') => {
    return await apiClient(`/academics/roster/${batch}`);
  },

  markAttendance: async (sessionData) => {
    return await apiClient('/academics/attendance/mark', {
      method: 'POST',
      body: sessionData
    });
  }
};

// -------------------------------------------------------------
// Assessment & Tests API
// -------------------------------------------------------------
export const testsAPI = {
  getTopics: async () => {
    return await apiClient('/tests/topics');
  },

  getActiveAssessments: async (topic = 'ALL') => {
    const query = topic && topic !== 'ALL' ? `?topic=${topic}` : '';
    return await apiClient(`/tests/active${query}`);
  },

  submitAssessment: async (assessmentId, answers, timeSpentSeconds = 0) => {
    return await apiClient('/tests/submit', {
      method: 'POST',
      body: { assessmentId, answers, timeSpentSeconds }
    });
  },

  getHistory: async () => {
    return await apiClient('/tests/history');
  }
};

// -------------------------------------------------------------
// Career & Resume Portfolio API
// -------------------------------------------------------------
export const careerAPI = {
  getProfile: async () => {
    return await apiClient('/career/profile');
  },

  addProject: async (projectData) => {
    return await apiClient('/career/project', {
      method: 'POST',
      body: projectData
    });
  },

  scanAts: async () => {
    return await apiClient('/career/scan-ats', {
      method: 'POST'
    });
  }
};

// -------------------------------------------------------------
// AI Mentor Copilot API
// -------------------------------------------------------------
export const aiAPI = {
  chat: async (message, context = {}) => {
    return await apiClient('/ai/chat', {
      method: 'POST',
      body: { message, context }
    });
  }
};

// -------------------------------------------------------------
// Institutional Administration API
// -------------------------------------------------------------
export const adminAPI = {
  getUsers: async (search = '', role = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiClient(`/admin/users${query}`);
  },

  provisionUser: async (userData) => {
    return await apiClient('/admin/users', {
      method: 'POST',
      body: userData
    });
  },

  toggleUserStatus: async (userId) => {
    return await apiClient(`/admin/users/${userId}/status`, {
      method: 'PATCH'
    });
  },

  getMetrics: async () => {
    return await apiClient('/admin/metrics');
  }
};
