import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    profilePhoto?: string;
    location?: string;
    skillsOffered?: Array<{
        name: string;
        description: string;
        level: string;
    }>;
    skillsWanted?: Array<{
        name: string;
        description: string;
        priority: string;
    }>;
    availability?: {
        weekdays: boolean;
        weekends: boolean;
        evenings: boolean;
        mornings: boolean;
        afternoons: boolean;
    };
    isPublic?: boolean;
    rating?: {
        average: number;
        count: number;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('token');
            if (savedToken) {
                try {
                    api.setAuthToken(savedToken);
                    const response = await api.getCurrentUser();
                    setUser(response.data.user);
                    setToken(savedToken);
                } catch (error) {
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.login(email, password);
            const { token: newToken, user: userData } = response.data;

            setToken(newToken);
            setUser(userData);
            localStorage.setItem('token', newToken);
            api.setAuthToken(newToken);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const response = await api.register(name, email, password);
            const { token: newToken, user: userData } = response.data;

            setToken(newToken);
            setUser(userData);
            localStorage.setItem('token', newToken);
            api.setAuthToken(newToken);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        api.removeAuthToken();
    };

    const updateUser = (userData: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...userData } : null);
    };

    const value: AuthContextType = {
        user,
        token,
        login,
        register,
        logout,
        loading,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
