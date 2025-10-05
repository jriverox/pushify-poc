// ============================================
// pushify-api/src/services/firestore.js
// Servicio para interactuar con Firestore
// ============================================

const { Firestore } = require('@google-cloud/firestore');

// Inicializar Firestore
// En Cloud Run, las credenciales se obtienen automáticamente
// En desarrollo local, usa GOOGLE_APPLICATION_CREDENTIALS
const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
});

const COLLECTION_NAME = 'notifications';

// ============================================
// Crear una nueva notificación
// ============================================
async function createNotification(messageId, notificationData) {
  const docRef = firestore.collection(COLLECTION_NAME).doc(messageId);
  await docRef.set(notificationData);
  return messageId;
}

// ============================================
// Obtener notificaciones por usuario
// ============================================
async function getNotificationsByUser(userId, status) {
  const query = firestore
    .collection(COLLECTION_NAME)
    .where('recipient.id', '==', userId)
    .where('status', '==', status)
    .orderBy('createdAt', 'desc')
    .limit(50);

  const snapshot = await query.get();

  const notifications = [];
  snapshot.forEach((doc) => {
    notifications.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  return notifications;
}

// ============================================
// Obtener una notificación por ID
// ============================================
async function getNotificationById(messageId) {
  const docRef = firestore.collection(COLLECTION_NAME).doc(messageId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  };
}

// ============================================
// Marcar notificación como leída
// ============================================
async function markAsRead(messageId) {
  const docRef = firestore.collection(COLLECTION_NAME).doc(messageId);
  await docRef.update({
    status: 'read',
    readAt: new Date().toISOString(),
  });
}

// ============================================
// Actualizar estado a "delivered"
// ============================================
async function markAsDelivered(messageId) {
  const docRef = firestore.collection(COLLECTION_NAME).doc(messageId);
  await docRef.update({
    status: 'delivered',
    deliveredAt: new Date().toISOString(),
  });
}

module.exports = {
  createNotification,
  getNotificationsByUser,
  getNotificationById,
  markAsRead,
  markAsDelivered,
};
