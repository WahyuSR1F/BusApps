// Debug cepat: buka homepage production, cek apakah React ter-render.
import puppeteer from "puppeteer-core";

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
    console.log(`[${m.type()}]`, m.text().slice(0, 300));
});
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 500)));

await page.goto(
  process.env.DEBUG_URL ||
    "https://bus-apps-d358lmf4n-wahyusr1fs-projects.vercel.app/",
  { waitUntil: "networkidle2", timeout: 30000 },
);
await new Promise((r) => setTimeout(r, 3000));

const info = await page.evaluate(() => ({
  url: location.href,
  rootChildren: document.getElementById("root")?.children.length ?? 0,
  rootHtml: (document.getElementById("root")?.innerHTML || "").slice(0, 200),
  bodyText: document.body.innerText.slice(0, 300),
}));
console.log(JSON.stringify(info, null, 2));

await browser.close();
