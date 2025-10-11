// ============================================
// web-app/src/stores/notifications.js
// Store global para notificaciones
// ============================================

import { ref, computed } from 'vue'
import { APP_CONFIG, DEV_CONFIG, debugLog, errorLog } from '../utils/environments'

// Función para cargar estado desde localStorage
function loadFromStorage() {
  try {
    const stored = localStorage.getItem('pushify-notifications')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    errorLog('Error cargando notificaciones desde localStorage:', error)
    return []
  }
}

// Función para guardar estado en localStorage
function saveToStorage(notifications) {
  try {
    localStorage.setItem('pushify-notifications', JSON.stringify(notifications))
  } catch (error) {
    errorLog('Error guardando notificaciones en localStorage:', error)
  }
}

// Estado global reactivo (cargar desde localStorage al inicio)
const notifications = ref(loadFromStorage())
const isConnected = ref(false)
const latestNotification = ref(null)
const isInitialized = ref(false)

// Getters computados
const unreadCount = computed(() => {
  // Contar notificaciones que NO están leídas (pending y delivered)
  const unread = notifications.value.filter(n => n.status === 'pending' || n.status === 'delivered').length
  if (DEV_CONFIG.DEBUG) {
    debugLog('🔔 unreadCount calculado:', unread, 'de', notifications.value.length, 'notificaciones')
    debugLog('🔔 Estados:', notifications.value.map(n => ({ id: n.messageId, status: n.status })))
  }
  return unread
})

// Funciones para actualizar el estado
function setNotifications(newNotifications) {
  notifications.value = newNotifications
  saveToStorage(newNotifications)
  debugLog('💾 Notificaciones guardadas en localStorage:', newNotifications.length)
}

function addNotification(notification) {
  // Verificar si la notificación ya existe para evitar duplicados
  const exists = notifications.value.some(n => n.messageId === notification.messageId)
  if (!exists) {
    notifications.value.unshift(notification)
    saveToStorage(notifications.value)
    debugLog('📬 Notificación agregada al store:', notification.messageId)
  } else {
    // Actualizar la notificación existente con datos más recientes del SSE
    const existingIndex = notifications.value.findIndex(n => n.messageId === notification.messageId)
    if (existingIndex !== -1) {
      const existing = notifications.value[existingIndex]
      
      // Si la notificación existente es "pending" y la nueva es "delivered", actualizar
      if (existing.status === 'pending' && notification.status === 'delivered') {
        notifications.value[existingIndex] = {
          ...notification,
          status: 'delivered',
          deliveredAt: notification.deliveredAt || new Date().toISOString()
        }
        saveToStorage(notifications.value)
        debugLog('🔄 Notificación actualizada a delivered:', notification.messageId)
      } else {
        // Mantener el estado original para otros casos
        notifications.value[existingIndex] = {
          ...notification,
          status: existing.status,
          readAt: existing.readAt
        }
        saveToStorage(notifications.value)
        debugLog('🔄 Notificación actualizada en el store:', notification.messageId)
      }
    }
  }
}

function markNotificationAsRead(notificationId) {
  const notification = notifications.value.find(n => n.messageId === notificationId)
  if (notification) {
    notification.status = 'read'
    // Forzar reactividad
    notifications.value = [...notifications.value]
    saveToStorage(notifications.value)
    debugLog('💾 Notificación marcada como leída y guardada:', notificationId)
  }
}

function setConnectionStatus(connected) {
  isConnected.value = connected
}

function setLatestNotification(notification) {
  latestNotification.value = notification
}

function clearLatestNotification() {
  latestNotification.value = null
}

function setInitialized(initialized) {
  isInitialized.value = initialized
}

// Función para limpiar notificaciones antiguas (más de 7 días)
function cleanOldNotifications() {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - APP_CONFIG.NOTIFICATIONS.CLEANUP_DAYS)
  
  const filtered = notifications.value.filter(notification => {
    const notificationDate = new Date(notification.createdAt || notification.timestamp)
    return notificationDate > cutoffDate
  })
  
  if (filtered.length !== notifications.value.length) {
    notifications.value = filtered
    saveToStorage(notifications.value)
    debugLog('🧹 Notificaciones antiguas limpiadas')
  }
}

// Función para marcar como leída (se sobrescribirá con la función real del composable)
let markAsReadFunction = null

function setMarkAsReadFunction(fn) {
  markAsReadFunction = fn
}

async function markAsRead(notificationId) {
  if (markAsReadFunction) {
    await markAsReadFunction(notificationId)
  } else {
    // Fallback: solo actualizar estado local
    markNotificationAsRead(notificationId)
  }
}

// Exportar el store
export function useNotificationStore() {
  return {
    // Estado
    notifications,
    isConnected,
    latestNotification,
    isInitialized,
    
    // Getters
    unreadCount,
    
    // Acciones
    setNotifications,
    addNotification,
    markNotificationAsRead,
    markAsRead,
    setMarkAsReadFunction,
    setConnectionStatus,
    setLatestNotification,
    clearLatestNotification,
    setInitialized,
    cleanOldNotifications
  }
}
