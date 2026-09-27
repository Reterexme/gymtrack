const express = require('express');
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Limita intentos para frenar ataques de fuerza bruta.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT) || 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta más tarde.' },
});

router.post('/register', limiter, ctrl.register);
router.post('/login', limiter, ctrl.login);
router.get('/me', authenticate, ctrl.me);

module.exports = router;
