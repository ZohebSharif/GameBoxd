import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getGame, postReview, postRating, postFavorite, getLists, addListItem } from '../api';

export default function GameDetail({ user }) {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review form
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Rating
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingMsg, setRatingMsg] = useState('');

  // Favorite
  const [favMsg, setFavMsg] = useState('');

  // Add to list
  const [showListModal, setShowListModal] = useState(false);
  const [lists, setLists] = useState([]);
  const [listMsg, setListMsg] = useState('');

  const fetchGame = () => {
    setLoading(true);
    getGame(id)
      .then((data) => {
        setGame(data.game);
        setReviews(data.reviews);
        setUserRating(data.userRating);
        setIsFavorited(data.isFavorited);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchGame(); }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!reviewText.trim()) {
      setReviewError('Review text cannot be empty.');
      return;
    }

    try {
      await postReview(id, reviewText);
      setReviewText('');
      setReviewSuccess('Review added successfully!');
      fetchGame();
    } catch (err) {
      setReviewError(err.message);
    }
  };

  const handleRating = async (value) => {
    setRatingMsg('');
    try {
      await postRating(id, value);
      setRatingMsg(`Rated ${value.toFixed(1)} ★`);
      fetchGame();
    } catch (err) {
      setRatingMsg(err.message);
    }
  };

  const handleFavorite = async () => {
    setFavMsg('');
    try {
      await postFavorite(id);
      setIsFavorited(true);
      setFavMsg('Added to favorites!');
    } catch (err) {
      setFavMsg(err.message);
    }
  };

  const openListModal = async () => {
    try {
      const data = await getLists();
      setLists(data);
      setShowListModal(true);
      setListMsg('');
    } catch (err) {
      setListMsg(err.message);
    }
  };

  const handleAddToList = async (listId) => {
    setListMsg('');
    try {
      await addListItem(listId, parseInt(id));
      setListMsg('Added to list!');
      setTimeout(() => setShowListModal(false), 1000);
    } catch (err) {
      setListMsg(err.message);
    }
  };

  if (loading) return <div className="loading">Loading game...</div>;
  if (error) return <div className="error-msg">{error}</div>;
  if (!game) return <div className="error-msg">Game not found.</div>;

  return (
    <div>
      <div className="game-detail">
        <img
          src={game.cover_url || 'https://placehold.co/300x400?text=No+Cover'}
          alt={game.title}
          onError={(e) => { e.target.src = 'https://placehold.co/300x400?text=No+Cover'; }}
        />
        <div className="game-meta">
          <h1>{game.title}</h1>
          <div className="meta-row">Creator: <span>{game.creator}</span></div>
          <div className="meta-row">Genre: <span>{game.genre || 'N/A'}</span></div>
          <div className="meta-row">Platform: <span>{game.platform || 'N/A'}</span></div>
          <div className="meta-row">Release Year: <span>{game.release_year || 'N/A'}</span></div>
          <div className="meta-row">
            Ratings: <span>{game.rating_count || 0}</span>
          </div>
          <div className="avg-rating">
            {game.avg_rating > 0 ? `★ ${Number(game.avg_rating).toFixed(1)}` : 'No ratings yet'}
          </div>

          {user && (
            <div className="game-actions">
              <button className="btn btn-primary btn-sm" onClick={handleFavorite} disabled={isFavorited}>
                {isFavorited ? '♥ Favorited' : '♡ Favorite'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={openListModal}>
                + Add to List
              </button>
            </div>
          )}
          {favMsg && <div className="success-msg">{favMsg}</div>}
          {listMsg && !showListModal && <div className="success-msg">{listMsg}</div>}
        </div>
      </div>

      {/* Rating */}
      {user && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>
            {userRating ? `Your Rating: ${Number(userRating.rating).toFixed(1)} ★` : 'Rate this game'}
          </h3>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= (hoverRating || (userRating ? Math.round(userRating.rating) : 0)) ? 'filled' : ''}`}
                onClick={() => handleRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </span>
            ))}
          </div>
          {ratingMsg && <div className="success-msg">{ratingMsg}</div>}
        </div>
      )}

      {/* Reviews */}
      <div className="reviews-section">
        <h2 className="page-title">Reviews ({reviews.length})</h2>

        {user && (
          <form onSubmit={handleReview} style={{ marginBottom: '1.5rem' }}>
            {reviewError && <div className="error-msg">{reviewError}</div>}
            {reviewSuccess && <div className="success-msg">{reviewSuccess}</div>}
            <div className="form-group">
              <label>Write a review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this game..."
              />
            </div>
            <button className="btn btn-primary" type="submit">Submit Review</button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p style={{ color: '#9ab' }}>No reviews yet. Be the first!</p>
        ) : (
          reviews.map((rev) => (
            <div className="review-card" key={rev.review_id}>
              <div className="review-header">
                <span className="review-author">{rev.username}</span>
                <span className="review-date">{new Date(rev.review_date).toLocaleDateString()}</span>
              </div>
              <p className="review-text">{rev.review}</p>
            </div>
          ))
        )}
      </div>

      {/* Add to List Modal */}
      {showListModal && (
        <div className="modal-overlay" onClick={() => setShowListModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add to List</h3>
            {listMsg && <div className="success-msg">{listMsg}</div>}
            {lists.length === 0 ? (
              <p style={{ color: '#9ab' }}>You have no lists yet. Create one from the My Lists page.</p>
            ) : (
              lists.map((list) => (
                <div
                  key={list.list_id}
                  className="list-card"
                  onClick={() => handleAddToList(list.list_id)}
                >
                  <h3>{list.name}</h3>
                </div>
              ))
            )}
            <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setShowListModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
