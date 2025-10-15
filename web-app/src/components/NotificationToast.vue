<!-- ============================================ -->
<!-- web-app/src/components/NotificationToast.vue  -->
<!-- Toast para notificaciones nuevas              -->
<!-- ============================================ -->

<template>
  <div class="toast" :class="`type-${notification.notification.type}`">
    <div class="toast-icon">
      {{ getIcon(notification.notification.type) }}
    </div>
    <div class="toast-content">
      <h4>{{ notification.notification.title }}</h4>
      <p>{{ notification.notification.content }}</p>
    </div>
    <button class="toast-close" @click="$emit('close')">×</button>
  </div>
  </template>

<script setup>
defineProps({
  notification: {
    type: Object,
    required: true
  }
});

defineEmits(['close']);

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

// Auto-cerrar después de 5 segundos
setTimeout(() => {
  // El componente padre maneja el cierre
}, 5000);
</script>

<style scoped>
.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  display: flex;
  gap: 1rem;
  align-items: center;
  background: var(--bg-primary);
  padding: 1rem 1.25rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  max-width: 420px;
  z-index: 1000;
  animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
}

@keyframes slideIn {
  from {
    transform: translateX(120%) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

.toast.type-error {
  border-left: 4px solid var(--secondary-color);
  background: linear-gradient(to right, rgba(255, 59, 48, 0.05) 0%, var(--bg-primary) 20%);
}

.toast.type-success {
  border-left: 4px solid var(--success-color);
  background: linear-gradient(to right, rgba(52, 199, 89, 0.05) 0%, var(--bg-primary) 20%);
}

.toast.type-warning, .toast.type-alert {
  border-left: 4px solid var(--warning-color);
  background: linear-gradient(to right, rgba(255, 149, 0, 0.05) 0%, var(--bg-primary) 20%);
}

.toast.type-info {
  border-left: 4px solid var(--info-color);
  background: linear-gradient(to right, rgba(0, 122, 255, 0.05) 0%, var(--bg-primary) 20%);
}

.toast-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.toast-content p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.toast-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-tertiary);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toast-close:hover {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.toast-close:active {
  transform: scale(0.95);
}

/* Animación de salida */
@keyframes slideOut {
  from {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateX(120%) scale(0.9);
    opacity: 0;
  }
}
</style>
