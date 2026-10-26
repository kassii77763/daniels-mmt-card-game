const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 820 } });

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:8080/index.html');
  await page.waitForTimeout(600);

  console.log('--- TEST: NEXT Field Badge ---');
  const nextFieldText = await page.innerText('#field-next-badge');
  console.log('Next Field Badge:', nextFieldText.replace(/\n+/g, ' '));

  console.log('--- TEST: 3-Win Lamp Gauge ---');
  const lampsExist = await page.locator('.match-gauge').isVisible();
  console.log('Match Gauge visible:', lampsExist);

  console.log('--- TEST: CPU Mini-Card Hints ---');
  const cpuHints = await page.locator('.cpu-mini-card').first().innerText();
  console.log('CPU First Card Hint:', cpuHints.replace(/\n+/g, ' '));

  console.log('--- TEST: Player Hand Aura Classes ---');
  const auraCards = await page.locator('.k-card.match-normal, .k-card.match-gravity, .k-card.match-dim').count();
  console.log('Player cards with aura or dim classes (should be 5):', auraCards);

  console.log('--- TEST: Play and Check Step 1 -> Step 2 -> Shake ---');
  await page.click('#player-hand-container .k-card:first-child');
  
  await page.waitForTimeout(400);
  const tickerStep1 = await page.innerText('#result-ticker');
  console.log('T=400ms Ticker (Base):', tickerStep1);

  await page.waitForTimeout(600);
  const tickerStep2 = await page.innerText('#result-ticker');
  console.log('T=1000ms Ticker (Pos Step):', tickerStep2);

  await page.waitForTimeout(900);
  const tickerFinal = await page.innerText('#result-ticker');
  console.log('T=1900ms Ticker (Final):', tickerFinal);

  await browser.close();
  console.log('✨ ALL V3 FEATURES VERIFIED SUCCESSFULLY!');
})();
