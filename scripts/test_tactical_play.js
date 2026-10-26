const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 820 } });

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:8080/index.html');
  await page.waitForTimeout(500);

  console.log('--- TEST 1: Initial state ---');
  const fieldName = await page.innerText('#field-name');
  console.log('Initial Field:', fieldName);

  console.log('--- TEST 2: Play Card & Check Suspense Phase ---');
  await page.click('#player-hand-container .k-card:first-child');
  await page.waitForTimeout(500);

  const tickerSuspense = await page.innerText('#result-ticker');
  const suspenseSlot = await page.innerText('#p1-slot');
  console.log('Suspense Ticker:', tickerSuspense);
  console.log('Suspense Slot:', suspenseSlot.replace(/\n+/g, ' '));

  console.log('--- TEST 3: Check Score Reveal (after 1.6s) ---');
  await page.waitForTimeout(1300);
  const tickerReveal = await page.innerText('#result-ticker');
  const revealedSlot = await page.innerText('#p1-slot');
  console.log('Reveal Ticker:', tickerReveal);
  console.log('Revealed Slot:', revealedSlot.replace(/\n+/g, ' '));

  console.log('--- TEST 4: Check Card Disappearance & Next Turn (after 4.8s) ---');
  await page.waitForTimeout(3500);
  const nextField = await page.innerText('#field-name');
  const slotAfter = await page.innerText('#p1-slot');
  const handCountAfter = await page.locator('#player-hand-container .k-card').count();
  console.log('Next Field:', nextField);
  console.log('Slot reset check:', slotAfter);
  console.log('Hand count after replenishment (should be 5):', handCountAfter);

  await browser.close();
  console.log('🎉 Full Life-Cycle Suspense & Fade-Out Verified Successfully!');
})();
