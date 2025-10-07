// Load environment variables
require('dotenv').config();

// ============================================
// SSE Broadcaster - Mantiene conexiones y envía notificaciones
// ============================================

const express = require('express');
const cors = require('cors');
const streamRouter = require('./routes/stream');
const redisSubscriber = require('./services/redis-subscriber');

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
  const connections = require('./connections');
  res.json({
    status: 'ok',
    service: 'broadcaster-api',
    activeConnections: connections.getConnectionCount(),
  });
});

// SSE Stream endpoint
app.use('/notifications/stream', streamRouter);

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
    // Conectar a Redis
    await redisSubscriber.connect();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✅ Broadcaster API running on port ${PORT}`);
      console.log(`📡 SSE endpoint: /notifications/stream`);
      console.log(`🔔 Redis subscriber: activo`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando servidor...');
  await redisSubscriber.close();
  process.exit(0);
});

startServer();
