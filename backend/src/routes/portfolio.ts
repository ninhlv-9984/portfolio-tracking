import express from 'express';
import { FillSyncService } from '../services/fill-sync.service.js';
import { PortfolioCalculatorService } from '../services/portfolio-calculator.service.js';

const router = express.Router();

// Initialize services
const apiKey = process.env.OKX_API_KEY!;
const secretKey = process.env.OKX_SECRET_KEY!;
const passphrase = process.env.OKX_PASSPHRASE!;

const fillSyncService = new FillSyncService(apiKey, secretKey, passphrase);
const portfolioCalculatorService = new PortfolioCalculatorService(apiKey, secretKey, passphrase);

/**
 * POST /api/portfolio/sync
 * Sync fills from OKX and recalculate portfolio
 */
router.post('/sync', async (req, res) => {
  try {
    console.log('📥 Syncing fills from OKX...');

    // Sync fills
    const syncResult = await fillSyncService.syncFills((progress) => {
      console.log(`  ${progress.instType}: Page ${progress.page}, ${progress.totalFills} fills`);
    });

    // Calculate portfolio
    const portfolio = await portfolioCalculatorService.calculatePortfolio();

    res.json({
      success: true,
      syncResult,
      portfolio
    });
  } catch (error: any) {
    console.error('Error syncing portfolio:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/portfolio/current
 * Get current portfolio with live prices
 */
router.get('/current', async (req, res) => {
  try {
    const portfolio = await portfolioCalculatorService.calculatePortfolio();

    res.json({
      success: true,
      portfolio
    });
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/portfolio/history
 * Get historical portfolio snapshots
 */
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 30;
    const snapshots = await portfolioCalculatorService.getSnapshots(limit);

    res.json({
      success: true,
      snapshots
    });
  } catch (error: any) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/portfolio/snapshot
 * Create a portfolio snapshot
 */
router.post('/snapshot', async (req, res) => {
  try {
    await portfolioCalculatorService.createSnapshot();

    res.json({
      success: true,
      message: 'Snapshot created successfully'
    });
  } catch (error: any) {
    console.error('Error creating snapshot:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
