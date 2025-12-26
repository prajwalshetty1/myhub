// Test Supabase Connection
require('dotenv').config();
const { Pool } = require('pg');

// Try different connection formats
const connectionStrings = [
  // Direct connection
  'postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres',
  // Alternative format
  'postgresql://postgres:NextGenDB%40123456@jarhhglbeawefqpgmuch.supabase.co:5432/postgres',
  // With SSL
  {
    host: 'db.jarhhglbeawefqpgmuch.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'NextGenDB@123456',
    ssl: { rejectUnauthorized: false }
  }
];

async function testConnection(config, label) {
  try {
    const pool = typeof config === 'string' 
      ? new Pool({ connectionString: config, ssl: { rejectUnauthorized: false } })
      : new Pool(config);
    
    const result = await pool.query('SELECT NOW() as time, current_database() as db, version() as version');
    console.log(`✅ ${label} - Connected!`);
    console.log(`   Database: ${result.rows[0].db}`);
    console.log(`   Time: ${result.rows[0].time}`);
    await pool.end();
    return true;
  } catch (error) {
    console.log(`❌ ${label} - Failed: ${error.message}`);
    return false;
  }
}

async function testAll() {
  console.log('Testing Supabase connections...\n');
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const config = connectionStrings[i];
    const label = i === 0 ? 'Direct connection (db.jarhhglbeawefqpgmuch.supabase.co)' 
                 : i === 1 ? 'Alternative format (jarhhglbeawefqpgmuch.supabase.co)'
                 : 'Individual parameters';
    
    const success = await testConnection(config, label);
    if (success) {
      console.log(`\n✅ Working connection found! Use this format.`);
      process.exit(0);
    }
  }
  
  console.log('\n⚠️  None of the connection formats worked.');
  console.log('Please check your Supabase dashboard for the correct connection string.');
  console.log('Dashboard: https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/settings/database');
  process.exit(1);
}

testAll();

