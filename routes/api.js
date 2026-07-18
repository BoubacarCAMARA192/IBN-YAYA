const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../database/db');
const { basicAuth } = require('../middleware/auth');

// ─── VISITEURS ───
router.post('/visit', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  db.prepare('INSERT INTO visitors (ip) VALUES (?)').run(ip);
  const count = db.prepare('SELECT COUNT(*) as total FROM visitors').get();
  res.json({ visitors: count.total });
});

router.get('/visitors', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as total FROM visitors').get();
  res.json({ visitors: count.total });
});

// ─── MESSAGES (Livre d'or) ───
router.get('/messages', (req, res) => {
  const msgs = db.prepare(
    "SELECT id, name, content, created_at FROM messages WHERE approved = 1 ORDER BY created_at DESC"
  ).all();
  res.json(msgs);
});

router.post('/messages', (req, res) => {
  const { name, content } = req.body;
  if (!name || !content) {
    return res.status(400).json({ error: 'Nom et message requis' });
  }
  const result = db.prepare(
    'INSERT INTO messages (name, content) VALUES (?, ?)'
  ).run(name.trim(), content.trim());
  res.json({ success: true, id: result.lastInsertRowid });
});

// ─── ADMIN: Gestion des messages ───
router.get('/admin/messages', basicAuth, (req, res) => {
  const msgs = db.prepare(
    "SELECT id, name, content, approved, created_at FROM messages ORDER BY created_at DESC"
  ).all();
  res.json(msgs);
});

router.put('/admin/messages/:id/approve', basicAuth, (req, res) => {
  db.prepare('UPDATE messages SET approved = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.delete('/admin/messages/:id', basicAuth, (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── BOUGIES ───
router.get('/candles/count', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as total FROM candles').get();
  res.json({ candles: count.total });
});

router.post('/candles/light', (req, res) => {
  const { name } = req.body;
  db.prepare('INSERT INTO candles (lit_by) VALUES (?)').run(name || 'Anonyme');
  const count = db.prepare('SELECT COUNT(*) as total FROM candles').get();
  res.json({ candles: count.total });
});

// ─── PHOTOS ───
router.get('/photos', (req, res) => {
  const photos = db.prepare(
    "SELECT id, filename, caption, uploaded_at FROM photos ORDER BY uploaded_at DESC"
  ).all();
  res.json(photos);
});

router.post('/photos/upload', (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier fourni' });
  }
  const caption = req.body.caption || '';
  const result = db.prepare(
    'INSERT INTO photos (filename, caption) VALUES (?, ?)'
  ).run(req.file.filename, caption);
  res.json({ success: true, id: result.lastInsertRowid, filename: req.file.filename });
});

router.delete('/admin/photos/:id', basicAuth, (req, res) => {
  const photo = db.prepare('SELECT filename FROM photos WHERE id = ?').get(req.params.id);
  if (photo) {
    const filePath = path.join(__dirname, '..', 'uploads', photo.filename);
    try { require('fs').unlinkSync(filePath); } catch (e) {}
    db.prepare('DELETE FROM photos WHERE id = ?').run(req.params.id);
  }
  res.json({ success: true });
});

// ─── STATISTIQUES DASHBOARD ───
router.get('/admin/stats', basicAuth, (req, res) => {
  const visitors = db.prepare('SELECT COUNT(*) as total FROM visitors').get().total;
  const messages = db.prepare('SELECT COUNT(*) as total FROM messages').get().total;
  const pendingMessages = db.prepare("SELECT COUNT(*) as total FROM messages WHERE approved = 0").get().total;
  const candles = db.prepare('SELECT COUNT(*) as total FROM candles').get().total;
  const photos = db.prepare('SELECT COUNT(*) as total FROM photos').get().total;
  res.json({ visitors, messages, pendingMessages, candles, photos });
});

module.exports = router;
