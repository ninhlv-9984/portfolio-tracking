import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// Get all history entries
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM history ORDER BY timestamp DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get history by asset
router.get('/asset/:asset', async (req: Request, res: Response) => {
  try {
    const { asset } = req.params;
    const result = await pool.query(
      'SELECT * FROM history WHERE asset = $1 ORDER BY timestamp DESC',
      [asset]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get history by transaction ID
router.get('/transaction/:transactionId', async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const result = await pool.query(
      'SELECT * FROM history WHERE transaction_id = $1 ORDER BY timestamp DESC',
      [transactionId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;