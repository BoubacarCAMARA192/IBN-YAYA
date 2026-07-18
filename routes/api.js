const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { basicAuth } = require('../middleware/auth');

router.post('/visit', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const total = db.ajouterVisiteur(ip);
  res.json({ visitors: total });
});

router.get('/visitors', (req, res) => {
  res.json({ visitors: db.compterVisiteurs() });
});

router.get('/messages', (req, res) => {
  res.json(db.getMessages(true));
});

router.post('/messages', (req, res) => {
  const { name, content } = req.body;
  if (!name || !content) return res.status(400).json({ error: 'Nom et message requis' });
  const id = db.ajouterMessage(name.trim(), content.trim());
  res.json({ success: true, id });
});

router.get('/admin/messages', basicAuth, (req, res) => {
  res.json(db.getMessages(false));
});

router.put('/admin/messages/:id/approve', basicAuth, (req, res) => {
  db.approuverMessage(req.params.id);
  res.json({ success: true });
});

router.delete('/admin/messages/:id', basicAuth, (req, res) => {
  db.supprimerMessage(req.params.id);
  res.json({ success: true });
});

router.get('/candles/count', (req, res) => {
  res.json({ candles: db.compterBougies() });
});

router.post('/candles/light', (req, res) => {
  const { name } = req.body;
  const total = db.ajouterBougie(name || 'Anonyme');
  res.json({ candles: total });
});

router.get('/photos', (req, res) => {
  res.json(db.getPhotos());
});

router.delete('/admin/photos/:id', basicAuth, (req, res) => {
  db.supprimerPhoto(req.params.id);
  res.json({ success: true });
});

router.get('/admin/stats', basicAuth, (req, res) => {
  res.json(db.getStats());
});

module.exports = router;
