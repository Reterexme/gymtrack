const app = require('./app');
const config = require('./config');
const { seedAdmin } = require('./seed');

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('JWT_SECRET es obligatorio en producción.');
  process.exit(1);
}

seedAdmin().then(() => {
  app.listen(config.port, () => console.log(`GymTrack escuchando en el puerto ${config.port}`));
});
