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

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await sleep(2000);

  const buttons = await page.evaluate(() => {
    const hero = document.querySelector('section');
    if (!hero) return null;
    const results = [];
    for (const btn of hero.querySelectorAll('button')) {
      const text = btn.textContent?.trim() || '';
      if (!text.includes('Lihat Jadwal') && !text.includes('Hubungi Kami')) continue;
      const cs = getComputedStyle(btn);
      results.push({
        text,
        bg: cs.backgroundColor,
        color: cs.color,
        border: cs.borderColor,
      });
    }
    return results;
  });
  console.log(JSON.stringify(buttons, null, 2));

  // Screenshot hero untuk inspeksi
  const hero = await page.$('section');
  if (hero) {
    await hero.screenshot({ path: 'scripts/hero-buttons.png' });
    console.log('Screenshot: scripts/hero-buttons.png');
  }

  await browser.close();
  console.log('DONE');
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
