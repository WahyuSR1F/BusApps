import puppeteer from 'puppeteer-core';

const BASE = process.env.DEBUG_URL || 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TEST = {
  phone: '021-9999-8888',
  email: 'tes@safatrans.co.id',
  address: 'Jl. Uji Coba No. 99',
  wa: '0812987654321',
  terminal: 'Terminal Uji Coba',
};

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
  console.log('Login:', page.url().includes('/dashboard') ? 'OK' : 'GAGAL');

  // 2. Buka profil, cek form kontak ada
  await page.goto(`${BASE}/dashboard/profil`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  const formInfo = await page.evaluate(() => ({
    phone: !!document.getElementById('phonePrimary'),
    email: !!document.getElementById('emailPrimary'),
    address: !!document.getElementById('address'),
    wa: !!document.getElementById('contactWhatsapp'),
    jam: !!document.getElementById('operationalHours'),
  }));
  console.log('Form kontak:', JSON.stringify(formInfo));

  // 3. Isi nilai test + simpan
  await setInput(page, 'phonePrimary', TEST.phone);
  await setInput(page, 'emailPrimary', TEST.email);
  await setInput(page, 'address', TEST.address);
  await setInput(page, 'contactWhatsapp', TEST.wa);

  // Tambah terminal uji
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Tambah Terminal'),
    );
    btn?.click();
  });
  await sleep(500);
  await page.evaluate(
    (val) => {
      const inputs = [...document.querySelectorAll('input[placeholder="Nama terminal"]')];
      const last = inputs[inputs.length - 1];
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      ).set;
      setter.call(last, val);
      last.dispatchEvent(new Event('input', { bubbles: true }));
    },
    TEST.terminal,
  );

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
  console.log('Toast simpan kontak:', toast);

  // 4. Cek halaman kontak publik menampilkan nilai baru
  await page.goto(`${BASE}/kontak`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  const kontakInfo = await page.evaluate(
    (t) => {
      const body = document.body.textContent || '';
      return {
        phone: body.includes(t.phone),
        email: body.includes(t.email),
        address: body.includes(t.address),
        waLink: !!document.querySelector(`a[href*="wa.me"]`),
        terminal: body.includes(t.terminal),
      };
    },
    TEST,
  );
  console.log('Halaman /kontak:', JSON.stringify(kontakInfo));

  // 5. Cek footer di halaman beranda
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  const footerInfo = await page.evaluate(
    (t) => {
      const footer = document.querySelector('footer');
      if (!footer) return { footerAda: false };
      const text = footer.textContent || '';
      return { footerAda: true, phone: text.includes(t.phone), email: text.includes(t.email), address: text.includes(t.address) };
    },
    TEST,
  );
  console.log('Footer beranda:', JSON.stringify(footerInfo));

  await browser.close();
  console.log('DONE');
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
