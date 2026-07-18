const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = process.env.UPLOADS_PATH || path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
  destination: uploadsDir,
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

app.post('/api/photos/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier ou format non supporté' });
  const caption = req.body.caption || '';
  const id = db.ajouterPhoto(req.file.filename, caption);
  res.json({ success: true, id, filename: req.file.filename });
});

app.use('/api', apiRoutes);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Serveur demarre sur http://localhost:' + PORT);
  console.log('Admin: http://localhost:' + PORT + '/admin');
});
