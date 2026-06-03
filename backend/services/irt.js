/**
 * Servicio de Teoría de Respuesta al Ítem (TRI / IRT)
 * Modelo de 3 parámetros (3PL)
 */

/**
 * Probabilidad de respuesta correcta según el modelo 3PL
 * P(θ) = c + (1-c) / (1 + exp(-a*(θ-b)))
 */
function probability(theta, a, b, c) {
  return c + (1 - c) / (1 + Math.exp(-a * (theta - b)));
}

/**
 * Información del ítem en el punto θ
 * I(θ) = a² * (P-c)² / ((1-c)² * P * (1-P))
 */
function itemInformation(theta, a, b, c) {
  const p = probability(theta, a, b, c);
  if (p <= 0 || p >= 1) return 0;
  return (a * a * Math.pow(p - c, 2)) / (Math.pow(1 - c, 2) * p * (1 - p));
}

/**
 * Seleccionar la siguiente pregunta usando Maximum Information
 * @param {number} theta - Habilidad actual del estudiante
 * @param {Array} questions - Preguntas disponibles (con difficulty, discrimination, guessing, id)
 * @param {Array} answeredIds - IDs ya respondidos
 * @returns {object|null} - Siguiente pregunta
 */
function selectNextQuestion(theta, questions, answeredIds) {
  const available = questions.filter(q => !answeredIds.includes(q.id));
  if (available.length === 0) return null;

  let best = null;
  let bestInfo = -Infinity;

  for (const q of available) {
    const info = itemInformation(theta, q.discrimination, q.difficulty, q.guessing);
    if (info > bestInfo) {
      bestInfo = info;
      best = q;
    }
  }

  return best;
}

/**
 * Actualizar estimación de habilidad después de una respuesta
 * Usa una aproximación simple EAP (Expected A Posteriori)
 * Para mayor precisión se puede implementar MLE completo
 */
function updateAbility(theta, standardError, isCorrect) {
  const adjustment = standardError * 0.5;
  const newTheta = isCorrect ? theta + adjustment : theta - adjustment;
  const newError = standardError * 0.9;
  return { theta: newTheta, error: newError };
}

/**
 * Verificar si el test debe terminar
 */
function shouldStop(answeredCount, standardError, maxQuestions = 20, minError = 0.3) {
  return answeredCount >= maxQuestions || standardError < minError;
}

/**
 * Convertir habilidad θ a nivel descriptivo
 */
function abilityToLevel(theta) {
  if (theta < -1.5) return { level: 'Básico', description: 'Conceptos fundamentales en desarrollo' };
  if (theta < 0) return { level: 'En proceso', description: 'Comprensión parcial de los temas' };
  if (theta < 1.5) return { level: 'Competente', description: 'Buen manejo de los conceptos principales' };
  return { level: 'Avanzado', description: 'Dominio sólido de la trigonometría' };
}

/**
 * Generar recomendaciones basadas en habilidad y categorías débiles
 */
function generateRecommendations(finalTheta, categoryStats) {
  const recs = [];

  if (finalTheta < -1.5) {
    recs.push('Revisar los conceptos básicos de medición de ángulos y círculo unitario.');
    recs.push('Practicar la conversión entre grados y radianes.');
    recs.push('Estudiar las definiciones básicas de las funciones trigonométricas.');
  } else if (finalTheta < 0) {
    recs.push('Practicar la aplicación de identidades trigonométricas básicas.');
    recs.push('Repasar la suma y resta de funciones trigonométricas.');
    recs.push('Reforzar la comprensión de las gráficas de seno y coseno.');
  } else if (finalTheta < 1.5) {
    recs.push('Profundizar en identidades trigonométricas compuestas.');
    recs.push('Practicar la resolución de ecuaciones trigonométricas.');
    recs.push('Analizar el comportamiento de las funciones de números reales.');
  } else {
    recs.push('Explorar aplicaciones avanzadas de trigonometría.');
    recs.push('Resolver problemas complejos que combinen múltiples conceptos.');
    recs.push('Estudiar la relación entre trigonometría y otras áreas matemáticas.');
  }

  // Añadir recomendaciones específicas por categoría débil
  if (categoryStats) {
    const weakCategories = Object.entries(categoryStats)
      .filter(([, s]) => s.total > 0 && s.correct / s.total < 0.5)
      .map(([cat]) => cat);

    for (const cat of weakCategories.slice(0, 2)) {
      recs.push(`Reforzar el estudio de: ${cat}.`);
    }
  }

  return recs;
}

module.exports = {
  probability,
  itemInformation,
  selectNextQuestion,
  updateAbility,
  shouldStop,
  abilityToLevel,
  generateRecommendations,
};
