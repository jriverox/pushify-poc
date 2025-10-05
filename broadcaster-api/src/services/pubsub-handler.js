// ============================================
// Handler para mensajes de Pub/Sub
// ============================================

const express = require('express');
const connections = require('../connections');
const firestoreService = require('./firestore');

const router = express.Router();

// ============================================
// POST /_internal/pubsub-handler
// Recibe mensajes push de Pub/Sub
// ============================================
router.post('/pubsub-handler', async (req, res) => {
  try {
    // Pub/Sub envía los mensajes en este formato
    const { message } = req.body;

    if (!message || !message.data) {
      console.log('[PUBSUB] Mensaje inválido recibido');
      return res.status(400).json({ error: 'Invalid message format' });
    }

    // Decodificar mensaje (viene en base64)
    const messageData = JSON.parse(
      Buffer.from(message.data, 'base64').toString('utf-8')
    );

    const { messageId, recipient, notification } = messageData;

    console.log(`[PUBSUB] 📨 Mensaje recibido: ${messageId} para ${recipient.type}:${recipient.id}`);

    // ============================================
    // BUSCAR CONEXIONES ACTIVAS
    // ============================================
    let targetConnections = [];

    if (recipient.type === 'individual') {
      // Notificación para usuario específico
      const connection = connections.getUserConnection(recipient.id);
      if (connection) {
        targetConnections.push(connection);
      }
    } else if (recipient.type === 'group') {
      // Notificación para grupo
      targetConnections = connections.getGroupConnections(recipient.id);
    } else if (recipient.type === 'broadcast') {
      // Broadcast a todos los usuarios conectados
      targetConnections = Array.from(connections.users.values());
    }

    // ============================================
    // ENVIAR NOTIFICACIÓN POR SSE
    // ============================================
    if (targetConnections.length > 0) {
      console.log(`[PUBSUB] ✅ Enviando a ${targetConnections.length} conexiones activas`);

      // Preparar payload SSE
      const sseData = JSON.stringify({
        messageId,
        notification,
        recipient,
        timestamp: new Date().toISOString()
      });

      // Enviar a cada conexión
      let sentCount = 0;
      for (const connection of targetConnections) {
        try {
          connection.write('event: notification\n');
          connection.write(`data: ${sseData}\n`);
          connection.write(`id: ${messageId}\n\n`);
          sentCount++;
        } catch (error) {
          console.error(`[PUBSUB] Error enviando a conexión:`, error);
          // La conexión está muerta, se limpiará en el próximo heartbeat
        }
      }

      console.log(`[PUBSUB] ✅ Enviado exitosamente a ${sentCount} conexiones`);

      // Actualizar estado en Firestore
      await firestoreService.markAsDelivered(messageId);

    } else {
      console.log(`[PUBSUB] ⚠️  No hay conexiones activas para ${recipient.type}:${recipient.id}`);
      console.log('[PUBSUB] La notificación permanece en Firestore como "pending"');
    }

    // ACK a Pub/Sub (siempre responder 200 para no reintentar)
    res.status(200).send('OK');

  } catch (error) {
    console.error('[PUBSUB ERROR]', error);
    // Aún así hacer ACK para no bloquear el topic
    res.status(200).send('ERROR');
  }
});

module.exports = router;
