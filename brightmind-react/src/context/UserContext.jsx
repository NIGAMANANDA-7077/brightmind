import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/axiosConfig';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserFromStorage = async () => {
            const storedUser = localStorage.getItem('brightmind_user');
            if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
                try {
                    const parsed = JSON.parse(storedUser);
                    setUser(parsed);

                    // Verify token with backend
                    const res = await api.get('/auth/me');
                    if (res.data.success) {
                        // Update with fresh data but keep token
                        setUser({ ...res.data.user, token: parsed.token });
                        localStorage.setItem('brightmind_user', JSON.stringify({ ...res.data.user, token: parsed.token }));
                    }
                } catch (err) {
                    console.error("Token verification failed, logging out", err);
                    logout();
                }
            }
            setLoading(false);
        };
        loadUserFromStorage();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data.success) {
                setUser(res.data.user);
                localStorage.setItem('brightmind_user', JSON.stringify(res.data.user));
                return { success: true, role: res.data.user.role };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const res = await api.post('/auth/register', userData);
            if (res.data.success) {
                setUser(res.data.user);
                localStorage.setItem('brightmind_user', JSON.stringify(res.data.user));
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('brightmind_user');
    };

    const updateUser = async (updatedData) => {
        if (!user) return;

        try {
            const res = await api.put(`/users/${user.id}`, updatedData);
            if (res.data.success) {
                const mergedUser = { ...user, ...res.data.user };
                setUser(mergedUser);
                localStorage.setItem('brightmind_user', JSON.stringify(mergedUser));
            }
        } catch (err) {
            console.error("Failed to update user backend data", err);
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
