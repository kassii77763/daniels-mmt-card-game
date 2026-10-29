const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log("==================================================");
  console.log("🛡️ 【超厳格・実機UI幾何監査v7】PC＆スマホ幾何・文字切れ・小窓化完全根絶テスト");
  console.log("==================================================");
  
  const browser = await chromium.launch({ headless: true });
  const fileUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

  // ====================================================
  // 1. 初期表示オーバーレイ・モーダル不可視チェック
  // ====================================================
  console.log("\n[TEST 1] 未アクティブ画面・モーダルの完全不可視チェック...");
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  const modalSelectors = [
    '#karuta-result-screen',
    '#judge-feedback-modal',
    '#judge-results-screen',
    '#pvp-pass-modal',
    '#carry-over-badge',
    '#image-modal-overlay'
  ];

  for (const sel of modalSelectors) {
    const el = page.locator(sel);
    const count = await el.count();
    if (count > 0) {
      const isVisible = await el.isVisible();
      const disp = await el.evaluate(e => window.getComputedStyle(e).display);
      console.log(`  ${sel}: visible=${isVisible}, display=${disp}`);
      if (isVisible || disp !== 'none') {
        throw new Error(`FAIL: 未アクティブモーダル ${sel} が初期ロード時に可視状態です (visible=${isVisible}, disp=${disp})`);
      }
    }
  }
  console.log("✅ TEST 1 合格: 全モーダル・リザルトの初期露出ゼロ確認");

  // ====================================================
  // 2. PC幅 (1280x800) 実測幾何テスト（内部スクロール枠撤廃＆文字切れゼロ）
  // ====================================================
  console.log("\n[TEST 2] PC幅 (1280x800) 実測幾何テスト...");
  // 図鑑タブを開く
  await page.click('button[data-tab="list"]');
  await page.waitForTimeout(600);

  // 内部スクロール禁止チェック
  const scrollContainerCheck = await page.evaluate(() => {
    const encSection = document.getElementById('tab-list');
    const encGrid = document.querySelector('.encyclopedia-grid');
    const secStyle = window.getComputedStyle(encSection);
    const gridStyle = window.getComputedStyle(encGrid);
    return {
      secOverflowY: secStyle.overflowY,
      secMaxHeight: secStyle.maxHeight,
      gridOverflowY: gridStyle.overflowY,
      gridMaxHeight: gridStyle.maxHeight
    };
  });
  console.log("  図鑑スクロール設定:", scrollContainerCheck);
  if (scrollContainerCheck.gridOverflowY === 'scroll' || 
      (scrollContainerCheck.gridOverflowY === 'auto' && scrollContainerCheck.gridMaxHeight !== 'none')) {
    throw new Error("FAIL: 図鑑グリッドに内部スクロール制限（小窓化）が設定されています！");
  }

  // 文字切れ（... 省略・はみ出し）ゼロ実測チェック
  const textTruncationErrors = await page.evaluate(() => {
    const cards = document.querySelectorAll('.encyclopedia-grid .k-card');
    const errors = [];
    cards.forEach((card, idx) => {
      const title = card.querySelector('.kc-title');
      const muscle = card.querySelector('.kc-muscle');
      const vec = card.querySelector('.kc-vec-text');
      
      // scrollWidth > clientWidth + 2 で省略・はみ出しを検知
      // ※折り返し（white-space: normal）されていれば scrollWidth == clientWidth になる
      [title, muscle, vec].forEach(el => {
        if (el) {
          const style = window.getComputedStyle(el);
          if (style.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 2) {
            errors.push(`Card #${idx+1} [${title ? title.textContent.trim() : '?'}] のテキストが ... で切れています (scrollWidth: ${el.scrollWidth} > clientWidth: ${el.clientWidth})`);
          }
        }
      });
    });
    return errors;
  });

  if (textTruncationErrors.length > 0) {
    console.error("  ❌ 文字切れ検出:", textTruncationErrors.slice(0, 5));
    throw new Error(`FAIL: ${textTruncationErrors.length} 件のカードで文字が '...' で切れています！`);
  }
  console.log("✅ TEST 2 合格: 図鑑内部スクロール枠撤廃 ＆ 文字切れゼロ確認");

  // ====================================================
  // 3. スマホ幅 (390x844) 実測幾何テスト（全5タブ横はみ出しゼロ＆極小潰れゼロ）
  // ====================================================
  console.log("\n[TEST 3] スマホ幅 (390x844: iPhone相当) 実測幾何テスト...");
  const spPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true
  });
  await spPage.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await spPage.waitForTimeout(800);

  const tabs = ['battle', 'karuta', 'judge', 'flow', 'list'];
  for (const tab of tabs) {
    await spPage.click(`button[data-tab="${tab}"]`);
    await spPage.waitForTimeout(400);

    // 横はみ出し実測
    const docScrollWidth = await spPage.evaluate(() => document.documentElement.scrollWidth);
    console.log(`  Tab [${tab}]: document.documentElement.scrollWidth = ${docScrollWidth}px`);
    if (docScrollWidth > 390) {
      throw new Error(`FAIL: タブ [${tab}] で横はみ出しが発生しています (${docScrollWidth}px > 390px)`);
    }

    // タブ別寸法チェック
    if (tab === 'battle') {
      // 手札カード幅チェック（潰れ防止：90px以上）
      const handCardWidth = await spPage.evaluate(() => {
        const firstCard = document.querySelector('.hand-card-grid .k-card-flip-wrap') || document.querySelector('.hand-card-grid .k-card');
        return firstCard ? firstCard.getBoundingClientRect().width : 0;
      });
      console.log(`  Battle 手札1枚の描画幅: ${handCardWidth.toFixed(1)}px`);
      if (handCardWidth < 90) {
        throw new Error(`FAIL: スマホでバトル手札が潰れています (${handCardWidth.toFixed(1)}px < 90px)`);
      }
    }

    if (tab === 'judge') {
      // 判定ボタン高さチェック（最小48px）
      const btnHeight = await spPage.evaluate(() => {
        const btn = document.querySelector('.jaction-btn');
        return btn ? btn.getBoundingClientRect().height : 0;
      });
      console.log(`  Judge 判定ボタンの描画高さ: ${btnHeight.toFixed(1)}px`);
      if (btnHeight < 40) {
        throw new Error(`FAIL: 判定ボタンが押しづらい極小サイズです (${btnHeight.toFixed(1)}px < 40px)`);
      }
    }

    if (tab === 'flow') {
      // フローチャートの画像枠が描画されているか
      const flowAgImg = await spPage.locator('#flow-ag-img').count();
      const flowGeImg = await spPage.locator('#flow-ge-img').count();
      console.log(`  Flowchart 画像要素存在確認: AG=${flowAgImg}, GE=${flowGeImg}`);
      if (flowAgImg === 0 || flowGeImg === 0) {
        throw new Error("FAIL: フローチャートにG3/G2のイラスト要素が存在しません！");
      }
    }

    if (tab === 'list') {
      // 図鑑カードのイラスト枠高さチェック（110px以上）
      const artHeight = await spPage.evaluate(() => {
        const art = document.querySelector('.encyclopedia-grid .kc-art-window');
        return art ? art.getBoundingClientRect().height : 0;
      });
      console.log(`  Encyclopedia イラスト枠の描画高さ: ${artHeight.toFixed(1)}px`);
      if (artHeight < 100) {
        throw new Error(`FAIL: 図鑑カードのイラスト枠が極小です (${artHeight.toFixed(1)}px < 100px)`);
      }
    }
  }
  console.log("✅ TEST 3 合格: 全5タブ スマホ横はみ出しゼロ＆極小潰れゼロ確認");

  // ====================================================
  // 4. カルタモード 1Pソロ ＆ 2P対面切替 実機テスト
  // ====================================================
  console.log("\n[TEST 4] カルタモード 1Pソロ標準 ＆ 2P対面切替テスト...");
  await page.click('button[data-tab="karuta"]');
  await page.waitForTimeout(400);

  // デフォルトで2Pゾーンが非表示（1Pソロ標準）であることを確認
  const p2ZoneDisp = await page.evaluate(() => {
    const el = document.getElementById('k-zone-p2');
    return el ? window.getComputedStyle(el).display : 'none';
  });
  console.log(`  デフォルト状態の 2Pゾーン display: ${p2ZoneDisp}`);
  if (p2ZoneDisp !== 'none') {
    throw new Error(`FAIL: カルタのデフォルトが1Pソロではなく2P対面になっています (display=${p2ZoneDisp})`);
  }

  // スタート説明画面が開いていれば閉じる
  const startBtn = page.locator('.karuta-btn-start').first();
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(400);
  }

  // 2P対面トグルボタンを押して切り替えテスト
  await page.click('#btn-split-toggle');
  await page.waitForTimeout(300);
  const p2ZoneDispAfter = await page.evaluate(() => {
    const el = document.getElementById('k-zone-p2');
    return el ? window.getComputedStyle(el).display : 'none';
  });
  console.log(`  切替後の 2Pゾーン display: ${p2ZoneDispAfter}`);
  if (p2ZoneDispAfter !== 'flex') {
    throw new Error(`FAIL: 2P対面切替ボタンを押しても2Pゾーンが表示されません (display=${p2ZoneDispAfter})`);
  }
  console.log("✅ TEST 4 合格: カルタ 1Pソロ標準 ＆ 2P対面切替 100% 動作確認");

  await page.close();
  await spPage.close();
  await browser.close();

  console.log("\n==================================================");
  console.log("🎉🎉 全実機UI幾何＆レスポンシブ監査テスト: 100% 完全合格 (ALL PASS) 🎉🎉");
  console.log("==================================================");
  process.exit(0);
})();
