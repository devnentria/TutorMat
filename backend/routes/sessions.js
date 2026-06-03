const express = require('express');
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');
const { selectNextQuestion, updateAbility, shouldStop, abilityToLevel, generateRecommendations } = require('../services/irt');
const { getHint, getFeedback, textToSpeech } = require('../services/openai');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// POST /api/sessions - Iniciar nueva sesión
router.post('/', (req, res) => {
  const { activity_id } = req.body;
  const result = db.prepare(
    'INSERT INTO sessions (user_id, current_ability, current_error, activity_id) VALUES (?, 0, 1, ?)'
  ).run(req.user.id, activity_id || null);
  res.status(201).json({ session_id: result.lastInsertRowid });
});

// GET /api/sessions/:id/next - Obtener siguiente pregunta
router.get('/:id/next', (req, res) => {
  const sessionId = parseInt(req.params.id);
  const session = db.prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ?').get(sessionId, req.user.id);

  if (!session) return res.status(404).json({ error: 'Sesión no encontrada' });
  if (session.status !== 'in_progress') return res.status(400).json({ error: 'La sesión ya terminó' });

  if (shouldStop(session.total_questions, session.current_error)) {
    return res.json({ finished: true });
  }

  // Obtener IDs ya respondidos en esta sesión
  const answeredRows = db.prepare('SELECT question_id FROM responses WHERE session_id = ?').all(sessionId);
  const answeredIds = answeredRows.map(r => r.question_id);

  // Obtener todas las preguntas disponibles
  const questions = db.prepare('SELECT * FROM questions').all();

  const next = selectNextQuestion(session.current_ability, questions, answeredIds);

  if (!next) {
    return res.json({ finished: true });
  }

  // No enviar la respuesta correcta al frontend
  const { correct_option, ...questionData } = next;
  res.json({
    question: questionData,
    progress: {
      answered: session.total_questions,
      ability: session.current_ability,
      error: session.current_error,
      finished: false
    }
  });
});

// POST /api/sessions/:id/answer - Enviar respuesta
router.post('/:id/answer', (req, res) => {
  const sessionId = parseInt(req.params.id);
  const { question_id, selected_option, response_time_ms } = req.body;

  if (!question_id || !selected_option) {
    return res.status(400).json({ error: 'question_id y selected_option son requeridos' });
  }

  const session = db.prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ?').get(sessionId, req.user.id);
  if (!session) return res.status(404).json({ error: 'Sesión no encontrada' });
  if (session.status !== 'in_progress') return res.status(400).json({ error: 'La sesión ya terminó' });

  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(question_id);
  if (!question) return res.status(404).json({ error: 'Pregunta no encontrada' });

  const isCorrect = selected_option.toUpperCase() === question.correct_option.toUpperCase();
  const { theta: newTheta, error: newError } = updateAbility(
    session.current_ability,
    session.current_error,
    isCorrect
  );

  // Guardar respuesta
  db.prepare(`
    INSERT INTO responses
      (session_id, question_id, selected_option, is_correct, response_time_ms,
       ability_before, ability_after, error_before, error_after)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    sessionId, question_id, selected_option.toUpperCase(),
    isCorrect ? 1 : 0, response_time_ms || null,
    session.current_ability, newTheta,
    session.current_error, newError
  );

  // Actualizar sesión
  db.prepare(`
    UPDATE sessions
    SET current_ability = ?, current_error = ?,
        total_questions = total_questions + 1,
        correct_answers = correct_answers + ?
    WHERE id = ?
  `).run(newTheta, newError, isCorrect ? 1 : 0, sessionId);

  const updatedSession = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
  const finished = shouldStop(updatedSession.total_questions, updatedSession.current_error);

  res.json({
    correct: isCorrect,
    correct_option: question.correct_option,
    ability: newTheta,
    error: newError,
    finished
  });
});

// POST /api/sessions/:id/complete - Finalizar sesión
router.post('/:id/complete', (req, res) => {
  const sessionId = parseInt(req.params.id);
  const session = db.prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ?').get(sessionId, req.user.id);

  if (!session) return res.status(404).json({ error: 'Sesión no encontrada' });

  db.prepare(`
    UPDATE sessions
    SET status = 'completed', end_time = CURRENT_TIMESTAMP,
        final_ability = current_ability, final_error = current_error
    WHERE id = ?
  `).run(sessionId);

  res.json({ success: true });
});

// GET /api/sessions/:id/results - Obtener resultados
router.get('/:id/results', (req, res) => {
  const sessionId = parseInt(req.params.id);
  const session = db.prepare(`
    SELECT s.*, u.name, u.username, u.grade
    FROM sessions s JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.user_id = ?
  `).get(sessionId, req.user.id);

  if (!session) return res.status(404).json({ error: 'Sesión no encontrada' });

  const responses = db.prepare(`
    SELECT r.*, q.category, q.text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option
    FROM responses r JOIN questions q ON r.question_id = q.id
    WHERE r.session_id = ?
    ORDER BY r.created_at
  `).all(sessionId);

  // Calcular estadísticas por categoría
  const categoryStats = {};
  let totalTime = 0;

  for (const r of responses) {
    if (!categoryStats[r.category]) {
      categoryStats[r.category] = { total: 0, correct: 0, avg_time: 0, total_time: 0 };
    }
    categoryStats[r.category].total++;
    if (r.is_correct) categoryStats[r.category].correct++;
    if (r.response_time_ms) {
      categoryStats[r.category].total_time += r.response_time_ms;
      totalTime += r.response_time_ms;
    }
  }
  for (const cat of Object.keys(categoryStats)) {
    const s = categoryStats[cat];
    s.avg_time = s.total > 0 ? Math.round(s.total_time / s.total) : 0;
    s.accuracy = s.total > 0 ? s.correct / s.total : 0;
  }

  const finalTheta = session.final_ability ?? session.current_ability;
  const { level, description } = abilityToLevel(finalTheta);
  const recommendations = generateRecommendations(finalTheta, categoryStats);

  res.json({
    session_id: session.id,
    student: { name: session.name, username: session.username, grade: session.grade },
    final_ability: finalTheta,
    final_error: session.final_error ?? session.current_error,
    ability_level: level,
    ability_description: description,
    total_questions: session.total_questions,
    correct_answers: session.correct_answers,
    accuracy: session.total_questions > 0 ? session.correct_answers / session.total_questions : 0,
    total_time_ms: totalTime,
    avg_time_ms: responses.length > 0 ? Math.round(totalTime / responses.length) : 0,
    category_stats: categoryStats,
    recommendations,
    responses: responses.map(r => ({
      question_id: r.question_id,
      category: r.category,
      selected: r.selected_option,
      correct: r.correct_option,
      is_correct: r.is_correct === 1,
      time_ms: r.response_time_ms,
    }))
  });
});

// GET /api/sessions - Historial de sesiones del estudiante
router.get('/', (req, res) => {
  const sessions = db.prepare(`
    SELECT id, start_time, end_time, total_questions, correct_answers,
           final_ability, final_error, status
    FROM sessions WHERE user_id = ?
    ORDER BY start_time DESC LIMIT 20
  `).all(req.user.id);
  res.json(sessions);
});

// POST /api/sessions/:id/feedback — Retroalimentación IA completa (5 fases)
router.post('/:id/feedback', async (req, res) => {
  const sessionId = parseInt(req.params.id);
  const { question_id, selected_option } = req.body;
  if (!question_id || !selected_option) {
    return res.status(400).json({ error: 'question_id y selected_option requeridos' });
  }

  const session = db.prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ?').get(sessionId, req.user.id);
  if (!session) return res.status(404).json({ error: 'Sesión no encontrada' });

  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(question_id);
  if (!question) return res.status(404).json({ error: 'Pregunta no encontrada' });

  const isCorrect = selected_option.toUpperCase() === question.correct_option.toUpperCase();

  // Verificar caché: si ya se generó feedback para esta pregunta en esta sesión, reutilizarlo
  const cached = db.prepare(`
    SELECT ai_feedback FROM responses
    WHERE session_id = ? AND question_id = ? AND ai_feedback IS NOT NULL
    ORDER BY created_at DESC LIMIT 1
  `).get(sessionId, question_id);

  if (cached?.ai_feedback) {
    return res.json({ feedback: cached.ai_feedback });
  }

  try {
    const feedback = await getFeedback({
      questionText: question.text,
      options: [question.option_a, question.option_b, question.option_c, question.option_d],
      selectedOption: selected_option.toUpperCase(),
      correctOption: question.correct_option,
      isCorrect,
    });

    // Guardar en la respuesta correspondiente (subquery para SQLite)
    db.prepare(`
      UPDATE responses SET ai_feedback = ?
      WHERE id = (
        SELECT id FROM responses
        WHERE session_id = ? AND question_id = ?
        ORDER BY created_at DESC LIMIT 1
      )
    `).run(feedback, sessionId, question_id);

    res.json({ feedback });
  } catch (err) {
    if (err.message.includes('OPENAI_API_KEY')) {
      return res.status(503).json({ error: 'IA no configurada. Agrega OPENAI_API_KEY al .env' });
    }
    console.error('OpenAI feedback error:', err.message);
    res.status(500).json({ error: 'No se pudo generar retroalimentación.' });
  }
});

// POST /api/sessions/tts — Text-to-Speech con voz IA natural
router.post('/tts', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text requerido' });

  try {
    const audioBuffer = await textToSpeech(text.slice(0, 1000)); // límite de seguridad
    res.set('Content-Type', 'audio/mpeg');
    res.set('Cache-Control', 'public, max-age=86400'); // caché 24h en browser
    res.send(audioBuffer);
  } catch (err) {
    if (err.message.includes('OPENAI_API_KEY')) {
      return res.status(503).json({ error: 'IA no configurada' });
    }
    console.error('TTS error:', err.message);
    res.status(500).json({ error: 'No se pudo generar audio' });
  }
});

// POST /api/sessions/hint - Pedir pista con IA
router.post('/hint', async (req, res) => {
  const { question_text, options } = req.body;
  if (!question_text) return res.status(400).json({ error: 'question_text requerido' });

  try {
    const hint = await getHint(question_text, options || []);
    res.json({ hint });
  } catch (err) {
    if (err.message.includes('OPENAI_API_KEY')) {
      return res.status(503).json({ error: 'El asistente de IA no está configurado. Agrega OPENAI_API_KEY al archivo .env' });
    }
    console.error('OpenAI error:', err.message);
    res.status(500).json({ error: 'No se pudo obtener la pista. Intenta más tarde.' });
  }
});

module.exports = router;
