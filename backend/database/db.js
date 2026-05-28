const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(DATA_DIR, 'evalutrig.db');

const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    name TEXT,
    grade TEXT,
    group_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id)
  );

  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    teacher_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
  );

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

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    current_ability REAL DEFAULT 0,
    current_error REAL DEFAULT 1,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    status TEXT DEFAULT 'in_progress',
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    final_ability REAL,
    final_error REAL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    group_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    due_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    selected_option TEXT NOT NULL,
    is_correct INTEGER NOT NULL,
    response_time_ms INTEGER,
    ability_before REAL,
    ability_after REAL,
    error_before REAL,
    error_after REAL,
    ai_feedback TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
  );
`);

// Migración: agregar activity_id a sessions si no existe
try { db.exec('ALTER TABLE sessions ADD COLUMN activity_id INTEGER REFERENCES activities(id)'); } catch {}

// Migración: agregar group_id a users si no existe
try {
  db.exec('ALTER TABLE users ADD COLUMN group_id INTEGER REFERENCES groups(id)');
} catch {}

// Migración: agregar ai_feedback a responses si no existe
try {
  db.exec('ALTER TABLE responses ADD COLUMN ai_feedback TEXT');
} catch {}

// Migración: agregar avatar a users si no existe
try {
  db.exec('ALTER TABLE users ADD COLUMN avatar TEXT');
} catch {}

// Crear admin por defecto si no existe
const adminExists = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
if (!adminExists) {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(
    "INSERT OR IGNORE INTO users (username, password, role, name) VALUES (?, ?, 'admin', 'Administrador')"
  ).run(username, hash);
  console.log(`[DB] Admin creado: ${username}`);
}

module.exports = db;
