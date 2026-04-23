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
6. Para activar IA real en el asistente, anade OPENAI_API_KEY.
7. Opcional: fija OPENAI_MODEL=gpt-5.4-mini o el modelo que prefieras.
8. Crea un volumen persistente para el servicio.
9. Monta el volumen en /app/data.
10. Espera al despliegue y abre la URL publica.

## Comprobacion

1. Abre /api/health y confirma que responde {"ok":true,"storage":"sqlite"}.
2. Crea una cuenta.
3. Crea un capitulo y una tarea.
4. Cierra sesion y vuelve a entrar.
5. Comprueba que los datos siguen guardados despues de redeplegar.

## Importante

Sin volumen persistente, SQLite se perdera al reiniciar o redeplegar el servicio.
