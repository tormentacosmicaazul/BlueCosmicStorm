#!/usr/bin/env node
/**
 * convert-to-webp.js
 * ==================
 * Convierte todas las imágenes PNG/JPG/JPEG del directorio actual a WebP,
 * actualiza las referencias en todos los archivos HTML y CSS,
 * y muestra un reporte de ahorro de espacio.
 *
 * Uso:
 *   node convert-to-webp.js            # convierte todo
 *   node convert-to-webp.js --dry-run  # solo muestra qué haría, sin tocar nada
 *   node convert-to-webp.js --quality 85  # calidad WebP (default: 80)
 *
 * Dependencias:
 *   npm install sharp   (solo la primera vez)
 */

const fs   = require('fs');
const path = require('path');

// ── Argumentos ──────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const qualIdx = args.indexOf('--quality');
const QUALITY = qualIdx !== -1 ? parseInt(args[qualIdx + 1], 10) : 80;

// ── Verificar que sharp esté instalado ──────────────────────────────────────
let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('\n❌  Falta la dependencia "sharp". Instalala con:\n');
  console.error('    npm install sharp\n');
  process.exit(1);
}

// ── Configuración ───────────────────────────────────────────────────────────
const WORK_DIR     = process.cwd();
const IMG_EXTS     = ['.png', '.jpg', '.jpeg'];
const SKIP_FILES   = ['giphy.gif', 'source.gif', 'icons8-fire.gif']; // GIFs animados, no tocar
const HTML_GLOB    = /\.(html|css|js)$/i;

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getSize(filePath) {
  try { return fs.statSync(filePath).size; } catch { return 0; }
}

// ── Recolectar imágenes a convertir ─────────────────────────────────────────
const images = fs.readdirSync(WORK_DIR).filter(f => {
  const ext = path.extname(f).toLowerCase();
  return IMG_EXTS.includes(ext) && !SKIP_FILES.includes(f);
});

if (images.length === 0) {
  console.log('No se encontraron imágenes PNG/JPG para convertir.');
  process.exit(0);
}

console.log(`\n🖼  Imágenes encontradas: ${images.length}`);
console.log(`⚙️  Calidad WebP: ${QUALITY}`);
if (DRY_RUN) console.log('🔍  Modo DRY-RUN: no se escribirá nada.\n');
else console.log('');

// ── Convertir imágenes ───────────────────────────────────────────────────────
async function convertImages() {
  let totalOriginal = 0;
  let totalWebP     = 0;
  const converted   = []; // { original, webp }

  for (const imgFile of images) {
    const srcPath  = path.join(WORK_DIR, imgFile);
    const baseName = path.basename(imgFile, path.extname(imgFile));
    const webpName = `${baseName}.webp`;
    const dstPath  = path.join(WORK_DIR, webpName);

    // Si ya existe el WebP y es más nuevo que el original, saltar
    if (!DRY_RUN && fs.existsSync(dstPath)) {
      const srcMtime = fs.statSync(srcPath).mtimeMs;
      const dstMtime = fs.statSync(dstPath).mtimeMs;
      if (dstMtime >= srcMtime) {
        console.log(`  ⏭  ${imgFile} → ya existe ${webpName}, saltando.`);
        converted.push({ original: imgFile, webp: webpName });
        continue;
      }
    }

    const origSize = getSize(srcPath);
    totalOriginal += origSize;

    if (DRY_RUN) {
      console.log(`  🔍  ${imgFile} → ${webpName}  (${formatBytes(origSize)})`);
      converted.push({ original: imgFile, webp: webpName });
      continue;
    }

    try {
      await sharp(srcPath)
        .webp({ quality: QUALITY, effort: 4 })
        .toFile(dstPath);

      const webpSize = getSize(dstPath);
      totalWebP += webpSize;
      const saving = origSize > 0 ? (((origSize - webpSize) / origSize) * 100).toFixed(1) : '?';

      console.log(`  ✅  ${imgFile} → ${webpName}  ${formatBytes(origSize)} → ${formatBytes(webpSize)}  (-${saving}%)`);
      converted.push({ original: imgFile, webp: webpName });
    } catch (err) {
      console.error(`  ❌  Error convirtiendo ${imgFile}: ${err.message}`);
    }
  }

  return { converted, totalOriginal, totalWebP };
}

// ── Actualizar referencias en HTML/CSS/JS ────────────────────────────────────
function updateReferences(converted) {
  const textFiles = fs.readdirSync(WORK_DIR).filter(f => HTML_GLOB.test(f));

  let filesUpdated = 0;
  let replacements = 0;

  for (const textFile of textFiles) {
    const filePath = path.join(WORK_DIR, textFile);
    let content;
    try { content = fs.readFileSync(filePath, 'utf8'); } catch { continue; }

    let newContent = content;

    for (const { original, webp } of converted) {
      // Reemplaza la extensión original por .webp en src=, url(), href=
      // Usa regex para capturar el nombre exacto (evita reemplazos parciales)
      const escapedName = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedName, 'g');
      const count = (newContent.match(regex) || []).length;
      if (count > 0) {
        newContent = newContent.replace(regex, webp);
        replacements += count;
      }
    }

    if (newContent !== content) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, newContent, 'utf8');
      }
      filesUpdated++;
      console.log(`  📝  ${textFile} actualizado`);
    }
  }

  return { filesUpdated, replacements };
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  const { converted, totalOriginal, totalWebP } = await convertImages();

  console.log('\n── Actualizando referencias en HTML/CSS/JS ──');
  const { filesUpdated, replacements } = updateReferences(converted);

  // ── Reporte final ──────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════');
  console.log('  REPORTE FINAL');
  console.log('══════════════════════════════════════════');
  console.log(`  Imágenes procesadas : ${converted.length}`);
  console.log(`  Archivos de texto   : ${filesUpdated} actualizados (${replacements} referencias)`);

  if (!DRY_RUN && totalOriginal > 0) {
    const saved   = totalOriginal - totalWebP;
    const pct     = ((saved / totalOriginal) * 100).toFixed(1);
    console.log(`  Tamaño original     : ${formatBytes(totalOriginal)}`);
    console.log(`  Tamaño WebP         : ${formatBytes(totalWebP)}`);
    console.log(`  Ahorro total        : ${formatBytes(saved)} (-${pct}%)`);
  }

  if (DRY_RUN) {
    console.log('\n  ⚠️  Modo DRY-RUN: ningún archivo fue modificado.');
    console.log('  Ejecutá sin --dry-run para aplicar los cambios.');
  } else {
    console.log('\n  ✅  Listo. Los archivos originales NO fueron borrados.');
    console.log('  Podés borrarlos manualmente una vez que verifiques que todo funciona.');
    console.log('  Ejemplo: del *.jpg *.png (Windows CMD) o rm *.jpg *.png (bash)');
  }
  console.log('══════════════════════════════════════════\n');
})();
