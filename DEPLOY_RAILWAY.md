# Publicar DoctoralOS en Railway

Esta v1 necesita Node.js y almacenamiento persistente porque usa SQLite para cuentas, sesiones y sincronizacion.

## Preparacion

El proyecto ya incluye:

- railway.json: comando de arranque y healthcheck.
- .nvmrc: Node 24.
- .railwayignore: evita subir base de datos local y archivos innecesarios.
- server.js: usa DATA_DIR o RAILWAY_VOLUME_MOUNT_PATH para guardar SQLite en un volumen persistente.

## Pasos

1. Sube el proyecto a GitHub.
2. En Railway, crea New Project.
3. Elige Deploy from GitHub Repo.
4. Selecciona el repositorio de DoctoralOS.
5. En variables, anade NODE_ENV=production.
6. La beta cerrada se activa en producción. Para dejar entrar a testers, usa BETA_INVITE_CODE o BETA_ALLOWED_EMAILS con correos separados por comas.
7. Para activar IA real en el asistente, anade OPENAI_API_KEY.
8. Opcional: fija OPENAI_MODEL=gpt-5.4-mini o el modelo que prefieras.
9. Para activar recuperación de contraseña por email, anade:
   - RESEND_API_KEY
   - EMAIL_FROM
10. Opcionalmente, añade tambien:
   - EMAIL_REPLY_TO
   - EMAIL_SENDER_NAME
   - PASSWORD_RESET_DELIVERY=email
11. Crea un volumen persistente para el servicio.
12. Monta el volumen en /app/data.
13. Espera al despliegue y abre la URL publica.

## Comprobacion

1. Abre /api/health y confirma que responde {"ok":true,"storage":"sqlite"}.
2. Crea una cuenta.
3. Crea un capitulo y una tarea.
4. Cierra sesion y vuelve a entrar.
5. Prueba `He olvidado mi contraseña`.
6. Comprueba que los datos siguen guardados despues de redeplegar.

## Importante

Sin volumen persistente, SQLite se perdera al reiniciar o redeplegar el servicio.
