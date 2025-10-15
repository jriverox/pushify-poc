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
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.notification-list h2 {
  margin: 0 0 1.25rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  padding: 0 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-tertiary);
  font-size: 1rem;
}

.empty-state p {
  margin: 0;
}

.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

.notification-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: transparent;
  transition: background 0.2s ease;
}

.notification-item:hover {
  box-shadow: var(--shadow-sm);
  border-color: var(--text-tertiary);
  transform: translateY(-1px);
}

.notification-item.read {
  opacity: 0.65;
  background: var(--bg-secondary);
}

.notification-item.priority-urgent::before {
  background: var(--secondary-color);
}

.notification-item.priority-high::before {
  background: var(--warning-color);
}

.notification-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.notification-header h3 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  white-space: nowrap;
  font-weight: 500;
}

.notification-text {
  margin: 0.5rem 0 0.875rem 0;
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 0.875rem;
}

.notification-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: capitalize;
}

.badge.priority {
  background: #E3F2FD;
  color: var(--info-color);
}

.badge.category {
  background: #F3E5F5;
  color: #9C27B0;
}

.badge.sender {
  background: #E8F5E9;
  color: var(--success-color);
}

.notification-status {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.read {
  background: #E8F5E9;
  color: var(--success-color);
}

.status-badge.unread {
  background: #FFF3E0;
  color: var(--warning-color);
}
</style>
