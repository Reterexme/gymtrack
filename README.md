# GymTrack – Módulo de usuarios, autenticación y rutinas

Sistema web para gestión y seguimiento de entrenamientos (Ingeniería de Software, entrega final).

## Qué incluye
- **Registro e inicio de sesión** con contraseñas cifradas (bcrypt) y **JWT**.
- **Roles**: `usuario`, `entrenador` y `admin`.
  - usuario: crea y ve sus rutinas.
  - entrenador: además asigna rutinas a usuarios.
  - admin: gestiona usuarios (listar, cambiar rol, eliminar) y ve/elimina cualquier rutina.
- Seguridad: cabeceras con Helmet y CSP estricta, límite de intentos de login, validación de datos, errores sin detalles internos.
- **Pruebas** con Jest (cobertura mínima 80 % obligatoria).
- **Pipeline CI/CD** en `.github/workflows/ci-cd.yml`.

## Cómo ejecutarlo
```bash
npm install
npm test          # pruebas + cobertura
npm run lint      # reglas de calidad SonarJS
ADMIN_EMAIL=admin@gym.com ADMIN_PASSWORD=Admin1234 JWT_SECRET=cambia-esto npm start
# abrir http://localhost:3000
```

## Endpoints
| Método | Ruta | Acceso |
|---|---|---|
| POST | /api/auth/register | Público |
| POST | /api/auth/login | Público |
| GET | /api/auth/me | Autenticado |
| GET | /api/usuarios | Admin |
| PATCH | /api/usuarios/:id/rol | Admin |
| DELETE | /api/usuarios/:id | Admin |
| POST / GET | /api/rutinas | Autenticado |
| GET | /api/rutinas/:id | Dueño o admin |
| DELETE | /api/rutinas/:id | Admin |

Especificación completa: `docs/openapi.yaml`.

## Pipeline CI/CD
1. **Pruebas y lint** → 2. **SonarQube** → 3. **Imagen Docker** (GHCR) → 4. **Despliegue a staging** (Render) con prueba de humo → 5. **OWASP ZAP**.

Configuración necesaria en GitHub (Settings → Secrets and variables → Actions):
- Secret `SONAR_TOKEN` (de sonarcloud.io) y, opcional, variable `SONAR_HOST_URL` si usan un SonarQube propio.
- Secret `RENDER_DEPLOY_HOOK_URL` (Render → servicio → Settings → Deploy Hook).
- Variable `STAGING_URL` (por ejemplo `https://gymtrack-staging.onrender.com`).

## Correr OWASP ZAP localmente
```bash
AUTH_RATE_LIMIT=100000 npm start   # en otra terminal
export ZAP_AUTH_TOKEN=<token de /api/auth/login>
zap.sh -cmd -autorun .zap/zap-plan.yaml
```

## Reportes
Ver `reports/RESUMEN-REPORTES.md`.

## Nota
El almacenamiento es en memoria (entorno de prueba). La capa `src/models` está aislada para cambiarla por una base de datos sin tocar controladores ni rutas.
