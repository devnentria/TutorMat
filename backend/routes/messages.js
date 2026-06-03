const express = require('express');
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Regla: solo admin puede enviar a cualquiera; usuarios solo pueden enviar a admin
function getAdminId() {
  const admin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  return admin?.id;
}

// GET /api/messages — bandeja de entrada + enviados
router.get('/', (req, res) => {
  const userId = req.user.id;
  const inbox = db.prepare(`
    SELECT m.*, u.name as from_name, u.username as from_username, u.role as from_role
    FROM messages m JOIN users u ON m.from_user_id = u.id
    WHERE m.to_user_id = ? ORDER BY m.created_at DESC LIMIT 50
  `).all(userId);

  const sent = db.prepare(`
    SELECT m.*, u.name as to_name, u.username as to_username, u.role as to_role
    FROM messages m JOIN users u ON m.to_user_id = u.id
    WHERE m.from_user_id = ? ORDER BY m.created_at DESC LIMIT 50
  `).all(userId);

  const unread = db.prepare(`SELECT COUNT(*) as count FROM messages WHERE to_user_id = ? AND read = 0`).get(userId);

  res.json({ inbox, sent, unread: unread.count });
});

// GET /api/messages/users — admin: lista de usuarios para enviar
router.get('/users', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Solo admin' });
  const users = db.prepare(`
    SELECT id, name, username, role FROM users WHERE id != ? ORDER BY role, name
  `).all(req.user.id);
  res.json(users);
});

// GET /api/messages/admin-id — obtener el id del admin (disponible para todos los usuarios autenticados)
router.get('/admin-id', (req, res) => {
  const adminId = getAdminId();
  if (!adminId) return res.status(404).json({ error: 'Admin no encontrado' });
  res.json({ admin_id: adminId });
});

// POST /api/messages — enviar mensaje
router.post('/', (req, res) => {
  const { subject, body } = req.body;
  let { to_user_id } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: 'El mensaje no puede estar vacío' });

  const adminId = getAdminId();

  // Para no-admin: resolver automáticamente al admin si no se especifica destinatario o se envía id=1
  if (req.user.role !== 'admin') {
    to_user_id = adminId;
  }

  // Validar: no-admin solo puede enviar al admin (doble verificación)
  if (req.user.role !== 'admin' && parseInt(to_user_id) !== adminId) {
    return res.status(403).json({ error: 'Solo puedes enviar mensajes al administrador' });
  }

  // Validar que el destinatario existe
  const recipient = db.prepare('SELECT id, name FROM users WHERE id = ?').get(to_user_id);
  if (!recipient) return res.status(404).json({ error: 'Destinatario no encontrado' });

  const result = db.prepare(
    'INSERT INTO messages (from_user_id, to_user_id, subject, body) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, to_user_id, subject || 'Sin asunto', body.trim());

  res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/messages/read-all — marcar todos como leídos (debe ir antes de /:id/read)
router.put('/read-all', (req, res) => {
  db.prepare('UPDATE messages SET read = 1 WHERE to_user_id = ?').run(req.user.id);
  res.json({ ok: true });
});

// PUT /api/messages/:id/read — marcar como leído
router.put('/:id/read', (req, res) => {
  db.prepare('UPDATE messages SET read = 1 WHERE id = ? AND to_user_id = ?')
    .run(parseInt(req.params.id), req.user.id);
  res.json({ ok: true });
});

module.exports = router;
