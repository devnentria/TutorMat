const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Solo docentes y admins
function teacherOnly(req, res, next) {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso solo para docentes' });
  }
  next();
}
router.use(teacherOnly);

// ── Dashboard ─────────────────────────────────────────────────────────────────

// GET /api/teacher/dashboard — estadísticas del docente
router.get('/dashboard', (req, res) => {
  const tid = req.user.id;

  const totalStudents = db.prepare(`
    SELECT COUNT(*) as n FROM users u
    JOIN groups g ON u.group_id = g.id
    WHERE g.teacher_id = ? AND u.role = 'student'
  `).get(tid).n;

  const totalSessions = db.prepare(`
    SELECT COUNT(*) as n FROM sessions s
    JOIN users u ON s.user_id = u.id
    JOIN groups g ON u.group_id = g.id
    WHERE g.teacher_id = ?
  `).get(tid).n;

  const completedSessions = db.prepare(`
    SELECT COUNT(*) as n FROM sessions s
    JOIN users u ON s.user_id = u.id
    JOIN groups g ON u.group_id = g.id
    WHERE g.teacher_id = ? AND s.status = 'completed'
  `).get(tid).n;

  const avgAccuracy = db.prepare(`
    SELECT AVG(CAST(s.correct_answers AS REAL) / s.total_questions) as avg
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    JOIN groups g ON u.group_id = g.id
    WHERE g.teacher_id = ? AND s.total_questions > 0
  `).get(tid).avg;

  const abilityDist = db.prepare(`
    SELECT
      CASE
        WHEN final_ability < -1.5 THEN 'Básico'
        WHEN final_ability < 0    THEN 'En proceso'
        WHEN final_ability < 1.5  THEN 'Competente'
        ELSE 'Avanzado'
      END as level, COUNT(*) as count
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    JOIN groups g ON u.group_id = g.id
    WHERE g.teacher_id = ? AND s.status = 'completed' AND s.final_ability IS NOT NULL
    GROUP BY level
  `).all(tid);

  const sessionsByDay = db.prepare(`
    SELECT DATE(s.start_time) as date, COUNT(*) as count
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    JOIN groups g ON u.group_id = g.id
    WHERE g.teacher_id = ? AND s.start_time >= DATE('now', '-30 days')
    GROUP BY DATE(s.start_time)
    ORDER BY date
  `).all(tid);

  const categoryPerf = db.prepare(`
    SELECT q.category,
           COUNT(*) as total, SUM(r.is_correct) as correct
    FROM responses r
    JOIN questions q ON r.question_id = q.id
    JOIN sessions s ON r.session_id = s.id
    JOIN users u ON s.user_id = u.id
    JOIN groups g ON u.group_id = g.id
    WHERE g.teacher_id = ?
    GROUP BY q.category
    ORDER BY q.category
  `).all(tid);

  const groups = db.prepare(`
    SELECT g.*, COUNT(u.id) as student_count
    FROM groups g
    LEFT JOIN users u ON u.group_id = g.id AND u.role = 'student'
    WHERE g.teacher_id = ?
    GROUP BY g.id
    ORDER BY g.created_at DESC
  `).all(tid);

  res.json({
    totals: {
      students: totalStudents,
      sessions: totalSessions,
      completed_sessions: completedSessions,
      avg_accuracy: avgAccuracy ? Math.round(avgAccuracy * 100) : 0
    },
    ability_distribution: abilityDist,
    sessions_by_day: sessionsByDay,
    category_performance: categoryPerf,
    groups
  });
});

// ── Grupos ────────────────────────────────────────────────────────────────────

// GET /api/teacher/groups
router.get('/groups', (req, res) => {
  const groups = db.prepare(`
    SELECT g.*, COUNT(u.id) as student_count
    FROM groups g
    LEFT JOIN users u ON u.group_id = g.id AND u.role = 'student'
    WHERE g.teacher_id = ?
    GROUP BY g.id
    ORDER BY g.created_at DESC
  `).all(req.user.id);
  res.json(groups);
});

// POST /api/teacher/groups
router.post('/groups', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre del grupo requerido' });

  const result = db.prepare(
    'INSERT INTO groups (name, description, teacher_id) VALUES (?, ?, ?)'
  ).run(name, description || null, req.user.id);

  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(group);
});

// PUT /api/teacher/groups/:id
router.put('/groups/:id', (req, res) => {
  const { name, description } = req.body;
  const group = db.prepare('SELECT * FROM groups WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

  db.prepare('UPDATE groups SET name = ?, description = ? WHERE id = ?')
    .run(name || group.name, description ?? group.description, group.id);

  res.json(db.prepare('SELECT * FROM groups WHERE id = ?').get(group.id));
});

// DELETE /api/teacher/groups/:id
router.delete('/groups/:id', (req, res) => {
  const group = db.prepare('SELECT * FROM groups WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

  db.prepare('UPDATE users SET group_id = NULL WHERE group_id = ?').run(group.id);
  db.prepare('DELETE FROM groups WHERE id = ?').run(group.id);
  res.json({ success: true });
});

// ── Estudiantes dentro de grupo ───────────────────────────────────────────────

// GET /api/teacher/groups/:id/students
router.get('/groups/:id/students', (req, res) => {
  const group = db.prepare('SELECT * FROM groups WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

  const students = db.prepare(`
    SELECT u.id, u.username, u.name, u.grade, u.created_at,
           COUNT(s.id) as total_sessions,
           MAX(s.start_time) as last_session,
           AVG(CASE WHEN s.status='completed' THEN s.final_ability END) as avg_ability
    FROM users u
    LEFT JOIN sessions s ON u.id = s.user_id
    WHERE u.group_id = ? AND u.role = 'student'
    GROUP BY u.id
    ORDER BY u.name
  `).all(req.params.id);

  res.json({ group, students });
});

// POST /api/teacher/groups/:id/students — dar de alta estudiante
router.post('/groups/:id/students', (req, res) => {
  const group = db.prepare('SELECT * FROM groups WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

  const { name, username, password, country, state, school } = req.body;
  if (!name || !username) return res.status(400).json({ error: 'Nombre y matrícula son requeridos' });

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return res.status(409).json({ error: 'La matrícula ya está registrada' });

  const rawPassword = password || username; // por defecto: matrícula como contraseña inicial
  const hash = bcrypt.hashSync(rawPassword, 10);

  const result = db.prepare(
    "INSERT INTO users (username, password, role, name, grade, group_id, country, state, school) VALUES (?, ?, 'student', ?, ?, ?, ?, ?, ?)"
  ).run(username, hash, name, req.body.grade || null, group.id, country || 'México', state || '', school || '');

  res.status(201).json({
    id: result.lastInsertRowid,
    username,
    name,
    grade: req.body.grade || null,
    password: rawPassword, // se devuelve UNA sola vez para que el docente la anote
    group_id: group.id,
    message: 'Guarda la contraseña, no se podrá ver de nuevo'
  });
});

// PUT /api/teacher/students/:id/reset-password — resetear contraseña
router.put('/students/:id/reset-password', (req, res) => {
  const student = db.prepare(`
    SELECT u.* FROM users u
    JOIN groups g ON u.group_id = g.id
    WHERE u.id = ? AND g.teacher_id = ? AND u.role = 'student'
  `).get(req.params.id, req.user.id);
  if (!student) return res.status(404).json({ error: 'Estudiante no encontrado' });

  const newPassword = req.body.password || student.username;
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, student.id);

  res.json({ password: newPassword, message: 'Contraseña restablecida' });
});

// DELETE /api/teacher/students/:id — dar de baja estudiante
router.delete('/students/:id', (req, res) => {
  const student = db.prepare(`
    SELECT u.* FROM users u
    JOIN groups g ON u.group_id = g.id
    WHERE u.id = ? AND g.teacher_id = ? AND u.role = 'student'
  `).get(req.params.id, req.user.id);
  if (!student) return res.status(404).json({ error: 'Estudiante no encontrado' });

  db.prepare('UPDATE users SET group_id = NULL WHERE id = ?').run(student.id);
  res.json({ success: true });
});

// GET /api/teacher/groups/:id/stats — estadísticas del grupo
router.get('/groups/:id/stats', (req, res) => {
  const group = db.prepare('SELECT * FROM groups WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

  const students = db.prepare("SELECT COUNT(*) as n FROM users WHERE group_id = ? AND role='student'").get(req.params.id).n;
  const sessions = db.prepare(`
    SELECT COUNT(*) as n FROM sessions s
    JOIN users u ON s.user_id = u.id WHERE u.group_id = ?
  `).get(req.params.id).n;

  const abilityDist = db.prepare(`
    SELECT
      CASE
        WHEN final_ability < -1.5 THEN 'Básico'
        WHEN final_ability < 0    THEN 'En proceso'
        WHEN final_ability < 1.5  THEN 'Competente'
        ELSE 'Avanzado'
      END as level, COUNT(*) as count
    FROM sessions s JOIN users u ON s.user_id = u.id
    WHERE u.group_id = ? AND s.status = 'completed' AND s.final_ability IS NOT NULL
    GROUP BY level
  `).all(req.params.id);

  const categoryPerf = db.prepare(`
    SELECT q.category,
           COUNT(*) as total, SUM(r.is_correct) as correct
    FROM responses r
    JOIN questions q ON r.question_id = q.id
    JOIN sessions s ON r.session_id = s.id
    JOIN users u ON s.user_id = u.id
    WHERE u.group_id = ?
    GROUP BY q.category
  `).all(req.params.id);

  const topStudents = db.prepare(`
    SELECT u.name, u.username,
           AVG(s.final_ability) as avg_ability,
           COUNT(s.id) as sessions
    FROM users u LEFT JOIN sessions s ON u.id = s.user_id
    WHERE u.group_id = ? AND u.role='student' AND s.status='completed'
    GROUP BY u.id ORDER BY avg_ability DESC LIMIT 5
  `).all(req.params.id);

  res.json({ group, students, sessions, ability_distribution: abilityDist, category_performance: categoryPerf, top_students: topStudents });
});

// ── Actividades ───────────────────────────────────────────────────────────────

// GET /api/teacher/groups/:id/activities
router.get('/groups/:id/activities', (req, res) => {
  const group = db.prepare('SELECT * FROM groups WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });
  const acts = db.prepare('SELECT * FROM activities WHERE group_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json(acts);
});

// POST /api/teacher/groups/:id/activities
router.post('/groups/:id/activities', (req, res) => {
  const group = db.prepare('SELECT * FROM groups WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });
  const { name, description, due_date } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  const result = db.prepare(
    'INSERT INTO activities (name, description, group_id, teacher_id, due_date) VALUES (?, ?, ?, ?, ?)'
  ).run(name, description || null, group.id, req.user.id, due_date || null);
  res.status(201).json(db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid));
});

// PATCH /api/teacher/activities/:id/status
router.patch('/activities/:id/status', (req, res) => {
  const act = db.prepare('SELECT * FROM activities WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!act) return res.status(404).json({ error: 'Actividad no encontrada' });
  const { status } = req.body; // 'active' | 'closed'
  db.prepare('UPDATE activities SET status = ? WHERE id = ?').run(status, act.id);
  res.json({ success: true });
});

// DELETE /api/teacher/activities/:id
router.delete('/activities/:id', (req, res) => {
  const act = db.prepare('SELECT * FROM activities WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!act) return res.status(404).json({ error: 'Actividad no encontrada' });
  db.prepare('DELETE FROM activities WHERE id = ?').run(act.id);
  res.json({ success: true });
});

module.exports = router;
