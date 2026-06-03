const express = require('express');
const db = require('../database/db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware, adminOnly);

// GET /api/admin/dashboard - Estadísticas generales
router.get('/dashboard', (req, res) => {
  const totalStudents = db.prepare("SELECT COUNT(*) as n FROM users WHERE role = 'student'").get().n;
  const totalSessions = db.prepare("SELECT COUNT(*) as n FROM sessions").get().n;
  const completedSessions = db.prepare("SELECT COUNT(*) as n FROM sessions WHERE status = 'completed'").get().n;
  const totalResponses = db.prepare('SELECT COUNT(*) as n FROM responses').get().n;
  const totalQuestions = db.prepare('SELECT COUNT(*) as n FROM questions').get().n;
  const avgAccuracy = db.prepare(`
    SELECT AVG(CAST(correct_answers AS REAL) / total_questions) as avg
    FROM sessions WHERE total_questions > 0
  `).get().avg;

  // Distribución de habilidad final
  const abilityDist = db.prepare(`
    SELECT
      CASE
        WHEN final_ability < -1.5 THEN 'Básico'
        WHEN final_ability < 0    THEN 'En proceso'
        WHEN final_ability < 1.5  THEN 'Competente'
        ELSE 'Avanzado'
      END as level,
      COUNT(*) as count
    FROM sessions
    WHERE status = 'completed' AND final_ability IS NOT NULL
    GROUP BY level
  `).all();

  // Sesiones por día (últimos 30 días)
  const sessionsByDay = db.prepare(`
    SELECT DATE(start_time) as date, COUNT(*) as count
    FROM sessions
    WHERE start_time >= DATE('now', '-30 days')
    GROUP BY DATE(start_time)
    ORDER BY date
  `).all();

  // Rendimiento por categoría
  const categoryPerf = db.prepare(`
    SELECT q.category,
           COUNT(*) as total,
           SUM(r.is_correct) as correct,
           ROUND(AVG(r.response_time_ms)/1000.0, 1) as avg_time_sec
    FROM responses r JOIN questions q ON r.question_id = q.id
    GROUP BY q.category
    ORDER BY q.category
  `).all();

  // Últimas 10 sesiones
  const recentSessions = db.prepare(`
    SELECT s.id, s.start_time, s.end_time, s.total_questions, s.correct_answers,
           s.final_ability, s.status, u.name, u.username, u.grade
    FROM sessions s JOIN users u ON s.user_id = u.id
    ORDER BY s.start_time DESC LIMIT 10
  `).all();

  res.json({
    totals: {
      students: totalStudents,
      sessions: totalSessions,
      completed_sessions: completedSessions,
      responses: totalResponses,
      questions: totalQuestions,
      avg_accuracy: avgAccuracy ? Math.round(avgAccuracy * 100) : 0
    },
    ability_distribution: abilityDist,
    sessions_by_day: sessionsByDay,
    category_performance: categoryPerf,
    recent_sessions: recentSessions
  });
});

// GET /api/admin/students - Lista de estudiantes
router.get('/students', (req, res) => {
  const students = db.prepare(`
    SELECT u.id, u.username, u.name, u.grade, u.created_at,
           COUNT(s.id) as total_sessions,
           MAX(s.start_time) as last_session,
           AVG(CASE WHEN s.status='completed' THEN s.final_ability END) as avg_ability
    FROM users u
    LEFT JOIN sessions s ON u.id = s.user_id
    WHERE u.role = 'student'
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `).all();
  res.json(students);
});

// GET /api/admin/students/:id - Detalle de un estudiante
router.get('/students/:id', (req, res) => {
  const student = db.prepare(
    "SELECT id, username, name, grade, created_at FROM users WHERE id = ? AND role = 'student'"
  ).get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Estudiante no encontrado' });

  const sessions = db.prepare(`
    SELECT id, start_time, end_time, total_questions, correct_answers,
           final_ability, final_error, status
    FROM sessions WHERE user_id = ?
    ORDER BY start_time DESC
  `).all(req.params.id);

  const categoryStats = db.prepare(`
    SELECT q.category,
           COUNT(*) as total,
           SUM(r.is_correct) as correct
    FROM responses r
    JOIN questions q ON r.question_id = q.id
    JOIN sessions s ON r.session_id = s.id
    WHERE s.user_id = ?
    GROUP BY q.category
  `).all(req.params.id);

  res.json({ student, sessions, category_stats: categoryStats });
});

// GET /api/admin/sessions - Lista de sesiones
router.get('/sessions', (req, res) => {
  const sessions = db.prepare(`
    SELECT s.id, s.start_time, s.end_time, s.total_questions, s.correct_answers,
           s.final_ability, s.final_error, s.status,
           u.name, u.username, u.grade
    FROM sessions s JOIN users u ON s.user_id = u.id
    ORDER BY s.start_time DESC LIMIT 100
  `).all();
  res.json(sessions);
});

// GET /api/admin/teachers - Lista de docentes
router.get('/teachers', (req, res) => {
  const teachers = db.prepare(`
    SELECT u.id, u.username, u.name, u.country, u.state, u.school, u.created_at,
           COUNT(DISTINCT g.id) as group_count,
           COUNT(DISTINCT st.id) as student_count
    FROM users u
    LEFT JOIN groups g ON g.teacher_id = u.id
    LEFT JOIN users st ON st.group_id = g.id AND st.role = 'student'
    WHERE u.role = 'teacher'
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `).all();
  res.json(teachers);
});

// DELETE /api/admin/teachers/:id - Dar de baja a un docente
router.delete('/teachers/:id', (req, res) => {
  const teacher = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'teacher'").get(req.params.id);
  if (!teacher) return res.status(404).json({ error: 'Docente no encontrado' });

  const groups = db.prepare('SELECT id FROM groups WHERE teacher_id = ?').all(req.params.id);
  for (const g of groups) {
    db.prepare('UPDATE users SET group_id = NULL WHERE group_id = ?').run(g.id);
    db.prepare('DELETE FROM activities WHERE group_id = ?').run(g.id);
  }
  db.prepare('DELETE FROM groups WHERE teacher_id = ?').run(req.params.id);
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);

  res.json({ success: true });
});

// GET /api/admin/questions - Estadísticas de preguntas
router.get('/questions', (req, res) => {
  const stats = db.prepare(`
    SELECT q.id, q.text, q.category, q.difficulty_level, q.difficulty,
           COUNT(r.id) as times_used,
           SUM(r.is_correct) as times_correct,
           ROUND(AVG(r.response_time_ms)/1000.0, 1) as avg_time_sec
    FROM questions q
    LEFT JOIN responses r ON q.id = r.question_id
    GROUP BY q.id
    ORDER BY times_used DESC
    LIMIT 50
  `).all();
  res.json(stats);
});

module.exports = router;
