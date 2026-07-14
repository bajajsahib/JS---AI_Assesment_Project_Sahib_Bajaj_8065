import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/tickets.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(dbPath, { enableForeignKeyConstraints: true });
db.exec('PRAGMA journal_mode = WAL');

export function closeDatabase() {
  db.close();
}

export default db;
