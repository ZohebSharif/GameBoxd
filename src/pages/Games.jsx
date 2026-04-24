import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGames, addGame } from '../api';

export default function Games() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [platform, setPlatform] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', creator: '', cover_url: '', genre: '', platform: '', release_year: '' });
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

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

  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    try {
      await addGame({
        ...addForm,
        release_year: addForm.release_year ? Number(addForm.release_year) : null,
      });
      setAddSuccess('Game added!');
      setAddForm({ title: '', creator: '', cover_url: '', genre: '', platform: '', release_year: '' });
      fetchGames();
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess('');
      }, 1000);
    } catch (err) {
      setAddError(err.message);
    }
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

      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn" onClick={() => setShowAddModal(true)}>
          Don't see your game? Add here
        </button>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add a Game</h3>
            {addError && <div className="error-msg">{addError}</div>}
            {addSuccess && <div className="success-msg">{addSuccess}</div>}
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input name="title" value={addForm.title} onChange={handleAddChange} required />
              </div>
              <div className="form-group">
                <label>Creator / Studio *</label>
                <input name="creator" value={addForm.creator} onChange={handleAddChange} required />
              </div>
              <div className="form-group">
                <label>Cover Image URL</label>
                <input name="cover_url" value={addForm.cover_url} onChange={handleAddChange} placeholder="https://example.com/cover.jpg" />
              </div>
              <div className="form-group">
                <label>Genre</label>
                <select name="genre" value={addForm.genre} onChange={handleAddChange}>
                  <option value="">Select genre</option>
                  <option value="Action">Action</option>
                  <option value="Action-Adventure">Action-Adventure</option>
                  <option value="Action RPG">Action RPG</option>
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
              </div>
              <div className="form-group">
                <label>Platform</label>
                <select name="platform" value={addForm.platform} onChange={handleAddChange}>
                  <option value="">Select platform</option>
                  <option value="PC">PC</option>
                  <option value="PlayStation">PlayStation</option>
                  <option value="Xbox">Xbox</option>
                  <option value="Nintendo Switch">Nintendo Switch</option>
                  <option value="Multi-platform">Multi-platform</option>
                </select>
              </div>
              <div className="form-group">
                <label>Release Year</label>
                <input name="release_year" type="number" value={addForm.release_year} onChange={handleAddChange} placeholder="2024" />
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                <button className="btn btn-primary" type="submit">Add Game</button>
                <button className="btn" type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
