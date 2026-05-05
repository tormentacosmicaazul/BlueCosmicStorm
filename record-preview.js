/**
 * Auto-preview recorder.
 *
 * Opens the deployed site in a headless Chromium, records ~12 seconds of
 * navigation (scroll + any custom actions), and saves the video as
 * `preview.webm` at the repo root.
 *
 * The GitHub Actions workflow then converts it to `preview.mp4` with ffmpeg.
 *
 * ─── Setup for each repo ─────────────────────────────────────────────────
 * 1. Change TARGET_URL to the deployed site URL
 * 2. (Optional) Customize `performActions(page)` for project-specific navigation
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ─── Config ────────────────────────────────────────────────────────────────
const TARGET_URL = process.env.TARGET_URL || 'https://example.com';
const DURATION_MS = 12000;      // total recording length
const WIDTH = 1280;
const HEIGHT = 720;
const OUTPUT_FILE = path.resolve(__dirname, '..', 'preview.webm');
// ──────────────────────────────────────────────────────────────────────────

/**
 * Customize this for project-specific navigation.
 * The default is a slow, smooth scroll down and back up — works for most
 * single-page sites and portfolios.
 */
async function performActions(page) {
  // Wait a beat so the page has a moment to animate in
  await page.waitForTimeout(1000);

  // Smooth scroll to bottom over ~5s
  await page.evaluate(() => {
    return new Promise((resolve) => {
      const totalHeight = document.body.scrollHeight;
      const duration = 5000;
      const start = performance.now();
      function step(now) {
        const t = Math.min((now - start) / duration, 1);
        window.scrollTo(0, totalHeight * t);
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  });

  await page.waitForTimeout(800);

  // Smooth scroll back to top over ~4s
  await page.evaluate(() => {
    return new Promise((resolve) => {
      const duration = 4000;
      const start = performance.now();
      const from = window.scrollY;
      function step(now) {
        const t = Math.min((now - start) / duration, 1);
        window.scrollTo(0, from * (1 - t));
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  });
}

(async () => {
  console.log(`▶ Recording preview of ${TARGET_URL}`);
  console.log(`  Duration: ${DURATION_MS}ms · Resolution: ${WIDTH}x${HEIGHT}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    recordVideo: {
      dir: path.resolve(__dirname, 'videos'),
      size: { width: WIDTH, height: HEIGHT },
    },
    // Desktop-ish user agent
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  // Kill any tracking/analytics network noise (best-effort)
  await page.route('**/*', (route) => {
    const u = route.request().url();
    if (
      u.includes('google-analytics.com') ||
      u.includes('googletagmanager.com') ||
      u.includes('doubleclick.net')
    ) {
      return route.abort();
    }
    return route.continue();
  });

  try {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (err) {
    console.warn('⚠ networkidle timeout — continuing anyway:', err.message);
  }

  const actionsPromise = performActions(page);
  const timeoutPromise = page.waitForTimeout(DURATION_MS);
  await Promise.race([actionsPromise, timeoutPromise]);
  // Always let the full duration elapse so video length is consistent
  await timeoutPromise;

  // Close page first so video finalizes
  await page.close();
  await context.close();
  await browser.close();

  // Playwright saves with a generated filename — find and rename it
  const videosDir = path.resolve(__dirname, 'videos');
  const files = fs.readdirSync(videosDir).filter((f) => f.endsWith('.webm'));
  if (files.length === 0) {
    console.error('✗ No video recorded.');
    process.exit(1);
  }
  const source = path.join(videosDir, files[0]);
  fs.copyFileSync(source, OUTPUT_FILE);
  fs.unlinkSync(source);
  fs.rmdirSync(videosDir, { recursive: true });

  const stats = fs.statSync(OUTPUT_FILE);
  console.log(`✓ Preview saved: ${OUTPUT_FILE} (${(stats.size / 1024).toFixed(1)} KB)`);
})().catch((err) => {
  console.error('✗ Recording failed:', err);
  process.exit(1);
});
