const ADMIN_USER = 'admin';
const ADMIN_PASS = 'yaya2026';

function basicAuth(req, res, next) {
  const auth = req.headers['authorization'];

  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).json({ error: 'Authentification requise' });
  }

  const base64 = auth.split(' ')[1];
  const decoded = Buffer.from(base64, 'base64').toString('utf-8');
  const [username, password] = decoded.split(':');

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
  return res.status(401).json({ error: 'Identifiants incorrects' });
}

module.exports = { basicAuth };
