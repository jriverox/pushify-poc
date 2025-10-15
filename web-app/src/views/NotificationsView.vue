<template>
  <div class="notifications-view">
    <div class="header">
      <button @click="goBack" class="btn-back">
        ←
      </button>
      <h1>Notificaciones</h1>
    </div>
    <NotificationList 
      :notifications="notifications" 
      @mark-read="markAsRead" 
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notifications'
import NotificationList from '../components/NotificationList.vue'

// Router para navegación
const router = useRouter()

// Solo usar el store global (las notificaciones ya están inicializadas en App.vue)
const { notifications, markAsRead } = useNotificationStore()

// Función para volver a la página principal
const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.notifications-view {
  max-width: 900px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: var(--bg-primary);
  padding: 1.25rem 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.btn-back {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.125rem;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
}

.btn-back:hover {
  background: var(--bg-tertiary);
  border-color: var(--text-tertiary);
  transform: translateX(-2px);
}

.btn-back:active {
  transform: translateX(0);
}

h1 {
  margin: 0;
  color: var(--text-primary);
  flex: 1;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.5px;
}
</style>
