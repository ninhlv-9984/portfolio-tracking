import { up, down } from './001_init.js';
import pool from '../config/database.js';

const command = process.argv[2];

async function runMigration() {
  try {
    if (command === 'up') {
      console.log('🔄 Running migrations...');
      await up();
      console.log('✅ All migrations completed');
    } else if (command === 'down') {
      console.log('🔄 Rolling back migrations...');
      await down();
      console.log('✅ All migrations rolled back');
    } else {
      console.log('Usage: npm run migrate up|down');
      process.exit(1);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
