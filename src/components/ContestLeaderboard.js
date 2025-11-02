import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../services/contestService';
import { SubmissionStatus } from '../models/contest';
import './ContestLeaderboard.css';

const ContestLeaderboard = ({ contestId, leaderboard: initialLeaderboard }) => {
    const [leaderboard, setLeaderboard] = useState(initialLeaderboard || []);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        if (initialLeaderboard) {
            setLeaderboard(initialLeaderboard);
        } else {
            fetchLeaderboard();
        }
        
        // Set up real-time updates (mock implementation)
        const interval = setInterval(() => {
            updateLeaderboard();
        }, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, [contestId, initialLeaderboard]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await leaderboardService.getContestLeaderboard(contestId);
            if (response.success) {
                setLeaderboard(response.data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateLeaderboard = async () => {
        try {
            const response = await leaderboardService.getContestLeaderboard(contestId);
            if (response.success) {
                setLeaderboard(response.data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Error updating leaderboard:', error);
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

    const formatTime = (minutes) => {
        if (minutes === 0) return '0m';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const getRankClass = (rank) => {
        if (rank === 1) return 'rank-gold';
        if (rank === 2) return 'rank-silver';
        if (rank === 3) return 'rank-bronze';
        return 'rank-normal';
    };

    if (loading && leaderboard.length === 0) {
        return (
            <div className="leaderboard-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h2>🏆 Live Leaderboard</h2>
                <div className="leaderboard-info">
                    <span className="last-updated">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                    <button 
                        className="btn-refresh"
                        onClick={fetchLeaderboard}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {leaderboard.length === 0 ? (
                <div className="no-leaderboard">
                    <h3>No submissions yet</h3>
                    <p>Be the first to solve a problem and appear on the leaderboard!</p>
                </div>
            ) : (
                <div className="leaderboard-table">
                    <div className="table-header">
                        <div className="header-cell rank-col">Rank</div>
                        <div className="header-cell user-col">User</div>
                        <div className="header-cell score-col">Score</div>
                        <div className="header-cell time-col">Time</div>
                        <div className="header-cell problems-col">Problems</div>
                        <div className="header-cell submissions-col">Submissions</div>
                    </div>

                    <div className="table-body">
                        {leaderboard.map((entry, index) => (
                            <div 
                                key={entry.userId} 
                                className={`table-row ${getRankClass(entry.rank)}`}
                            >
                                <div className="table-cell rank-col">
                                    <span className="rank-icon">{getRankIcon(entry.rank)}</span>
                                    <span className="rank-number">{entry.rank}</span>
                                </div>

                                <div className="table-cell user-col">
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            {entry.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-details">
                                            <div className="username">{entry.username}</div>
                                            <div className="user-stats">
                                                {entry.problemsSolved} solved
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="table-cell score-col">
                                    <span className="score-value">{entry.totalScore}</span>
                                </div>

                                <div className="table-cell time-col">
                                    <span className="time-value">{formatTime(entry.totalTime)}</span>
                                </div>

                                <div className="table-cell problems-col">
                                    <div className="problems-status">
                                        {entry.submissions.map((submission, idx) => (
                                            <div 
                                                key={idx}
                                                className="problem-status"
                                                title={`Problem ${String.fromCharCode(65 + idx)}: ${submission.status || 'Not attempted'}`}
                                            >
                                                {submission.status ? (
                                                    <span 
                                                        className="status-icon"
                                                        style={{ color: getStatusColor(submission.status) }}
                                                    >
                                                        {getStatusIcon(submission.status)}
                                                    </span>
                                                ) : (
                                                    <span className="status-icon not-attempted">⚪</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="table-cell submissions-col">
                                    <div className="submissions-summary">
                                        {entry.submissions.map((submission, idx) => (
                                            <div key={idx} className="submission-item">
                                                <span className="problem-letter">
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                <span className="submission-score">
                                                    {submission.score || 0}
                                                </span>
                                                {submission.timeTaken > 0 && (
                                                    <span className="submission-time">
                                                        {formatTime(submission.timeTaken)}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="leaderboard-legend">
                <h4>Legend</h4>
                <div className="legend-items">
                    <div className="legend-item">
                        <span className="status-icon" style={{ color: '#48bb78' }}>✅</span>
                        <span>Accepted</span>
                    </div>
                    <div className="legend-item">
                        <span className="status-icon" style={{ color: '#f56565' }}>❌</span>
                        <span>Wrong Answer</span>
                    </div>
                    <div className="legend-item">
                        <span className="status-icon" style={{ color: '#ed8936' }}>⏰</span>
                        <span>Time Limit Exceeded</span>
                    </div>
                    <div className="legend-item">
                        <span className="status-icon" style={{ color: '#e53e3e' }}>💥</span>
                        <span>Runtime Error</span>
                    </div>
                    <div className="legend-item">
                        <span className="status-icon" style={{ color: '#805ad5' }}>🔧</span>
                        <span>Compilation Error</span>
                    </div>
                    <div className="legend-item">
                        <span className="status-icon not-attempted">⚪</span>
                        <span>Not Attempted</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestLeaderboard;
