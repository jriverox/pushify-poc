<!-- ============================================ -->
<!-- web-app/src/components/NotificationList.vue   -->
<!-- Lista de notificaciones                       -->
<!-- ============================================ -->

<template>
  <div class="notification-list">
    <h2>Notificaciones</h2>
    
    <div v-if="notifications.length === 0" class="empty-state">
      <p>📭 No hay notificaciones</p>
    </div>

    <div 
      v-for="notification in notifications" 
      :key="notification.messageId"
      class="notification-item"
      :class="[
        notification.status,
        `priority-${notification.notification.priority}`,
        `type-${notification.notification.type}`
      ]"
      @click="$emit('mark-read', notification.messageId)"
    >
      <div class="notification-icon">
        {{ getIcon(notification.notification.type) }}
      </div>
      
      <div class="notification-content">
        <div class="notification-header">
          <h3>{{ notification.notification.title }}</h3>
          <span class="notification-time">
            {{ formatTime(notification.createdAt) }}
          </span>
        </div>
        
        <p class="notification-text">
          {{ notification.notification.content }}
        </p>
        
        <div class="notification-meta">
          <span class="badge priority">
            {{ notification.notification.priority }}
          </span>
          <span class="badge category">
            {{ notification.notification.category }}
          </span>
          <span class="badge sender">
            De: {{ notification.sender.name }}
          </span>
        </div>
      </div>

      <div class="notification-status">
        <span v-if="notification.status === 'read'" class="status-badge read">
          ✓ Leída
        </span>
        <span v-else class="status-badge unread">
          Sin leer
        </span>
      </div>
    </div>
  </div>
  </template>

<script setup>
defineProps({
  notifications: {
    type: Array,
    default: () => []
  }
});

defineEmits(['mark-read']);

function getIcon(type) {
  const icons = {
    info: 'ℹ️',
    alert: '⚠️',
    warning: '⚡',
    error: '❌',
    success: '✅',
    text: '💬'
  };
  return icons[type] || '📌';
}

function formatTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} h`;
  return date.toLocaleDateString();
}
</script>

<style scoped>
.notification-list {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.notification-list h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
  font-size: 1.1rem;
}

.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.notification-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.notification-item.read {
  opacity: 0.6;
  background: #f9f9f9;
}

.notification-item.priority-urgent {
  border-left: 4px solid #f44336;
}

.notification-item.priority-high {
  border-left: 4px solid #ff9800;
}

.notification-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.notification-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.notification-time {
  font-size: 0.85rem;
  color: #999;
}

.notification-text {
  margin: 0.5rem 0 1rem 0;
  color: #666;
  line-height: 1.5;
}

.notification-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge.priority {
  background: #e3f2fd;
  color: #1976d2;
}

.badge.category {
  background: #f3e5f5;
  color: #7b1fa2;
}

.badge.sender {
  background: #e8f5e9;
  color: #388e3c;
}

.notification-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.read {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.unread {
  background: #fff3e0;
  color: #e65100;
}
</style>
