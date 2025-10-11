// ============================================
// web-app/src/utils/environments.js
// Configuración centralizada de variables de entorno
// ============================================

/**
 * Configuración de URLs de los servicios
 */
export const API_CONFIG = {
  // Pushify API - Servicio principal para crear y gestionar notificaciones
  PUSHIFY_API_URL: import.meta.env.VITE_API_URL,

  // Broadcaster API - Servicio para conexiones SSE y entrega en tiempo real
  BROADCASTER_API_URL: import.meta.env.VITE_BROADCASTER_URL,

  // Web App - URL base de la aplicación frontend
  WEB_APP_URL: import.meta.env.VITE_WEB_APP_URL,

  // Base URL para rutas de la aplicación
  BASE_URL: import.meta.env.BASE_URL || "/",
};

/**
 * Configuración de endpoints específicos
 */
export const ENDPOINTS = {
  // Pushify API endpoints
  NOTIFICATIONS: {
    CREATE: `${API_CONFIG.PUSHIFY_API_URL}/notifications`,
    GET_BY_USER: (userId, status = "") =>
      `${API_CONFIG.PUSHIFY_API_URL}/notifications?userId=${userId}${
        status ? `&status=${status}` : ""
      }`,
    MARK_AS_READ: (notificationId, userId) =>
      `${API_CONFIG.PUSHIFY_API_URL}/notifications/${notificationId}/read?userId=${userId}`,
    HEALTH: `${API_CONFIG.PUSHIFY_API_URL}/health`,
  },

  // Broadcaster API endpoints
  SSE: {
    STREAM: (userId) => `${API_CONFIG.BROADCASTER_API_URL}/stream/${userId}`,
    HEALTH: `${API_CONFIG.BROADCASTER_API_URL}/health`,
  },
};

/**
 * Configuración de la aplicación
 */
export const APP_CONFIG = {
  // Usuario por defecto para pruebas
  DEFAULT_USER_ID: "user123",

  // Configuración de notificaciones
  NOTIFICATIONS: {
    // Tiempo de duración del toast (en ms)
    TOAST_DURATION: 5000,

    // Días para limpiar notificaciones antiguas
    CLEANUP_DAYS: 7,

    // Estados de notificación
    STATUS: {
      PENDING: "pending",
      DELIVERED: "delivered",
      READ: "read",
    },
  },

  // Configuración de reconexión SSE
  SSE: {
    // Tiempo de espera antes de reconectar (en ms)
    RECONNECT_DELAY: 5000,

    // Número máximo de intentos de reconexión
    MAX_RECONNECT_ATTEMPTS: 10,
  },
};

/**
 * Configuración de desarrollo
 */
export const DEV_CONFIG = {
  // Habilitar logs de debug
  DEBUG: import.meta.env.DEV,

  // Mostrar logs de conexión SSE
  LOG_SSE: import.meta.env.DEV,

  // Mostrar logs de notificaciones
  LOG_NOTIFICATIONS: import.meta.env.DEV,
};

/**
 * Función helper para obtener la URL completa de un endpoint
 */
export const getEndpoint = (endpoint) => {
  if (typeof endpoint === "function") {
    return endpoint;
  }
  return endpoint;
};

/**
 * Función helper para logging condicional
 */
export const debugLog = (message, ...args) => {
  if (DEV_CONFIG.DEBUG) {
    console.log(message, ...args);
  }
};

/**
 * Función helper para logging de errores
 */
export const errorLog = (message, error) => {
  console.error(message, error);
};

export default {
  API_CONFIG,
  ENDPOINTS,
  APP_CONFIG,
  DEV_CONFIG,
  getEndpoint,
  debugLog,
  errorLog,
};
