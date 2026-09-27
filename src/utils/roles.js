// Roles del sistema definidos en el avance: usuario, entrenador y administrador.
const ROLES = Object.freeze({
  USUARIO: 'usuario',
  ENTRENADOR: 'entrenador',
  ADMIN: 'admin',
});

const ALL_ROLES = Object.values(ROLES);

module.exports = { ROLES, ALL_ROLES };
