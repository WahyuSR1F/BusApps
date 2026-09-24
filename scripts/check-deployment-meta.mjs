// Debug: sha per deployment lama + status SPA.
import fs from "fs";
import os from "os";
import path from "path";

const authPath = path.join(
  process.env.APPDATA || "",
  "com.vercel.cli",
  "Data",
  "auth.json",
);
const token = JSON.parse(fs.readFileSync(authPath, "utf8")).token;

const list = [
  "bus-apps-ymbaugos1-wahyusr1fs-projects.vercel.app",
  "bus-apps-oxuk06o18-wahyusr1fs-projects.vercel.app",
  "bus-apps-jh8pafup1-wahyusr1fs-projects.vercel.app",
  "bus-apps-7gnh5xxtz-wahyusr1fs-projects.vercel.app",
  "bus-apps-9ghng54uv-wahyusr1fs-projects.vercel.app",
  "bus-apps-2v0dis3px-wahyusr1fs-projects.vercel.app",
  "bus-apps-3hkslkfkf-wahyusr1fs-projects.vercel.app",
  "bus-apps-d358lmf4n-wahyusr1fs-projects.vercel.app",
];

for (const url of list) {
  const [body, spa] = await Promise.all([
    fetch(`https://api.vercel.com/v13/deployments/${url}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),
    fetch(`${`https://${url}`}/jadwal`, { redirect: "manual" }).then(
      (r) => r.status,
    ),
  ]);
  console.log(
    url.slice(9, 18),
    "| sha:",
    body.meta?.githubCommitSha?.slice(0, 7),
    "| ready:",
    body.readyState,
    "| /jadwal:",
    spa,
  );
}
