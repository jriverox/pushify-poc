// ============================================
// web-app/src/composables/useNotifications.js
// Lógica de notificaciones (fetch + SSE)
// ============================================

import { ref, onMounted, onUnmounted } from 'vue';

export function useNotifications(userId) {
  // URLs de las APIs (desde variables de entorno)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const BROADCASTER_URL =
    import.meta.env.VITE_BROADCASTER_URL || 'http://localhost:8081';

  // Estado reactivo
  const notifications = ref([]);
  const isConnected = ref(false);
  const latestNotification = ref(null);

  let eventSource = null;

  // ============================================
  // Función 1: Recuperar notificaciones pendientes
  // ============================================
  async function fetchPendingNotifications() {
    try {
      const response = await fetch(
        `${API_URL}/notifications?userId=${userId}&status=pending`
      );

      if (response.ok) {
        const data = await response.json();
        notifications.value = data.notifications.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        console.log(`✅ ${data.notifications.length} notificaciones pendientes recuperadas`);
      }
    } catch (error) {
      console.error('❌ Error recuperando notificaciones:', error);
    }
  }

  // ============================================
  // Función 2: Conectar a SSE para notificaciones en tiempo real
  // ============================================
  function connectToSSE() {
    // Cerrar conexión anterior si existe
    if (eventSource) {
      eventSource.close();
    }

    // Crear nueva conexión SSE
    const sseUrl = `${BROADCASTER_URL}/notifications/stream/${userId}`;
    eventSource = new EventSource(sseUrl);

    // Evento: Conexión abierta
    eventSource.onopen = () => {
      isConnected.value = true;
      console.log('🔗 Conexión SSE establecida');
    };

    // Evento: Mensaje recibido
    eventSource.onmessage = (event) => {
      try {
        const newNotification = JSON.parse(event.data);

        // Agregar notificación al inicio del array
        notifications.value.unshift(newNotification);

        // Actualizar última notificación para el toast
        latestNotification.value = newNotification;

        // Auto-cerrar toast después de 5 segundos
        setTimeout(() => {
          if (
            latestNotification.value?.messageId === newNotification.messageId
          ) {
            latestNotification.value = null;
          }
        }, 5000);

        console.log(
          '📬 Nueva notificación recibida:',
          newNotification.notification.title
        );
      } catch (error) {
        console.error('❌ Error procesando notificación:', error);
      }
    };

    // Evento: Error de conexión
    eventSource.onerror = (error) => {
      isConnected.value = false;
      console.error('❌ Error en conexión SSE:', error);

      // Intentar reconectar después de 5 segundos
      setTimeout(() => {
        console.log('🔄 Intentando reconectar...');
        connectToSSE();
      }, 5000);
    };
  }

  // ============================================
  // Función 3: Marcar notificación como leída
  // ============================================
  async function markAsRead(notificationId) {
    try {
      const response = await fetch(
        `${API_URL}/notifications/${notificationId}/read?userId=${userId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.ok || response.status === 204) {
        // Actualizar estado local
        const notification = notifications.value.find(
          (n) => n.messageId === notificationId
        );

        if (notification) {
          notification.status = 'read';
          console.log(`✅ Notificación ${notificationId} marcada como leída`);
        }
      }
    } catch (error) {
      console.error('❌ Error marcando notificación como leída:', error);
    }
  }

  // ============================================
  // Función 4: Refrescar notificaciones
  // ============================================
  async function refresh() {
    await fetchPendingNotifications();
  }

  // ============================================
  // Lifecycle: Inicializar al montar el componente
  // ============================================
  onMounted(async () => {
    console.log('🚀 Inicializando sistema de notificaciones...');

    // 1. Recuperar notificaciones pendientes
    await fetchPendingNotifications();

    // 2. Conectar a SSE para recibir notificaciones en tiempo real
    connectToSSE();
  });

  // ============================================
  // Lifecycle: Limpiar al desmontar el componente
  // ============================================
  onUnmounted(() => {
    if (eventSource) {
      eventSource.close();
      console.log('🔌 Conexión SSE cerrada');
    }
  });

  // ============================================
  // Retornar API pública del composable
  // ============================================
  return {
    notifications,
    isConnected,
    latestNotification,
    markAsRead,
    refresh,
  };
}
