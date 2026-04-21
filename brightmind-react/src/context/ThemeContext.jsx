import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/axiosConfig';

const ThemeContext = createContext();

const getStoredUser = () => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('brightmind_user');
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const applyThemeToDom = (theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
    } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
    }
};

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const initialTheme = () => {
        if (typeof window === 'undefined') return 'light';
        const preloaded = document.documentElement.getAttribute('data-theme');
        if (preloaded === 'dark' || preloaded === 'light') return preloaded;
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const [theme, setTheme] = useState(initialTheme);
    const [isReady, setIsReady] = useState(false);
    const lastPersisted = useRef(null);

    const persistPreference = useCallback(async (nextTheme) => {
        const user = getStoredUser();
        if (!user?.token) return;
        try {
            // Generic preference store for all roles
            await api.put('/users/theme', { theme: nextTheme });
            // Student-specific preference (maintain existing endpoint usage)
            if (user.role === 'Student') {
                await api.put('/student/preferences', { dark_mode: nextTheme === 'dark' });
            }
            lastPersisted.current = nextTheme;
        } catch (err) {
            console.warn('Failed to persist theme preference', err);
        }
    }, []);

    useEffect(() => {
        applyThemeToDom(theme);
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', theme);
        }
        // Avoid spamming persistence on initial hydration if nothing changed
        if (isReady && lastPersisted.current !== theme) {
            persistPreference(theme);
        }
    }, [theme, isReady, persistPreference]);

    // Hydrate from backend if user preference exists
    useEffect(() => {
        const fetchTheme = async () => {
            const user = getStoredUser();
            if (!user?.token) {
                if (!isReady) setIsReady(true);
                return;
            }
            try {
                const res = await api.get('/users/theme');
                const saved = res.data?.theme;
                if (saved === 'dark' || saved === 'light') {
                    lastPersisted.current = saved;
                    setTheme(saved);
                }
            } catch (err) {
                console.warn('Failed to fetch theme preference', err);
            } finally {
                setIsReady(true);
            }
        };

        fetchTheme();

        const handleAuthChange = () => fetchTheme();
        window.addEventListener('auth_change', handleAuthChange);
        return () => window.removeEventListener('auth_change', handleAuthChange);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    const setThemeExplicit = (next) => {
        if (next === 'dark' || next === 'light') {
            setTheme(next);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode: theme === 'dark', toggleTheme, setTheme: setThemeExplicit }}>
            {children}
        </ThemeContext.Provider>
    );
};
