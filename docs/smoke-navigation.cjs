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
    let failVenues = false;
    const bookingRequests = [];
    const venue = { id: 'venue1', slug: 'test', name: 'Lieu de test', neighborhood: 'Gombe', priceRange: 2, reservationsEnabled: true, media: [], categories: [], address: 'Adresse de test', latitude: -4.3, longitude: 15.3 };
    const event = { id: 'event1', title: 'Concert de test', description: 'Soirée de test', startDate: '2026-09-20T18:00:00Z', endDate: null, media: [], place: venue };
    await page.route('**/api/mobile/**', async route => {
      const resource = new URL(route.request().url()).pathname.split('/api/mobile/')[1];
      let body = { items: [], page: 1, total: 0, totalPages: 0 };
      if (resource === 'venues' && failVenues) { await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Service momentanément indisponible.' }) }); return; }
      if (resource === 'venues') body = { places: [], page: 1, total: 0, totalPages: 0 };
      if (resource === 'venues/test') body = { id: 'venue1', slug: 'test', name: 'Lieu de test', neighborhood: 'Gombe', priceRange: 2, reservationsEnabled: true, media: [], categories: [], averageRating: null, reviewCount: 0, isFavorite: false, description: 'Description de test', address: 'Adresse de test', phone: null, latitude: -4.3, longitude: 15.3, maxPartySize: 8, menuItems: [{ id: 'dish1', name: 'Plat de test', description: null, price: '12 USD', category: 'Plats', imageUrl: null }] };
      if (resource === 'session') body = { token: 'qvm_' + 'a'.repeat(64), expires: new Date(Date.now() + 86400000).toISOString(), user: { id: 'test-user', name: 'Compte de test', email: 'test@example.test', role: 'USER' } };
      if (resource === 'venues/venue1/availability') body = { success: true, slots: ['18:00', '19:00'], closed: false, quote: { amountMinor: 0, currency: 'USD' } };
      if (resource === 'reservations' && route.request().method() === 'POST') {
        bookingRequests.push(route.request().postDataJSON());
        if (bookingRequests.length === 1) { await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Coupure de test, réessaie.' }) }); return; }
        body = { success: true, reference: 'TEST-REF', status: 'CONFIRMED' };
      }
      if (resource === 'reservations/TEST-REF') body = { id: 'reservation1', reference: 'TEST-REF', dateTime: '2026-09-20T17:00:00Z', partySize: 2, status: 'CONFIRMED', reservationPriceMinor: 0, reservationCurrency: 'USD', place: venue };
      if (resource === 'events') body = { items: [event], page: 1, total: 1, totalPages: 1 };
      if (resource === 'events/event1') body = event;
      if (resource === 'ai') body = { message: 'Voici une piste pour ta sortie.', context: {}, recommendations: [{ id: venue.id, slug: venue.slug, name: venue.name, neighborhood: venue.neighborhood, priceRange: 2, category: 'Restaurant', image: null, rating: null, reason: 'Correspond à ton envie.' }] };
      if (resource === 'search-options') body = { neighborhoods: ['Gombe'], categories: [{ name: 'Restaurant', slug: 'restaurant' }] };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
    await page.goto(base);
    await page.getByRole('button', { name: 'Découvrir Quivibe', exact: true }).click();
    await page.getByRole('button', { name: 'Chill', exact: true }).click();
    await page.getByRole('button', { name: 'Continuer', exact: true }).click();
    await page.getByRole('button', { name: 'Plus tard', exact: true }).click();
    await page.getByRole('heading', { name: /Quelle est ta vibe/ }).waitFor();
    await page.reload();
    await page.getByRole('heading', { name: /Quelle est ta vibe/ }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.evaluate(() => document.fonts.check('16px NotoSans_400Regular')), true);
    await page.screenshot({ path: path.join(__dirname, 'navigation-home.png'), fullPage: true });
    for (const [width, height] of [[360, 800], [375, 812], [390, 844], [412, 915]]) {
      await page.setViewportSize({ width, height });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    }
    await page.goto(base + '/explore');
    await page.getByRole('button', { name: 'Filtres', exact: true }).click();
    await page.getByRole('button', { name: 'Gombe', exact: true }).click();
    await page.getByRole('button', { name: 'Voir les résultats', exact: true }).click();
    await page.getByText('Les adresses de Gombe', { exact: true }).waitFor();
    await page.goto(base + '/search');
    await page.getByRole('textbox', { name: 'Rechercher', exact: true }).fill('Brunch');
    await page.getByRole('button', { name: 'Voir les résultats', exact: true }).click();
    await page.getByRole('heading', { name: 'Brunch', exact: true }).waitFor();
    await page.goto(base + '/venue/test');
    await page.getByRole('heading', { name: 'Lieu de test', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Voir le menu complet', exact: true }).click();
    await page.getByText('Plat de test · 12 USD', { exact: true }).last().waitFor();
    await page.goto(base + '/reviews/venue1');
    await page.getByRole('heading', { name: 'La communauté en parle', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill('test@example.test');
    await page.getByLabel('Mot de passe', { exact: true }).fill('test-password');
    await page.getByRole('button', { name: 'Se connecter', exact: true }).last().click();
    await page.getByRole('textbox', { name: 'Ton avis', exact: true }).waitFor();
    await page.goto(base + '/reservation/test');
    await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill('test@example.test');
    await page.getByLabel('Mot de passe', { exact: true }).fill('test-password');
    await page.getByRole('button', { name: 'Se connecter', exact: true }).last().click();
    const confirm = page.getByRole('button', { name: 'Confirmer la réservation', exact: true });
    await page.getByRole('button', { name: '18:00', exact: true }).waitFor();
    assert.equal(await confirm.isDisabled(), true);
    await page.getByRole('button', { name: '18:00', exact: true }).click();
    await page.screenshot({ path: path.join(__dirname, 'navigation-reservation.png'), fullPage: true });
    await confirm.click();
    await page.getByText('Coupure de test, réessaie.', { exact: true }).waitFor();
    await confirm.click();
    await page.getByRole('heading', { name: 'Réservation confirmée 🎉', exact: true }).waitFor();
    assert.equal(bookingRequests.length, 2);
    assert.equal(bookingRequests[0].requestKey, bookingRequests[1].requestKey, 'Retry preserves idempotency key');
    assert.equal(bookingRequests[0].placeId, venue.id);
    await page.getByRole('button', { name: 'Voir ma réservation', exact: true }).click();
    await page.getByText('Réf. TEST-REF', { exact: false }).waitFor();
    await page.goto(base + '/events');
    await page.getByRole('heading', { name: 'Les événements', exact: true }).waitFor();
    await page.getByText(event.title, { exact: true }).click();
    await page.getByRole('heading', { name: event.title, exact: true }).waitFor();
    await page.goto(base + '/ai');
    await page.getByRole('textbox', { name: 'Ton envie', exact: true }).fill('Un dîner calme à Gombe');
    await page.getByRole('button', { name: 'Envoyer', exact: true }).click();
    await page.getByText('Voici une piste pour ta sortie.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Découvrir Lieu de test', exact: true }).click();
    await page.getByRole('heading', { name: venue.name, exact: true }).waitFor();
    failVenues = true;
    await page.goto(base + '/explore');
    await page.getByRole('button', { name: 'Réessayer', exact: true }).waitFor();
    failVenues = false;
    await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
    await page.getByRole('heading', { name: 'Aucun endroit trouvé.', exact: true }).waitFor();
    await page.context().setOffline(true);
    await page.getByText('Hors connexion · tes données déjà chargées restent visibles', { exact: true }).waitFor();
    await page.context().setOffline(false);
    assert.deepEqual(errors, [], 'No JavaScript runtime errors');
    console.log('PASS: onboarding, preferences, search/filters, venue/menu/reviews, login return, booking retry/idempotency/confirmation, events, AI, four viewport sizes, fonts, no runtime errors.');
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
