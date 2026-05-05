# Setup específico para cada repo

Copiá los 3 archivos del template (`.github/workflows/preview.yml`, `scripts/package.json`, `scripts/record-preview.js`) al root de cada repo, y después configurá la URL como se indica abajo.

## 1. ArcheoScope

**Repo:** https://github.com/ifernandez89/ArcheoScope

Editá `scripts/record-preview.js` línea 21:
```js
const TARGET_URL = process.env.TARGET_URL || 'https://ifernandez89.github.io/ArcheoScope/';
```

Para grabar el sitio landing (no la app embebida), el scroll por defecto funciona bien. Si querés mostrar algo específico de la app, agregá en `performActions`:

```js
// Ejemplo: esperar que cargue la escena 3D
await page.waitForSelector('canvas', { timeout: 8000 }).catch(() => {});
await page.waitForTimeout(2000); // dejá que la escena se vea
```

## 2. Pillow

**Repo:** https://github.com/ifernandezdesign/pillow (o similar)

Editá `scripts/record-preview.js` línea 21:
```js
const TARGET_URL = process.env.TARGET_URL || 'https://ifernandezdesign.github.io/pillow/';
```

El scroll por defecto funciona — es un sitio de una sola página.

## 3. Oxlahun Cauac (BlueCosmicStorm)

**Repo:** https://github.com/tormentacosmicaazul/BlueCosmicStorm

Editá `scripts/record-preview.js` línea 21:
```js
const TARGET_URL = process.env.TARGET_URL || 'https://tormentacosmicaazul.github.io/BlueCosmicStorm/';
```

Scroll por defecto OK.

## Después de copiar los archivos en cada repo

1. Ir a **Settings → Actions → General → Workflow permissions** → marcar **"Read and write permissions"** → Save.
2. Ir a la pestaña **Actions** → activar workflows si te pregunta.
3. Seleccionar "Generate preview video" → botón **Run workflow** → rama main → Run.
4. Esperar ~2-3 minutos. Al terminar, vas a ver dos archivos nuevos commiteados por `github-actions[bot]`: `preview.webm` y `preview.mp4`.
5. Esperar que GitHub Pages re-publique (1-2 min). Verificá que la URL funciona:
   - https://ifernandez89.github.io/ArcheoScope/preview.mp4
   - https://ifernandezdesign.github.io/pillow/preview.mp4
   - https://tormentacosmicaazul.github.io/BlueCosmicStorm/preview.mp4

## En el portfolio

Una vez que los previews existan públicamente, el portfolio los va a detectar automáticamente (HEAD request) y reemplazar los videos locales. No hay que tocar nada más acá.

Si un preview no existe, el portfolio usa el video local que ya está commiteado (`videos/pillow.mp4`, `videos/OC.mp4`) — es el fallback.

## Problemas comunes

**"Permission denied" al pushear en el workflow**
→ Settings → Actions → General → Workflow permissions → "Read and write permissions".

**El video sale muy oscuro o vacío**
→ Es porque `networkidle` no esperó lo suficiente. Agregá un `await page.waitForTimeout(3000)` al inicio de `performActions`.

**No se ve una animación específica**
→ Customizá `performActions` con selectores del sitio (clicks, hover, etc).

**El workflow tarda mucho**
→ Normal: ~2 min (instalar Playwright = 1 min, grabar = 20s, convertir = 10s, commitear = 5s).
