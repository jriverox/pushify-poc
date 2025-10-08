// ============================================
// Endpoint SSE para conexiones de clientes
// ============================================

const express = require('express');
const { streamHandler } = require('../controllers/stream.controller');

const router = express.Router();

// ============================================
// GET /notifications/stream/:userId
// Establece conexión SSE con el cliente
// ============================================
router.get('/:userId', streamHandler);

module.exports = router;
