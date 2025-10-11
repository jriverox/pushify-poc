<!-- ============================================ -->
<!-- web-app/src/App.vue                           -->
<!-- Componente principal de la aplicación         -->
<!-- ============================================ -->

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🔔 Pushify - Sistema de Notificaciones</h1>
      <div class="header-info">
        <span class="user-badge">Usuario: {{ userId }}</span>
        <span class="connection-status" :class="{ connected: isConnected, disconnected: !isConnected }">
          {{ isConnected ? '● Conectado' : '○ Desconectado' }}
        </span>
        <NotificationBell />
      </div>
    </header>

    <main class="app-main">
      <router-view />

      <!-- Toast de notificaciones nuevas -->
      <NotificationToast v-if="latestNotification" :notification="latestNotification"
        @close="clearLatestNotification" />
    </main>

    <footer class="app-footer">
      <p>PoC - Sistema de Notificaciones Push en Tiempo Real</p>
      <button @click="testNotification" class="btn-test">
        Enviar Notificación de Prueba
      </button>
    </footer>
  </div>
</template>

<script setup>
import NotificationBell from './components/NotificationBell.vue';
import NotificationToast from './components/NotificationToast.vue';
import { useNotifications } from './composables/useNotifications';
import { useNotificationStore } from './stores/notifications';
import { ENDPOINTS, APP_CONFIG, debugLog, errorLog } from './utils/environments';

// Usar userId desde configuración
const userId = APP_CONFIG.DEFAULT_USER_ID;

// Composable de notificaciones
const { refresh } = useNotifications(userId);

// Store global para notificaciones
const { isConnected, latestNotification, clearLatestNotification } = useNotificationStore();

// Función de prueba: enviar notificación
async function testNotification() {
  try {
    const response = await fetch(ENDPOINTS.NOTIFICATIONS.CREATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notification: {
          type: 'info',
          priority: 'normal',
          title: 'Notificación de Prueba',
          content: `Mensaje enviado a las ${new Date().toLocaleTimeString()}`,
          category: 'message'
        },
        sender: {
          id: 'test-ui',
          name: 'Interfaz de Prueba'
        },
        recipient: {
          type: 'individual',
          id: userId
        }
      })
    });

    if (response.ok) {
      debugLog('✅ Notificación de prueba enviada');
      // Refrescar la lista de notificaciones para actualizar el contador
      await refresh();
    }
  } catch (error) {
    errorLog('Error enviando notificación de prueba:', error);
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
}

.header-info {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.user-badge,
.connection-status,
.notification-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.connection-status.connected {
  background: rgba(76, 175, 80, 0.8);
}

.connection-status.disconnected {
  background: rgba(244, 67, 54, 0.8);
}

.notification-count {
  background: rgba(255, 193, 7, 0.9);
  color: #333;
  font-weight: bold;
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.app-footer {
  background: white;
  padding: 1.5rem;
  text-align: center;
  border-top: 1px solid #e0e0e0;
}

.btn-test {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.btn-test:hover {
  background: #5568d3;
}
</style>
