# Deployment

## Desarrollo local

```bash
node server.js
```

Abrir:

- Landing: `http://127.0.0.1:4173/`
- App: `http://127.0.0.1:4173/app`

## Variables

- `PORT`: puerto del servidor.
- `HOST`: host de escucha.
- `DATA_DIR`: carpeta donde se guarda SQLite.

## Produccion minima

1. Ejecutar detras de HTTPS.
2. Configurar `DATA_DIR` en volumen persistente.
3. Activar backups periodicos del archivo SQLite.
4. Ejecutar pruebas antes de desplegar.
5. Servir desde un dominio propio.

## Comando de prueba

```bash
node tests/backend.test.js
```
