import puppeteer from 'puppeteer-core';

const BASE = process.env.DEBUG_URL || 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NEW_NAME = `BusTest${Date.now() % 10000}`;

async function setInput(page, id, value) {
  await page.evaluate(
    (elId, val) => {
      const input = document.getElementById(elId);
      if (!input) throw new Error(`Input #${elId} tidak ditemukan`);
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      ).set;
      setter.call(input, val);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    },
    id,
    value,
  );
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 200)));

  // 1. Login admin
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' });
  await page.type('#email', 'superadmin@gmail.com');
  await page.type('#password', 'admin123');
  await sleep(2500);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await sleep(2000);

  // 2. Profil: ganti nama aplikasi + simpan
  await page.goto(`${BASE}/dashboard/profil`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  const appNameField = await page.evaluate(() => !!document.getElementById('appName'));
  console.log('Field Nama Aplikasi ada:', appNameField);

  await setInput(page, 'appName', NEW_NAME);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Simpan Kontak'),
    );
    btn?.click();
  });
  await sleep(2500);
  const toast = await page.evaluate(
    () => document.querySelector('[data-sonner-toast]')?.textContent?.trim() || '(tidak ada toast)',
  );
  console.log('Toast simpan:', toast);

  // 3. Dashboard sidebar pakai nama baru
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  const sidebarName = await page.evaluate(
    () => document.querySelector('aside span.font-bold')?.textContent?.trim() || '',
  );
  console.log('Sidebar dashboard:', sidebarName, sidebarName === NEW_NAME ? 'OK' : 'BELUM');

  // 4. Logout, cek navbar publik + login page
  await page.goto(`${BASE}/kontak`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  const navbarName = await page.evaluate(
    () => document.querySelector('nav span.text-xl')?.textContent?.trim() || '',
  );
  console.log('Navbar publik:', navbarName, navbarName === NEW_NAME ? 'OK' : 'BELUM');

  const footerName = await page.evaluate(() => {
    const span = [...document.querySelectorAll('footer span')].find((s) =>
      s.className?.includes?.('text-xl'),
    );
    return span?.textContent?.trim() || '';
  });
  console.log('Footer:', footerName, footerName === NEW_NAME ? 'OK' : 'BELUM');

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' });
  await sleep(1500);
  const loginName = await page.evaluate(() => {
    const span = [...document.querySelectorAll('span')].find((s) =>
      s.className?.includes?.('text-2xl'),
    );
    return span?.textContent?.trim() || '';
  });
  console.log('Halaman login:', loginName, loginName === NEW_NAME ? 'OK' : 'BELUM');

  await browser.close();
  console.log('Nama test:', NEW_NAME);
  console.log('DONE');
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
