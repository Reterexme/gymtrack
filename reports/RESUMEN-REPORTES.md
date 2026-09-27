# Resumen de reportes – GymTrack

## 1. Pruebas unitarias (Jest)
- 50 pruebas, 50 aprobadas (7 archivos: 5 unitarios, 3 de integración).
- Cobertura: **Líneas 100 % · Sentencias 100 % · Funciones 100 % · Ramas 96.47 %** (mínimo exigido 80 %).
- Archivos: `reports/jest-resultados.txt`, `reports/coverage/index.html` (abrir en navegador), `reports/coverage/lcov.info`.

## 2. Seguridad – OWASP ZAP 2.16.1 (escaneo pasivo + activo)
Plan: `.zap/zap-plan.yaml` (importa `docs/openapi.yaml`, spider, escaneo pasivo y activo con token JWT).

| Escaneo | Alta | Media | Baja | Informativa |
|---|---|---|---|---|
| Antes de corregir | 0 | 1 (CSP con comodines) | 0 | 3 (incluye contraseña en URL) |
| Después de corregir | 0 | 1 (Anti-CSRF, falso positivo justificado) | 0 | 2 |

- **No se detectó XSS ni inyección SQL** en ningún endpoint.
- Corregido: CSP con comodines (`https:`, `data:`) → política explícita sin comodines.
- Corregido: el formulario de login enviaba correo y contraseña por URL (GET) si el JavaScript no cargaba → `method="post"`.
- Falso positivo: Anti-CSRF. La API usa JWT en cabecera, no cookies, y solo acepta JSON (probado en `tests/integration/csrf.test.js`).
- Archivos: `reports/zap/zap-reporte-ANTES.html|json`, `reports/zap/zap-reporte-DESPUES.html|json`.

## 3. Calidad de código – reglas SonarJS (las mismas que usa SonarQube para JavaScript)
| Métrica | Antes | Después |
|---|---|---|
| Problemas (bugs, vulnerabilidades, code smells) | 11 | 0 |
| Vulnerabilidad ReDoS (regex del correo) | 1 | 0 |
| Código duplicado (jscpd) | 0 % | 0 % |
| Complejidad ciclomática máx. por función | 11 | 11 |
| Líneas de código (src + public / pruebas) | 407 / 436 | |
- Archivos: `reports/eslint-sonarjs-ANTES.txt|json`, `reports/eslint-sonarjs-DESPUES.txt|json`, `reports/jscpd/`.
- El análisis en el servidor de SonarQube/SonarCloud (deuda técnica, quality gate) corre en el job 2 del pipeline.
  Para activarlo: crear el proyecto en sonarcloud.io y guardar `SONAR_TOKEN` en los *secrets* del repositorio.

## 4. Dependencias – npm audit
- 0 vulnerabilidades conocidas. Archivo: `reports/npm-audit.json`.
