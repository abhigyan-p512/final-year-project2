// Contest Service for API calls and business logic
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

const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: { 'Content-Type': 'application/json' }
});

// Attach auth token if present
api.interceptors.request.use((config) => {
    try {
        const raw = localStorage.getItem('auth');
        if (raw) {
            const { token } = JSON.parse(raw);
            if (token) config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (_) {}
    return config;
});

// Contest Management
export const contestService = {
    // Get all contests
    async getContests() {
        const res = await api.get('/api/contests');
        return res.data;
    },

    // Get contest by ID
    async getContestById(contestId) {
        const res = await api.get(`/api/contests/${contestId}`);
        return res.data;
    },

    // Create new contest
    async createContest(contestData) {
        const res = await api.post('/api/contests', contestData);
        return res.data;
    },

    // Join contest
    async joinContest(contestId, userId) {
        const res = await api.post(`/api/contests/${contestId}/join`, { userId });
        return res.data;
    }
};

// Problem Management
export const problemService = {
    // Get problems for a contest
    async getProblemsByContest(contestId) {
        const res = await api.get(`/api/contests/${contestId}/problems`);
        return res.data;
    },

    // Get problem by ID
    async getProblemById(problemId) {
        const res = await api.get(`/api/problems/${problemId}`);
        return res.data;
    }
};

// Submission Management
export const submissionService = {
    // Submit code
    async submitCode(submissionData) {
        const res = await api.post('/api/submissions', submissionData);
        return res.data;
    },

    // Get user submissions for a contest
    async getUserSubmissions(contestId, userId) {
        const res = await api.get(`/api/contests/${contestId}/users/${userId}/submissions`);
        return res.data;
    },

    // Get all submissions for a contest
    async getContestSubmissions(contestId) {
        const res = await api.get(`/api/contests/${contestId}/submissions`);
        return res.data;
    }
};

// Leaderboard Management
export const leaderboardService = {
    // Get contest leaderboard
    async getContestLeaderboard(contestId) {
        const res = await api.get(`/api/contests/${contestId}/leaderboard`);
        return res.data;
    },

    // Update leaderboard (called after each submission)
    async updateLeaderboard(contestId, submission) {
        // No-op for now; backend recalculates on fetch
        const res = await api.get(`/api/contests/${contestId}/leaderboard`);
        return res.data;
    }
};

