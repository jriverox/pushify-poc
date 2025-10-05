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
  top: 20px;
  right: 20px;
  display: flex;
  gap: 1rem;
  align-items: center;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  max-width: 400px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast.type-error {
  border-left: 4px solid #f44336;
}

.toast.type-success {
  border-left: 4px solid #4caf50;
}

.toast.type-warning, .toast.type-alert {
  border-left: 4px solid #ff9800;
}

.toast.type-info {
  border-left: 4px solid #2196f3;
}

.toast-icon {
  font-size: 2rem;
}

.toast-content {
  flex: 1;
}

.toast-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #333;
}

.toast-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.toast-close:hover {
  background: #f5f5f5;
}
</style>
