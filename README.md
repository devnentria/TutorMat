# TutorMat

**Sistema de Evaluación Adaptativa de Trigonometría**  
Facultad de Ciencias Físico Matemáticas · BUAP

TutorMat es una plataforma educativa adaptativa para la evaluación de trigonometría en nivel bachillerato/universidad. Combina la **Teoría de Respuesta al Ítem (TRI 3PL)** con retroalimentación generativa basada en el **Ciclo de Modelización Matemática de Borromeo-Ferri (2006/2010)**.

---

## Características principales

- **Evaluación adaptativa (IRT 3PL)** — selección dinámica de preguntas según el nivel de habilidad estimado del estudiante
- **Retroalimentación con IA** — 7 fases del ciclo de Borromeo-Ferri con contexto real aleatorio (arquitectura, robótica, medicina, aeronáutica, etc.)
- **Ilustraciones SVG contextuales** — escenas del mundo real + diagrama matemático por cada pregunta
- **Text-to-Speech natural** — voz `shimmer` de OpenAI (tts-1-hd) con precarga de audio
- **Speech-to-Text** — respuesta por voz reconociendo opción A/B/C/D
- **Roles**: Administrador · Docente · Estudiante
- **Gestión de grupos y actividades** por docente
- **Modo oscuro** (solo estudiantes), tipografía Inter
- **Resultados y recomendaciones** por categoría de trigonometría

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Backend | Node.js + Express.js |
| Base de datos | SQLite (`node:sqlite` nativo) |
| IA | OpenAI API — `o3-mini` (retroalimentación), `tts-1-hd` (voz) |
| Autenticación | JWT |
| Subida de archivos | Multer |

---

## Estructura del proyecto

```
TutorMat/
├── backend/
│   ├── database/          # db.js, migraciones SQLite
│   ├── middleware/         # auth JWT
│   ├── routes/            # sessions, auth, groups, questions
│   ├── services/          # irt.js (TRI 3PL), openai.js (IA)
│   └── server.js
├── frontend/
│   ├── public/            # facu.png (logo FCFM-BUAP)
│   └── src/
│       ├── api.js
│       ├── App.jsx
│       ├── components/
│       │   ├── audio/     # AudioControls (TTS + STT)
│       │   ├── Evaluation/ # EvaluationApp, Results
│       │   ├── feedback/  # FeedbackIllustration, FeedbackSteps
│       │   ├── figures/   # TriangleFigure
│       │   ├── Student/   # StudentHome, StudentProfile
│       │   └── Teacher/   # Dashboard, GroupDetail
│       └── contexts/      # AuthContext, ThemeContext
└── data/
    ├── evalutrig.db       # Base de datos SQLite (no versionada)
    └── avatars/           # Fotos de perfil (no versionadas)
```

---

## Instalación y configuración

### Requisitos
- Node.js 22+ (para `node:sqlite` nativo)
- Cuenta OpenAI con API Key

### 1. Clonar el repositorio

```bash
git clone https://github.com/devnentria/TutorMat.git
cd TutorMat
git checkout dev
```

### 2. Configurar el backend

```bash
cd backend
npm install
```

Crear archivo `.env` en `backend/`:

```env
PORT=3001
JWT_SECRET=tu_secreto_jwt_aqui
OPENAI_API_KEY=sk-...
OPENAI_MODEL=o3-mini
NODE_ENV=development
```

### 3. Inicializar la base de datos e importar preguntas

```bash
npm run import-questions
```

### 4. Iniciar el backend

```bash
npm start
# Servidor en http://localhost:3001
```

### 5. Configurar el frontend

```bash
cd ../frontend
npm install
npm run dev
# App en http://localhost:5173
```

---

## Uso

### Credenciales por defecto

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `admin123` |

El administrador puede crear docentes y estudiantes desde el panel.

### Flujo del estudiante

1. Inicia sesión → redirige al lobby de actividades (`/student`)
2. Selecciona una actividad creada por su docente
3. Responde preguntas adaptativas (hasta ~20)
4. Recibe retroalimentación inmediata con:
   - Ilustración contextual (situación real + modelo matemático)
   - 7 fases del ciclo de Borromeo-Ferri con contexto real
5. Consulta resultados y recomendaciones al finalizar

### Flujo del docente

1. Crea grupos y agrega estudiantes
2. Crea actividades (nombre, descripción, fecha límite)
3. Monitorea progreso y nivel estimado por estudiante

---

## Fundamento teórico

### Teoría de Respuesta al Ítem (TRI 3PL)

La selección adaptativa de preguntas usa el **modelo logístico de 3 parámetros (3PL)**:

$$P(\theta) = c + \frac{1-c}{1 + e^{-a(\theta - b)}}$$

Donde:
- `θ` — habilidad estimada del estudiante
- `a` — discriminación del ítem
- `b` — dificultad del ítem  
- `c` — pseudo-azar (probabilidad de adivinar)

La habilidad se actualiza tras cada respuesta mediante **Máxima Verosimilitud** (Newton-Raphson).

### Ciclo de Modelización de Borromeo-Ferri (2006/2010)

La retroalimentación sigue las 6 fases + validación del ciclo cognitivo de Borromeo-Ferri:

| Fase | Transición | Descripción |
|---|---|---|
| 1. Situación real (RS) | → Comprensión | Contexto real donde aparece el concepto |
| 2. Modelo de situación (SM) | → Simplificación | Representación mental interna del problema |
| 3. Modelo real (RM) | → Matematización | Esquema simplificado con supuestos explícitos |
| 4. Modelo matemático (MM) | → Trabajo matemático | Fórmula trigonométrica formalizada |
| 5. Resultados matemáticos (MaR) | → Interpretación | Procedimiento numérico/algebraico |
| 6. Resultados reales (RR) | → Validación | Significado del resultado en el contexto real |
| 7. Validación | — | Plausibilidad y corrección del modelo |

> Borromeo-Ferri, R. (2006). Theoretical and empirical differentiations of phases in the modelling process. *ZDM – Mathematics Education*, 38(2), 86–95.  
> Borromeo-Ferri, R. (2010). On the influence of mathematical thinking styles on learners' modeling behavior. *Journal für Mathematik-Didaktik*, 31(1), 99–118.

---

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `PORT` | Puerto del servidor | `3001` |
| `JWT_SECRET` | Secreto para tokens JWT | — |
| `OPENAI_API_KEY` | API Key de OpenAI | — |
| `OPENAI_MODEL` | Modelo de IA | `o3-mini` |
| `NODE_ENV` | Entorno | `development` |

Para máxima calidad de retroalimentación: `OPENAI_MODEL=o3`

---

## Licencia

Proyecto académico — Doctorado en Ciencias de la Educación · BUAP  
© 2024 Geovani Daniel Nolasco
