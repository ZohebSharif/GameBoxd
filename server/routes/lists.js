import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Must be logged in to view lists' });
    }

    const [lists] = await pool.execute(
      'SELECT * FROM lists WHERE user_id = ? ORDER BY created_at DESC',
      [req.session.userId]
    );

    res.json(lists);
  } catch (err) {
    console.error('Error fetching lists:', err);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Must be logged in to create a list' });
    }

    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'List name cannot be empty' });
    }
    if (name.length > 100) {
      return res.status(400).json({ error: 'List name must be 100 characters or less' });
    }

    const [result] = await pool.execute(
      'INSERT INTO lists (user_id, name) VALUES (?, ?)',
      [req.session.userId, name.trim()]
    );

    res.status(201).json({ message: 'List created', listId: result.insertId });
  } catch (err) {
    console.error('Error creating list:', err);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

router.get('/:listId', async (req, res) => {
  try {
    const { listId } = req.params;

    const [lists] = await pool.execute(
      'SELECT l.*, u.username FROM lists l JOIN users u ON l.user_id = u.user_id WHERE l.list_id = ?',
      [listId]
    );

    if (lists.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    const [games] = await pool.execute(
      `SELECT g.*, li.added_at FROM list_items li
       JOIN games g ON li.game_id = g.game_id
       WHERE li.list_id = ? ORDER BY li.added_at DESC`,
      [listId]
    );

    res.json({ list: lists[0], games });
  } catch (err) {
    console.error('Error fetching list:', err);
    res.status(500).json({ error: 'Failed to fetch list details' });
  }
});

router.post('/:listId/items', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Must be logged in to add items to a list' });
    }

    const { listId } = req.params;
    const { game_id } = req.body;

    if (!game_id) {
      return res.status(400).json({ error: 'game_id is required' });
    }

    const [lists] = await pool.execute(
      'SELECT * FROM lists WHERE list_id = ? AND user_id = ?',
      [listId, req.session.userId]
    );

    if (lists.length === 0) {
      return res.status(403).json({ error: 'You can only add items to your own lists' });
    }

    await pool.execute(
      'INSERT INTO list_items (list_id, game_id) VALUES (?, ?)',
      [listId, game_id]
    );

    res.status(201).json({ message: 'Game added to list' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Game already in this list' });
    }
    console.error('Error adding item to list:', err);
    res.status(500).json({ error: 'Failed to add game to list' });
  }
});

export default router;
