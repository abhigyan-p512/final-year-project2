// Contest Data Models

export const ContestStatus = {
    UPCOMING: 'upcoming',
    RUNNING: 'running',
    FINISHED: 'finished'
};

export const SubmissionStatus = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    WRONG_ANSWER: 'wrong_answer',
    TIME_LIMIT_EXCEEDED: 'time_limit_exceeded',
    RUNTIME_ERROR: 'runtime_error',
    COMPILATION_ERROR: 'compilation_error'
};

export const Language = {
    CPP: 'cpp',
    JAVA: 'java',
    PYTHON: 'python',
    JAVASCRIPT: 'javascript'
};

// Mock Contest Data
export const mockContests = [
    {
        id: 'contest-1',
        title: 'Weekly Coding Challenge',
        description: 'A weekly challenge featuring algorithmic problems of varying difficulty.',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        duration: 180, // 3 hours in minutes
        status: ContestStatus.UPCOMING,
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
        startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        duration: 120, // 2 hours
        status: ContestStatus.RUNNING,
        maxParticipants: 50,
        currentParticipants: 32,
        problems: ['prob-4', 'prob-5'],
        createdBy: 'mentor1',
        createdAt: new Date()
    },
    {
        id: 'contest-3',
        title: 'Advanced Algorithms Contest',
        description: 'Challenging problems for experienced programmers.',
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        duration: 240, // 4 hours
        status: ContestStatus.FINISHED,
        maxParticipants: 75,
        currentParticipants: 68,
        problems: ['prob-6', 'prob-7', 'prob-8', 'prob-9'],
        createdBy: 'expert',
        createdAt: new Date()
    }
];

export const mockProblems = [
    {
        id: 'prob-1',
        contestId: 'contest-1',
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        inputFormat: 'First line contains n (number of elements). Next line contains n space-separated integers. Last line contains target.',
        outputFormat: 'Print two space-separated indices.',
        sampleInput: '4\n2 7 11 15\n9',
        sampleOutput: '0 1',
        timeLimit: 1000, // milliseconds
        memoryLimit: 256, // MB
        difficulty: 'Easy',
        points: 100,
        testCases: [
            { input: '4\n2 7 11 15\n9', output: '0 1', isHidden: false },
            { input: '3\n3 2 4\n6', output: '1 2', isHidden: false },
            { input: '2\n3 3\n6', output: '0 1', isHidden: true }
        ]
    },
    {
        id: 'prob-2',
        contestId: 'contest-1',
        title: 'Valid Parentheses',
        description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        inputFormat: 'Single line containing the string s.',
        outputFormat: 'Print "true" if valid, "false" otherwise.',
        sampleInput: '()',
        sampleOutput: 'true',
        timeLimit: 1000,
        memoryLimit: 256,
        difficulty: 'Easy',
        points: 100,
        testCases: [
            { input: '()', output: 'true', isHidden: false },
            { input: '()[]{}', output: 'true', isHidden: false },
            { input: '(]', output: 'false', isHidden: false },
            { input: '([)]', output: 'false', isHidden: true },
            { input: '{[]}', output: 'true', isHidden: true }
        ]
    },
    {
        id: 'prob-3',
        contestId: 'contest-1',
        title: 'Maximum Subarray',
        description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
        inputFormat: 'First line contains n. Next line contains n space-separated integers.',
        outputFormat: 'Print the maximum sum.',
        sampleInput: '5\n-2 1 -3 4 -1',
        sampleOutput: '4',
        timeLimit: 1000,
        memoryLimit: 256,
        difficulty: 'Medium',
        points: 150,
        testCases: [
            { input: '5\n-2 1 -3 4 -1', output: '4', isHidden: false },
            { input: '1\n1', output: '1', isHidden: false },
            { input: '5\n5 4 -1 7 8', output: '23', isHidden: true },
            { input: '3\n-1 -2 -3', output: '-1', isHidden: true }
        ]
    }
    ,
    {
        id: 'prob-4',
        contestId: 'contest-2',
        title: 'Sum of Array',
        description: 'Given n and an array of n integers, output the sum of the elements.',
        inputFormat: 'First line contains n. Next line contains n space-separated integers.',
        outputFormat: 'Print a single integer: the sum.',
        sampleInput: '5\n1 2 3 4 5',
        sampleOutput: '15',
        timeLimit: 1000,
        memoryLimit: 256,
        difficulty: 'Easy',
        points: 100,
        testCases: [
            { input: '5\n1 2 3 4 5', output: '15', isHidden: false },
            { input: '3\n-1 2 -3', output: '-2', isHidden: false },
            { input: '1\n1000000000', output: '1000000000', isHidden: true }
        ]
    },
    {
        id: 'prob-5',
        contestId: 'contest-2',
        title: 'Count Evens',
        description: 'Given n and an array of n integers, count how many numbers are even.',
        inputFormat: 'First line contains n. Next line contains n space-separated integers.',
        outputFormat: 'Print a single integer: the count of even numbers.',
        sampleInput: '6\n1 2 3 4 5 6',
        sampleOutput: '3',
        timeLimit: 1000,
        memoryLimit: 256,
        difficulty: 'Easy',
        points: 100,
        testCases: [
            { input: '6\n1 2 3 4 5 6', output: '3', isHidden: false },
            { input: '4\n2 4 6 8', output: '4', isHidden: false },
            { input: '5\n1 3 5 7 9', output: '0', isHidden: true }
        ]
    }
];

export const mockSubmissions = [
    {
        id: 'sub-1',
        contestId: 'contest-2',
        problemId: 'prob-4',
        userId: 'user1',
        username: 'alice',
        code: 'def solve():\n    n = int(input())\n    arr = list(map(int, input().split()))\n    return sum(arr)',
        language: Language.PYTHON,
        status: SubmissionStatus.ACCEPTED,
        score: 100,
        timeTaken: 15, // minutes
        submittedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        testCasesPassed: 5,
        totalTestCases: 5,
        executionTime: 120 // milliseconds
    },
    {
        id: 'sub-2',
        contestId: 'contest-2',
        problemId: 'prob-4',
        userId: 'user2',
        username: 'bob',
        code: '#include <iostream>\nusing namespace std;\nint main() {\n    int n, sum = 0;\n    cin >> n;\n    for(int i = 0; i < n; i++) {\n        int x;\n        cin >> x;\n        sum += x;\n    }\n    cout << sum << endl;\n    return 0;\n}',
        language: Language.CPP,
        status: SubmissionStatus.ACCEPTED,
        score: 100,
        timeTaken: 12,
        submittedAt: new Date(Date.now() - 30 * 60 * 1000),
        testCasesPassed: 5,
        totalTestCases: 5,
        executionTime: 95
    }
];

export const mockLeaderboard = [
    {
        rank: 1,
        userId: 'user1',
        username: 'alice',
        totalScore: 200,
        totalTime: 27, // minutes
        problemsSolved: 2,
        submissions: [
            { problemId: 'prob-4', score: 100, timeTaken: 15, status: SubmissionStatus.ACCEPTED },
            { problemId: 'prob-5', score: 100, timeTaken: 12, status: SubmissionStatus.ACCEPTED }
        ]
    },
    {
        rank: 2,
        userId: 'user2',
        username: 'bob',
        totalScore: 100,
        totalTime: 12,
        problemsSolved: 1,
        submissions: [
            { problemId: 'prob-4', score: 100, timeTaken: 12, status: SubmissionStatus.ACCEPTED },
            { problemId: 'prob-5', score: 0, timeTaken: 0, status: null }
        ]
    }
];
