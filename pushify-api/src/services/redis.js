const { createClient } = require('redis');

class RedisService {
  constructor() {
    this.client = null;
    this.publisher = null;
  }

  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.publisher = createClient({ url: redisUrl });
      await this.publisher.connect();
      
      console.log('Redis Publisher conectado');
    } catch (error) {
      console.error('Error conectando a Redis:', error);
      throw error;
    }
  }

  async publishNotification(notificationDoc) {
    try {
      const channel = 'notifications';
      const message = JSON.stringify(notificationDoc);
      
      await this.publisher.publish(channel, message);
      console.log(`[REDIS] Notificación publicada en canal ${channel}`);
    } catch (error) {
      console.error('[REDIS] Error publicando notificación:', error);
      throw error;
    }
  }

  async close() {
    if (this.publisher) {
      await this.publisher.quit();
      console.log('🔌 Conexión Redis cerrada');
    }
  }
}

// Singleton
const redisService = new RedisService();

module.exports = redisService;
