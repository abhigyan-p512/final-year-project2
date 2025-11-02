import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const Signup = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authService.signup({ username, email, password });
            if (res.success) {
                navigate('/contests', { replace: true });
            } else {
                setError(res.message || 'Signup failed');
            }
        } catch (err) {
            setError('Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="homePageWrapper">
            <div className="bg-pattern" />
            <div className="formWrapper">
                <div className="mainLabel">Create your account</div>
                {error && <div className="error-message" style={{marginBottom: '1rem', color:'#ff6b6b'}}>{error}</div>}
                <form onSubmit={onSubmit} className="inputGroup">
                    <input
                        className="inputBox"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        className="inputBox"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="inputBox"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className="joinBtn" type="submit" disabled={loading}>
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>
                <div className="createInfo">
                    Already have an account?{' '}
                    <Link className="createNewBtn" to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;


