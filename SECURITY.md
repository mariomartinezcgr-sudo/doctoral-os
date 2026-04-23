# Seguridad

## Estado actual

- Backend local con Node.js.
- Base de datos SQLite.
- Contrasenas hasheadas con PBKDF2 y sal individual.
- Sesiones con token aleatorio de 32 bytes.
- Separacion de estado por usuario.
- Exportacion de respaldo por usuario autenticado.

## Limitaciones conocidas

- No hay recuperacion por email real.
- No hay 2FA.
- No hay rate limiting.
- No hay cifrado de contenido a nivel de campo.
- No hay sistema automatizado de backups remotos.

## Antes de produccion

- Ejecutar tras HTTPS.
- Anadir rate limiting.
- Anadir recuperacion de contrasena.
- Anadir logs de auditoria minimos.
- Definir politica de backups.
- Revisar cumplimiento legal segun jurisdiccion.
