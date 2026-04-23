# DoctoralOS v1

Version comercial minima de una app SaaS para ayudar a doctorandos individuales a terminar su tesis con menos caos.

## Como abrirlo

Requiere Node.js 22.5 o superior, porque el backend usa SQLite nativo.

Arranca el backend:

```bash
node server.js
```

Luego abre:

- Landing: `http://127.0.0.1:4173/`
- App: `http://127.0.0.1:4173/app`

La app tambien puede abrirse como `index.html` con `localStorage`, pero la v1 comercial usa cuenta y sincronizacion.

## Modulos incluidos

- Panel general orientado a tres acciones: escribir capitulo, planificar semana y resolver comentarios.
- Editor real de capitulos con metadatos, secciones, borrador, notas internas y checklist de calidad.
- Lecturas basicas vinculadas a capitulos.
- Plan semanal tipo tablero.
- Reuniones y revision en una sola vista.
- Bitacora de escritura.
- Cuenta, sincronizacion y exportacion de respaldo.

## Archivos

- `index.html`: estructura de la app.
- `styles.css`: sistema visual responsive.
- `app.js`: estado, interacciones, persistencia y exportacion.
- `server.js`: backend local con cuentas, sesiones, SQLite y sincronizacion de estado.
- `package.json`: metadatos y scripts de arranque.
- `landing.html`, `pricing.html`, `help.html`: paginas publicas minimas.
- `tests/backend.test.js`: pruebas basicas del backend.

## Pruebas

```bash
node --check app.js
node --check server.js
node tests/backend.test.js
```

## Revision manual recomendada

1. Abrir landing, precios y ayuda.
2. Entrar en la app y crear una cuenta local.
3. Crear un capitulo, una tarea semanal, una reunion y una sesion de escritura.
4. Exportar un respaldo y comprobar que el archivo contiene el estado actual.
