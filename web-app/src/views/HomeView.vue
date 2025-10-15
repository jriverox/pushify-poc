<template>
  <div class="home-view">
    <div class="welcome-card">
      <div class="icon-container">
        <span class="bell-icon">🔔</span>
      </div>
      <h2>Bienvenido a Pushify</h2>
      <p>Sistema de notificaciones en tiempo real</p>
      <div class="info-message">
        <span class="info-icon">ℹ️</span>
        <span>Haz clic en la campanita en el encabezado para ver tus notificaciones</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// Vista principal con mensaje de bienvenida
</script>

<style scoped>
.home-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.welcome-card {
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  padding: 3rem;
  text-align: center;
  box-shadow: var(--shadow-md);
  max-width: 500px;
  width: 100%;
}

.icon-container {
  margin-bottom: 1.5rem;
}

.bell-icon {
  font-size: 4rem;
  display: inline-block;
  animation: bellRing 2s ease-in-out infinite;
}

@keyframes bellRing {
  0%, 100% {
    transform: rotate(0deg);
  }
  10%, 30% {
    transform: rotate(-10deg);
  }
  20%, 40% {
    transform: rotate(10deg);
  }
  50% {
    transform: rotate(0deg);
  }
}

h2 {
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: -0.5px;
}

p {
  color: var(--text-secondary);
  font-size: 1.125rem;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.info-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #E3F2FD;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  color: var(--info-color);
  font-size: 0.875rem;
  line-height: 1.5;
  border: 1px solid #BBDEFB;
}

.info-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}
</style>
