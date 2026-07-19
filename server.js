require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const db = require('./db/connection');
const seed = require('./db/seed');
const errorHandler = require('./middleware/error');

const app = express();

// Segurança
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));

// Body parser
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (req, res) => {
  const users = db.prepare('SELECT COUNT(*) as n FROM users').get().n;
  res.json({ ok: true, users, time: new Date().toISOString() });
});

// API
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/clients',      require('./routes/clients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/measurements', require('./routes/measurements'));
app.use('/api/goals',        require('./routes/goals'));
app.use('/api/behaviors',    require('./routes/behaviors'));
app.use('/api/meal-plans',   require('./routes/meal-plans'));
app.use('/api/appointments', require('./routes/appointments'));

// Front-end estático
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// SPA fallback — qualquer rota não-API devolve index.html
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// 404 API
app.use('/api', (req, res) => res.status(404).json({ error: 'not_found', message: 'Rota não encontrada' }));

// Erro central
app.use(errorHandler);

const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, async () => {
  console.log(`[server] NutriFit Pro — http://localhost:${PORT}`);
  try { await seed.run(); } catch (e) { console.error('[seed]', e); }
});
