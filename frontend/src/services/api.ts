import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth methods
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    register: (name: string, email: string, password: string) =>
        api.post('/auth/register', { name, email, password }),

    getCurrentUser: () =>
        api.get('/auth/me'),

    refreshToken: () =>
        api.post('/auth/refresh'),
};

// User methods
export const userAPI = {
    getUsers: (params?: any) =>
        api.get('/users', { params }),

    getUserById: (id: string) =>
        api.get(`/users/${id}`),

    updateProfile: (data: any) =>
        api.put('/users/profile', data),

    uploadProfilePhoto: (formData: FormData) =>
        api.post('/users/profile/photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    getUserSwaps: (id: string) =>
        api.get(`/users/${id}/swaps`),

    searchUsersBySkills: (skill: string) =>
        api.get(`/users/search/skills?skill=${skill}`),
};

// Swap methods
export const swapAPI = {
    createSwap: (data: any) =>
        api.post('/swaps', data),

    getMySwaps: (params?: any) =>
        api.get('/swaps/my-swaps', { params }),

    getSwapById: (id: string) =>
        api.get(`/swaps/${id}`),

    updateSwapStatus: (id: string, status: string) =>
        api.put(`/swaps/${id}/status`, { status }),

    completeSwap: (id: string) =>
        api.put(`/swaps/${id}/complete`),

    cancelSwap: (id: string) =>
        api.delete(`/swaps/${id}`),

    submitFeedback: (id: string, rating: number, comment?: string) =>
        api.post(`/swaps/${id}/feedback`, { rating, comment }),
};

// Skills methods
export const skillsAPI = {
    getSkillSuggestions: (q: string) =>
        api.get(`/skills/suggestions?q=${q}`),

    getPopularSkills: () =>
        api.get('/skills/popular'),

    getSkillStats: () =>
        api.get('/skills/stats'),
};

// Admin methods
export const adminAPI = {
    getDashboard: () =>
        api.get('/admin/dashboard'),

    getUsers: (params?: any) =>
        api.get('/admin/users', { params }),

    banUser: (id: string, reason?: string) =>
        api.put(`/admin/users/${id}/ban`, { reason }),

    getSwaps: (params?: any) =>
        api.get('/admin/swaps', { params }),

    updateSwapNotes: (id: string, adminNotes: string) =>
        api.put(`/admin/swaps/${id}/notes`, { adminNotes }),

    createMessage: (data: any) =>
        api.post('/admin/messages', data),

    getMessages: (params?: any) =>
        api.get('/admin/messages', { params }),

    toggleMessage: (id: string) =>
        api.put(`/admin/messages/${id}/toggle`),

    generateReport: (type: string, params?: any) =>
        api.get(`/admin/reports/${type}`, { params }),
};

// Helper methods
const apiService = {
    setAuthToken: (token: string) => {
        api.defaults.headers.Authorization = `Bearer ${token}`;
    },

    removeAuthToken: () => {
        delete api.defaults.headers.Authorization;
    },

    // Auth
    login: authAPI.login,
    register: authAPI.register,
    getCurrentUser: authAPI.getCurrentUser,
    refreshToken: authAPI.refreshToken,

    // Users
    getUsers: userAPI.getUsers,
    getUserById: userAPI.getUserById,
    updateProfile: userAPI.updateProfile,
    uploadProfilePhoto: userAPI.uploadProfilePhoto,
    getUserSwaps: userAPI.getUserSwaps,
    searchUsersBySkills: userAPI.searchUsersBySkills,

    // Swaps
    createSwap: swapAPI.createSwap,
    getMySwaps: swapAPI.getMySwaps,
    getSwapById: swapAPI.getSwapById,
    updateSwapStatus: swapAPI.updateSwapStatus,
    completeSwap: swapAPI.completeSwap,
    cancelSwap: swapAPI.cancelSwap,
    submitFeedback: swapAPI.submitFeedback,

    // Skills
    getSkillSuggestions: skillsAPI.getSkillSuggestions,
    getPopularSkills: skillsAPI.getPopularSkills,
    getSkillStats: skillsAPI.getSkillStats,

    // Admin
    getDashboard: adminAPI.getDashboard,
    getAdminUsers: adminAPI.getUsers,
    banUser: adminAPI.banUser,
    getAdminSwaps: adminAPI.getSwaps,
    updateSwapNotes: adminAPI.updateSwapNotes,
    createMessage: adminAPI.createMessage,
    getMessages: adminAPI.getMessages,
    toggleMessage: adminAPI.toggleMessage,
    generateReport: adminAPI.generateReport,
};

export default apiService;
