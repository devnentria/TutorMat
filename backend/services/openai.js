const OpenAI = require('openai');

let client = null;

function getClient() {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY no está configurado en el archivo .env');
    }
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

// Modelo configurable por .env. o3-mini es el más adecuado: razonamiento potente y rápido.
// Para máxima calidad cambia OPENAI_MODEL=o3 en .env
const MODEL = process.env.OPENAI_MODEL || 'o3-mini';

// Los modelos o3 no aceptan parámetro temperature
const isReasoningModel = (m) => m.startsWith('o1') || m.startsWith('o3');

function buildParams(messages, maxTokens = 400) {
  const base = { model: MODEL, messages };
  if (isReasoningModel(MODEL)) {
    return { ...base, max_completion_tokens: maxTokens };
  }
  return { ...base, max_tokens: maxTokens, temperature: 0.7 };
}

/**
 * Retroalimentación completa después de una respuesta
 * Sigue el ciclo de modelización matemática de Borromeo-Ferri (2010)
 */
const REAL_CONTEXTS = [
  { ctx: 'arquitectura: un arquitecto diseña un techo inclinado y necesita calcular el ángulo de pendiente', scene: 'building' },
  { ctx: 'ingeniería civil: un ingeniero calcula la inclinación de una rampa de acceso para vehículos', scene: 'ramp' },
  { ctx: 'astronomía: un astrónomo mide el ángulo de elevación de una estrella sobre el horizonte', scene: 'mountain' },
  { ctx: 'medicina: un técnico en ultrasonido ajusta el ángulo de incidencia del transductor sobre el cuerpo del paciente', scene: 'default' },
  { ctx: 'animación 3D: un animador programa la rotación de una cámara alrededor de un personaje usando ángulos trigonométricos', scene: 'unit_circle' },
  { ctx: 'robótica: un ingeniero calcula el ángulo de articulación de un brazo mecánico para alcanzar un punto exacto', scene: 'ladder' },
  { ctx: 'música y acústica: un ingeniero de sonido modela la propagación de una onda sonora en una sala de conciertos', scene: 'wave' },
  { ctx: 'geología: un geólogo mide el ángulo de inclinación de estratos rocosos en una ladera para evaluar riesgo de deslizamiento', scene: 'mountain' },
  { ctx: 'topografía: un topógrafo usa un teodolito para medir la distancia a un punto lejano mediante triangulación', scene: 'tree_shadow' },
  { ctx: 'ingeniería de puentes: un ingeniero calcula el ángulo de los cables de un puente colgante para distribuir la carga', scene: 'bridge' },
  { ctx: 'física solar: un técnico calcula el ángulo óptimo de inclinación de paneles solares según la latitud', scene: 'ramp' },
  { ctx: 'aeronáutica: un piloto calcula el ángulo de ascenso de la aeronave al despegar de la pista', scene: 'building' },
  { ctx: 'navegación marítima: un marinero usa el ángulo de elevación de un faro para determinar la distancia a la costa', scene: 'navigation' },
  { ctx: 'escalada: un guía de montaña calcula el ángulo de inclinación de una pared rocosa antes de escalarla', scene: 'ladder' },
];

async function getFeedback({ questionText, options, selectedOption, correctOption, isCorrect }) {
  const openai = getClient();

  const optLabels = ['A', 'B', 'C', 'D'];
  const optText = options.map((o, i) => `${optLabels[i]}) ${o}`).join('\n');
  const selectedText = options[optLabels.indexOf(selectedOption)] || selectedOption;
  const correctText = options[optLabels.indexOf(correctOption)] || correctOption;

  // Detectar tipo de problema para forzar escena correcta
  const qLower = questionText.toLowerCase();
  let sceneOverride = null;
  if (/c[ií]rculo unitario|circunferencia unitaria|ángulo en posición estándar|posici[oó]n est[aá]ndar/.test(qLower)) {
    sceneOverride = 'unit_circle';
  } else if (/funci[oó]n sinusoidal|funci[oó]n coseno|onda|periodo|amplitud|frecuencia/.test(qLower)) {
    sceneOverride = 'wave';
  } else if (/puente|cable|estructura/.test(qLower)) {
    sceneOverride = 'bridge';
  } else if (/escalera|pared/.test(qLower)) {
    sceneOverride = 'ladder';
  } else if (/rampa|pendiente|plano inclinado/.test(qLower)) {
    sceneOverride = 'ramp';
  } else if (/edificio|torre|altura.*edificio/.test(qLower)) {
    sceneOverride = 'building';
  } else if (/monta[ñn]a|cerro|elevaci[oó]n|depresi[oó]n/.test(qLower)) {
    sceneOverride = 'mountain';
  } else if (/árbol|sombra|poste/.test(qLower)) {
    sceneOverride = 'tree_shadow';
  } else if (/barco|nav[eo]|faro|br[uú]jula/.test(qLower)) {
    sceneOverride = 'navigation';
  }

  // Contexto aleatorio para evitar que el modelo siempre elija el mismo
  const { ctx: randomCtx, scene: forcedSceneRandom } = REAL_CONTEXTS[Math.floor(Math.random() * REAL_CONTEXTS.length)];
  const forcedScene = sceneOverride || forcedSceneRandom;

  const situacion = isCorrect
    ? `El estudiante respondió correctamente (opción ${selectedOption}).`
    : `El estudiante eligió la opción ${selectedOption} ("${selectedText}"), pero la correcta es ${correctOption} ("${correctText}").`;

  const prompt = `Eres TutorMat, tutor adaptativo de trigonometría de la BUAP, basado en el ciclo de modelización matemática de Borromeo-Ferri (2006/2010).

SITUACIÓN DEL ESTUDIANTE: ${situacion}

PREGUNTA:
${questionText}

OPCIONES:
${optText}

---
CONTEXTO REAL OBLIGATORIO: ${randomCtx}
USA "scene": "${forcedScene}" en el JSON.
---

INSTRUCCIÓN: Responde ÚNICAMENTE con este JSON (sin texto fuera):
{"scene":"${forcedScene}","feedback":"<texto completo>"}

En el campo "feedback" genera una retroalimentación siguiendo EXACTAMENTE las 6 fases + validación del CICLO DE BORROMEO-FERRI. Este ciclo tiene tres principios clave que debes respetar:
1. El proceso va de la REALIDAD → abstracción matemática → de vuelta a la REALIDAD.
2. Cada fase involucra una transición cognitiva específica del estudiante.
3. Los errores de MODELIZACIÓN (fases 1-3) son cualitativamente distintos a los errores MATEMÁTICOS (fase 4).

**Paso 1 — Situación real (RS):**
Describe vívidamente la situación concreta del mundo real en el contexto de "${randomCtx}". El estudiante debe sentir que enfrenta un problema real con consecuencias prácticas, no un ejercicio abstracto. Usa detalles sensoriales y profesionales.

**Paso 2 — Modelo de situación (SM):**
Guía la construcción de la representación mental interna: ¿qué imagen geométrica emerge al leer el problema? ¿qué datos están dados y cuáles son implícitos? ¿qué conocimiento previo (físico, geográfico, técnico) se activa? Ayuda al estudiante a "ver" el problema antes de formalizarlo.

**Paso 3 — Modelo real (RM):**
Explicita los supuestos de simplificación: ¿qué se asume ideal o constante? ¿qué variables se descartan? Identifica la figura geométrica (triángulo rectángulo, círculo unitario, etc.), etiqueta sus partes con los datos del problema y establece qué incógnita se busca.

**Paso 4 — Modelo matemático (MM):**
Traduce el modelo real al lenguaje formal: escribe la razón o función trigonométrica exacta que relaciona los elementos identificados. Justifica por qué esa función (sen, cos, tan, etc.) es la apropiada para este modelo y no otra. Si aplica, escribe la ecuación explícita.

**Paso 5 — Trabajo matemático (MaR):**
Ejecuta el procedimiento algebraico/numérico paso a paso con los valores del problema. Muestra la sustitución, simplificación y resultado. Señala si hay algún paso que el estudiante podría confundir con variantes incorrectas.

**Paso 6 — Interpretación (RR):**
Devuelve el resultado matemático al contexto real: ¿qué significa ese valor o razón en la situación de "${randomCtx}"? ¿Qué decisión o acción permite tomar ese resultado a un profesional real?

**Paso 7 — Validación:**
${isCorrect
  ? `El estudiante respondió correctamente. Refuerza por qué la opción ${correctOption} es matemáticamente correcta. Luego regresa OBLIGATORIAMENTE al contexto real de "${randomCtx}": ¿qué significa este resultado para el profesional en esa situación? ¿Es plausible ese valor en la práctica? ¿Qué consecuencia real tendría si el resultado fuera diferente?`
  : `Identifica en QUÉ FASE del ciclo ocurrió el error al elegir ${selectedOption}: ¿fue un error de comprensión (fase 1-2), de modelización (fase 3), de selección de fórmula (fase 4) o de cálculo (fase 5)? Explica el error conceptual con precisión. Confirma por qué ${correctOption} es correcta. Luego regresa OBLIGATORIAMENTE al contexto real de "${randomCtx}": ¿qué consecuencia real tendría haber cometido ese error en esa situación profesional? ¿El resultado correcto es plausible y tiene sentido en la práctica?`}

TONO: motivador, profesional pero cercano. Como un tutor que acompaña, no que juzga. Español mexicano. Usa negritas (**texto**) para términos clave y fórmulas.`;


  const response = await openai.chat.completions.create(
    buildParams([{ role: 'user', content: prompt }], 4000)
  );

  const raw = response.choices[0].message.content.trim();

  // Intentar parsear JSON; si falla, devolver texto plano con escena default
  try {
    const parsed = JSON.parse(raw);
    return JSON.stringify({ scene: parsed.scene || 'default', feedback: parsed.feedback || raw });
  } catch {
    return JSON.stringify({ scene: 'default', feedback: raw });
  }
}

/**
 * Pista sin revelar la respuesta
 */
async function getHint(questionText, options) {
  const openai = getClient();

  const optText = options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join('\n');

  const prompt = `Eres TutorMat, un tutor de trigonometría. Un estudiante necesita una pista para esta pregunta:

${questionText}

Opciones:
${optText}

Proporciona UNA pista útil que lo oriente hacia la respuesta correcta SIN revelarla directamente.
Menciona el concepto o fórmula clave. Máximo 3 oraciones. En español.`;

  const response = await openai.chat.completions.create(
    buildParams([{ role: 'user', content: prompt }], 200)
  );

  return response.choices[0].message.content.trim();
}

/**
 * Text-to-Speech con voz natural de OpenAI
 * Voz: nova (natural, femenina, clara para educación)
 */
async function textToSpeech(text) {
  const openai = getClient();
  // tts-1-hd + shimmer suena más natural en español latinoamericano
  // El prefijo en el texto ayuda al modelo a calibrar el acento
  const response = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice: 'shimmer',
    input: text,
    response_format: 'mp3',
    speed: 0.92,           // ligeramente más lento para mayor claridad
  });
  return Buffer.from(await response.arrayBuffer());
}

module.exports = { getFeedback, getHint, textToSpeech };
