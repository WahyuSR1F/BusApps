// Debug: ambil konfigurasi deployment aktif dari API Vercel.
// Token diambil dari config CLI global (auth.json) — read-only.
import fs from "fs";
import os from "os";
import path from "path";

const cfgPath = path.join(
  os.homedir(),
  ".local",
  "share",
  "com.vercel.cli",
  "auth.json",
);
const altPaths = [
  path.join(os.homedir(), ".vercel", "auth.json"),
  path.join(process.env.APPDATA || "", "com.vercel.cli", "auth.json"),
  path.join(process.env.LOCALAPPDATA || "", "com.vercel.cli", "auth.json"),
];

const candidates = [
  path.join(
    process.env.APPDATA || "",
    "com.vercel.cli",
    "Data",
    "auth.json",
  ),
  cfgPath,
  ...altPaths,
];

let token;
for (const p of candidates) {
  try {
    token = JSON.parse(fs.readFileSync(p, "utf8")).token;
    console.log("token from", p);
    break;
  } catch {
    /* next */
  }
}
if (!token) {
  console.error("No Vercel token found; paths tried:", cfgPath, altPaths);
  process.exit(1);
}

const TEAM = "team_wahyusr1fs-projects"; // dicoba dulu; fallback tanpa teamId
const DEPL = "dpl_HeETqTLUUPTLSfitHbEbThRxV6Wu";

const tryFetch = async (url) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status, body: await res.json() };
};

for (const url of [
  `https://api.vercel.com/v13/deployments/${DEPL}`,
  `https://api.vercel.com/v13/deployments/${DEPL}?teamId=wahyusr1fs-projects`,
]) {
  const { status, body } = await tryFetch(url);
  console.log(url.slice(0, 60), "->", status);
  if (status === 200) {
    console.log(
      JSON.stringify(
        {
          projectId: body.projectId,
          routes: body.routes?.slice(0, 30),
          buildSucceeded: body.buildSucceeded,
        },
        null,
        2,
      ).slice(0, 4000),
    );
    break;
  } else {
    console.log(JSON.stringify(body).slice(0, 300));
  }
}
