import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contestService } from '../services/contestService';
import { authService } from '../services/authService';
import { ContestStatus } from '../models/contest';
import './ContestList.css';

const ContestList = () => {
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, running, finished
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            setLoading(true);
            const response = await contestService.getContests();
            if (response.success) {
                setContests(response.data);
            }
        } catch (error) {
            console.error('Error fetching contests:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredContests = contests.filter(contest => {
        if (filter === 'all') return true;
        return contest.status === filter;
    });

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
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    const getTimeRemaining = (startTime, endTime, status) => {
        const now = new Date();
        
        if (status === ContestStatus.UPCOMING) {
            const diff = new Date(startTime) - now;
            if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                return `Starts in ${hours}h ${minutes}m`;
            }
        } else if (status === ContestStatus.RUNNING) {
            const diff = new Date(endTime) - now;
            if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                return `Ends in ${hours}h ${minutes}m`;
            }
        }
        
        return 'Contest ended';
    };

    const handleContestClick = (contestId) => {
        navigate(`/contests/${contestId}`);
    };

    const handleJoinContest = async (contestId, e) => {
        e.stopPropagation();
        try {
            if (!authService.isAuthenticated()) {
                navigate('/login', { state: { redirectTo: `/contests/${contestId}` } });
                return;
            }
            const user = authService.getUser();
            const response = await contestService.joinContest(contestId, user?.id);
            if (response.success) {
                alert('Successfully joined contest!');
                fetchContests(); // Refresh to update participant count
                navigate(`/contests/${contestId}`); // Go to contest details
            } else {
                alert(response.message);
            }
        } catch (error) {
            console.error('Error joining contest:', error);
            alert('Failed to join contest');
        }
    };

    const canJoinContest = (contest) => {
        return contest.status === ContestStatus.UPCOMING || contest.status === ContestStatus.RUNNING;
    };

    if (loading) {
        return (
            <div className="contest-list-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading contests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="contest-list-container">
            <div className="contest-header">
                <h1>🎯 Coding Contests</h1>
                <div className="contest-actions">
                    <button 
                        className="btn btn-primary"
                        onClick={() => {
                            if (!authService.isAuthenticated()) {
                                navigate('/login', { state: { redirectTo: '/contests' } });
                                return;
                            }
                            setShowCreateModal(true);
                        }}
                    >
                        Create Contest
                    </button>
                </div>
            </div>

            <div className="contest-filters">
                <button 
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Contests
                </button>
                <button 
                    className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setFilter('upcoming')}
                >
                    Upcoming
                </button>
                <button 
                    className={`filter-btn ${filter === 'running' ? 'active' : ''}`}
                    onClick={() => setFilter('running')}
                >
                    Running
                </button>
                <button 
                    className={`filter-btn ${filter === 'finished' ? 'active' : ''}`}
                    onClick={() => setFilter('finished')}
                >
                    Finished
                </button>
            </div>

            <div className="contests-grid">
                {filteredContests.map(contest => (
                    <div 
                        key={contest.id} 
                        className="contest-card"
                        onClick={() => handleContestClick(contest.id)}
                    >
                        <div className="contest-card-header">
                            <h3 className="contest-title">{contest.title}</h3>
                            {getStatusBadge(contest.status)}
                        </div>
                        
                        <p className="contest-description">{contest.description}</p>
                        
                        <div className="contest-info">
                            <div className="info-item">
                                <span className="info-label">📅 Start:</span>
                                <span className="info-value">{formatDate(contest.startTime)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">⏱️ Duration:</span>
                                <span className="info-value">{contest.duration} minutes</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">👥 Participants:</span>
                                <span className="info-value">{contest.currentParticipants}/{contest.maxParticipants}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">📝 Problems:</span>
                                <span className="info-value">{contest.problems.length}</span>
                            </div>
                        </div>

                        <div className="contest-timing">
                            <span className="time-remaining">
                                {getTimeRemaining(contest.startTime, contest.endTime, contest.status)}
                            </span>
                        </div>

                        <div className="contest-card-actions">
                            {canJoinContest(contest) && (
                                <button 
                                    className="btn btn-secondary"
                                    onClick={(e) => handleJoinContest(contest.id, e)}
                                >
                                    Join Contest
                                </button>
                            )}
                            <button 
                                className="btn btn-outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleContestClick(contest.id);
                                }}
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredContests.length === 0 && (
                <div className="no-contests">
                    <h3>No contests found</h3>
                    <p>Try adjusting your filters or create a new contest.</p>
                </div>
            )}

            {showCreateModal && (
                <CreateContestModal 
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchContests();
                    }}
                />
            )}
        </div>
    );
};

// Create Contest Modal Component
const CreateContestModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: 120,
        maxParticipants: 50,
        startTime: '',
        endTime: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.title.trim() || !formData.description.trim()) {
                alert('Title and description are required');
                return;
            }
            if (!formData.startTime || !formData.endTime) {
                alert('Start and End time are required');
                return;
            }
            if (new Date(formData.endTime) <= new Date(formData.startTime)) {
                alert('End time must be after start time');
                return;
            }
            const contestData = {
                ...formData,
                startTime: new Date(formData.startTime),
                endTime: new Date(formData.endTime),
                problems: [], // Will be added separately
                createdBy: 'current-user'
            };

            const response = await contestService.createContest(contestData);
            if (response.success) {
                onSuccess();
            }
            else if (response.message) {
                alert(response.message);
            }
        } catch (error) {
            console.error('Error creating contest:', error);
            alert('Failed to create contest');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Contest</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} className="create-contest-form">
                    <div className="form-group">
                        <label>Contest Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Enter contest title"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Describe your contest"
                            rows="3"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Duration (minutes)</label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                required
                                min="30"
                                max="1440"
                            />
                        </div>

                        <div className="form-group">
                            <label>Max Participants</label>
                            <input
                                type="number"
                                name="maxParticipants"
                                value={formData.maxParticipants}
                                onChange={handleChange}
                                required
                                min="2"
                                max="1000"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Time</label>
                            <input
                                type="datetime-local"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>End Time</label>
                            <input
                                type="datetime-local"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Create Contest
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContestList;
