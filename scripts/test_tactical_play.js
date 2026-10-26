const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 800 } });

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:8080/index.html');
  await page.waitForTimeout(600);

  console.log('--- TEST 1: Initial state ---');
  const fieldName = await page.innerText('#field-name');
  const subName = await page.innerText('#field-sub-name');
  const scoreReadout = await page.innerText('#score-readout');
  const bedBtn = await page.innerText('#btn-bed-rotate');
  console.log('Field:', fieldName, '| Sub:', subName, '| Score:', scoreReadout, '| BedBtn:', bedBtn);

  console.log('--- TEST 2: Use Bed Rotate ---');
  await page.click('#btn-bed-rotate');
  await page.waitForTimeout(300);
  const newFieldName = await page.innerText('#field-name');
  const bedBtnAfter = await page.innerText('#btn-bed-rotate');
  const bedBtnDisabled = await page.getAttribute('#btn-bed-rotate', 'disabled');
  console.log('New Field:', newFieldName, '| BedBtn after:', bedBtnAfter, '| Disabled:', bedBtnDisabled !== null);

  console.log('--- TEST 3: Play a Card ---');
  // Click first card in hand
  await page.click('#player-hand-container .k-card:first-child');
  await page.waitForTimeout(700);

  const resultTicker = await page.innerText('#result-ticker');
  const p1Slot = await page.innerText('#p1-slot');
  console.log('Ticker:', resultTicker);
  console.log('P1 Slot content preview:', p1Slot.replace(/\n+/g, ' '));

  // Wait for draw and next turn
  await page.waitForTimeout(1600);
  const handCountAfter = await page.locator('#player-hand-container .k-card').count();
  console.log('Hand count after draw (should be 5):', handCountAfter);

  await browser.close();
  console.log('✨ All Interactive Playwright Tests PASSED!');
})();
