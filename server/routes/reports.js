import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/top-rated', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT g.title, g.game_id, COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.rating_id) as num_ratings
       FROM games g LEFT JOIN ratings r ON g.game_id = r.game_id
       GROUP BY g.game_id HAVING num_ratings > 0
       ORDER BY avg_rating DESC, num_ratings DESC LIMIT 5`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching top rated:', err);
    res.status(500).json({ error: 'Failed to fetch top rated games' });
  }
});

router.get('/most-reviewed', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT g.title, g.game_id, COUNT(rev.review_id) as review_count
       FROM games g JOIN reviews rev ON g.game_id = rev.game_id
       GROUP BY g.game_id ORDER BY review_count DESC LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching most reviewed:', err);
    res.status(500).json({ error: 'Failed to fetch most reviewed games' });
  }
});

router.get('/most-favorited', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT g.title, g.game_id, COUNT(f.user_id) as fav_count
       FROM games g JOIN favorites f ON g.game_id = f.game_id
       GROUP BY g.game_id ORDER BY fav_count DESC LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching most favorited:', err);
    res.status(500).json({ error: 'Failed to fetch most favorited games' });
  }
});

router.get('/ratings-average', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT g.title, g.game_id, COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.rating_id) as num_ratings
       FROM games g LEFT JOIN ratings r ON g.game_id = r.game_id
       GROUP BY g.game_id ORDER BY avg_rating DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching ratings average:', err);
    res.status(500).json({ error: 'Failed to fetch ratings average' });
  }
});

router.get('/user-reviews/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.execute(
      `SELECT rev.*, g.title, u.username FROM reviews rev
       JOIN games g ON rev.game_id = g.game_id
       JOIN users u ON rev.user_id = u.user_id
       WHERE rev.user_id = ? ORDER BY rev.review_date DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching user reviews:', err);
    res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
});

router.get('/top-list-creators', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.username, u.user_id, COUNT(l.list_id) as list_count
       FROM users u JOIN lists l ON u.user_id = l.user_id
       GROUP BY u.user_id ORDER BY list_count DESC LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching top list creators:', err);
    res.status(500).json({ error: 'Failed to fetch top list creators' });
  }
});

router.get('/list/:listId', async (req, res) => {
  try {
    const { listId } = req.params;
    const [rows] = await pool.execute(
      `SELECT l.name, l.list_id, u.username, g.title, g.game_id, li.added_at
       FROM list_items li
       JOIN lists l ON li.list_id = l.list_id
       JOIN games g ON li.game_id = g.game_id
       JOIN users u ON l.user_id = u.user_id
       WHERE li.list_id = ? ORDER BY li.added_at DESC`,
      [listId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching list report:', err);
    res.status(500).json({ error: 'Failed to fetch list report' });
  }
});

export default router;
