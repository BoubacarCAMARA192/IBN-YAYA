const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = process.env.DB_PATH ? path.dirname(process.env.DB_PATH) : path.join(__dirname);
const dbPath = process.env.DB_PATH || path.join(dbDir, 'tribute.db');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT NOT NULL,
    visit_date DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    approved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS candles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lit_by TEXT DEFAULT 'Anonyme',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    caption TEXT DEFAULT '',
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );
`);

const insertDefaultAdmin = db.prepare(`
  INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)
`);
insertDefaultAdmin.run('admin', 'yaya2026');

// ─── DONNÉES STATIQUES (seed) ───
const msgCount = db.prepare('SELECT COUNT(*) as c FROM messages').get().c;
if (msgCount === 0) {
  const seedMessages = [
    { name: 'Boubacar Camara', content: 'Papa, tu resteras à jamais dans mon cœur. Chaque réussite de ma vie, je te la dédie. Que la paix soit sur ton âme.' },
    { name: 'La Famille Camara', content: 'Yaya, tu nous as quittés mais ton sourire et ta bienveillance restent gravés dans nos mémoires. Repose en paix, cher frère.' },
    { name: 'Un Ami', content: 'Homme de foi et de valeurs, Yaya était un exemple pour tous ceux qui l\'ont connu. Qu\'Allah l\'accueille dans Son Paradis.' },
  ];
  const insertMsg = db.prepare('INSERT INTO messages (name, content, approved) VALUES (?, ?, 1)');
  seedMessages.forEach(m => insertMsg.run(m.name, m.content));

  const seedCandles = [
    'Boubacar', 'Maman', 'Fatou', 'Amadou', 'Aminata'
  ];
  const insertCandle = db.prepare('INSERT INTO candles (lit_by) VALUES (?)');
  seedCandles.forEach(c => insertCandle.run(c));
}

module.exports = db;
