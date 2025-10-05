// ============================================
// pushify-api/src/services/pubsub.js
// Servicio para publicar mensajes a Pub/Sub
// ============================================

const { PubSub } = require('@google-cloud/pubsub');

// Inicializar cliente Pub/Sub
const pubsub = new PubSub({
  projectId: process.env.GCP_PROJECT_ID,
});

const TOPIC_NAME = process.env.PUBSUB_TOPIC || 'notifications';

// ============================================
// Publicar notificación a Pub/Sub
// ============================================
async function publishNotification(notificationData) {
  try {
    const topic = pubsub.topic(TOPIC_NAME);

    // Convertir datos a Buffer
    const dataBuffer = Buffer.from(JSON.stringify(notificationData));

    // Atributos del mensaje (útil para filtering)
    const attributes = {
      messageId: notificationData.messageId,
      recipientType: notificationData.recipient.type,
      recipientId: notificationData.recipient.id,
      priority: notificationData.notification.priority,
    };

    // Publicar mensaje
    const messageId = await topic.publishMessage({
      data: dataBuffer,
      attributes,
    });

    console.log(`[PUBSUB] Mensaje publicado con ID: ${messageId}`);
    return messageId;
  } catch (error) {
    console.error('[PUBSUB ERROR]', error);
    throw error;
  }
}

module.exports = {
  publishNotification,
};
