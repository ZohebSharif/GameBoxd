import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGames } from '../api';

export default function Games() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [platform, setPlatform] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGames = () => {
    setLoading(true);
    setError('');
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (genre) params.genre = genre;
    if (platform) params.platform = platform;
    getGames(params)
      .then((data) => setGames(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchGames(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGames();
  };

  return (
    <div>
      <h1 className="page-title">Browse Games</h1>
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">All Genres</option>
          <option value="Action">Action</option>
          <option value="RPG">RPG</option>
          <option value="Adventure">Adventure</option>
          <option value="Platformer">Platformer</option>
          <option value="Simulation">Simulation</option>
          <option value="Sandbox">Sandbox</option>
          <option value="Puzzle">Puzzle</option>
          <option value="Roguelike">Roguelike</option>
          <option value="Metroidvania">Metroidvania</option>
          <option value="Indie">Indie</option>
        </select>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="">All Platforms</option>
          <option value="PC">PC</option>
          <option value="PlayStation">PlayStation</option>
          <option value="Xbox">Xbox</option>
          <option value="Nintendo Switch">Nintendo Switch</option>
          <option value="Multi-platform">Multi-platform</option>
        </select>
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      {error && <div className="error-msg">{error}</div>}
      {loading ? (
        <div className="loading">Loading games...</div>
      ) : games.length === 0 ? (
        <p style={{ color: '#9ab' }}>No games found matching your criteria.</p>
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
                  <p>{game.creator} · {game.release_year}</p>
                  {game.avg_rating > 0 && (
                    <span className="game-card-rating">★ {Number(game.avg_rating).toFixed(1)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
