const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions.cjs');
const server = http.createServer(app);
const cors = require('cors');
// Demo mode: avoid requiring external services if not available
let mongoose, jwt, bcrypt, axios;
try {
    mongoose = require('mongoose');
    jwt = require('jsonwebtoken');
    bcrypt = require('bcryptjs');
    axios = require('axios');
} catch (e) {
    console.log('Running in demo mode: Mongo/JWT/Judge0 not required.');
}

// Determine allowed CORS origin for development
const getCorsOrigin = () => {
    const envOrigin = process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.trim();
    if (envOrigin) return envOrigin;
    // CRA default dev server origin
    return 'http://localhost:3000';
};

const io = new Server(server, {
    cors: {
        origin: getCorsOrigin(),
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

app.use(cors());
app.use(express.json());
app.use(express.static('build'));

// ----------------
// Auth (in-memory)
// ----------------
const users = [];
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function signToken(payload) {
    if (!jwt) return null;
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function requireAuth(req, res, next) {
    if (!jwt) return res.status(501).json({ success: false, message: 'Auth not available in demo mode' });
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Missing token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}

// Seed a demo user for easy login
(function seedDemoUser() {
    const email = 'demo@demo.com';
    if (users.find(u => u.email === email)) return;
    const password = 'demo123';
    let passwordHash = password;
    try {
        if (bcrypt && bcrypt.hashSync) passwordHash = bcrypt.hashSync(password, 10);
    } catch (_) {}
    users.push({ id: 'user-demo', username: 'demo', email, passwordHash });
})();

const userSocketMap = {};
function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    // Handle chat messages
    socket.on(ACTIONS.CHAT_MESSAGE, ({ roomId, username, message }) => {
        console.log('Server got message:', username, message, 'for room', roomId);
        io.in(roomId).emit(ACTIONS.CHAT_MESSAGE, { username, message });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });

});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));



// ---------------
// API Endpoints
// ---------------
// Auth endpoints
app.post('/api/auth/signup', async (req, res) => {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const exists = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });
    let passwordHash = password;
    try {
        if (bcrypt) passwordHash = await bcrypt.hash(password, 10);
    } catch (_) {}
    const user = { id: `user-${Date.now()}`, username, email, passwordHash };
    users.push(user);
    const token = signToken({ userId: user.id, username: user.username, email: user.email });
    return res.status(201).json({ success: true, data: { token, user: { id: user.id, username, email } } });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    let valid = password === user.passwordHash;
    try {
        if (bcrypt) valid = await bcrypt.compare(password, user.passwordHash);
    } catch (_) {}
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = signToken({ userId: user.id, username: user.username, email: user.email });
    return res.json({ success: true, data: { token, user: { id: user.id, username: user.username, email: user.email } } });
});
// In-memory data store for contests module (demo functional backend)
const contests = [
    {
        id: 'contest-1',
        title: 'Weekly Coding Challenge',
        description: 'A weekly challenge featuring algorithmic problems of varying difficulty.',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        duration: 180,
        status: 'upcoming',
        maxParticipants: 100,
        currentParticipants: 45,
        problems: ['prob-1', 'prob-2', 'prob-3'],
        createdBy: 'admin',
        createdAt: new Date()
    },
    {
        id: 'contest-2',
        title: 'Beginner Friendly Contest',
        description: 'Perfect for those starting their competitive programming journey.',
        startTime: new Date(Date.now() - 30 * 60 * 1000),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        duration: 120,
        status: 'running',
        maxParticipants: 50,
        currentParticipants: 32,
        problems: ['prob-4', 'prob-5'],
        createdBy: 'mentor1',
        createdAt: new Date()
    },
    {
        id: 'contest-demo',
        title: 'Demo Sprint Contest',
        description: 'A fully functional demo contest with multiple problems and a live leaderboard.',
        startTime: new Date(Date.now() - 15 * 60 * 1000),
        endTime: new Date(Date.now() + 45 * 60 * 1000),
        duration: 60,
        status: 'running',
        maxParticipants: 200,
        currentParticipants: 5,
        problems: ['demo-1', 'demo-2', 'demo-3'],
        createdBy: 'system',
        createdAt: new Date()
    },
];

const problems = [
    {
        id: 'prob-1',
        contestId: 'contest-1',
        title: 'Two Sum',
        description: 'Return indices of two numbers that add up to target.',
        inputFormat: 'n, array, target',
        outputFormat: 'two indices',
        sampleInput: '4\n2 7 11 15\n9',
        sampleOutput: '0 1',
        timeLimit: 1000,
        memoryLimit: 256,
        difficulty: 'Easy',
        points: 100,
        testCases: [
            { input: '4\n2 7 11 15\n9', output: '0 1', isHidden: false },
            { input: '3\n3 2 4\n6', output: '1 2', isHidden: false },
        ]
    },
    {
        id: 'prob-2',
        contestId: 'contest-1',
        title: 'Valid Parentheses',
        description: 'Determine if the input string is valid parentheses.',
        inputFormat: 'string s',
        outputFormat: 'true/false',
        sampleInput: '()',
        sampleOutput: 'true',
        timeLimit: 1000,
        memoryLimit: 256,
        difficulty: 'Easy',
        points: 100,
        testCases: [
            { input: '()', output: 'true', isHidden: false },
            { input: '([)]', output: 'false', isHidden: true },
        ]
    },
    {
        id: 'prob-3',
        contestId: 'contest-1',
        title: 'Maximum Subarray',
        description: 'Find maximum subarray sum.',
        inputFormat: 'n and array',
        outputFormat: 'max sum',
        sampleInput: '5\n-2 1 -3 4 -1',
        sampleOutput: '4',
        timeLimit: 1000,
        memoryLimit: 256,
        difficulty: 'Medium',
        points: 150,
        testCases: [
            { input: '5\n-2 1 -3 4 -1', output: '4', isHidden: false }
        ]
    },
    {
        id: 'prob-4',
        contestId: 'contest-2',
        title: 'Sum of Array',
        description: 'Sum the array elements.',
        inputFormat: 'n and array',
        outputFormat: 'sum',
        sampleInput: '5\n1 2 3 4 5',
        sampleOutput: '15',
        timeLimit: 1000,
        memoryLimit: 256,
        difficulty: 'Easy',
        points: 100,
        testCases: [
            { input: '5\n1 2 3 4 5', output: '15', isHidden: false }
        ]
    },
    {
        id: 'prob-5',
        contestId: 'contest-2',
        title: 'Count Evens',
        description: 'Count even numbers in an array.',
        inputFormat: 'n and array',
        outputFormat: 'count',
        sampleInput: '6\n1 2 3 4 5 6',
        sampleOutput: '3',
        timeLimit: 1000,
        memoryLimit: 256,
        difficulty: 'Easy',
        points: 100,
        testCases: [
            { input: '6\n1 2 3 4 5 6', output: '3', isHidden: false }
        ]
    },
    // Demo sprint problems
    {
        id: 'demo-1',
        contestId: 'contest-demo',
        title: 'Print Hello',
        description: 'Output the text "Hello, World!" exactly.',
        inputFormat: 'No input',
        outputFormat: 'Hello, World!',
        sampleInput: '',
        sampleOutput: 'Hello, World!',
        timeLimit: 1000,
        memoryLimit: 128,
        difficulty: 'Easy',
        points: 50,
        testCases: [
            { input: '', output: 'Hello, World!', isHidden: false }
        ]
    },
    {
        id: 'demo-2',
        contestId: 'contest-demo',
        title: 'Sum Two Numbers',
        description: 'Given two integers, print their sum.',
        inputFormat: 'Two space-separated integers a b',
        outputFormat: 'Single integer a+b',
        sampleInput: '2 3',
        sampleOutput: '5',
        timeLimit: 1000,
        memoryLimit: 128,
        difficulty: 'Easy',
        points: 100,
        testCases: [
            { input: '2 3', output: '5', isHidden: false },
            { input: '10 15', output: '25', isHidden: true }
        ]
    },
    {
        id: 'demo-3',
        contestId: 'contest-demo',
        title: 'Reverse String',
        description: 'Read a string and print it reversed.',
        inputFormat: 'A single string s',
        outputFormat: 'Reversed string',
        sampleInput: 'abcd',
        sampleOutput: 'dcba',
        timeLimit: 1000,
        memoryLimit: 128,
        difficulty: 'Medium',
        points: 150,
        testCases: [
            { input: 'abcd', output: 'dcba', isHidden: false },
            { input: 'racecar', output: 'racecar', isHidden: true }
        ]
    },
];

const submissions = [
    // Seeded demo submissions for leaderboard
    {
        id: `sub-${Date.now()}-1`,
        contestId: 'contest-demo',
        problemId: 'demo-1',
        userId: 'user1',
        username: 'alice',
        code: 'print("Hello, World!")',
        language: 'python',
        status: 'accepted',
        score: 50,
        timeTaken: 3,
        submittedAt: new Date(Date.now() - 10 * 60 * 1000),
        testCasesPassed: 1,
        totalTestCases: 1,
        executionTime: 30,
    },
    {
        id: `sub-${Date.now()}-2`,
        contestId: 'contest-demo',
        problemId: 'demo-2',
        userId: 'user1',
        username: 'alice',
        code: 'print(5)',
        language: 'python',
        status: 'accepted',
        score: 100,
        timeTaken: 8,
        submittedAt: new Date(Date.now() - 8 * 60 * 1000),
        testCasesPassed: 2,
        totalTestCases: 2,
        executionTime: 40,
    },
    {
        id: `sub-${Date.now()}-3`,
        contestId: 'contest-demo',
        problemId: 'demo-1',
        userId: 'user2',
        username: 'bob',
        code: 'console.log("Hello, World!")',
        language: 'javascript',
        status: 'accepted',
        score: 50,
        timeTaken: 5,
        submittedAt: new Date(Date.now() - 9 * 60 * 1000),
        testCasesPassed: 1,
        totalTestCases: 1,
        executionTime: 25,
    },
    {
        id: `sub-${Date.now()}-4`,
        contestId: 'contest-demo',
        problemId: 'demo-3',
        userId: 'user2',
        username: 'bob',
        code: 'print("dcba")',
        language: 'python',
        status: 'wrong_answer',
        score: 0,
        timeTaken: 12,
        submittedAt: new Date(Date.now() - 6 * 60 * 1000),
        testCasesPassed: 0,
        totalTestCases: 2,
        executionTime: 50,
    }
];

function calcContestStatus(contest) {
    const now = new Date();
    if (now < new Date(contest.startTime)) return 'upcoming';
    if (now > new Date(contest.endTime)) return 'finished';
    return 'running';
}

function buildLeaderboard(contestId) {
    const subs = submissions.filter(s => s.contestId === contestId);
    const userAgg = new Map();
    for (const s of subs) {
        const current = userAgg.get(s.userId) || { userId: s.userId, username: s.username, totalScore: 0, totalTime: 0, problemsSolved: 0 };
        current.totalScore += s.score || 0;
        current.totalTime += s.timeTaken || 0;
        if (s.status === 'accepted') current.problemsSolved += 1;
        userAgg.set(s.userId, current);
    }
    const arr = Array.from(userAgg.values()).sort((a, b) => b.totalScore - a.totalScore || a.totalTime - b.totalTime);
    return arr.map((u, idx) => ({ rank: idx + 1, ...u }));
}

// Contests
app.get('/api/contests', (req, res) => {
    const data = contests.map(c => ({ ...c, status: calcContestStatus(c) }));
    res.json({ success: true, data });
});

app.get('/api/contests/:id', (req, res) => {
    const contest = contests.find(c => c.id === req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    res.json({ success: true, data: { ...contest, status: calcContestStatus(contest) } });
});

app.post('/api/contests', requireAuth, (req, res) => {
    const { title, description, duration, maxParticipants, startTime, endTime, problems: probs, createdBy } = req.body || {};
    if (!title || !description || !duration || !maxParticipants || !startTime || !endTime) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const id = `contest-${Date.now()}`;
    const contest = {
        id,
        title,
        description,
        duration,
        maxParticipants,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'upcoming',
        currentParticipants: 0,
        problems: Array.isArray(probs) ? probs : [],
        createdBy: (req.user && req.user.username) || createdBy || 'system',
        createdAt: new Date()
    };
    contests.push(contest);
    res.status(201).json({ success: true, data: contest });
});

app.post('/api/contests/:id/join', requireAuth, (req, res) => {
    const userId = (req.user && req.user.userId) || (req.body && req.body.userId);
    const contest = contests.find(c => c.id === req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    const status = calcContestStatus(contest);
    if (status === 'finished') return res.status(400).json({ success: false, message: 'Contest finished' });
    if (contest.currentParticipants >= contest.maxParticipants) return res.status(400).json({ success: false, message: 'Contest is full' });
    contest.currentParticipants += 1;
    res.json({ success: true, message: 'Successfully joined contest', data: { userId } });
});

// Problems
app.get('/api/contests/:id/problems', (req, res) => {
    const list = problems.filter(p => p.contestId === req.params.id);
    res.json({ success: true, data: list });
});

app.get('/api/problems/:problemId', (req, res) => {
    const problem = problems.find(p => p.id === req.params.problemId);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, data: problem });
});

// Submissions
app.get('/api/contests/:id/submissions', (req, res) => {
    const list = submissions.filter(s => s.contestId === req.params.id);
    res.json({ success: true, data: list });
});

app.get('/api/contests/:id/users/:userId/submissions', (req, res) => {
    const list = submissions.filter(s => s.contestId === req.params.id && s.userId === req.params.userId);
    res.json({ success: true, data: list });
});

app.post('/api/submissions', requireAuth, (req, res) => {
    const { contestId, problemId, code, language } = req.body || {};
    const userId = (req.user && req.user.userId);
    const username = (req.user && req.user.username);
    if (!contestId || !problemId || !userId || !username || !code || !language) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const problem = problems.find(p => p.id === problemId);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    // Mock judge: simple heuristic
    let testCasesPassed = 0;
    for (const tc of problem.testCases) {
        if (String(code).toLowerCase().includes(String(tc.output).toLowerCase())) {
            testCasesPassed += 1;
        }
    }
    let status = 'wrong_answer';
    let score = 0;
    if (testCasesPassed === problem.testCases.length) {
        status = 'accepted';
        score = problem.points;
    } else if (testCasesPassed > 0) {
        status = 'wrong_answer';
        score = Math.floor((testCasesPassed / problem.testCases.length) * problem.points * 0.5);
    }
    const submission = {
        id: `sub-${Date.now()}`,
        contestId,
        problemId,
        userId,
        username,
        code,
        language,
        status,
        score,
        timeTaken: Math.floor(Math.random() * 60) + 5,
        submittedAt: new Date(),
        testCasesPassed,
        totalTestCases: problem.testCases.length,
        executionTime: Math.floor(Math.random() * 200) + 50,
    };
    submissions.push(submission);
    res.status(201).json({ success: true, data: submission });
});

// Leaderboard
app.get('/api/contests/:id/leaderboard', (req, res) => {
    const data = buildLeaderboard(req.params.id);
    res.json({ success: true, data });
});
app.post('/api/judge0/submit', (req, res) => {
    // Demo: echo stdout based on input
    const { stdin } = req.body || {};
    return res.json({ stdout: String(stdin || '') });
});

// SPA fallback must be last and ignore API/socket paths
app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
