// ============================================
// Endpoint SSE para conexiones de clientes
// ============================================

const express = require('express');
const connections = require('../connections');

const router = express.Router();

// ============================================
// GET /notifications/stream/:userId
// Establece conexión SSE con el cliente
// ============================================
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  // Validación básica (en producción validarías token de auth)
  if (!userId) {
    return res.status(400).json({ error: 'Missing required parameter: userId' });
  }

  console.log(`[SSE] Nueva conexión de userId=${userId}`);

  // ============================================
  // CONFIGURAR HEADERS SSE
  // ============================================
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Evitar buffering de nginx/proxies
  res.setHeader('X-Accel-Buffering', 'no');

  // Flush inicial para establecer conexión
  res.flushHeaders();

  // ============================================
  // REGISTRAR CONEXIÓN
  // ============================================
  
  // Agregar metadata al Response para tracking
  res.userId = userId;
  
  // Registrar en Map de usuarios
  connections.addUserConnection(userId, res);

  // TODO: En producción, obtener grupos del usuario desde auth token
  // Por ahora, simulamos que el usuario NO está en grupos
  // Si necesitas probar grupos, descomenta:
  // connections.addUserToGroup('zone_1', res);

  // ============================================
  // ENVIAR MENSAJE INICIAL
  // ============================================
  res.write('event: connected\n');
  res.write(`data: {"userId":"${userId}","timestamp":"${new Date().toISOString()}"}\n\n`);

  // ============================================
  // HEARTBEAT
  // Enviar ping cada 30 segundos para mantener conexión viva
  // ============================================
  const heartbeatInterval = setInterval(() => {
    try {
      res.write('event: heartbeat\n');
      res.write('data: ping\n\n');
    } catch (error) {
      console.log(`[SSE] Error en heartbeat para ${userId}, limpiando conexión`);
      clearInterval(heartbeatInterval);
      connections.cleanupConnection(userId, res);
    }
  }, 30000); // 30 segundos

  // ============================================
  // CLEANUP AL CERRAR CONEXIÓN
  // ============================================
  req.on('close', () => {
    console.log(`[SSE] Cliente ${userId} cerró conexión`);
    clearInterval(heartbeatInterval);
    connections.cleanupConnection(userId, res);
  });

  req.on('error', (error) => {
    console.error(`[SSE] Error en conexión de ${userId}:`, error);
    clearInterval(heartbeatInterval);
    connections.cleanupConnection(userId, res);
  });
});

module.exports = router;
