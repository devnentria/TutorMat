/**
 * Script para importar preguntas desde archivos TXT a SQLite
 * Uso: node scripts/importQuestions.js
 */
try { require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') }); } catch {}

const fs = require('fs');
const path = require('path');
const { DatabaseSync: Database } = require('node:sqlite');

const QUESTIONS_DIR = path.join(__dirname, '..', 'preguntastxt');
const DATA_DIR = path.join(__dirname, '..', 'backend', 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'evalutrig.db');
const db = new Database(DB_PATH);
db.exec('PRAGMA foreign_keys = ON');

// Crear tabla de preguntas si no existe
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL,
    category TEXT NOT NULL,
    topic_level INTEGER NOT NULL,
    difficulty_level INTEGER NOT NULL,
    difficulty REAL NOT NULL DEFAULT 0,
    discrimination REAL NOT NULL DEFAULT 1.0,
    guessing REAL NOT NULL DEFAULT 0.25,
    needs_image INTEGER DEFAULT 0,
    image_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Mapeo de número de categoría a nombre
const CATEGORY_MAP = {
  1: 'Ángulos',
  2: 'Funciones trigonométricas de ángulos',
  3: 'Suma y resta de funciones trigonométricas',
  4: 'Identidades Trigonométricas',
  5: 'Funciones trigonométricas de números reales',
  6: 'Gráficas Trigonométricas',
  7: 'Ecuaciones Trigonométricas',
};

// Parámetros IRT por nivel de dificultad (X en X.Y)
function getIRTParams(difficultyLevel) {
  const ranges = {
    1: [-3.0, -1.5],
    2: [-1.5, 0.0],
    3: [0.0, 1.5],
    4: [1.5, 3.0],
  };
  const [min, max] = ranges[difficultyLevel] || [0, 0];
  const difficulty = min + Math.random() * (max - min);
  const discrimination = 0.5 + Math.random() * 1.5; // 0.5 a 2.0
  const guessing = 0.25;
  return { difficulty, discrimination, guessing };
}

// Limpiar texto LaTeX con errores comunes
function cleanLatex(text) {
  let t = text;
  // Corregir llaves desbalanceadas en fracciones
  t = t.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}\}/g, '\\frac{$1}{$2}');
  t = t.replace(/\\frac\{([^{}]+)\}\{\}([^{}]+)\}/g, '\\frac{$1}{$2}');
  // Corregir ^\cir3 → ^\circ 3
  t = t.replace(/\^\\cir(\d)/g, '^\\circ$1');
  // Corregir $$ mal cerrados como $$-240$$^\circ$$
  t = t.replace(/\$\$([^$]+)\$\$(\^\{?\\circ\}?)/g, '$$$$1$2$$');
  // Quitar [Muestra] del texto visible
  t = t.replace(/\[Muestra\]/gi, '').trim();
  return t.trim();
}

// Detectar tipo de figura necesaria
function detectImageType(questionText, options) {
  const allText = [questionText, ...options].join(' ');

  // Triángulo con valores específicos
  if (allText.match(/\b17\b/) && allText.match(/\b15\b/) && allText.match(/\b8\b/)) {
    return 'triangle-8-15-17';
  }
  if (allText.match(/\b5\b/) && allText.match(/\b4\b/) && allText.match(/\b3\b/)) {
    return 'triangle-3-4-5';
  }
  if (allText.match(/\b13\b/) && allText.match(/\b12\b/) && allText.match(/\b5\b/)) {
    return 'triangle-5-12-13';
  }
  // Triángulo genérico (la mayoría de los casos)
  if (questionText.includes('[Muestra]') || allText.match(/triángulo|ángulo θ|angle θ/i)) {
    return 'triangle-generic';
  }
  return 'triangle-generic';
}

// Parsear un archivo de preguntas
function parseFile(content) {
  const questions = [];
  const lines = content.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line || line.startsWith('A)') || line.startsWith('B)') ||
        line.startsWith('C)') || line.startsWith('D)') || line.startsWith('ANSWER:')) {
      i++;
      continue;
    }

    // Línea de pregunta
    const questionRaw = line;
    const optA_lines = [], optB_lines = [], optC_lines = [], optD_lines = [];
    let answer = '';

    i++;
    while (i < lines.length) {
      const l = lines[i].trim();
      if (!l) { i++; continue; }

      if (l.startsWith('A)')) { optA_lines.push(l.slice(2).trim()); i++; }
      else if (l.startsWith('B)')) { optB_lines.push(l.slice(2).trim()); i++; }
      else if (l.startsWith('C)')) { optC_lines.push(l.slice(2).trim()); i++; }
      else if (l.startsWith('D)')) { optD_lines.push(l.slice(2).trim()); i++; }
      else if (l.startsWith('ANSWER:')) {
        answer = l.replace('ANSWER:', '').trim().toUpperCase();
        i++;
        break;
      } else {
        // Continuación de la pregunta o separador
        break;
      }
    }

    const optA = optA_lines.join(' ');
    const optB = optB_lines.join(' ');
    const optC = optC_lines.join(' ');
    const optD = optD_lines.join(' ');

    if (!optA || !optB || !optC || !optD || !answer) continue;
    if (!['A', 'B', 'C', 'D'].includes(answer)) continue;

    const needsImage = questionRaw.includes('[Muestra]') ? 1 : 0;
    const imageType = needsImage
      ? detectImageType(questionRaw, [optA, optB, optC, optD])
      : null;

    questions.push({
      text: cleanLatex(questionRaw),
      option_a: cleanLatex(optA),
      option_b: cleanLatex(optB),
      option_c: cleanLatex(optC),
      option_d: cleanLatex(optD),
      correct_option: answer,
      needs_image: needsImage,
      image_type: imageType,
    });
  }

  return questions;
}

// Importar todas las preguntas
function importAll() {
  const files = fs.readdirSync(QUESTIONS_DIR)
    .filter(f => f.endsWith('.txt'))
    .sort();

  let total = 0, inserted = 0, skipped = 0, errors = 0;

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO questions
      (text, option_a, option_b, option_c, option_d, correct_option,
       category, topic_level, difficulty_level, difficulty, discrimination, guessing,
       needs_image, image_type)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Importar preguntas en transacción manual
  function importMany(questions) {
    db.exec('BEGIN TRANSACTION');
    try {
      for (const q of questions) {
        const info = insertStmt.run(
          q.text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option,
          q.category, q.topic_level, q.difficulty_level,
          q.difficulty, q.discrimination, q.guessing,
          q.needs_image, q.image_type
        );
        if (info.changes > 0) inserted++;
        else skipped++;
      }
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }

  for (const filename of files) {
    // Parsear nombre: "1.2 Funciones.txt" → difficulty=1, category_id=2
    const match = filename.match(/^(\d+)\.(\d+)\s+(.+)\.txt$/);
    if (!match) {
      console.warn(`  ⚠ Archivo ignorado (nombre inesperado): ${filename}`);
      continue;
    }

    const difficultyLevel = parseInt(match[1]);
    const categoryId = parseInt(match[2]);
    const category = CATEGORY_MAP[categoryId] || match[3];

    const filepath = path.join(QUESTIONS_DIR, filename);
    const content = fs.readFileSync(filepath, 'utf-8');

    let questions;
    try {
      questions = parseFile(content);
    } catch (err) {
      console.error(`  ✗ Error parseando ${filename}:`, err.message);
      errors++;
      continue;
    }

    const { difficulty, discrimination, guessing } = getIRTParams(difficultyLevel);

    const enriched = questions.map(q => ({
      ...q,
      category,
      topic_level: categoryId,      // categoría 1-7
      difficulty_level: difficultyLevel, // dificultad 1-4
      difficulty: q.difficulty ?? difficulty,
      discrimination: q.discrimination ?? discrimination,
      guessing: q.guessing ?? guessing,
    }));

    total += enriched.length;

    try {
      importMany(enriched);
      console.log(`  ✓ ${filename}: ${enriched.length} preguntas`);
    } catch (err) {
      console.error(`  ✗ Error insertando ${filename}:`, err.message);
      errors++;
    }
  }

  const finalCount = db.prepare('SELECT COUNT(*) as n FROM questions').get().n;
  console.log(`\n========================================`);
  console.log(`  Total encontradas: ${total}`);
  console.log(`  Insertadas:        ${inserted}`);
  console.log(`  Ya existían:       ${skipped}`);
  console.log(`  Errores:           ${errors}`);
  console.log(`  En base de datos:  ${finalCount}`);
  console.log(`========================================\n`);
}

console.log('EvaluTrig - Importador de Preguntas');
console.log(`  Leyendo de: ${QUESTIONS_DIR}`);
console.log(`  Base de datos: ${DB_PATH}\n`);

importAll();
db.close();
