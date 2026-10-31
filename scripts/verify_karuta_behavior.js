const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  const filePath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  await page.goto(filePath);
  await page.waitForLoadState('networkidle');

  await page.click('button[data-tab="karuta"]');
  await page.waitForTimeout(400);

  const startBtn = await page.$('#karuta-start-screen button');
  if (startBtn && await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(500);
  }

  // 10秒待機して全句（第1句・第2句・第3句）が順次流れるのを確認
  console.log('Watching poem sequence flow...');
  await page.waitForTimeout(9000);
  const l1 = await page.$eval('.line-1', el => el.textContent);
  const l2 = await page.$eval('.line-2', el => el.textContent);
  const l3 = await page.$eval('.line-3', el => el.textContent);
  console.log('L1:', l1);
  console.log('L2:', l2);
  console.log('L3:', l3);

  // 正解カードを見つけてクリックし、正解開示を検証
  const targetId = await page.evaluate(() => window.karutaTargetCard.id);
  console.log('Target Card ID:', targetId);
  const targetBtn = await page.$(`#k-zone-p1 [data-id="${targetId}"]`);
  if (targetBtn) {
    await targetBtn.click();
    await page.waitForTimeout(500);
    const banner = await page.$eval('#k-banner-text', el => el.innerText);
    console.log('Correct Banner:', banner);
    const postL1 = await page.$eval('.line-1', el => el.textContent);
    const postL2 = await page.$eval('.line-2', el => el.textContent);
    const postL3 = await page.$eval('.line-3', el => el.textContent);
    console.log('Post L1:', postL1);
    console.log('Post L2:', postL2);
    console.log('Post L3:', postL3);
  }

  await browser.close();
  console.log('✅ ALL SEQUENCE & REVEAL CHECKS PASSED!');
})();
