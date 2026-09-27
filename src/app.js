// Aplicación Express de GymTrack (arquitectura monolítica).
const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const routineRoutes = require('./routes/routineRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use(
  helmet({
    // Política CSP explícita, sin comodines (corrige la alerta "CSP: Wildcard Directive" de ZAP).
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: true,
  }),
);
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (req, res) => res.json({ estado: 'ok', servicio: 'gymtrack' }));
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/rutinas', routineRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
