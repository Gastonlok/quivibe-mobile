// Run with: node docs/smoke-navigation.cjs <absolute path to @playwright/test>
// Uses a local browser only. No calls to the Quivibe production backend.
const { chromium } = require(process.argv[2] || '@playwright/test');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.ttf': 'font/ttf', '.css': 'text/css', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const target = path.resolve(root, '.' + pathname);
  if (target !== root && !target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  const file = fs.existsSync(target) && fs.statSync(target).isFile() ? target : path.join(root, 'index.html');
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = `http://127.0.0.1:${server.address().port}`;
    await page.goto(base);
    await page.getByText('Où veux-tu sortir aujourd’hui ?', { exact: true }).waitFor();
    for (const label of ['Explorer', 'Événements', 'Favoris', 'Profil', 'Accueil']) {
      await page.getByText(label, { exact: true }).last().click();
    }
    await page.getByText('Où veux-tu sortir aujourd’hui ?', { exact: true }).waitFor();
    await page.screenshot({ path: path.join(__dirname, 'navigation-home.png'), fullPage: true });
    await page.getByRole('button', { name: 'Explorer Kinshasa', exact: true }).click();
    await page.getByText('À chacun sa vibe.', { exact: true }).waitFor();
    for (const [route, title] of [
      ['/events', 'Kinshasa fait le show.'], ['/favorites', 'Les adresses à garder.'],
      ['/profile', 'La ville est à toi.'], ['/search', 'Une adresse en tête ?'],
      ['/ai', 'Dis-nous ton envie.'], ['/auth/login', 'Bienvenue chez toi.'],
      ['/auth/register', 'Tes sorties commencent ici.'], ['/venue/example', 'Ton prochain coup de cœur'],
      ['/reservation/example', 'Une table t’attend'], ['/menu/example', 'À la carte'],
      ['/reviews/example', 'La communauté en parle'], ['/event/example', 'Une sortie à partager'],
      ['/account/reservations', 'Mes réservations'], ['/missing-page', 'Cette adresse nous échappe'],
    ]) {
      await page.goto(base + route);
      await page.getByText(title, { exact: true }).last().waitFor();
    }
    await page.goto(base + '/');
    await page.getByRole('button', { name: 'Explorer : Cafés', exact: true }).click();
    await page.getByRole('heading', { name: 'Cafés', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Toutes les catégories', exact: true }).click();
    await page.getByText('À chacun sa vibe.', { exact: true }).waitFor();
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto(base);
    await page.getByText('Où veux-tu sortir aujourd’hui ?', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'No horizontal overflow at 320px');
    assert.deepEqual(errors, [], 'No JavaScript runtime errors');
    console.log('PASS: navigation, deep links, category reset, 320px layout, no runtime errors.');
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
