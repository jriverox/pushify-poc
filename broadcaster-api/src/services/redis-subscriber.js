const { createClient } = require('redis');
const connections = require('../connections');

class RedisSubscriber {
  constructor() {
    this.subscriber = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.subscriber = createClient({ url: redisUrl });
      
      this.subscriber.on('error', (err) => {
        console.error('Redis Subscriber Error:', err);
        this.isConnected = false;
      });

      this.subscriber.on('connect', () => {
        console.log('Redis Subscriber conectado');
        this.isConnected = true;
      });

      await this.subscriber.connect();
      
      await this.subscriber.subscribe('notifications', (message) => {
        this.handleNotification(message);
      });
      
      console.log('📡 Suscrito al canal "notifications"');
    } catch (error) {
      console.error('Error conectando Redis Subscriber:', error);
      throw error;
    }
  }

  handleNotification(message) {
    try {
      const notification = JSON.parse(message);
      console.log('Notificación recibida:', notification.notification.title);
      
      this.broadcastToUsers(notification);
      
    } catch (error) {
      console.error('Error procesando notificación:', error);
    }
  }

  broadcastToUsers(notification) {
    const { recipient } = notification;
    
    if (recipient.type === 'individual') {
      const userConnection = connections.getUserConnection(recipient.id);
      if (userConnection) {
        this.sendToConnection(userConnection, notification);
      } else {
        console.log(`Usuario ${recipient.id} no está conectado`);
      }
    } else if (recipient.type === 'broadcast') {
      const allConnections = connections.getAllConnections();
      allConnections.forEach(connection => {
        this.sendToConnection(connection, notification);
      });
    }
  }

  sendToConnection(connection, notification) {
    try {
      connection.write(`data: ${JSON.stringify(notification)}\n\n`);
      console.log('Notificación enviada via SSE');
    } catch (error) {
      console.error('Error enviando notificación:', error);
    }
  }

  async close() {
    if (this.subscriber) {
      await this.subscriber.quit();
      console.log('Redis Subscriber cerrado');
    }
  }
}

// Singleton
const redisSubscriber = new RedisSubscriber();

module.exports = redisSubscriber;
