const { MongoClient } = require('mongodb');

class MongoDBService {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
  }

  async connect() {
    try {
      const uri = process.env.MONGODB_URI;
      const dbName = process.env.MONGODB_DB;

      this.client = new MongoClient(uri);
      await this.client.connect();

      this.db = this.client.db(dbName);
      this.collection = this.db.collection('notifications');

      console.log('MongoDB conectado correctamente');

      // Crear índices para optimizar consultas
      await this.collection.createIndex({ 'recipient.id': 1, status: 1 });
      await this.collection.createIndex({ createdAt: -1 });
    } catch (error) {
      console.error('Error conectando a MongoDB:', error);
      throw error;
    }
  }

  async markAsDelivered(messageId) {
    try {
      const result = await this.collection.updateOne(
        { _id: messageId },
        { $set: { status: 'delivered', deliveredAt: new Date().toISOString() } }
      );

      console.log(`[MONGODB] Notificación ${messageId} marcada como entregada`);
      return result;
    } catch (error) {
      console.error('[MONGODB] Error marcando como entregada:', error);
      throw error;
    }
  }

  async getNotificationById(messageId) {
    try {
      const notification = await this.collection.findOne({ _id: messageId });
      return notification;
    } catch (error) {
      console.error('[MONGODB] Error obteniendo notificación:', error);
      throw error;
    }
  }

  async markAsRead(messageId) {
    try {
      const result = await this.collection.updateOne(
        { _id: messageId },
        {
          $set: {
            status: 'read',
            readAt: new Date().toISOString(),
          },
        }
      );

      console.log(`[MONGODB] Notificación ${messageId} marcada como leída`);
      return result;
    } catch (error) {
      console.error('[MONGODB] Error marcando como leída:', error);
      throw error;
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log('Conexión MongoDB cerrada');
    }
  }
}

// Singleton
const mongoService = new MongoDBService();

module.exports = mongoService;
