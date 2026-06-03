const express = require('express');
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/student/home — datos del lobby del estudiante
router.get('/home', (req, res) => {
  const user = db.prepare(`
    SELECT u.id, u.name, u.username, u.grade, u.group_id,
           g.name as group_name, g.description as group_desc,
           teacher.name as teacher_name
    FROM users u
    LEFT JOIN groups g ON u.group_id = g.id
    LEFT JOIN users teacher ON g.teacher_id = teacher.id
    WHERE u.id = ?
  `).get(req.user.id);

  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  // Actividades disponibles de su grupo
  const activities = user.group_id
    ? db.prepare(`
        SELECT a.*,
               (SELECT COUNT(*) FROM sessions s WHERE s.user_id = ? AND s.activity_id = a.id) as attempts,
               (SELECT id FROM sessions s WHERE s.user_id = ? AND s.activity_id = a.id AND s.status='completed' ORDER BY start_time DESC LIMIT 1) as completed_session_id
        FROM activities a
        WHERE a.group_id = ? AND a.status = 'active'
        ORDER BY a.created_at DESC
      `).all(req.user.id, req.user.id, user.group_id)
    : [];

  // Sesiones recientes del estudiante
  const recentSessions = db.prepare(`
    SELECT s.id, s.start_time, s.status, s.total_questions, s.correct_answers,
           s.final_ability, s.activity_id, a.name as activity_name
    FROM sessions s
    LEFT JOIN activities a ON s.activity_id = a.id
    WHERE s.user_id = ?
    ORDER BY s.start_time DESC LIMIT 5
  `).all(req.user.id);

  res.json({ user, activities, recent_sessions: recentSessions });
});

module.exports = router;
