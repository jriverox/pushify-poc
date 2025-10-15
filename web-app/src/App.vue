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
  background: var(--bg-secondary);
}

.app-header {
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 1.5rem 2rem;
  box-shadow: var(--shadow-sm);
  border-bottom: 1px solid var(--border-color);
}

.app-header h1 {
  margin: 0 0 1rem 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.header-info {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.user-badge,
.connection-status {
  background: var(--bg-secondary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.connection-status.connected {
  background: #E8F5E9;
  color: var(--success-color);
  border-color: var(--success-color);
}

.connection-status.disconnected {
  background: #FFEBEE;
  color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.app-footer {
  background: var(--bg-primary);
  padding: 2rem;
  text-align: center;
  border-top: 1px solid var(--border-color);
}

.app-footer p {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.btn-test {
  padding: 0.875rem 2rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-test:hover {
  background: var(--primary-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-test:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}
</style>
