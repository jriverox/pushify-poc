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
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.btn-back {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-back:hover {
  background-color: #5a6268;
}

.btn-back:active {
  background-color: #545b62;
}

h1 {
  margin: 0;
  color: #333;
  flex: 1;
}
</style>
