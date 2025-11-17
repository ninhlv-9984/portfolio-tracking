import pool from '../config/database.js';
import { OKXAuth } from './okx-auth.js';

export class FillSyncService {
  private okx: OKXAuth;

  constructor(apiKey: string, secretKey: string, passphrase: string) {
    this.okx = new OKXAuth(apiKey, secretKey, passphrase);
  }

  /**
   * Sync all fills from OKX to database
   */
  async syncFills(onProgress?: (progress: any) => void): Promise<{ newFills: number; totalFills: number }> {
    console.log('🔄 Starting fill sync from OKX...');

    try {
      // Fetch all fills from OKX
      const fills = await this.okx.getAllFillsAllTypes(onProgress);

      console.log(`📥 Fetched ${fills.length} fills from OKX`);

      // Insert fills into database (skip duplicates)
      let newFills = 0;
      const client = await pool.connect();

      try {
        for (const fill of fills) {
          try {
            await client.query(
              `INSERT INTO fills (
                bill_id, inst_id, inst_type, side, fill_px, fill_sz,
                fee, fee_ccy, ord_id, ts
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              ON CONFLICT (bill_id) DO NOTHING`,
              [
                fill.billId,
                fill.instId,
                fill.instType,
                fill.side,
                fill.fillPx,
                fill.fillSz,
                fill.fee,
                fill.feeCcy,
                fill.ordId,
                fill.ts
              ]
            );
            newFills++;
          } catch (error:any) {
            // Skip duplicate entries
            if (!error.message.includes('duplicate key')) {
              console.error('Error inserting fill:', error);
            }
          }
        }
      } finally {
        client.release();
      }

      console.log(`✅ Synced ${newFills} new fills to database`);

      return { newFills, totalFills: fills.length };
    } catch (error) {
      console.error('❌ Error syncing fills:', error);
      throw error;
    }
  }

  /**
   * Get all fills from database
   */
  async getFillsFromDB(): Promise<any[]> {
    const result = await pool.query('SELECT * FROM fills ORDER BY ts DESC');
    return result.rows;
  }

  /**
   * Get fills for a specific symbol from database
   */
  async getFillsBySymbol(symbol: string): Promise<any[]> {
    const result = await pool.query(
      'SELECT * FROM fills WHERE inst_id LIKE $1 ORDER BY ts DESC',
      [`${symbol}-%`]
    );
    return result.rows;
  }

  /**
   * Clear all fills from database
   */
  async clearFills(): Promise<void> {
    await pool.query('DELETE FROM fills');
    console.log('✅ All fills cleared from database');
  }
}
