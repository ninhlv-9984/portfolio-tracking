import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all transactions for the authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transaction by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Create new transaction
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      asset,
      type,
      quantity,
      price_usd,
      destination_asset,
      source_asset,
      transaction_date,
      notes
    } = req.body;

    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert the main transaction
      const result = await client.query(
        `INSERT INTO transactions
        (asset, type, quantity, price_usd, destination_asset, source_asset, transaction_date, notes, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [asset, type, quantity, price_usd, destination_asset, source_asset, transaction_date, notes, req.userId]
      );

      const newTransaction = result.rows[0];

      // If it's a sell transaction with destination asset, create buy transaction for stablecoin
      if (type === 'sell' && destination_asset) {
        const receiveAmount = quantity * price_usd;
        await client.query(
          `INSERT INTO transactions
          (asset, type, quantity, price_usd, transaction_date, notes, user_id)
          VALUES ($1, 'buy', $2, 1, $3, $4, $5)`,
          [
            destination_asset,
            receiveAmount,
            transaction_date,
            `Received from selling ${quantity} ${asset}`,
            req.userId
          ]
        );
      }

      // If it's a swap transaction, deduct from source stablecoin and add the crypto
      if (type === 'swap' && source_asset) {
        const swapCost = quantity * price_usd;
        // Create a sell transaction for the source stablecoin
        await client.query(
          `INSERT INTO transactions
          (asset, type, quantity, price_usd, transaction_date, notes, user_id)
          VALUES ($1, 'sell', $2, 1, $3, $4, $5)`,
          [
            source_asset,
            swapCost,
            transaction_date,
            `Used to swap for ${quantity} ${asset}`,
            req.userId
          ]
        );
      }

      // For withdrawals with no price, use 0. Deposits should always have a price for cost basis
      const finalPriceUsd = type === 'withdraw' && !price_usd ? 0 : price_usd;

      // Record in history
      await client.query(
        `INSERT INTO history
        (action, transaction_id, asset, type, destination_asset, source_asset, quantity, price_usd, transaction_date, notes, user_id)
        VALUES ('add', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [newTransaction.id, asset, type, destination_asset, source_asset, quantity, price_usd, transaction_date, notes, req.userId]
      );

      await client.query('COMMIT');
      res.status(201).json(newTransaction);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update transaction
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      asset,
      type,
      quantity,
      price_usd,
      destination_asset,
      source_asset,
      transaction_date,
      notes
    } = req.body;

    const result = await pool.query(
      `UPDATE transactions
      SET asset = $1, type = $2, quantity = $3, price_usd = $4,
          destination_asset = $5, source_asset = $6, transaction_date = $7, notes = $8
      WHERE id = $9 AND user_id = $10
      RETURNING *`,
      [asset, type, quantity, price_usd, destination_asset, source_asset, transaction_date, notes, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get transaction details before deletion
      const transaction = await client.query(
        'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
        [id, req.userId]
      );

      if (transaction.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Transaction not found' });
      }

      const deletedTransaction = transaction.rows[0];

      // Record deletion in history
      await client.query(
        `INSERT INTO history
        (action, transaction_id, asset, type, destination_asset, source_asset, quantity, price_usd, transaction_date, notes, user_id)
        VALUES ('delete', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          deletedTransaction.id,
          deletedTransaction.asset,
          deletedTransaction.type,
          deletedTransaction.destination_asset,
          deletedTransaction.source_asset,
          deletedTransaction.quantity,
          deletedTransaction.price_usd,
          deletedTransaction.transaction_date,
          deletedTransaction.notes,
          req.userId
        ]
      );

      // Delete the transaction
      await client.query('DELETE FROM transactions WHERE id = $1', [id]);

      await client.query('COMMIT');
      res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

export default router;