const { admin } = require('./firebase');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ok:false,error:'Token Firebase diperlukan'});
    const token = header.slice(7).trim();
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch (err) {
    console.error('AUTH:', err.message);
    res.status(401).json({ok:false,error:'Token tidak valid atau sudah kedaluwarsa'});
  }
}

async function requireAdmin(req, res, next) {
  const configuredUid = String(process.env.ADMIN_UID || '').trim();
  const configuredEmail = String(process.env.ADMIN_EMAIL || 'admin@gmail.com').trim().toLowerCase();
  const uidOk = configuredUid && req.user?.uid === configuredUid;
  const emailOk = configuredEmail && String(req.user?.email || '').toLowerCase() === configuredEmail;
  if (!uidOk && !emailOk) return res.status(403).json({ok:false,error:'Akses admin ditolak'});
  next();
}

module.exports = { requireAuth, requireAdmin };
