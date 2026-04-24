# Seguridad

## Estado actual

- Backend con Node.js.
- Base de datos SQLite.
- Contraseñas hasheadas con PBKDF2 y sal individual.
- Sesiones con token aleatorio de 32 bytes.
- Separación de estado por usuario.
- Exportación de respaldo por usuario autenticado.

## Limitaciones conocidas

- No hay recuperación por email real.
- No hay 2FA.
- No hay rate limiting.
- No hay cifrado de contenido a nivel de campo.
- No hay sistema automatizado de backups remotos.

## Antes de producción

- Ejecutar tras HTTPS.
- Añadir rate limiting.
- Añadir recuperación de contraseña.
- Añadir logs de auditoría mínimos.
- Definir política de backups.
- Revisar cumplimiento legal según jurisdicción.

