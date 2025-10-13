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
  display: inline-block;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.notification-bell:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.bell-icon {
  font-size: 24px;
  line-height: 1;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ff4444;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  transform: translate(25%, -25%);
}
</style>
