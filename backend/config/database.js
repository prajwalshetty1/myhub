// Database Configuration - Supabase Compatible
const { Pool } = require('pg');
require('dotenv').config();

// Support both Supabase connection string and individual parameters
let poolConfig;

if (process.env.DATABASE_URL) {
  // Supabase provides DATABASE_URL connection string
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    // Always use SSL for Supabase (production or preview)
    ssl: process.env.DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // Fallback to individual parameters
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'myhub',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: (process.env.DB_HOST && process.env.DB_HOST.includes('supabase')) || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;

