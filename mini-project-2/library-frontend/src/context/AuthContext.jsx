// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        try {
            const u = localStorage.getItem('user');
            if (u) setUser(JSON.parse(u));
        } catch { }
        setLoading(false);
    }, []);

    const login = async ({ email, password }) => {
        try {
            const res = await authAPI.login({ email, password });
            const { user, token } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true };
        } catch (e) {
            return { success: false, error: e?.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (payload) => {
        try {
            const res = await authAPI.register(payload);
            const { user, token } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true };
        } catch (e) {
            return { success: false, error: e?.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};