import puppeteer from 'puppeteer-core';
import { mkdtempSync, readFileSync, existsSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

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

  // Login
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' });
  await page.type('#email', 'superadmin@gmail.com');
  await page.type('#password', 'admin123');
  await sleep(2500);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await sleep(2000);

  // Buka dialog export
  await page.goto(`${BASE}/dashboard/jadwal`, { waitUntil: 'networkidle2' });
  await sleep(1500);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Export PDF'),
    );
    btn?.click();
  });
  await sleep(2500); // tunggu query exportData selesai

  // Tangkap download via CDP
  const dir = mkdtempSync(join(tmpdir(), 'pdf-test-'));
  const cdp = await page.createCDPSession();
  await cdp.send('Browser.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: dir,
    eventsEnabled: true,
  });

  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('[role="dialog"] button')].find((b) =>
      b.textContent?.includes('Download PDF'),
    );
    btn?.click();
  });

  // Tunggu file selesai ditulis (poll hingga 30 detik)
  let pdfPath = null;
  for (let i = 0; i < 60; i += 1) {
    const files = readdirSync(dir).filter((f) => f.endsWith('.pdf'));
    if (files.length > 0) {
      const candidate = join(dir, files[0]);
      // .crdownload berarti masih mengunduh
      if (!existsSync(`${candidate}.crdownload`)) {
        pdfPath = candidate;
        break;
      }
    }
    await sleep(500);
  }

  if (!pdfPath) {
    console.log('HASIL: PDF TIDAK TER-DOWNLOAD');
    await browser.close();
    process.exit(1);
  }

  const buf = readFileSync(pdfPath);
  const isPdf = buf.subarray(0, 5).toString() === '%PDF-';
  console.log('File PDF:', pdfPath.split(/[\\/]/).pop());
  console.log('Ukuran:', buf.length, 'bytes');
  console.log('Header valid:', isPdf ? 'YA (%PDF-)' : 'TIDAK');
  console.log('HASIL:', isPdf && buf.length > 1000 ? 'PDF VALID' : 'PDF RUSAK');

  await browser.close();
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
