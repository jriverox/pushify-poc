// ============================================
// pushify-api/src/routes/notifications.js
// Endpoints para gestión de notificaciones
// ============================================

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const firestoreService = require('../services/firestore');
const pubsubService = require('../services/pubsub');

const router = express.Router();

// ============================================
// POST /notifications
// Crear una nueva notificación
// ============================================
router.post('/', async (req, res) => {
  try {
    const { notification, sender, recipient } = req.body;

    // Validación básica
    if (!notification || !notification.title || !notification.content) {
      return res.status(400).json({ 
        error: 'Missing required fields: notification.title, notification.content' 
      });
    }

    if (!recipient || !recipient.type || !recipient.id) {
      return res.status(400).json({ 
        error: 'Missing required fields: recipient.type, recipient.id' 
      });
    }

    // Generar ID único para la notificación
    const messageId = uuidv4();
    const now = new Date().toISOString();

    // Construir documento completo
    const notificationDoc = {
      messageId,
      createdAt: now,
      
      notification: {
        type: notification.type || 'info',
        priority: notification.priority || 'normal',
        title: notification.title,
        content: notification.content,
        category: notification.category || 'message'
      },
      
      sender: sender || {
        id: 'system',
        name: 'Sistema'
      },
      
      recipient: {
        type: recipient.type, // individual | group | broadcast
        id: recipient.id
      },
      
      status: 'pending',
      deliveredAt: null,
      readAt: null
    };

    console.log(`[CREATE] Notificación ${messageId} para ${recipient.type}:${recipient.id}`);

    // 1. Guardar en Firestore
    await firestoreService.createNotification(messageId, notificationDoc);
    console.log(`[FIRESTORE] ✅ Guardado: ${messageId}`);

    // 2. Publicar a Pub/Sub para entrega en tiempo real
    await pubsubService.publishNotification(notificationDoc);
    console.log(`[PUBSUB] ✅ Publicado: ${messageId}`);

    // Responder inmediatamente (asíncrono)
    res.status(202).json({
      messageId,
      status: 'queued',
      message: 'Notification queued for delivery'
    });

  } catch (error) {
    console.error('[ERROR] Creating notification:', error);
    res.status(500).json({ 
      error: 'Failed to create notification',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// GET /notifications
// Obtener notificaciones pendientes para un usuario
// ============================================
router.get('/', async (req, res) => {
  try {
    const { userId, status = 'pending' } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing required parameter: userId' });
    }

    console.log(`[FETCH] Notificaciones para userId=${userId}, status=${status}`);

    // Obtener notificaciones desde Firestore
    const notifications = await firestoreService.getNotificationsByUser(userId, status);

    console.log(`[FETCH] ✅ Encontradas ${notifications.length} notificaciones`);

    res.json({
      userId,
      status,
      count: notifications.length,
      notifications
    });

  } catch (error) {
    console.error('[ERROR] Fetching notifications:', error);
    res.status(500).json({ 
      error: 'Failed to fetch notifications',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// PATCH /notifications/:id/read
// Marcar una notificación como leída
// ============================================
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing required parameter: userId' });
    }

    console.log(`[READ] Marcando notificación ${id} como leída por userId=${userId}`);

    // Verificar que la notificación existe y pertenece al usuario
    const notification = await firestoreService.getNotificationById(id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Validación simple: verificar que el destinatario coincide
    if (notification.recipient.type === 'individual' && notification.recipient.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Actualizar estado a "read"
    await firestoreService.markAsRead(id);
    console.log(`[READ] ✅ Notificación ${id} marcada como leída`);

    res.status(204).send();

  } catch (error) {
    console.error('[ERROR] Marking as read:', error);
    res.status(500).json({ 
      error: 'Failed to mark notification as read',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
