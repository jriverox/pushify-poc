const { MongoClient } = require('mongodb');

class MongoDBService {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
  }

  async connect() {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      const dbName = process.env.MONGODB_DB || 'pushify';

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

  async createNotification(messageId, notificationDoc) {
    try {
      const result = await this.collection.insertOne({
        _id: messageId,
        ...notificationDoc,
      });

      console.log(`[MONGODB] Notificación ${messageId} creada`);
      return result;
    } catch (error) {
      console.error('[MONGODB] Error creando notificación:', error);
      throw error;
    }
  }

  async getUnreadNotificationsByUser(userId) {
    try {
      const query = {
        'recipient.id': userId,
        status: { $in: ['pending', 'delivered'] },
      };

      const notifications = await this.collection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      console.log(
        `[MONGODB] ${notifications.length} notificaciones no leídas encontradas para ${userId}`
      );
      return notifications;
    } catch (error) {
      console.error(
        '[MONGODB] Error obteniendo notificaciones no leídas:',
        error
      );
      throw error;
    }
  }

  async getNotificationsByUser(userId, status = 'pending') {
    try {
      const query = {
        'recipient.id': userId,
        status: status,
      };

      const notifications = await this.collection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      console.log(
        `[MONGODB] ${notifications.length} notificaciones encontradas para ${userId}`
      );
      return notifications;
    } catch (error) {
      console.error('[MONGODB] Error obteniendo notificaciones:', error);
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
