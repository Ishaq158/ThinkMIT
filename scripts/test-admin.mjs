import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const BASE_URL = 'http://localhost:3000';

async function run() {
  console.log('Testing Admin security & endpoints...');

  // 1. Unauthenticated /api/admin/stats -> 401
  const res1 = await fetch(`${BASE_URL}/api/admin/stats`);
  console.log(`[Test 1] Unauthenticated /api/admin/stats status: ${res1.status} (expected 401)`);
  if (res1.status !== 401) throw new Error(`Expected 401, got ${res1.status}`);

  // 2. Unauthenticated /api/admin/teams -> 401
  const res2 = await fetch(`${BASE_URL}/api/admin/teams`);
  console.log(`[Test 2] Unauthenticated /api/admin/teams status: ${res2.status} (expected 401)`);
  if (res2.status !== 401) throw new Error(`Expected 401, got ${res2.status}`);

  // 3. Unauthenticated /api/admin/teams/[id] -> 401
  const res3 = await fetch(`${BASE_URL}/api/admin/teams/fake-id`);
  console.log(`[Test 3] Unauthenticated /api/admin/teams/fake-id status: ${res3.status} (expected 401)`);
  if (res3.status !== 401) throw new Error(`Expected 401, got ${res3.status}`);

  // 4. Unauthenticated /api/admin/teams/bulk -> 401
  const res4 = await fetch(`${BASE_URL}/api/admin/teams/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'status', teamIds: ['123'], status: 'shortlisted' })
  });
  console.log(`[Test 4] Unauthenticated /api/admin/teams/bulk status: ${res4.status} (expected 401)`);
  if (res4.status !== 401) throw new Error(`Expected 401, got ${res4.status}`);

  // 5. Test UI via Headless Edge / Chrome
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Visit /admin/login
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[type="email"]');
  console.log('[Test 5] Successfully rendered /admin/login');

  fs.mkdirSync('public/screenshots', { recursive: true });
  await page.screenshot({ path: 'public/screenshots/admin-login.png', fullPage: true });
  console.log('Saved screenshot: public/screenshots/admin-login.png');

  // Visit /admin while not logged in -> layout redirects to /admin/login
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle0' });
  const urlAfterNav = page.url();
  console.log(`[Test 6] Visited /admin unauthenticated -> redirected to: ${urlAfterNav}`);
  if (!urlAfterNav.includes('/admin/login')) {
    throw new Error(`Expected redirect to /admin/login, got ${urlAfterNav}`);
  }

  await browser.close();
  console.log('All Milestone 7 Admin automated tests PASSED!');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
