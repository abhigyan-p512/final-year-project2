import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contestService, problemService, leaderboardService } from '../services/contestService';
import { authService } from '../services/authService';
import { ContestStatus } from '../models/contest';
import ContestLeaderboard from '../components/ContestLeaderboard';
import './ContestDetails.css';

const ContestDetails = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState(null);
    const [problems, setProblems] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('problems'); // problems, leaderboard, submissions
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        fetchContestDetails();
    }, [contestId]);

    const fetchContestDetails = async () => {
        try {
            setLoading(true);
            
            // Fetch contest details
            const contestResponse = await contestService.getContestById(contestId);
            if (contestResponse.success) {
                setContest(contestResponse.data);
            }

            // Fetch problems
            const problemsResponse = await problemService.getProblemsByContest(contestId);
            if (problemsResponse.success) {
                setProblems(problemsResponse.data);
            }

            // Fetch leaderboard
            const leaderboardResponse = await leaderboardService.getContestLeaderboard(contestId);
            if (leaderboardResponse.success) {
                setLeaderboard(leaderboardResponse.data);
            }

            // Check if user has joined (mock check)
            setJoined(true); // For demo purposes
        } catch (error) {
            console.error('Error fetching contest details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinContest = async () => {
        try {
            if (!authService.isAuthenticated()) {
                navigate('/login', { state: { redirectTo: `/contests/${contestId}` } });
                return;
            }
            const user = authService.getUser();
            const response = await contestService.joinContest(contestId, user?.id);
            if (response.success) {
                setJoined(true);
                alert('Successfully joined contest!');
                fetchContestDetails(); // Refresh to update participant count
            } else {
                alert(response.message);
            }
        } catch (error) {
            console.error('Error joining contest:', error);
            alert('Failed to join contest');
        }
    };

    const handleProblemClick = (problemId) => {
        if (!joined && contest.status === ContestStatus.UPCOMING) {
            alert('Please join the contest first to view problems');
            return;
        }
        navigate(`/contests/${contestId}/problems/${problemId}`);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            [ContestStatus.UPCOMING]: { class: 'status-upcoming', text: 'Upcoming' },
            [ContestStatus.RUNNING]: { class: 'status-running', text: 'Running' },
            [ContestStatus.FINISHED]: { class: 'status-finished', text: 'Finished' }
        };
        
        const config = statusConfig[status];
        return <span className={`status-badge ${config.class}`}>{config.text}</span>;
    };

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    const getTimeRemaining = () => {
        if (!contest) return '';
        
        const now = new Date();
        
        if (contest.status === ContestStatus.UPCOMING) {
            const diff = new Date(contest.startTime) - now;
            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                return `Starts in ${days}d ${hours}h ${minutes}m`;
            }
        } else if (contest.status === ContestStatus.RUNNING) {
            const diff = new Date(contest.endTime) - now;
            if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                return `Ends in ${hours}h ${minutes}m`;
            }
        }
        
        return 'Contest ended';
    };

    const canJoinContest = () => {
        return contest && (contest.status === ContestStatus.UPCOMING || contest.status === ContestStatus.RUNNING) && !joined;
    };

    const canViewProblems = () => {
        return contest && (contest.status === ContestStatus.RUNNING || contest.status === ContestStatus.FINISHED) && joined;
    };

    if (loading) {
        return (
            <div className="contest-details-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading contest details...</p>
                </div>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="contest-details-container">
                <div className="error-message">
                    <h2>Contest not found</h2>
                    <p>The contest you're looking for doesn't exist or has been removed.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/contests')}>
                        Back to Contests
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="contest-details-container">
            <div className="contest-header">
                <div className="contest-header-info">
                    <div className="contest-title-section">
                        <h1>{contest.title}</h1>
                        {getStatusBadge(contest.status)}
                    </div>
                    <p className="contest-description">{contest.description}</p>
                </div>
                
                <div className="contest-header-actions">
                    {canJoinContest() && (
                        <button className="btn btn-primary" onClick={handleJoinContest}>
                            Join Contest
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={() => navigate('/contests')}>
                        Back to Contests
                    </button>
                </div>
            </div>

            <div className="contest-info-grid">
                <div className="info-card">
                    <h3>📅 Contest Timing</h3>
                    <div className="info-item">
                        <span className="info-label">Start Time:</span>
                        <span className="info-value">{formatDate(contest.startTime)}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">End Time:</span>
                        <span className="info-value">{formatDate(contest.endTime)}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Duration:</span>
                        <span className="info-value">{contest.duration} minutes</span>
                    </div>
                    <div className="time-remaining">
                        {getTimeRemaining()}
                    </div>
                </div>

                <div className="info-card">
                    <h3>👥 Participants</h3>
                    <div className="info-item">
                        <span className="info-label">Current:</span>
                        <span className="info-value">{contest.currentParticipants}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Maximum:</span>
                        <span className="info-value">{contest.maxParticipants}</span>
                    </div>
                    <div className="participant-progress">
                        <div 
                            className="progress-bar"
                            style={{ 
                                width: `${(contest.currentParticipants / contest.maxParticipants) * 100}%` 
                            }}
                        ></div>
                    </div>
                </div>

                <div className="info-card">
                    <h3>📝 Problems</h3>
                    <div className="info-item">
                        <span className="info-label">Total:</span>
                        <span className="info-value">{problems.length}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Created by:</span>
                        <span className="info-value">{contest.createdBy}</span>
                    </div>
                </div>
            </div>

            <div className="contest-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'problems' ? 'active' : ''}`}
                    onClick={() => setActiveTab('problems')}
                >
                    Problems
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('leaderboard')}
                >
                    Leaderboard
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('submissions')}
                >
                    My Submissions
                </button>
            </div>

            <div className="contest-content">
                {activeTab === 'problems' && (
                    <div className="problems-section">
                        <h2>Contest Problems</h2>
                        {!canViewProblems() && !joined && (
                            <div className="join-prompt">
                                <p>Join the contest to view and solve problems!</p>
                            </div>
                        )}
                        
                        {problems.length === 0 ? (
                            <div className="no-problems">
                                <h3>No problems available</h3>
                                <p>Problems will be added soon.</p>
                            </div>
                        ) : (
                            <div className="problems-grid">
                                {problems.map((problem, index) => (
                                    <div 
                                        key={problem.id} 
                                        className="problem-card"
                                        onClick={() => handleProblemClick(problem.id)}
                                    >
                                        <div className="problem-header">
                                            <h3>Problem {String.fromCharCode(65 + index)}</h3>
                                            <span className="problem-points">{problem.points} pts</span>
                                        </div>
                                        <h4 className="problem-title">{problem.title}</h4>
                                        <p className="problem-description">{problem.description}</p>
                                        <div className="problem-meta">
                                            <span className={`difficulty difficulty-${problem.difficulty.toLowerCase()}`}>
                                                {problem.difficulty}
                                            </span>
                                            <span className="time-limit">{problem.timeLimit}ms</span>
                                            <span className="memory-limit">{problem.memoryLimit}MB</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'leaderboard' && (
                    <div className="leaderboard-section">
                        <ContestLeaderboard 
                            contestId={contestId}
                            leaderboard={leaderboard}
                        />
                    </div>
                )}

                {activeTab === 'submissions' && (
                    <div className="submissions-section">
                        <h2>My Submissions</h2>
                        <div className="no-submissions">
                            <p>No submissions yet. Start solving problems to see your submissions here!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContestDetails;
