import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// Get all transactions
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM transactions ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transaction by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM transactions WHERE id = $1',
      [id]
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
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      asset,
      type,
      quantity,
      price_usd,
      destination_asset,
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
        (asset, type, quantity, price_usd, destination_asset, transaction_date, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [asset, type, quantity, price_usd, destination_asset, transaction_date, notes]
      );

      const newTransaction = result.rows[0];

      // If it's a sell transaction with destination asset, create buy transaction for stablecoin
      if (type === 'sell' && destination_asset) {
        const receiveAmount = quantity * price_usd;
        await client.query(
          `INSERT INTO transactions 
          (asset, type, quantity, price_usd, transaction_date, notes)
          VALUES ($1, 'buy', $2, 1, $3, $4)`,
          [
            destination_asset,
            receiveAmount,
            transaction_date,
            `Received from selling ${quantity} ${asset}`
          ]
        );
      }

      // Record in history
      await client.query(
        `INSERT INTO history 
        (action, transaction_id, asset, type, destination_asset, quantity, price_usd, transaction_date, notes)
        VALUES ('add', $1, $2, $3, $4, $5, $6, $7, $8)`,
        [newTransaction.id, asset, type, destination_asset, quantity, price_usd, transaction_date, notes]
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
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      asset,
      type,
      quantity,
      price_usd,
      destination_asset,
      transaction_date,
      notes
    } = req.body;

    const result = await pool.query(
      `UPDATE transactions 
      SET asset = $1, type = $2, quantity = $3, price_usd = $4, 
          destination_asset = $5, transaction_date = $6, notes = $7
      WHERE id = $8
      RETURNING *`,
      [asset, type, quantity, price_usd, destination_asset, transaction_date, notes, id]
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
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get transaction details before deletion
      const transaction = await client.query(
        'SELECT * FROM transactions WHERE id = $1',
        [id]
      );

      if (transaction.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Transaction not found' });
      }

      const deletedTransaction = transaction.rows[0];

      // Record deletion in history
      await client.query(
        `INSERT INTO history 
        (action, transaction_id, asset, type, destination_asset, quantity, price_usd, transaction_date, notes)
        VALUES ('delete', $1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          deletedTransaction.id,
          deletedTransaction.asset,
          deletedTransaction.type,
          deletedTransaction.destination_asset,
          deletedTransaction.quantity,
          deletedTransaction.price_usd,
          deletedTransaction.transaction_date,
          deletedTransaction.notes
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