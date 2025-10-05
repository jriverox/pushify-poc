// ============================================
// Servicio para actualizar estados en Firestore
// ============================================

const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
});

const COLLECTION_NAME = 'notifications';

// ============================================
// Marcar notificación como entregada
// ============================================
async function markAsDelivered(messageId) {
  try {
    const docRef = firestore.collection(COLLECTION_NAME).doc(messageId);
    await docRef.update({
      status: 'delivered',
      deliveredAt: new Date().toISOString()
    });
    console.log(`[FIRESTORE] ✅ ${messageId} marcado como delivered`);
  } catch (error) {
    console.error(`[FIRESTORE ERROR] No se pudo actualizar ${messageId}:`, error);
  }
}

module.exports = {
  markAsDelivered
};
