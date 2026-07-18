const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer config pour upload photos
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    cb(null, extOk && mimeOk);
  }
});

// Rendre multer accessible aux routes
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// API routes
app.use('/api', apiRoutes);

// Upload route with multer directly
app.post('/api/photos/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier ou format non supporté' });
  }
  const db = require('./database/db');
  const caption = req.body.caption || '';
  const result = db.prepare(
    'INSERT INTO photos (filename, caption) VALUES (?, ?)'
  ).run(req.file.filename, caption);
  res.json({ success: true, id: result.lastInsertRowid, filename: req.file.filename });
});

// Fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin`);
});
