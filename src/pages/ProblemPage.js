import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { problemService, submissionService } from '../services/contestService';
import { authService } from '../services/authService';
import { Language, SubmissionStatus } from '../models/contest';
import ContestCodeEditor from '../components/ContestCodeEditor';
import './ProblemPage.css';

const ProblemPage = () => {
    const { contestId, problemId } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState([]);
    const [activeTab, setActiveTab] = useState('problem'); // problem, submissions
    const [code, setCode] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState(Language.PYTHON);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProblemDetails();
        fetchUserSubmissions();
    }, [contestId, problemId]);

    const fetchProblemDetails = async () => {
        try {
            setLoading(true);
            const response = await problemService.getProblemById(problemId);
            if (response.success) {
                setProblem(response.data);
            }
        } catch (error) {
            console.error('Error fetching problem:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserSubmissions = async () => {
        try {
            const response = await submissionService.getUserSubmissions(contestId, 'current-user');
            if (response.success) {
                // Filter submissions for current problem
                const problemSubmissions = response.data.filter(
                    sub => sub.problemId === problemId
                );
                setSubmissions(problemSubmissions);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }
    };

    const handleSubmit = async () => {
        if (!code.trim()) {
            alert('Please write some code before submitting!');
            return;
        }

        if (!authService.isAuthenticated()) {
            navigate('/login', { state: { redirectTo: `/contests/${contestId}/problems/${problemId}` } });
            return;
        }
        setSubmitting(true);
        try {
            const user = authService.getUser();
            const submissionData = {
                contestId,
                problemId,
                userId: user?.id,
                username: user?.username,
                code,
                language: selectedLanguage
            };

            const response = await submissionService.submitCode(submissionData);
            if (response.success) {
                alert(`Submission successful! Score: ${response.data.score}/${problem.points}`);
                setSubmissions(prev => [response.data, ...prev]);
                setActiveTab('submissions');
            } else {
                alert(response.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error submitting code:', error);
            alert('Failed to submit code');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case SubmissionStatus.ACCEPTED:
                return '✅';
            case SubmissionStatus.WRONG_ANSWER:
                return '❌';
            case SubmissionStatus.TIME_LIMIT_EXCEEDED:
                return '⏰';
            case SubmissionStatus.RUNTIME_ERROR:
                return '💥';
            case SubmissionStatus.COMPILATION_ERROR:
                return '🔧';
            default:
                return '⏳';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case SubmissionStatus.ACCEPTED:
                return '#48bb78';
            case SubmissionStatus.WRONG_ANSWER:
                return '#f56565';
            case SubmissionStatus.TIME_LIMIT_EXCEEDED:
                return '#ed8936';
            case SubmissionStatus.RUNTIME_ERROR:
                return '#e53e3e';
            case SubmissionStatus.COMPILATION_ERROR:
                return '#805ad5';
            default:
                return '#a0aec0';
        }
    };

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(new Date(date));
    };

    const getLanguageDisplayName = (lang) => {
        const names = {
            [Language.PYTHON]: 'Python',
            [Language.JAVA]: 'Java',
            [Language.CPP]: 'C++',
            [Language.JAVASCRIPT]: 'JavaScript'
        };
        return names[lang] || lang;
    };

    if (loading) {
        return (
            <div className="problem-page-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading problem...</p>
                </div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="problem-page-container">
                <div className="error-message">
                    <h2>Problem not found</h2>
                    <p>The problem you're looking for doesn't exist or has been removed.</p>
                    <button className="btn btn-primary" onClick={() => navigate(`/contests/${contestId}`)}>
                        Back to Contest
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="problem-page-container lc-layout">
            <div className="lc-header">
                <div className="lc-title">
                    <h1>{problem.title}</h1>
                    <div className="lc-badges">
                        <span className={`difficulty difficulty-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
                        <span className="points">{problem.points} points</span>
                        <span className="time-limit">{problem.timeLimit}ms</span>
                        <span className="memory-limit">{problem.memoryLimit}MB</span>
                    </div>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate(`/contests/${contestId}`)}>← Back to Contest</button>
            </div>

            <div className="lc-main">
                {/* Left: Problem Pane */}
                <div className="lc-left">
                    <div className="problem-content lc-card">
                        <div className="problem-tabs lc-tabs">
                            <button className={`tab-btn ${activeTab === 'problem' ? 'active' : ''}`} onClick={() => setActiveTab('problem')}>Description</button>
                            <button className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>Submissions ({submissions.length})</button>
                        </div>
                        <div className="problem-tab-content lc-scroll">
                            {activeTab === 'problem' && (
                                <div className="problem-description">
                                    <div className="description-section">
                                        <h3>Description</h3>
                                        <p>{problem.description}</p>
                                    </div>
                                    <div className="description-section">
                                        <h3>Input Format</h3>
                                        <pre className="format-text">{problem.inputFormat}</pre>
                                    </div>
                                    <div className="description-section">
                                        <h3>Output Format</h3>
                                        <pre className="format-text">{problem.outputFormat}</pre>
                                    </div>
                                    <div className="description-section">
                                        <h3>Sample Input</h3>
                                        <pre className="sample-text">{problem.sampleInput}</pre>
                                    </div>
                                    <div className="description-section">
                                        <h3>Sample Output</h3>
                                        <pre className="sample-text">{problem.sampleOutput}</pre>
                                    </div>
                                    <div className="description-section">
                                        <h3>Test Cases</h3>
                                        <div className="test-cases">
                                            {problem.testCases.map((testCase, index) => (
                                                <div key={index} className="test-case">
                                                    <div className="test-case-header">
                                                        <span className="test-case-number">Test Case {index + 1}</span>
                                                        <span className={`test-case-type ${testCase.isHidden ? 'hidden' : 'visible'}`}>{testCase.isHidden ? 'Hidden' : 'Visible'}</span>
                                                    </div>
                                                    <div className="test-case-content">
                                                        <div className="test-input">
                                                            <strong>Input:</strong>
                                                            <pre>{testCase.input}</pre>
                                                        </div>
                                                        <div className="test-output">
                                                            <strong>Expected Output:</strong>
                                                            <pre>{testCase.output}</pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'submissions' && (
                                <div className="submissions-section">
                                    {submissions.length === 0 ? (
                                        <div className="no-submissions">
                                            <h3>No submissions yet</h3>
                                            <p>Submit your solution to see it appear here!</p>
                                        </div>
                                    ) : (
                                        <div className="submissions-list">
                                            {submissions.map((submission, index) => (
                                                <div key={submission.id} className="submission-item">
                                                    <div className="submission-header">
                                                        <div className="submission-info">
                                                            <span className="submission-number">#{index + 1}</span>
                                                            <span className="submission-time">{formatDate(submission.submittedAt)}</span>
                                                            <span className="submission-language">{getLanguageDisplayName(submission.language)}</span>
                                                        </div>
                                                        <div className="submission-result">
                                                            <span className="submission-status" style={{ color: getStatusColor(submission.status) }}>{getStatusIcon(submission.status)} {submission.status}</span>
                                                            <span className="submission-score">{submission.score}/{problem.points}</span>
                                                        </div>
                                                    </div>
                                                    <div className="submission-details">
                                                        <div className="submission-meta">
                                                            <span>Test Cases: {submission.testCasesPassed}/{submission.totalTestCases}</span>
                                                            <span>Execution Time: {submission.executionTime}ms</span>
                                                            <span>Time Taken: {submission.timeTaken} minutes</span>
                                                        </div>
                                                        <details className="submission-code">
                                                            <summary>View Code</summary>
                                                            <pre>{submission.code}</pre>
                                                        </details>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Editor Pane */}
                <div className="lc-right">
                    <div className="code-editor-section lc-card">
                        <div className="editor-header lc-toolbar">
                            <div className="language-selector">
                                <label>Language:</label>
                                <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="language-select">
                                    <option value={Language.PYTHON}>Python</option>
                                    <option value={Language.JAVA}>Java</option>
                                    <option value={Language.CPP}>C++</option>
                                    <option value={Language.JAVASCRIPT}>JavaScript</option>
                                </select>
                            </div>
                            <div className="editor-actions">
                                <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !code.trim()}>
                                    {submitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </div>
                        <ContestCodeEditor code={code} onChange={setCode} language={selectedLanguage} height="600px" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemPage;
