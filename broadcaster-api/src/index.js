// Load environment variables
require('dotenv').config();
const mongoService = require('./services/mongodb');
// ============================================
// SSE Broadcaster - Mantiene conexiones y envía notificaciones
// ============================================

const express = require('express');
const cors = require('cors');
const streamRouter = require('./routes/stream.route');
const subscriptionRouter = require('./routes/subscription.route');

const app = express();
const PORT = process.env.PORT || 8081;

// ============================================
// MIDDLEWARES
// ============================================

// CORS configurado para permitir SSE
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  const connections = require('./sse-connection-manager');
  res.json({
    status: 'ok',
    service: 'broadcaster-api',
    activeConnections: connections.getConnectionCount(),
  });
});

// SSE Stream endpoint
app.use('/stream/', streamRouter);
// Subscription endpoint (listener de Pub/Sub)
app.use('/subscription/', subscriptionRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
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

async function startServer() {
  try {
    // Conectar a MongoDB
    await mongoService.connect();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✅ Broadcaster API running on port ${PORT}`);
      console.log(`📡 SSE endpoint: /notifications/stream`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando servidor...');
  await mongoService.close();
  process.exit(0);
});

startServer();
