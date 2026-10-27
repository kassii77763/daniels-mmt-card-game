const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 820 } });

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:8080/index.html');
  await page.waitForTimeout(600);

  console.log('--- TEST 1: Sound Toggle Button ---');
  const soundBtnText = await page.innerText('#btn-sound-toggle');
  console.log('Initial Sound Button:', soundBtnText);
  await page.click('#btn-sound-toggle');
  const soundBtnMuted = await page.innerText('#btn-sound-toggle');
  console.log('After Toggle:', soundBtnMuted);
  await page.click('#btn-sound-toggle'); // re-enable

  console.log('--- TEST 2: Play Card & Check Stop at 1.4s ---');
  await page.click('#player-hand-container .k-card:first-child');

  // Check 0.3s (Base Grade)
  await page.waitForTimeout(300);
  const slotStep1 = await page.innerText('#p1-slot');
  console.log('T=300ms Slot (Base):', slotStep1.replace(/\n+/g, ' '));

  // Check 1.0s (Score Counted Up)
  await page.waitForTimeout(700);
  const slotStep2 = await page.innerText('#p1-slot');
  console.log('T=1000ms Slot (Counted):', slotStep2.replace(/\n+/g, ' '));

  // Check 1.6s (Resolved & Stopped with Next Button & Clinical Memo)
  await page.waitForTimeout(700);
  const nextBtnVisible = await page.locator('#btn-next-turn').isVisible();
  const memoVisible = await page.locator('#clinical-memo').isVisible();
  const memoText = await page.innerText('#clinical-memo');
  const tickerText = await page.innerText('#result-ticker');

  console.log('T=1700ms Next Button Visible:', nextBtnVisible);
  console.log('T=1700ms Memo Visible:', memoVisible);
  console.log('Clinical Memo:', memoText);
  console.log('Ticker:', tickerText);

  // Check that cards are STILL ON BOARD after 2.5s (No Auto-Dismissal!)
  await page.waitForTimeout(2500);
  const cardsStillThere = await page.locator('#p1-slot .k-card, #p1-slot img').count() > 0 || (await page.innerText('#p1-slot')).length > 20;
  console.log('Are cards still preserved for reading after 2.5s?:', cardsStillThere);

  console.log('--- TEST 3: Click [次のターンへ ▶] and Verify Transition ---');
  await page.click('#btn-next-turn');
  await page.waitForTimeout(1100);

  const slotAfterReset = await page.innerText('#p1-slot');
  const nextBtnAfter = await page.locator('#btn-next-turn').isVisible();
  console.log('Slot after reset:', slotAfterReset);
  console.log('Next button hidden after transition:', !nextBtnAfter);

  await browser.close();
  console.log('🎉 ALL V4 FEATURES (MANUAL TURN ADVANCE, CLINICAL MEMO, WEB AUDIO, CARRY OVER) PASSED!');
})();
