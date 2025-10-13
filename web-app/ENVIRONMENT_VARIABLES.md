# Variables de Entorno - Frontend

## Configuración Requerida

### Variables de Entorno del Frontend

Crea un archivo `.env` en la carpeta `web-app/` con las siguientes variables:

```env
# URLs de los servicios backend
VITE_API_URL=http://localhost:8080
VITE_BROADCASTER_URL=http://localhost:8081
VITE_WEB_APP_URL=http://localhost:5173

# Base URL para rutas de la aplicación
BASE_URL=/

# Configuración de desarrollo
NODE_ENV=development
```

## Configuración Centralizada

Todas las variables de entorno están centralizadas en `src/utils/environments.js`:

### API_CONFIG
- `PUSHIFY_API_URL`: URL del servicio principal de notificaciones
- `BROADCASTER_API_URL`: URL del servicio de conexiones SSE
- `WEB_APP_URL`: URL de la aplicación frontend
- `BASE_URL`: Base URL para rutas

### ENDPOINTS
- `NOTIFICATIONS.CREATE`: Endpoint para crear notificaciones
- `NOTIFICATIONS.GET_BY_USER`: Endpoint para obtener notificaciones por usuario
- `NOTIFICATIONS.MARK_AS_READ`: Endpoint para marcar notificación como leída
- `SSE.STREAM`: Endpoint para conexión SSE

### APP_CONFIG
- `DEFAULT_USER_ID`: Usuario por defecto para pruebas
- `NOTIFICATIONS.TOAST_DURATION`: Duración del toast (ms)
- `NOTIFICATIONS.CLEANUP_DAYS`: Días para limpiar notificaciones antiguas
- `SSE.RECONNECT_DELAY`: Tiempo de reconexión SSE (ms)

### DEV_CONFIG
- `DEBUG`: Habilitar logs de debug
- `LOG_SSE`: Mostrar logs de conexión SSE
- `LOG_NOTIFICATIONS`: Mostrar logs de notificaciones

## Uso

```javascript
import { API_CONFIG, ENDPOINTS, APP_CONFIG } from './utils/environments';

// Usar configuración
const apiUrl = API_CONFIG.PUSHIFY_API_URL;
const endpoint = ENDPOINTS.NOTIFICATIONS.CREATE;
const userId = APP_CONFIG.DEFAULT_USER_ID;
```
