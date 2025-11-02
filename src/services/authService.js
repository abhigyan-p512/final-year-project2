import axios from 'axios';

function getApiBaseUrl() {
    const env = process.env.REACT_APP_BACKEND_URL && process.env.REACT_APP_BACKEND_URL.trim();
    if (env) return env;
    if (typeof window !== 'undefined' && window.location) {
        const isLocal = /localhost|127\.0\.0\.1/.test(window.location.hostname);
        return isLocal ? 'http://localhost:5000' : window.location.origin;
    }
    return '';
}

const api = axios.create({ baseURL: getApiBaseUrl(), headers: { 'Content-Type': 'application/json' } });

const key = 'auth';

export const authService = {
    async signup({ username, email, password }) {
        const res = await api.post('/api/auth/signup', { username, email, password });
        if (res.data?.success) {
            localStorage.setItem(key, JSON.stringify(res.data.data));
        }
        return res.data;
    },
    async login({ email, password }) {
        const res = await api.post('/api/auth/login', { email, password });
        if (res.data?.success) {
            localStorage.setItem(key, JSON.stringify(res.data.data));
        }
        return res.data;
    },
    logout() {
        localStorage.removeItem(key);
    },
    getAuth() {
        try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
    },
    isAuthenticated() {
        return !!this.getAuth()?.token;
    },
    getUser() {
        return this.getAuth()?.user || null;
    }
};


