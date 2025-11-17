import express from 'express';
import pool from '../config/database.js';
import { FillSyncService } from '../services/fill-sync.service.js';

const router = express.Router();

const apiKey = process.env.OKX_API_KEY!;
const secretKey = process.env.OKX_SECRET_KEY!;
const passphrase = process.env.OKX_PASSPHRASE!;

const fillSyncService = new FillSyncService(apiKey, secretKey, passphrase);

/**
 * GET /api/holdings
 * Get all holdings
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM holdings ORDER BY total_cost DESC');

    res.json({
      success: true,
      holdings: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching holdings:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/holdings/:symbol
 * Get holding details for a specific symbol
 */
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;

    // Get holding
    const holdingResult = await pool.query(
      'SELECT * FROM holdings WHERE symbol = $1',
      [symbol]
    );

    if (holdingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Holding not found' });
    }

    // Get fills for this symbol
    const fills = await fillSyncService.getFillsBySymbol(symbol);

    res.json({
      success: true,
      holding: holdingResult.rows[0],
      fills
    });
  } catch (error: any) {
    console.error('Error fetching holding details:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
