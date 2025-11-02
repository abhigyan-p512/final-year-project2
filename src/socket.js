import { io } from 'socket.io-client';

const getBackendUrl = () => {
    // Prefer env when provided
    const envUrl = process.env.REACT_APP_BACKEND_URL && process.env.REACT_APP_BACKEND_URL.trim();
    if (envUrl) return envUrl;

    // If app is served by the same origin as server (production), use same origin
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
        // When CRA dev server is used, socket server likely on localhost:5000
        const isLocalDev = /localhost|127\.0\.0\.1/.test(window.location.hostname);
        if (isLocalDev) {
            return 'http://localhost:5000';
        }
        return window.location.origin;
    }

    // Fallback
    return 'http://localhost:5000';
};

export const initSocket = async () => {
    const options = {
        forceNew: true,
        reconnectionAttempts: Infinity,
        timeout: 10000,
        transports: ['websocket', 'polling'],
    };
    const url = getBackendUrl();
    return io(url, options);
};

export { getBackendUrl };
