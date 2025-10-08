const express = require('express');
const router = express.Router();
const {
  subscriptionHandler,
} = require('../controllers/subscription.controller');

// ============================================
// POST /subscription/subscription-handler
// Recibe mensajes push de Pub/Sub
// ============================================
router.post('/subscription-handler', subscriptionHandler);

module.exports = router;
