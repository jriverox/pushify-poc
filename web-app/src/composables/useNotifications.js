// ============================================
// web-app/src/composables/useNotifications.js
// Lógica de notificaciones (fetch + SSE)
// ============================================

import { onMounted, onUnmounted } from "vue";
import { useNotificationStore } from "../stores/notifications";
import { ENDPOINTS, APP_CONFIG, DEV_CONFIG, debugLog, errorLog } from "../utils/environments";

export function useNotifications(userId = APP_CONFIG.DEFAULT_USER_ID) {

  // Usar el store global
  const {
    notifications,
    isConnected,
    latestNotification,
    isInitialized,
    setNotifications,
    addNotification,
    markNotificationAsRead,
    setConnectionStatus,
    setLatestNotification,
    clearLatestNotification,
    setMarkAsReadFunction,
    setInitialized,
    cleanOldNotifications,
  } = useNotificationStore();

  // Función real para marcar como leída que llama al API
  async function markAsReadAPI(notificationId) {
    try {
      const response = await fetch(
        ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(notificationId, userId),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok || response.status === 204) {
        // Actualizar estado global
        markNotificationAsRead(notificationId);
        debugLog(`✅ Notificación ${notificationId} marcada como leída`);
      }
    } catch (error) {
      errorLog("❌ Error marcando notificación como leída:", error);
    }
  }

  let eventSource = null;

  // ============================================
  // Función 1: Recuperar notificaciones pendientes
  // ============================================
  async function fetchPendingNotifications() {
    try {
      const response = await fetch(
        ENDPOINTS.NOTIFICATIONS.GET_BY_USER(userId, 'pending')
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(
          data.notifications.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
        debugLog(
          `✅ ${data.notifications.length} notificaciones pendientes recuperadas`
        );
      }
    } catch (error) {
      errorLog("❌ Error recuperando notificaciones:", error);
    }
  }

  // ============================================
  // Función 2: Conectar a SSE para notificaciones en tiempo real
  // ============================================
  function connectToSSE() {
    // Cerrar conexión anterior si existe
    if (eventSource) {
      eventSource.close();
      debugLog("🔌 Conexión SSE anterior cerrada");
    }

    // Crear nueva conexión SSE
    const sseUrl = ENDPOINTS.SSE.STREAM(userId);
    eventSource = new EventSource(sseUrl);

    // Evento: Conexión abierta
    eventSource.onopen = () => {
      setConnectionStatus(true);
      debugLog("🔗 Conexión SSE establecida");
    };

    // Evento: Mensaje recibido
    eventSource.onmessage = (event) => {
      if (DEV_CONFIG.LOG_SSE) {
        debugLog("📨 Mensaje genérico recibido:", event.data);
      }
    };

    // Evento: Notificación específica
    eventSource.addEventListener("notification", (event) => {
      try {
        const newNotification = JSON.parse(event.data);

        // Agregar notificación al store (maneja duplicados internamente)
        addNotification(newNotification);

        // Actualizar última notificación para el toast
        setLatestNotification(newNotification);

        // Auto-cerrar toast después del tiempo configurado
        setTimeout(() => {
          if (
            latestNotification.value?.messageId === newNotification.messageId
          ) {
            clearLatestNotification();
          }
        }, APP_CONFIG.NOTIFICATIONS.TOAST_DURATION);

        if (DEV_CONFIG.LOG_NOTIFICATIONS) {
          debugLog(
            "📬 Nueva notificación recibida:",
            newNotification.notification.title
          );
        }
      } catch (error) {
        errorLog("❌ Error procesando notificación:", error);
      }
    });

    // Evento: Error de conexión
    eventSource.onerror = (error) => {
      setConnectionStatus(false);
      errorLog("❌ Error en conexión SSE:", error);

      // Intentar reconectar después del tiempo configurado
      setTimeout(() => {
        debugLog("🔄 Intentando reconectar...");
        connectToSSE();
      }, APP_CONFIG.SSE.RECONNECT_DELAY);
    };
  }

  // La función markAsRead ya está implementada arriba como markAsReadAPI

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
    // Solo inicializar si no se ha hecho antes
    if (isInitialized.value) {
      debugLog(
        "🚀 Sistema de notificaciones ya inicializado, reutilizando..."
      );
      return;
    }

    debugLog("🚀 Inicializando sistema de notificaciones...");

    // Marcar como inicializado
    setInitialized(true);

    // Limpiar notificaciones antiguas
    cleanOldNotifications();

    // Registrar la función real de markAsRead en el store
    setMarkAsReadFunction(markAsReadAPI);

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
      debugLog("🔌 Conexión SSE cerrada");
    }
  });

  // ============================================
  // Retornar API pública del composable
  // ============================================
  return {
    notifications,
    isConnected,
    latestNotification,
    markAsRead: markAsReadAPI,
    refresh,
  };
}
