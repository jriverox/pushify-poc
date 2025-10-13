// ============================================
// web-app/src/main.js
// Punto de entrada de la aplicación Vue
// ============================================

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './style.css';

createApp(App).use(router).mount('#app');
