# 🔔 Pushify - Sistema de Notificaciones Push en Tiempo Real

> **Proof of Concept (PoC)** - Sistema escalable de notificaciones push diseñado para arquitecturas cloud-native con entrega garantizada y tiempo real.

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Arquitectura](#-arquitectura)
- [Componentes Principales](#-componentes-principales)
- [Flujos de Trabajo](#-flujos-de-trabajo)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Reference](#-api-reference)
- [Diagramas](#-diagramas)

---

## 🎯 Descripción

**Pushify** es un sistema de notificaciones push en tiempo real diseñado para aplicaciones modernas que requieren comunicación instantánea con sus usuarios. El sistema garantiza la entrega de notificaciones mediante una arquitectura distribuida basada en microservicios.

### Características principales

- ✅ **Notificaciones en tiempo real** mediante Server-Sent Events (SSE)
- 📦 **Persistencia garantizada** con Firestore
- 🔄 **Recuperación de mensajes perdidos** para usuarios offline
- 🎯 **Envío individual y broadcast** a múltiples usuarios
- 📊 **Estados de notificación** (pending, delivered, read)
- 🚀 **Arquitectura escalable** con Google Cloud Run
- 🔗 **Pub/Sub** para desacoplamiento entre componentes
- 💾 **Almacenamiento histórico** de notificaciones

### Casos de uso

- 📬 Sistemas de mensajería en tiempo real
- 🚨 Alertas y notificaciones críticas
- 📢 Anuncios y comunicados corporativos
- 📊 Actualizaciones de estado de procesos
- 🔔 Recordatorios y notificaciones programadas

---

## 🏗️ Arquitectura

Pushify utiliza una arquitectura de microservicios distribuida basada en Google Cloud Platform:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PUSHIFY ECOSYSTEM                            │
│                                                                     │
│  ┌──────────────┐                                                  │
│  │External      │                                                  │
│  │System        │                                                  │
│  │(Sender)      │                                                  │
│  └──────┬───────┘                                                  │
│         │                                                           │
│         │ POST /notifications                                      │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                     PUSHIFY API                             │  │
│  │                   (Cloud Run + Node.js)                     │  │
│  │                                                             │  │
│  │  • Recibe notificaciones                                    │  │
│  │  • Valida y almacena en Firestore                          │  │
│  │  • Publica en Pub/Sub topic                                │  │
│  │  • Gestiona estados (read/pending)                         │  │
│  └──────────────────┬──────────────────┬───────────────────────┘  │
│                     │                  │                           │
│                     │                  │                           │
│         ┌───────────▼──────────┐      │                           │
│         │   PushifyDB          │      │                           │
│         │   (Firestore)        │      │                           │
│         │                      │      │                           │
│         │ • usuarios/{uid}/    │      │                           │
│         │   notificaciones/    │      │                           │
│         │   {notifId}          │      │                           │
│         └──────────────────────┘      │                           │
│                                        │                           │
│                          ┌─────────────▼──────────────┐            │
│                          │  Pub/Sub Topic             │            │
│                          │  /pubsub-handler           │            │
│                          │                            │            │
│                          │  • Desacopla componentes   │            │
│                          │  • Garantiza entrega       │            │
│                          └──────────────┬─────────────┘            │
│                                         │                          │
│                                         │ subscribe                │
│                                         │                          │
│                                         ▼                          │
│                          ┌────────────────────────────────────┐   │
│                          │     BROADCASTER API                │   │
│                          │   (Cloud Run + Node.js)            │   │
│                          │                                    │   │
│                          │  • Mantiene conexiones SSE         │   │
│                          │  • Escucha Pub/Sub                 │   │
│                          │  • Envía notificaciones en RT      │   │
│                          └──────────────┬─────────────────────┘   │
│                                         │                          │
│                                         │ SSE Stream               │
│                                         │                          │
│                                         ▼                          │
│                          ┌────────────────────────────────────┐   │
│                          │        WEB APP                     │   │
│                          │      (Vue 3 + Vite)                │   │
│                          │                                    │   │
│                          │  • Interfaz de usuario             │   │
│                          │  • Recibe notificaciones RT        │   │
│                          │  • Gestiona estados                │   │
│                          └────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Flujo de datos

1. **Sistema externo** envía notificación → **Pushify API**
2. **Pushify API** guarda en **Firestore** y publica en **Pub/Sub**
3. **Broadcaster API** recibe mensaje de **Pub/Sub**
4. **Broadcaster** envía vía **SSE** a clientes conectados
5. **Web App** recibe y muestra notificación en tiempo real

---

## 📦 Componentes Principales

### 1. Pushify API (Node.js + Express + Cloud Run)

**Responsabilidades:**

- Recibir solicitudes de envío de notificaciones
- Validar y persistir notificaciones en Firestore
- Publicar eventos en Pub/Sub para procesamiento asíncrono
- Gestionar estados de notificaciones (pending → delivered → read)
- Proporcionar endpoints para consultar notificaciones

**Endpoints principales:**

```
POST   /notifications              # Crear notificación
GET    /notifications?userId=X     # Obtener notificaciones por usuario
PATCH  /notifications/:id/read     # Marcar como leída
```

**Estructura de notificación:**

```json
{
  "messageId": "uuid",
  "notification": {
    "type": "info|alert|warning|error|success",
    "priority": "urgent|high|normal|low",
    "title": "Título",
    "content": "Contenido del mensaje",
    "category": "message|alert|system"
  },
  "sender": {
    "id": "sender-id",
    "name": "Nombre del remitente"
  },
  "recipient": {
    "type": "individual|broadcast",
    "id": "user-id"
  },
  "status": "pending|delivered|read",
  "createdAt": "2025-10-05T10:30:00Z"
}
```

### 2. Broadcaster API (Node.js + Express + Cloud Run)

**Responsabilidades:**

- Mantener conexiones SSE activas con clientes
- Suscribirse a Pub/Sub para recibir notificaciones
- Enrutar notificaciones a los usuarios correspondientes
- Gestionar conexiones y desconexiones de clientes

**Endpoint SSE:**

```
GET /notifications/stream/:userId
```

**Formato de mensajes SSE:**

```
data: {"messageId":"123","notification":{...},"sender":{...}}

data: {"messageId":"124","notification":{...},"sender":{...}}
```

### 3. PushifyDB (Firestore)

**Estructura de colecciones:**

```
usuarios/
  └── {userId}/
      └── notificaciones/
          └── {notificationId}/
              ├── messageId: string
              ├── notification: object
              ├── sender: object
              ├── recipient: object
              ├── status: string
              └── createdAt: timestamp
```

**Índices necesarios:**

- `userId` + `status` (para recuperar pendientes)
- `createdAt` (para ordenamiento)

### 4. Pub/Sub Topic

**Topic:** `/pubsub-handler`

**Función:**

- Desacoplar Pushify API del Broadcaster API
- Permitir escalado independiente de componentes
- Garantizar entrega de mensajes (retry automático)
- Facilitar adición de nuevos suscriptores

### 5. Web App (Vue 3 + Vite)

**Características:**

- Interfaz moderna y reactiva
- Conexión SSE para tiempo real
- Recuperación de mensajes pendientes al iniciar
- Sistema de toasts para nuevas notificaciones
- Gestión de estados visuales (leída/sin leer)

**Componentes:**

```
src/
├── App.vue                      # Componente raíz
├── components/
│   ├── NotificationList.vue     # Lista de notificaciones
│   └── NotificationToast.vue    # Toast flotante
└── composables/
    └── useNotifications.js      # Lógica de notificaciones
```

---

## 🔄 Flujos de Trabajo

### Flujo 1: Envío de Notificación en Tiempo Real

```
┌──────────────┐
│External      │
│System        │
└──────┬───────┘
       │
       │ 1. POST /notifications
       │    {notification, sender, recipient}
       │
       ▼
┌──────────────────┐
│  Pushify API     │
│                  │
│ 2. Crear doc     │
│    en Firestore  │
│                  │
│ 3. Publicar en   │
│    Pub/Sub       │
└──────┬───────────┘
       │
       │ 4. Message published
       │
       ▼
┌──────────────────┐
│  Pub/Sub Topic   │
│  /pubsub-handler │
└──────┬───────────┘
       │
       │ 5. Pull subscription
       │
       ▼
┌──────────────────┐
│ Broadcaster API  │
│                  │
│ 6. Enrutar a     │
│    userId        │
│                  │
│ 7. Enviar vía    │
│    SSE           │
└──────┬───────────┘
       │
       │ 8. data: {...}\n\n
       │
       ▼
┌──────────────────┐
│    Web App       │
│                  │
│ 9. Recibir       │
│    notificación  │
│                  │
│ 10. Mostrar      │
│     toast        │
└──────────────────┘
```

### Flujo 2: Recuperación de Notificaciones Pendientes

```
┌──────────────┐
│   Usuario    │
└──────┬───────┘
       │
       │ 1. Abre aplicación
       │
       ▼
┌──────────────────┐
│    Web App       │
│                  │
│ 2. onMounted()   │
│                  │
│ 3. GET /notif    │
│    ?userId=X     │
│    &status=      │
│    pending       │
└──────┬───────────┘
       │
       │ 4. Query Firestore
       │
       ▼
┌──────────────────┐
│  Pushify API     │
│                  │
│ 5. Buscar docs   │
│    where status  │
│    = pending     │
└──────┬───────────┘
       │
       │ 6. [notificaciones]
       │
       ▼
┌──────────────────┐
│  Firestore       │
└──────┬───────────┘
       │
       │ 7. http 200 [notificaciones]
       │
       ▼
┌──────────────────┐
│    Web App       │
│                  │
│ 8. Mostrar       │
│    notificaciones│
│    en lista      │
└──────────────────┘
```

### Flujo 3: Marcar Notificación como Leída

```
┌──────────────┐
│   Usuario    │
└──────┬───────┘
       │
       │ 1. Click en notificación
       │
       ▼
┌──────────────────┐
│    Web App       │
│                  │
│ 2. markAsRead(   │
│    notificationId│
│    )             │
│                  │
│ 3. PATCH /notif  │
│    /{id}/read    │
└──────┬───────────┘
       │
       │ 4. Update Firestore
       │
       ▼
┌──────────────────┐
│  Pushify API     │
│                  │
│ 5. Update doc    │
│    set read=true │
└──────┬───────────┘
       │
       │ 6. Update realizado
       │
       ▼
┌──────────────────┐
│  Firestore       │
└──────┬───────────┘
       │
       │ 7. http 204 (No Content)
       │
       ▼
┌──────────────────┐
│    Web App       │
│                  │
│ 8. Actualizar    │
│    UI local      │
│    (opacity 0.6) │
└──────────────────┘
```

---

## 🛠️ Tecnologías

### Backend

- **Node.js** v18+ - Runtime de JavaScript
- **Express** - Framework web
- **Firestore** - Base de datos NoSQL
- **Pub/Sub** - Sistema de mensajería
- **Cloud Run** - Serverless containers

### Frontend

- **Vue 3** - Framework progresivo de JavaScript
- **Vite** - Build tool y dev server
- **Server-Sent Events (SSE)** - Comunicación en tiempo real

### DevOps

- **Docker** - Containerización
- **Google Cloud Platform** - Infraestructura cloud
- **Cloud Build** - CI/CD

---

## 📥 Instalación

### Prerrequisitos

- Node.js v18 o superior
- npm o yarn
- Cuenta de Google Cloud Platform
- gcloud CLI instalado

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/pushify.git
cd pushify
```

### 2. Instalar dependencias

#### Backend (Pushify API)

```bash
cd pushify-api
npm install
```

#### Backend (Broadcaster API)

```bash
cd ../broadcaster-api
npm install
```

#### Frontend (Web App)

```bash
cd ../web-app
npm install
```

---

## ⚙️ Configuración

### 1. Google Cloud Platform

#### Crear proyecto GCP

```bash
gcloud projects create pushify-poc --name="Pushify PoC"
gcloud config set project pushify-poc
```

#### Habilitar APIs necesarias

```bash
gcloud services enable firestore.googleapis.com
gcloud services enable pubsub.googleapis.com
gcloud services enable run.googleapis.com
```

#### Crear base de datos Firestore

```bash
gcloud firestore databases create --location=us-central1
```

#### Crear topic de Pub/Sub

```bash
gcloud pubsub topics create pubsub-handler
```

#### Crear suscripción push para Broadcaster

```bash
gcloud pubsub subscriptions create broadcaster-subscription \
  --topic=pubsub-handler \
  --push-endpoint=https://broadcaster-api-url.run.app/pubsub/notifications
```

### 2. Configurar variables de entorno

#### Pushify API (.env)

```env
PORT=8080
GOOGLE_CLOUD_PROJECT=pushify-poc
FIRESTORE_COLLECTION=usuarios
PUBSUB_TOPIC=pubsub-handler
```

#### Broadcaster API (.env)

```env
PORT=8081
GOOGLE_CLOUD_PROJECT=pushify-poc
PUBSUB_SUBSCRIPTION=broadcaster-subscription
```

#### Web App (.env)

```env
VITE_API_URL=http://localhost:8080
VITE_BROADCASTER_URL=http://localhost:8081
```

### 3. Autenticación local

```bash
gcloud auth application-default login
```

---

## 🚀 Uso

### Desarrollo local

#### 1. Iniciar Pushify API

```bash
cd pushify-api
npm run dev
# Servidor corriendo en http://localhost:8080
```

#### 2. Iniciar Broadcaster API

```bash
cd broadcaster-api
npm run dev
# Servidor corriendo en http://localhost:8081
```

#### 3. Iniciar Web App

```bash
cd web-app
npm run dev
# App corriendo en http://localhost:5173
```

### Enviar notificación de prueba

```bash
curl -X POST http://localhost:8080/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "notification": {
      "type": "info",
      "priority": "normal",
      "title": "¡Bienvenido a Pushify!",
      "content": "Tu sistema de notificaciones está funcionando correctamente",
      "category": "message"
    },
    "sender": {
      "id": "system",
      "name": "Sistema Pushify"
    },
    "recipient": {
      "type": "individual",
      "id": "user123"
    }
  }'
```

### Deploy a producción

#### 1. Build y deploy Pushify API

```bash
cd pushify-api
gcloud run deploy pushify-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### 2. Build y deploy Broadcaster API

```bash
cd broadcaster-api
gcloud run deploy broadcaster-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### 3. Build y deploy Web App

```bash
cd web-app
npm run build
# Subir carpeta dist/ a tu hosting preferido
```

---

## 📚 API Reference

### Pushify API

#### POST /notifications

Crear una nueva notificación.

**Request Body:**

```json
{
  "notification": {
    "type": "info",
    "priority": "normal",
    "title": "Título",
    "content": "Contenido",
    "category": "message"
  },
  "sender": {
    "id": "sender-id",
    "name": "Sender Name"
  },
  "recipient": {
    "type": "individual",
    "id": "user-id"
  }
}
```

**Response:** `202 Accepted`

```json
{
  "messageId": "abc123",
  "status": "accepted"
}
```

#### GET /notifications?userId={userId}&status={status}

Obtener notificaciones de un usuario.

**Query Parameters:**

- `userId` (required): ID del usuario
- `status` (optional): pending | delivered | read

**Response:** `200 OK`

```json
[
  {
    "messageId": "abc123",
    "notification": {...},
    "sender": {...},
    "recipient": {...},
    "status": "pending",
    "createdAt": "2025-10-05T10:30:00Z"
  }
]
```

#### PATCH /notifications/{id}/read

Marcar notificación como leída.

**Response:** `204 No Content`

### Broadcaster API

#### GET /notifications/stream/{userId}

Establecer conexión SSE para recibir notificaciones en tiempo real.

**Headers:**

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Response:** Stream de eventos

```
data: {"messageId":"123",...}

data: {"messageId":"124",...}
```

---

## 📊 Diagramas

Los diagramas de secuencia y arquitectura se encuentran en la carpeta `/docs`:

1. **Arquitectura del ecosistema** - Vista general del sistema
2. **Flujo de envío de notificaciones** - Secuencia de envío en tiempo real
3. **Flujo de recuperación** - Inicialización y carga de pendientes
4. **Flujo de marcar como leída** - Actualización de estado

---

## 🧪 Testing

### Pruebas unitarias

```bash
npm test
```

### Pruebas de integración

```bash
npm run test:integration
```

### Pruebas de carga

```bash
# Usando Apache Bench
ab -n 1000 -c 10 -p notification.json \
  -T application/json \
  http://localhost:8080/notifications
```

---

## 📈 Monitoreo

### Logs en Cloud Run

```bash
gcloud run services logs read pushify-api --limit=50
gcloud run services logs read broadcaster-api --limit=50
```

### Métricas en consola

- Visitar: https://console.cloud.google.com/run
- Seleccionar servicio
- Ver pestaña "Metrics"

---

## 🔐 Seguridad

### Recomendaciones para producción

1. **Autenticación**: Implementar JWT o OAuth2
2. **CORS**: Configurar orígenes permitidos
3. **Rate limiting**: Limitar requests por IP
4. **Validación**: Sanitizar todos los inputs
5. **HTTPS**: Usar siempre en producción
6. **Secrets**: Usar Secret Manager de GCP

---

## 🚧 Roadmap

- [ ] Autenticación con Firebase Auth
- [ ] Notificaciones programadas
- [ ] Sistema de plantillas
- [ ] Dashboard de analytics
- [ ] SDK para múltiples lenguajes
- [ ] Soporte para push notifications nativas
- [ ] Webhooks para eventos
- [ ] Sistema de prioridades avanzado

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es un **Proof of Concept (PoC)** para fines educativos y de demostración.

---

## 👥 Autores

- **Tu Nombre** - Jhony Rivero

---

## 🙏 Agradecimientos

- Google Cloud Platform por la infraestructura
- Comunidad de Vue.js
- Comunidad de Node.js

**Pushify** - Sistema de notificaciones push en tiempo real 🚀

_Construido con ❤️ usando Node.js, Vue 3 y Google Cloud Platform_
