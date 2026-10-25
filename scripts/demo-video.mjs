// Records a ~30s tour of the PUBLIC landing page of the SDIT Bustanul Huda frontend.
// The admin panel is intentionally not recorded: the backend is not deployed yet
// (see README#demo), so there are no working demo credentials.
// Usage: node scripts/demo-video.mjs [baseURL]

import { chromium } from "@playwright/test";
import { mkdirSync, renameSync } from "node:fs";

const BASE = process.argv[2] ?? process.env.DEMO_BASE_URL ?? "https://sdit-bustanul-huda-frontend.vercel.app";
const OUT = "demo-output";
const wait = (page, ms) => page.waitForTimeout(ms);

async function step(page, label, fn) {
  const t = Date.now();
  try {
    await fn();
    console.log(`ok   ${label} (${Math.round((Date.now() - t) / 1000)}s)`);
  } catch (err) {
    console.log(`skip ${label}: ${err.message.split("\n")[0]}`);
  }
}

const CURSOR_JS = () => {
  const dot = document.createElement("div");
  dot.style.cssText =
    "position:fixed;z-index:2147483647;width:18px;height:18px;border-radius:50%;" +
    "background:rgba(217,119,6,.9);box-shadow:0 0 0 4px rgba(217,119,6,.25);" +
    "pointer-events:none;transform:translate(-50%,-50%);transition:width .1s,height .1s;left:-40px;top:-40px";
  document.documentElement.appendChild(dot);
  window.addEventListener("mousemove", (e) => {
    dot.style.left = e.clientX + "px";
    dot.style.top = e.clientY + "px";
  }, true);
  window.addEventListener("mousedown", () => { dot.style.width = "28px"; dot.style.height = "28px"; }, true);
  window.addEventListener("mouseup", () => { dot.style.width = "18px"; dot.style.height = "18px"; }, true);
};

async function glide(page, x, y) {
  await page.mouse.move(x, y, { steps: 12 });
  await wait(page, 350);
}

async function scrollBy(page, total, chunk = 320, pause = 900) {
  let done = 0;
  while (done < total) {
    await page.mouse.wheel(0, chunk);
    done += chunk;
    await wait(page, pause);
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: OUT, size: { width: 1280, height: 720 } },
    locale: "id-ID",
  });
  await context.addInitScript(CURSOR_JS);
  const page = await context.newPage();
  page.setDefaultTimeout(12000);

  await step(page, "hero", async () => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await wait(page, 4000);
    await glide(page, 640, 320);
    await wait(page, 2000);
  });

  await step(page, "about + stats", async () => {
    await scrollBy(page, 640);
    await wait(page, 1500);
  });

  await step(page, "programs", async () => {
    await scrollBy(page, 700);
    await wait(page, 1200);
  });

  await step(page, "gallery", async () => {
    await scrollBy(page, 700);
    await wait(page, 1200);
  });

  await step(page, "announcements", async () => {
    await scrollBy(page, 700);
    await wait(page, 1200);
  });

  await step(page, "contact/footer", async () => {
    await scrollBy(page, 640);
    await wait(page, 1600);
  });

  await step(page, "login page", async () => {
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
    await wait(page, 2500);
    await glide(page, 640, 420);
    await wait(page, 1500);
  });

  await step(page, "back to top", async () => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await wait(page, 2200);
    await glide(page, 640, 200);
    await wait(page, 1200);
  });

  const video = page.video();
  await context.close();
  await browser.close();
  const tmp = await video.path();
  mkdirSync("docs/media", { recursive: true });
  renameSync(tmp, "docs/media/demo.webm");
  console.log("saved docs/media/demo.webm");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
