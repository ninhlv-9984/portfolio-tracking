import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all history entries for authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM history WHERE user_id = $1 ORDER BY timestamp DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get history by asset for authenticated user
router.get('/asset/:asset', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { asset } = req.params;
    const result = await pool.query(
      'SELECT * FROM history WHERE asset = $1 AND user_id = $2 ORDER BY timestamp DESC',
      [asset, req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get history by transaction ID for authenticated user
router.get('/transaction/:transactionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const result = await pool.query(
      'SELECT * FROM history WHERE transaction_id = $1 AND user_id = $2 ORDER BY timestamp DESC',
      [transactionId, req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;