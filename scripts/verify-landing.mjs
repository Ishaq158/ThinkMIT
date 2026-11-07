import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const widths = [320, 375, 768, 1024, 1280, 1440, 1920, 2560];

async function runVerification() {
  console.log('Starting Landing Page Responsive & Motion Verification...');

  const tmpUserDataDir = path.join(__dirname, '..', '.tmp-edge-' + Date.now());
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    userDataDir: tmpUserDataDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const results = [];

  for (const w of widths) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Initial hero card layout height (offsetHeight is untransformed layout height)
    const initialHeroHeight = await page.evaluate(() => {
      const card = document.querySelector('.hero-card');
      return card ? card.offsetHeight : null;
    });

    // Wait 2.5s for typing and reveal animations
    await new Promise((r) => setTimeout(r, 2500));

    // Checks after typing
    const metrics = await page.evaluate((width) => {
      const doc = document.documentElement;
      const scrollWidth = doc.scrollWidth;
      const innerWidth = window.innerWidth;
      const hasHorizontalScroll = scrollWidth > innerWidth;

      const heroCard = document.querySelector('.hero-card');
      const heroHeight = heroCard ? heroCard.offsetHeight : null;

      const studio = document.querySelector('#studio');
      const studioRect = studio ? studio.getBoundingClientRect() : null;
      const heroCardRect = heroCard ? heroCard.getBoundingClientRect() : null;

      const studioContained = studioRect && heroCardRect
        ? studioRect.right <= heroCardRect.right + 2 && studioRect.left >= heroCardRect.left - 2
        : true;

      const splitWords = document.querySelectorAll('.h-display .w');
      const gaugeArc = document.getElementById('g-arc');
      const gaugeOffset = gaugeArc ? gaugeArc.style.strokeDashoffset : null;

      return {
        width,
        scrollWidth,
        innerWidth,
        hasHorizontalScroll,
        heroHeight,
        studioContained,
        splitWordCount: splitWords.length,
        gaugeOffset,
      };
    }, w);

    const heightStable = Math.abs((initialHeroHeight || 0) - (metrics.heroHeight || 0)) < 2;

    const screenshotPath = path.join(screenshotsDir, `responsive-${w}.png`);
    await page.screenshot({ path: screenshotPath });

    results.push({
      ...metrics,
      initialHeroHeight,
      heightStable,
      screenshot: `responsive-${w}.png`,
    });

    console.log(
      `Width ${w}px: ScrollWidth=${metrics.scrollWidth}/${metrics.innerWidth} | NoHorizontalScroll=${!metrics.hasHorizontalScroll} | HeightStable=${heightStable} | StudioContained=${metrics.studioContained}`
    );
  }

  // Test with JavaScript Disabled
  console.log('Testing with JavaScript Disabled...');
  const noJsPage = await browser.newPage();
  await noJsPage.setJavaScriptEnabled(false);
  await noJsPage.setViewport({ width: 1280, height: 900 });
  await noJsPage.goto('http://localhost:3000', { waitUntil: 'load' });

  const noJsVisible = await noJsPage.evaluate(() => {
    const rvEls = document.querySelectorAll('.rv');
    let allVisible = true;
    rvEls.forEach((el) => {
      const style = window.getComputedStyle(el);
      if (style.opacity === '0' || style.visibility === 'hidden') {
        allVisible = false;
      }
    });
    return {
      totalCards: rvEls.length,
      allVisible,
    };
  });

  const noJsScreenshot = path.join(screenshotsDir, 'no-js.png');
  await noJsPage.screenshot({ path: noJsScreenshot });
  console.log(`No-JS Test: ${noJsVisible.totalCards} cards | All Visible Without JS=${noJsVisible.allVisible}`);

  await browser.close();
  try {
    fs.rmSync(tmpUserDataDir, { recursive: true, force: true });
  } catch {}

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.table(
    results.map((r) => ({
      Width: r.width,
      'No H-Scroll': !r.hasHorizontalScroll ? 'PASS' : 'FAIL',
      'Hero Height Stable': r.heightStable ? 'PASS' : 'FAIL',
      'Studio Inside Hero': r.studioContained ? 'PASS' : 'FAIL',
      'Words Split': r.splitWordCount > 0 ? 'PASS' : 'FAIL',
    }))
  );
  console.log('No-JS Fallback Visibility:', noJsVisible.allVisible ? 'PASS' : 'FAIL');
}

runVerification().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
