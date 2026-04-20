import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getLists, createList } from '../api';

export default function Lists({ user }) {
  const [lists, setLists] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchLists();
  }, [user]);

  const fetchLists = () => {
    setLoading(true);
    getLists()
      .then((data) => setLists(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('List name cannot be empty.');
      return;
    }
    if (name.length > 100) {
      setError('List name must be 100 characters or fewer.');
      return;
    }

    try {
      await createList(name);
      setName('');
      setSuccess('List created!');
      fetchLists();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return null;

  return (
    <div>
      <h1 className="page-title">My Lists</h1>

      <form onSubmit={handleCreate} style={{ marginBottom: '2rem' }}>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <input
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.6rem 0.8rem',
              background: '#2c3440',
              border: '1px solid #456',
              borderRadius: '4px',
              color: '#d8d8d8',
              fontSize: '0.95rem',
            }}
            placeholder="New list name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Create List</button>
        </div>
      </form>

      {loading ? (
        <div className="loading">Loading lists...</div>
      ) : lists.length === 0 ? (
        <p style={{ color: '#9ab' }}>You haven't created any lists yet.</p>
      ) : (
        lists.map((list) => (
          <Link to={`/lists/${list.list_id}`} key={list.list_id} style={{ textDecoration: 'none' }}>
            <div className="list-card">
              <h3>{list.name}</h3>
              <span className="list-date">{new Date(list.created_at).toLocaleDateString()}</span>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
