import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authService.login({ email, password });
            if (res.success) {
                const redirect = (location.state && location.state.redirectTo) || '/contests';
                navigate(redirect, { replace: true });
            } else {
                setError(res.message || 'Login failed');
            }
        } catch (err) {
            setError('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="homePageWrapper">
            <div className="bg-pattern" />
            <div className="formWrapper">
                <div className="mainLabel">Welcome back</div>
                {error && <div className="error-message" style={{marginBottom: '1rem', color:'#ff6b6b'}}>{error}</div>}
                <form onSubmit={onSubmit} className="inputGroup">
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
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="createInfo">
                    Don't have an account?{' '}
                    <Link className="createNewBtn" to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;


