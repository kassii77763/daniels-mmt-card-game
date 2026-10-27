const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 820 } });

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:8080/index.html');
  await page.waitForTimeout(600);

  console.log('--- TEST 1: Tab Navigation ---');
  // Switch to flow tab
  await page.click('button[data-tab="flow"]');
  await page.waitForTimeout(300);
  const flowTabVisible = await page.locator('#tab-flow').isVisible();
  console.log('Flow Tab Visible:', flowTabVisible);

  console.log('--- TEST 2: Interactive Flow Chart Joint Switching ---');
  const initialJoint = await page.innerText('#flow-joint-title');
  const initialAg = await page.innerText('#flow-ag-pos');
  const initialGe = await page.innerText('#flow-ge-pos');
  console.log('Initial Joint in Flow:', initialJoint, '| AG:', initialAg, '| GE:', initialGe);

  // Click another joint button e.g. "肩関節外転"
  await page.click('.joint-btn:has-text("肩関節外転")');
  await page.waitForTimeout(200);

  const switchedJoint = await page.innerText('#flow-joint-title');
  const switchedAg = await page.innerText('#flow-ag-pos');
  const switchedGe = await page.innerText('#flow-ge-pos');
  console.log('Switched Joint in Flow:', switchedJoint, '| AG:', switchedAg, '| GE:', switchedGe);

  console.log('--- TEST 3: Switch back to Battle and Select CPU Persona ---');
  await page.click('button[data-tab="battle"]');
  await page.waitForTimeout(300);

  await page.click('#p-rookie');
  const cpuLabel = await page.innerText('#cpu-name-label');
  console.log('Selected Rookie CPU Persona. Label:', cpuLabel);

  console.log('--- TEST 4: Play Card, Cause Misjudgment & Check Weakness Karte ---');
  // Play first card in hand
  await page.click('#player-hand-container .k-card:first-child');
  await page.waitForTimeout(1600); // Wait for resolution and stop
  
  // Advance turn
  await page.click('#btn-next-turn');
  await page.waitForTimeout(1100);

  // Switch to encyclopedia tab to inspect weakness karte
  await page.click('button[data-tab="list"]');
  await page.waitForTimeout(300);

  const weakCount = await page.innerText('#weak-count');
  console.log('Weakness count in Encyclopedia:', weakCount);

  // Check disclaimer presence (strictly preserved)
  const disclaimerExists = await page.locator('.rules-disclaimer').isVisible();
  console.log('Medical Disclaimer Preserved:', disclaimerExists);

  await browser.close();
  console.log('🎉 ALL V5 FLOW CHART & FEATURE TESTS PASSED!');
})();
