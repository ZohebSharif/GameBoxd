import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getList } from '../api';

export default function ListDetail({ user }) {
  const { listId } = useParams();
  const [list, setList] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getList(listId)
      .then((data) => {
        setList(data.list);
        setGames(data.games);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [listId]);

  if (loading) return <div className="loading">Loading list...</div>;
  if (error) return <div className="error-msg">{error}</div>;
  if (!list) return <div className="error-msg">List not found.</div>;

  return (
    <div>
      <h1 className="page-title">{list.name}</h1>
      <p style={{ color: '#9ab', marginBottom: '1.5rem' }}>
        Created by <span style={{ color: '#00e054' }}>{list.username}</span> on{' '}
        {new Date(list.created_at).toLocaleDateString()}
      </p>

      {games.length === 0 ? (
        <p style={{ color: '#9ab' }}>This list has no games yet.</p>
      ) : (
        <div className="game-grid">
          {games.map((game) => (
            <Link to={`/games/${game.game_id}`} key={game.game_id} style={{ textDecoration: 'none' }}>
              <div className="game-card">
                <img
                  src={game.cover_url || 'https://placehold.co/300x400?text=No+Cover'}
                  alt={game.title}
                  onError={(e) => { e.target.src = 'https://placehold.co/300x400?text=No+Cover'; }}
                />
                <div className="game-card-info">
                  <h3>{game.title}</h3>
                  <p>Added {new Date(game.added_at).toLocaleDateString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
