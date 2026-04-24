import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Must be logged in to add a game' });
    }

    const { title, creator, cover_url, genre, platform, release_year } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!creator || !creator.trim()) {
      return res.status(400).json({ error: 'Creator is required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO games (title, creator, cover_url, genre, platform, release_year) VALUES (?, ?, ?, ?, ?, ?)',
      [title.trim(), creator.trim(), cover_url || null, genre || null, platform || null, release_year || null]
    );

    res.status(201).json({ message: 'Game added', gameId: result.insertId });
  } catch (err) {
    console.error('Error adding game:', err);
    res.status(500).json({ error: 'Failed to add game' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { search, genre, platform } = req.query;
    let sql = 'SELECT g.*, COALESCE(AVG(r.rating), 0) as avg_rating FROM games g LEFT JOIN ratings r ON g.game_id = r.game_id';
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('g.title LIKE ?');
      params.push(`%${search}%`);
    }
    if (genre) {
      conditions.push('g.genre = ?');
      params.push(genre);
    }
    if (platform) {
      conditions.push('g.platform = ?');
      params.push(platform);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY g.game_id ORDER BY g.title';

    const [games] = await pool.execute(sql, params);
    res.json(games);
  } catch (err) {
    console.error('Error fetching games:', err);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [games] = await pool.execute(
      `SELECT g.*, COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.rating_id) as rating_count
       FROM games g LEFT JOIN ratings r ON g.game_id = r.game_id
       WHERE g.game_id = ? GROUP BY g.game_id`,
      [id]
    );

    if (games.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const [reviews] = await pool.execute(
      `SELECT rev.*, u.username FROM reviews rev
       JOIN users u ON rev.user_id = u.user_id
       WHERE rev.game_id = ? ORDER BY rev.review_date DESC`,
      [id]
    );

    let userRating = null;
    let isFavorited = false;

    if (req.session.userId) {
      const [ratings] = await pool.execute(
        'SELECT * FROM ratings WHERE user_id = ? AND game_id = ?',
        [req.session.userId, id]
      );
      userRating = ratings.length > 0 ? ratings[0] : null;

      const [favorites] = await pool.execute(
        'SELECT * FROM favorites WHERE user_id = ? AND game_id = ?',
        [req.session.userId, id]
      );
      isFavorited = favorites.length > 0;
    }

    res.json({ game: games[0], reviews, userRating, isFavorited });
  } catch (err) {
    console.error('Error fetching game:', err);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
});

router.post('/:id/reviews', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Must be logged in to write a review' });
    }

    const { id } = req.params;
    const { review } = req.body;

    if (!review || review.trim().length === 0) {
      return res.status(400).json({ error: 'Review text cannot be empty' });
    }

    const [result] = await pool.execute(
      'INSERT INTO reviews (user_id, game_id, review) VALUES (?, ?, ?)',
      [req.session.userId, id, review.trim()]
    );

    res.status(201).json({ message: 'Review added', reviewId: result.insertId });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

router.post('/:id/rating', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Must be logged in to rate a game' });
    }

    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1.0 || rating > 5.0) {
      return res.status(400).json({ error: 'Rating must be between 1.0 and 5.0' });
    }

    const [existing] = await pool.execute(
      'SELECT * FROM ratings WHERE user_id = ? AND game_id = ?',
      [req.session.userId, id]
    );

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE ratings SET rating = ?, rating_date = NOW() WHERE user_id = ? AND game_id = ?',
        [rating, req.session.userId, id]
      );
      res.json({ message: 'Rating updated' });
    } else {
      await pool.execute(
        'INSERT INTO ratings (user_id, game_id, rating) VALUES (?, ?, ?)',
        [req.session.userId, id, rating]
      );
      res.status(201).json({ message: 'Rating added' });
    }
  } catch (err) {
    console.error('Error rating game:', err);
    res.status(500).json({ error: 'Failed to rate game' });
  }
});

router.post('/:id/favorite', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Must be logged in to favorite a game' });
    }

    const { id } = req.params;

    await pool.execute(
      'INSERT INTO favorites (user_id, game_id) VALUES (?, ?)',
      [req.session.userId, id]
    );

    res.status(201).json({ message: 'Game added to favorites' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Game already in favorites' });
    }
    console.error('Error favoriting game:', err);
    res.status(500).json({ error: 'Failed to favorite game' });
  }
});

export default router;
