const fs = require('fs');
const path = require('path');

const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, 'data.json');

function readData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function ajouterVisiteur(ip) {
  const data = readData();
  data.visitors.push({ id: data._nextId.visitors++, ip, visit_date: new Date().toISOString() });
  writeData(data);
  return data.visitors.length;
}

function compterVisiteurs() {
  return readData().visitors.length;
}

function getMessages(approuvesSeulement) {
  const data = readData();
  let msgs = data.messages;
  if (approuvesSeulement) msgs = msgs.filter(m => m.approved);
  return msgs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function ajouterMessage(name, content) {
  const data = readData();
  const msg = { id: data._nextId.messages++, name, content, approved: 0, created_at: new Date().toISOString() };
  data.messages.push(msg);
  writeData(data);
  return msg.id;
}

function approuverMessage(id) {
  const data = readData();
  const msg = data.messages.find(m => m.id === Number(id));
  if (msg) msg.approved = 1;
  writeData(data);
}

function supprimerMessage(id) {
  const data = readData();
  data.messages = data.messages.filter(m => m.id !== Number(id));
  writeData(data);
}

function compterBougies() {
  return readData().candles.length;
}

function ajouterBougie(name) {
  const data = readData();
  data.candles.push({ id: data._nextId.candles++, lit_by: name, created_at: new Date().toISOString() });
  writeData(data);
  return data.candles.length;
}

function getPhotos() {
  return readData().photos.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
}

function ajouterPhoto(filename, caption) {
  const data = readData();
  const photo = { id: data._nextId.photos++, filename, caption, uploaded_at: new Date().toISOString() };
  data.photos.push(photo);
  writeData(data);
  return photo.id;
}

function supprimerPhoto(id) {
  const data = readData();
  const idx = data.photos.findIndex(p => p.id === Number(id));
  if (idx !== -1) {
    const photo = data.photos[idx];
    const filePath = path.join(__dirname, '..', 'uploads', photo.filename);
    try { fs.unlinkSync(filePath); } catch (e) {}
    data.photos.splice(idx, 1);
    writeData(data);
  }
}

function getPrieres() {
  return readData().prieres.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function ajouterPriere(name, message) {
  const data = readData();
  const priere = { id: data._nextId.prieres++, name, message, created_at: new Date().toISOString() };
  data.prieres.push(priere);
  writeData(data);
  return data.prieres.length;
}

function compterPrieres() {
  return readData().prieres.length;
}

function getLivreChapitres() {
  return readData().livre.chapitres.sort((a, b) => a.ordre - b.ordre);
}

function getLivre() {
  return readData().livre;
}

function getStats() {
  const data = readData();
  return {
    visitors: data.visitors.length,
    messages: data.messages.length,
    pendingMessages: data.messages.filter(m => !m.approved).length,
    candles: data.candles.length,
    photos: data.photos.length,
    prieres: data.prieres.length
  };
}

function verifierAdmin(username, password) {
  const data = readData();
  return data.admins.some(a => a.username === username && a.password === password);
}

module.exports = {
  ajouterVisiteur,
  compterVisiteurs,
  getMessages,
  ajouterMessage,
  approuverMessage,
  supprimerMessage,
  compterBougies,
  ajouterBougie,
  getPhotos,
  ajouterPhoto,
  supprimerPhoto,
  getPrieres,
  ajouterPriere,
  compterPrieres,
  getLivreChapitres,
  getLivre,
  getStats,
  verifierAdmin
};
