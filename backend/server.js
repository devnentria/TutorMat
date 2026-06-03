require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const messageRoutes = require('./routes/messages');

// Inicializar base de datos (crea tablas y admin si no existen)
require('./database/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Servir avatars
const path = require('path');
app.use('/avatars', require('express').static(path.join(__dirname, '../data/avatars')));

// Middlewares
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173'
  ],
  credentials: true
}));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const db = require('./database/db');
  const qCount = db.prepare('SELECT COUNT(*) as n FROM questions').get().n;
  res.json({ status: 'ok', questions: qCount, timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor EvaluTrig corriendo en http://localhost:${PORT}`);
  console.log(`   Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DB:   ${process.env.DB_PATH || './data/evalutrig.db'}`);
  console.log(`   Importar preguntas: npm run import-questions\n`);
});
