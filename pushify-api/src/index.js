// ============================================
// pushify-api/src/index.js
// API Principal para recibir y gestionar notificaciones
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const notificationsRouter = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 8080;

// ============================================
// MIDDLEWARES
// ============================================

// Permitir CORS para desarrollo local
app.use(cors());

// Parser de JSON
app.use(express.json());

// Logger básico para debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check para Cloud Run
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pushify-api' });
});

// Rutas de notificaciones
app.use('/notifications', notificationsRouter);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`✅ Pushify API running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
