const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log("==================================================");
  console.log("🚀 MMT GRADE 総合実機 E2E 自律検証スイート");
  console.log("==================================================");
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const fileUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
  console.log(`Loading URL: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // ----------------------------------------------------
  // TEST 1: 初期表示チラつき防止（Flash Prevention）
  // ----------------------------------------------------
  console.log("\n[TEST 1] 初期表示オーバーレイ・モーダル不可視チェック...");
  const initialInvisibleSelectors = [
    '#karuta-result-screen',
    '#judge-feedback-modal',
    '#carry-over-badge',
    '#image-modal-overlay'
  ];
  for (const sel of initialInvisibleSelectors) {
    const el = page.locator(sel);
    const count = await el.count();
    if (count > 0) {
      const isVisible = await el.isVisible();
      const disp = await el.evaluate(e => window.getComputedStyle(e).display);
      console.log(`  ${sel}: visible=${isVisible}, display=${disp}`);
      if (isVisible || disp !== 'none') {
        throw new Error(`FAIL: ${sel} is visible on initial load!`);
      }
    }
  }
  console.log("✅ TEST 1 合格: 初期オーバーレイ・モーダルの露出ゼロ確認");

  // ----------------------------------------------------
  // TEST 2: 3行読み上げカルタ（モードA）＆ 重複排除チェック
  // ----------------------------------------------------
  console.log("\n[TEST 2] 3行読み上げカルタ（モードA）自律検証...");
  // First switch to Karuta tab
  console.log("  Switching to Karuta tab...");
  await page.click('button[data-tab="karuta"]');
  await page.waitForTimeout(500);
  // Start screen click
  const startBtn = page.locator('.karuta-btn-start').first();
  if (await startBtn.isVisible()) {
    console.log("  Clicking '対戦スタート！' button...");
    await startBtn.click();
    await page.waitForTimeout(600);
  }

  // Check 4 choices deduplication
  const choices = await page.locator('#k-zone-p1 .k-karuta-card-btn').all();
  console.log(`  Zone P1 choices count: ${choices.length}`);
  if (choices.length !== 4) throw new Error("Expected 4 choices in Karuta!");

  const imgSources = [];
  for (const choice of choices) {
    const src = await choice.locator('img').getAttribute('src');
    imgSources.push(src.split('?')[0]);
  }
  const uniqueImgs = new Set(imgSources);
  console.log(`  Unique images in 4 choices: ${uniqueImgs.size}/4 (${Array.from(uniqueImgs).join(', ')})`);
  if (uniqueImgs.size !== 4) throw new Error("FAIL: Duplicate images found in Karuta 4 choices!");

  // Tap correct choice
  const targetId = await page.evaluate(() => window.karutaTargetCard ? window.karutaTargetCard.id : null);
  console.log(`  Target Card ID: ${targetId}`);
  if (targetId) {
    const correctBtn = page.locator(`#k-zone-p1 [data-id="${targetId}"]`).first();
    await correctBtn.click();
    await page.waitForTimeout(400);
    const banner = await page.locator('#k-banner-text').textContent();
    console.log(`  Banner after correct tap: ${banner}`);
    if (!banner.includes('正解')) throw new Error("FAIL: Correct answer banner did not appear!");
  }
  console.log("✅ TEST 2 合格: カルタ4枚重複ゼロ＆正解判定確認");

  // ----------------------------------------------------
  // TEST 3: イラスト4択クイズ（モードB）
  // ----------------------------------------------------
  console.log("\n[TEST 3] イラスト4択クイズ（モードB）自律検証...");
  await page.click('#btn-mode-quiz');
  await page.waitForTimeout(500);

  const quizChoices = await page.locator('#k-zone-p1 .k-quiz-choice-btn').all();
  console.log(`  Quiz choices count: ${quizChoices.length}`);
  if (quizChoices.length !== 4) throw new Error("Expected 4 choices in Quiz!");

  const quizTitles = [];
  for (const qc of quizChoices) {
    const t = await qc.locator('.k-c-motion').textContent();
    quizTitles.push(t.replace(/\(G.*\)/, '').trim());
  }
  const uniqueTitles = new Set(quizTitles);
  console.log(`  Unique titles in 4 quiz choices: ${uniqueTitles.size}/4`);
  if (uniqueTitles.size !== 4) throw new Error("FAIL: Duplicate motions found in Quiz 4 choices!");
  console.log("✅ TEST 3 合格: クイズ4択重複ゼロ確認");

  // ----------------------------------------------------
  // TEST 4: 段階3スタート判定フローチャート（第10版基準検証）
  // ----------------------------------------------------
  console.log("\n[TEST 4] 段階3スタート判定フローチャート第10版基準検証...");
  await page.click('button[data-tab="flow"]');
  await page.waitForTimeout(500);

  // Check Grade pills text (No English qualitative labels)
  const pills = await page.locator('.grade-result-list .grade-pill').allTextContents();
  console.log(`  Grade pills found: ${pills.join(', ')}`);
  for (const p of pills) {
    if (/Normal|Good|Fair|Poor|Trace|Zero/i.test(p)) {
      throw new Error(`FAIL: Found deprecated qualitative label in flowchart pill: ${p}`);
    }
  }

  // Check Grade 2 definition
  const g2Text = await page.locator('.grade-result-list li:has(.g2)').textContent();
  console.log(`  Grade 2 text: ${g2Text.trim()}`);
  if (!g2Text.includes('重力を最小にした肢位で関節運動（一部〜全可動域）が可能')) {
    throw new Error("FAIL: Grade 2 definition is not 10th edition compliant!");
  }

  // Click Shoulder Flexion (肩関節屈曲)
  console.log("  Testing Shoulder Flexion joint button...");
  const shFlexBtn = page.locator('.joint-btn:has-text("肩関節屈曲")').first();
  if (await shFlexBtn.count() > 0) {
    await shFlexBtn.click();
    await page.waitForTimeout(300);
    const agPos = await page.locator('#flow-ag-pos').textContent();
    const gePos = await page.locator('#flow-ge-pos').textContent();
    console.log(`  Shoulder Flexion: agPos=${agPos}, gePos=${gePos}`);
    if (!agPos.includes('端座位') || !gePos.includes('側臥位')) {
      throw new Error("FAIL: Shoulder flexion positions incorrect for 10th edition!");
    }
  }
  console.log("✅ TEST 4 合格: フローチャート第10版完全準拠確認");

  // ----------------------------------------------------
  // TEST 5: 肢位マスター図鑑 ＆ 🔍拡大モーダル検証
  // ----------------------------------------------------
  console.log("\n[TEST 5] 肢位マスター図鑑 ＆ 🔍拡大モーダル検証...");
  await page.click('button[data-tab="list"]');
  await page.waitForTimeout(600);

  const cardCount = await page.locator('.k-card-flip-wrap').count();
  console.log(`  Total cards in encyclopedia: ${cardCount}`);
  if (cardCount !== 160) throw new Error(`Expected 160 cards, found ${cardCount}`);

  // Test zoom modal
  const firstZoomBtn = page.locator('.kc-zoom-btn').first();
  await firstZoomBtn.click();
  await page.waitForTimeout(400);

  const modal = page.locator('#image-modal-overlay');
  const isModalVisible = await modal.isVisible();
  const modalDisp = await modal.evaluate(el => window.getComputedStyle(el).display);
  const modalImgSrc = await page.locator('#modal-img').getAttribute('src');
  const modalTitle = await page.locator('#modal-card-title').textContent();

  console.log(`  Modal opened: visible=${isModalVisible}, display=${modalDisp}, title=${modalTitle}`);
  if (!isModalVisible || modalDisp !== 'flex') {
    throw new Error("FAIL: Zoom modal did not open properly!");
  }

  // Close modal via close button
  await page.click('.image-modal-close');
  await page.waitForTimeout(300);
  const isModalClosed = !(await modal.isVisible());
  console.log(`  Modal closed successfully: ${isModalClosed}`);
  if (!isModalClosed) throw new Error("FAIL: Modal did not close!");

  // Test filter buttons
  console.log("  Testing Encyclopedia filter chips...");
  await page.click('button[data-filter="手指・母指"]');
  await page.waitForTimeout(300);
  const fingerCards = await page.locator('.k-card-flip-wrap:visible').count();
  console.log(`  Finger cards visible: ${fingerCards}`);
  if (fingerCards !== 28) throw new Error(`Expected 28 finger cards, found ${fingerCards}`);

  await page.click('button[data-filter="足関節・足趾"]');
  await page.waitForTimeout(300);
  const footCards = await page.locator('.k-card-flip-wrap:visible').count();
  console.log(`  Foot/toe cards visible: ${footCards}`);
  if (footCards !== 20) throw new Error(`Expected 20 foot/toe cards, found ${footCards}`);

  await page.click('button[data-filter="all"]');
  console.log("✅ TEST 5 合格: 図鑑160枚・フィルタ・拡大モーダル開閉100%確認");

  // ----------------------------------------------------
  // TEST 6: オセロ式MMTバトル
  // ----------------------------------------------------
  console.log("\n[TEST 6] オセロ式MMTバトル自律検証...");
  await page.click('button[data-tab="battle"]');
  await page.waitForTimeout(500);

  const handCards = await page.locator('#player-hand-container .k-card').count();
  console.log(`  Player hand cards: ${handCards}`);
  if (handCards !== 5) throw new Error(`Expected 5 hand cards, found ${handCards}`);

  const fieldName = await page.locator('#field-name').textContent();
  console.log(`  Current field: ${fieldName}`);
  if (!fieldName) throw new Error("Field name is empty!");

  console.log("✅ TEST 6 合格: オセロMMTバトル初期化確認");

  console.log("\n==================================================");
  console.log("🎉🎉 全6大実機E2Eテスト: 100% 完全合格 (ALL PASS) 🎉🎉");
  console.log("==================================================");

  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error("\n❌ E2E TEST FAILED:", err);
  process.exit(1);
});
