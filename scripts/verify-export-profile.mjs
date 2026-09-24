import puppeteer from 'puppeteer-core';

const BASE = process.env.DEBUG_URL || 'http://localhost:3000';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function textOf(page, sel) {
  return page.$eval(sel, (el) => el.textContent?.trim() || '').catch(() => '');
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
  page.on('response', async (res) => {
    if (res.url().includes('auth.login')) {
      console.log('LOGIN HTTP:', res.status(), (await res.text()).slice(0, 300));
    }
  });

  // 1. Login
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' });
  await page.type('#email', 'superadmin@gmail.com');
  await page.type('#password', 'admin123');
  await sleep(2500); // tunggu Turnstile token siap
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await sleep(2500);
  console.log('URL after login:', page.url());
  if (page.url().includes('/login')) {
    const err = await page.evaluate(() =>
      [...document.querySelectorAll('[role="alert"], .text-red-500, .text-destructive')]
        .map((el) => el.textContent?.trim())
        .filter(Boolean)
        .join(' | '),
    );
    console.log('Login error di layar:', err || '(tidak terlihat)');
  }

  // 2. Halaman jadwal: tombol Export PDF
  await page.goto(`${BASE}/dashboard/jadwal`, { waitUntil: 'networkidle2' });
  await sleep(1500);
  const hasExportBtn = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    return btns.some((b) => b.textContent?.includes('Export PDF'));
  });
  console.log('Tombol Export PDF ada:', hasExportBtn);

  // 3. Buka dialog export
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Export PDF'),
    );
    btn?.click();
  });
  await sleep(2000);
  const dialogInfo = await page.evaluate(() => {
    const title = [...document.querySelectorAll('h2')].find((el) =>
      el.textContent?.includes('Export Jadwal'),
    );
    const inputs = [...document.querySelectorAll('[role="dialog"] input')];
    const buttons = [...document.querySelectorAll('[role="dialog"] button')].map(
      (b) => b.textContent?.trim(),
    );
    return {
      dialogOpen: !!title,
      inputCount: inputs.length,
      dateInputs: inputs.filter((i) => i.type === 'date').length,
      buttons: buttons.filter(Boolean).slice(0, 6),
    };
  });
  console.log('Dialog export:', JSON.stringify(dialogInfo));

  // 4. Klik "Kirim via WA" (tanpa nomor -> harus muncul toast error)
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('[role="dialog"] button')].find((b) =>
      b.textContent?.includes('Kirim via WA'),
    );
    btn?.click();
  });
  await sleep(800);
  const toastText = await page.evaluate(() =>
    document.querySelector('[data-sonner-toast]')?.textContent?.trim() || '(tidak ada toast)',
  );
  console.log('Toast saat WA kosong:', toastText);

  // Tutup dialog
  await page.keyboard.press('Escape');
  await sleep(800);

  // 5. Halaman profil
  await page.goto(`${BASE}/dashboard/profil`, { waitUntil: 'networkidle2' });
  await sleep(1500);
  const profilInfo = await page.evaluate(() => {
    const heading = [...document.querySelectorAll('h2')].some((el) =>
      el.textContent?.includes('Profil Admin'),
    );
    const nameInput = document.querySelector('#name');
    const waInput = document.querySelector('#whatsapp');
    return {
      heading,
      hasName: !!nameInput,
      hasWa: !!waInput,
      nameValue: nameInput?.value || '',
      waValue: waInput?.value || '',
    };
  });
  console.log('Halaman profil:', JSON.stringify(profilInfo));

  // 6. Isi nomor WA + simpan
  await page.evaluate(() => {
    const waInput = document.querySelector('#whatsapp');
    if (!waInput) return;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    ).set;
    setter.call(waInput, '081234567890');
    waInput.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Simpan'),
    );
    btn?.click();
  });
  await sleep(2000);
  const saveToast = await page.evaluate(() =>
    document.querySelector('[data-sonner-toast]')?.textContent?.trim() || '(tidak ada toast)',
  );
  console.log('Toast setelah simpan profil:', saveToast);

  // 7. Reload dan pastikan nomor WA tersimpan (prefill)
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(1500);
  const waPersisted = await page.evaluate(() => {
    const waInput = document.querySelector('#whatsapp');
    return waInput?.value || '';
  });
  console.log('Nomor WA tersimpan (setelah reload):', waPersisted || '(kosong)');

  await browser.close();
  console.log('DONE');
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
