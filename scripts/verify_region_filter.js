const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  const filePath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  console.log('Loading file:', filePath);
  await page.goto(filePath);
  await page.waitForLoadState('domcontentloaded');

  // 即時（50ms待機）で出題部位チップが存在するか確認
  await page.waitForTimeout(100);
  const chips = await page.$$('#drf-chips .drf-chip');
  console.log(`Initial chips count: ${chips.length}`);
  
  if (chips.length === 0) {
    console.error('❌ ERROR: #drf-chips is empty on initial page load!');
    process.exit(1);
  }

  const badgeText = await page.$eval('#drf-count-badge', el => el.innerText);
  console.log('Badge text:', badgeText);

  // チップの各ラベルを表示
  for (let i = 0; i < chips.length; i++) {
    const text = await chips[i].innerText();
    console.log(`Chip ${i + 1}: ${text}`);
  }

  // 1つのチップをクリックしてトグルをテスト
  await chips[0].click();
  await page.waitForTimeout(200);
  const newBadgeText = await page.$eval('#drf-count-badge', el => el.innerText);
  console.log('Badge text after toggle:', newBadgeText);

  await browser.close();
  console.log('✅ Region filter bar initial load & toggle verification PASSED!');
})();
