// Debug: buka halaman jadwal production di headless Chrome, login sebagai
// admin, lalu klik toggle Kalender dan tangkap error console/page.
import puppeteer from "puppeteer-core";
import "dotenv/config";

const BASE =
  process.env.DEBUG_URL ||
  "https://bus-apps-aq6trbb6n-wahyusr1fs-projects.vercel.app";
const EMAIL = process.env.ADMIN_EMAIL || "superadmin@gmail.com";
const PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const browser = await puppeteer.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH ||
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  args: ["--no-sandbox"],
});

const page = await browser.newPage();
page.on("console", (m) => {
  if (["error", "warning"].includes(m.type()))
    console.log(`[${m.type()}]`, m.text().slice(0, 400));
});
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 800)));
page.on("requestfailed", (req) =>
  console.log("[requestfailed]", req.url(), req.failure()?.errorText),
);
page.on("response", (res) => {
  if (res.url().includes("/api/") && res.status() >= 400)
    console.log("[api-error]", res.status(), res.url());
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  // 1) Halaman jadwal publik (tanpa login)
  await page.goto(`${BASE}/jadwal`, {
    waitUntil: "networkidle2",
    timeout: 30000,
  });
  await sleep(2000);
  console.log("== /jadwal ==", page.url());
  console.log(
    "bodyText:",
    await page.evaluate(() => document.body.innerText.slice(0, 200)),
  );

  // 2) Login via UI
  await page.goto(`${BASE}/login`, {
    waitUntil: "networkidle2",
    timeout: 30000,
  });
  await sleep(1500);
  const inputInfo = await page.evaluate(() =>
    [...document.querySelectorAll("input")].map(
      (i) => `${i.type}:${i.name || i.id || i.placeholder || "?"}`,
    ),
  );
  console.log("== /login inputs ==", JSON.stringify(inputInfo));

  const inputs = await page.$$("input");
  for (const inp of inputs) {
    const t = await page.evaluate((el) => el.type, inp);
    if (t === "email") await inp.type(EMAIL, { delay: 15 });
    else if (t === "password") await inp.type(PASSWORD, { delay: 15 });
  }
  await Promise.all([
    page
      .waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 })
      .catch(() => {}),
    page.click('button[type="submit"]').catch(async () => {
      // fallback: klik tombol pertama bertulisan Masuk/Login
      await page.evaluate(() => {
        const btn = [...document.querySelectorAll("button")].find((b) =>
          /masuk|login|sign in/i.test(b.textContent || ""),
        );
        btn?.click();
      });
    }),
  ]);
  await sleep(1500);
  console.log("== after login ==", page.url());

  // 3) Halaman dashboard jadwal
  await page.goto(`${BASE}/dashboard/jadwal`, {
    waitUntil: "networkidle2",
    timeout: 30000,
  });
  await sleep(2500);
  console.log("== /dashboard/jadwal ==", page.url());
  console.log(
    "bodyText:",
    await page.evaluate(() => document.body.innerText.slice(0, 300)),
  );

  // 4) Klik toggle Kalender
  const hasToggle = await page.evaluate(() =>
    [...document.querySelectorAll("button")].some((b) =>
      (b.textContent || "").includes("Kalender"),
    ),
  );
  console.log("Toggle Kalender ada:", hasToggle);
  if (hasToggle) {
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) =>
        (b.textContent || "").includes("Kalender"),
      );
      btn?.click();
    });
    await sleep(5000);

    const calInfo = await page.evaluate(() => ({
      hasFc: !!document.querySelector(".fc"),
      fcTitle: document.querySelector(".fc-toolbar-title")?.textContent || null,
      fcEventCount: document.querySelectorAll(".fc-event").length,
      bodySnippet: document.body.innerText.slice(0, 300),
    }));
    console.log("== after toggle ==", JSON.stringify(calInfo, null, 2));
  }
} finally {
  await browser.close();
}
