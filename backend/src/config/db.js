import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function initSchema() {
  const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'models', 'schema.sql'), 'utf8');
  const seedSql = fs.readFileSync(path.join(__dirname, '..', 'models', 'seed.sql'), 'utf8');
  const conn = await pool.getConnection();
  try {
    await conn.query(schemaSql);
    await conn.query(seedSql);
    logger.info('DB schema initialized.');
  } finally {
    conn.release();
  }
}
