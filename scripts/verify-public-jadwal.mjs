import puppeteer from 'puppeteer-core';

const BASE = process.env.DEBUG_URL || 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 200)));

  // 1. Halaman publik jadwal - view tabel
  await page.goto(`${BASE}/jadwal`, { waitUntil: 'networkidle2' });
  await sleep(2000);

  const tabelInfo = await page.evaluate(() => {
    const heading = [...document.querySelectorAll('h1')].some((el) =>
      el.textContent?.includes('Jadwal Keberangkatan'),
    );
    const cards = [...document.querySelectorAll('.bg-white.rounded-xl.border')].filter((el) =>
      el.textContent?.includes('Rp'),
    );
    const dummyGone = !document.body.textContent?.includes('John Doe');
    const toggle = [...document.querySelectorAll('button')].filter(
      (b) => b.textContent?.includes('Tabel') || b.textContent?.includes('Kalender'),
    ).length;
    return { heading, jadwalCount: cards.length, dummyGone, toggleButtons: toggle };
  });
  console.log('Tabel:', JSON.stringify(tabelInfo));

  // 2. Search
  await page.type('input[placeholder*="Cari"]', 'Kediri');
  await sleep(1500);
  const searchCount = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.bg-white.rounded-xl.border')].filter((el) =>
      el.textContent?.includes('Rp'),
    );
    return cards.length;
  });
  console.log('Hasil search "Kediri":', searchCount, 'jadwal');
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Cari"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, '');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await sleep(1000);

  // 3. Toggle kalender
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent?.trim() === 'Kalender',
    );
    btn?.click();
  });
  await sleep(2500);

  const kalenderInfo = await page.evaluate(() => {
    const cal = document.querySelector('.fc');
    const title = document.querySelector('.fc-toolbar-title')?.textContent?.trim();
    const events = document.querySelectorAll('.fc-event').length;
    const buttons = [...document.querySelectorAll('.fc-button')].map((b) => b.textContent?.trim());
    const localeBtn = buttons.filter((t) => t === 'Hari Ini' || t === 'Bulan' || t === 'Daftar').length;
    return { calendarRendered: !!cal, title, eventCount: events, localeBtn };
  });
  console.log('Kalender:', JSON.stringify(kalenderInfo));

  // 4. Klik event -> dialog detail
  await page.evaluate(() => {
    document.querySelector('.fc-event')?.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
  });
  await sleep(1000);

  const dialogInfo = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return { open: false };
    const title = dialog.querySelector('h2')?.textContent?.trim() || '';
    const rows = [...dialog.querySelectorAll('div.flex.justify-between')].map(
      (r) => r.textContent?.trim(),
    );
    return { open: true, title, rows: rows.slice(0, 6) };
  });
  console.log('Dialog detail:', JSON.stringify(dialogInfo));

  await browser.close();
  console.log('DONE');
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
