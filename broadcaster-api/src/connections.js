// ============================================
// Gestor de conexiones SSE activas
// ============================================

/**
 * MAPS DE CONEXIONES
 * 
 * Mantiene registro de usuarios conectados para poder
 * enviarles notificaciones en tiempo real.
 * 
 * Estructura:
 * - users: Map<userId, Response>
 * - groups: Map<groupId, Response[]>
 */

class ConnectionManager {
  constructor() {
    // Map de usuarios individuales
    // Key: userId, Value: Response object de Express
    this.users = new Map();
    
    // Map de grupos
    // Key: groupId, Value: Array de Response objects
    this.groups = new Map();
    
    console.log('[CONNECTIONS] Manager iniciado');
  }

  // ============================================
  // Registrar conexión de usuario
  // ============================================
  addUserConnection(userId, response) {
    this.users.set(userId, response);
    console.log(`[CONNECTIONS] ✅ Usuario ${userId} conectado. Total: ${this.users.size}`);
  }

  // ============================================
  // Registrar usuario en grupo
  // ============================================
  addUserToGroup(groupId, response) {
    if (!this.groups.has(groupId)) {
      this.groups.set(groupId, []);
    }
    this.groups.get(groupId).push(response);
    console.log(`[CONNECTIONS] ✅ Usuario agregado a grupo ${groupId}`);
  }

  // ============================================
  // Remover conexión de usuario
  // ============================================
  removeUserConnection(userId) {
    const existed = this.users.delete(userId);
    if (existed) {
      console.log(`[CONNECTIONS] ❌ Usuario ${userId} desconectado. Total: ${this.users.size}`);
    }
  }

  // ============================================
  // Remover usuario de grupo
  // ============================================
  removeUserFromGroup(groupId, response) {
    if (this.groups.has(groupId)) {
      const connections = this.groups.get(groupId);
      const index = connections.indexOf(response);
      if (index > -1) {
        connections.splice(index, 1);
      }
      
      // Si el grupo queda vacío, eliminarlo
      if (connections.length === 0) {
        this.groups.delete(groupId);
      }
    }
  }

  // ============================================
  // Obtener conexión de usuario
  // ============================================
  getUserConnection(userId) {
    return this.users.get(userId);
  }

  // ============================================
  // Obtener conexiones de grupo
  // ============================================
  getGroupConnections(groupId) {
    return this.groups.get(groupId) || [];
  }

  // ============================================
  // Contar conexiones activas
  // ============================================
  getConnectionCount() {
    return {
      users: this.users.size,
      groups: this.groups.size
    };
  }

  // ============================================
  // Limpiar conexión muerta
  // ============================================
  cleanupConnection(userId, response) {
    this.removeUserConnection(userId);
    
    // Remover de todos los grupos
    for (const [groupId, connections] of this.groups.entries()) {
      this.removeUserFromGroup(groupId, response);
    }
  }
}

// Singleton - una sola instancia compartida
const connectionManager = new ConnectionManager();

module.exports = connectionManager;
