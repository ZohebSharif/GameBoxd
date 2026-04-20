import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';

export default function Register({ setUser }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (username.length < 5 || username.length > 20) {
      setError('Username must be between 5 and 20 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const data = await register(username, email, password);
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Create Account</h2>
      {error && <div className="error-msg">{error}</div>}
      <div className="form-group">
        <label>Username (5–20 characters)</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div className="form-group">
        <label>Password (min 6 characters)</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a password" />
      </div>
      <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Creating account...' : 'Register'}
      </button>
      <p style={{ textAlign: 'center', marginTop: '1rem', color: '#9ab' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </form>
  );
}
