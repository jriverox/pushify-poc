const sseConnectionManager = require("../sse-connection-manager");
const mongoService = require("../services/mongodb");

const subscriptionHandler = async (req, res) => {
  try {
    // Pub/Sub envía los mensajes en este formato
    const { message } = req.body;

    if (!message || !message.data) {
      console.log("[PUBSUB] Mensaje inválido recibido");
      return res.status(400).json({ error: "Invalid message format" });
    }

    // Decodificar mensaje (viene en base64)
    const messageData = JSON.parse(
      Buffer.from(message.data, "base64").toString("utf-8")
    );

    const { messageId, recipient, notification, sender } = messageData;

    console.log(
      `[PUBSUB] 📨 Mensaje recibido: ${messageId} para ${recipient.type}:${recipient.id}`
    );

    // ============================================
    // BUSCAR CONEXIONES ACTIVAS
    // ============================================
    let targetConnections = [];

    if (recipient.type === "individual") {
      // Notificación para usuario específico
      const connection = sseConnectionManager.getUserConnection(recipient.id);
      if (connection) {
        targetConnections.push(connection);
      }
    } else if (recipient.type === "group") {
      // Notificación para grupo
      targetConnections = sseConnectionManager.getGroupConnections(
        recipient.id
      );
    } else if (recipient.type === "broadcast") {
      // Broadcast a todos los usuarios conectados
      targetConnections = Array.from(sseConnectionManager.users.values());
    }

    // ============================================
    // ENVIAR NOTIFICACIÓN POR SSE
    // ============================================
    if (targetConnections.length > 0) {
      console.log(
        `[PUBSUB] ✅ Enviando a ${targetConnections.length} conexiones activas`
      );

      const currentNotification = await mongoService.getNotificationById(
        messageId
      );
      console.log(`[DEBUG] Notificación desde DB:`, {
        messageId,
        status: currentNotification?.status,
        createdAt: currentNotification?.createdAt,
        deliveredAt: currentNotification?.deliveredAt,
      });

      // Preparar payload SSE con el estado real de la base de datos (sin fallbacks)
      const sseData = JSON.stringify({
        messageId,
        notification,
        recipient,
        sender,
        status: currentNotification?.status,
        createdAt: currentNotification?.createdAt,
        deliveredAt: currentNotification?.deliveredAt,
        timestamp: new Date().toISOString(),
      });

      console.log(`[DEBUG] Payload SSE enviado:`, {
        messageId,
        status: currentNotification?.status,
        createdAt: currentNotification?.createdAt,
        deliveredAt: currentNotification?.deliveredAt,
      });

      // Enviar a cada conexión
      let sentCount = 0;
      for (const connection of targetConnections) {
        try {
          connection.write("event: notification\n");
          connection.write(`data: ${sseData}\n`);
          connection.write(`id: ${messageId}\n\n`);
          sentCount++;
        } catch (error) {
          console.error(`[PUBSUB] Error enviando a conexión:`, error);
          // La conexión está muerta, se limpiará en el próximo heartbeat
        }
      }

      console.log(`[PUBSUB] ✅ Enviado exitosamente a ${sentCount} conexiones`);

      // Actualizar estado en MongoDB
      await mongoService.markAsDelivered(messageId);
      console.log(
        `[PUBSUB] ✅ Notificación ${messageId} marcada como entregada`
      );
    } else {
      console.log(
        `[PUBSUB] ⚠️  No hay conexiones activas para ${recipient.type}:${recipient.id}`
      );
    }

    // ACK a Pub/Sub (siempre responder 200 para no reintentar)
    res.status(200).send("OK");
  } catch (error) {
    console.error("[PUBSUB ERROR]", error);
    // Aún así hacer ACK para no bloquear el topic
    res.status(200).send("ERROR");
  }
};

module.exports = {
  subscriptionHandler,
};
