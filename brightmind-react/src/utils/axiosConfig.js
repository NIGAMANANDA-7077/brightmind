import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the JWT token to out-going requests
api.interceptors.request.use(
    (config) => {
        const userStr = localStorage.getItem('brightmind_user');
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
            try {
                const user = JSON.parse(userStr);
                if (user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            } catch (e) {
                console.error("Failed to parse user from localstorage", e);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Add response interceptor for global 401 handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Unauthenticated - might want to trigger logout event or redirect here
            // But usually handled by context
            console.warn('Unauthorized request - Token may be expired');
        }
        return Promise.reject(error);
    }
);

export default api;
