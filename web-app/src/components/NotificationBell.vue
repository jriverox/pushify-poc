<template>
  <div class="notification-bell" @click="goToNotifications">
    <div class="bell-icon">
      🔔
    </div>
    <div v-if="unreadCount > 0" class="notification-badge">
      {{ unreadCount }}
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notifications'

const router = useRouter()
const { unreadCount } = useNotificationStore()

const goToNotifications = () => {
  router.push('/notifications')
}
</script>

<style scoped>
.notification-bell {
  position: relative;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: transparent;
}

.notification-bell:hover {
  background: var(--bg-secondary);
}

.bell-icon {
  font-size: 1.5rem;
  line-height: 1;
  filter: grayscale(20%);
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: linear-gradient(135deg, var(--secondary-color) 0%, #FF6B6B 100%);
  color: white;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 0 0.25rem;
  box-shadow: 0 2px 4px rgba(255, 59, 48, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
