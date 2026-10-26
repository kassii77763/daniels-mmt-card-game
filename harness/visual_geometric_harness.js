/**
 * 🛡️ visual_geometric_harness.js (領域7 特化センサー)
 * 過去の失敗教訓（H2-RULE-006: ゲシュタルト視覚検査、H2-RULE-004: 解剖図過剰適合排除）を反映
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function evaluateVisualQuality(htmlPath) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('file://' + path.resolve(htmlPath));
  await page.waitForTimeout(500);

  const results = await page.evaluate(async () => {
    const errors = [];

    // 1. バトル画面手札カードの視覚幾何監査（アクティブ状態）
    const handCards = document.querySelectorAll('#player-hand-container .k-card');
    if (handCards.length === 0) {
      errors.push("致命的エラー: 手札カード (.k-card) が1枚も検出されませんでした");
    }

    handCards.forEach((card, idx) => {
      const img = card.querySelector('img');
      const text = card.querySelector('.kc-title');

      if (img) {
        const imgRect = img.getBoundingClientRect();
        if (imgRect.width < 40 || imgRect.height < 40) {
          errors.push(`手札 Card #${idx + 1}: 画像が小さすぎてカルタ視認不可 (${Math.round(imgRect.width)}x${Math.round(imgRect.height)}px)`);
        }
      }
      if (text) {
        const style = window.getComputedStyle(text);
        const fontSize = parseFloat(style.fontSize);
        if (fontSize < 10) {
          errors.push(`手札 Card #${idx + 1}: フォントが小さすぎます (${fontSize}px < 10px)`);
        }
      }
    });

    // 2. 図鑑タブを開いて全15枚の視覚幾何監査
    const listBtn = document.querySelector('.nav-btn[data-tab="list"]');
    if (listBtn) {
      listBtn.click();
    }

    const encCards = document.querySelectorAll('#encyclopedia-container .k-card');
    if (encCards.length === 0) {
      errors.push("致命的エラー: 図鑑カードが1枚もレンダリングされていません");
    }

    encCards.forEach((card, idx) => {
      const img = card.querySelector('img');
      const text = card.querySelector('.kc-title');

      if (img) {
        const imgRect = img.getBoundingClientRect();
        if (imgRect.width < 40 || imgRect.height < 40) {
          errors.push(`図鑑 Card #${idx + 1}: 画像が小さすぎて視認不可 (${Math.round(imgRect.width)}x${Math.round(imgRect.height)}px)`);
        }
      }
      if (text) {
        const style = window.getComputedStyle(text);
        const fontSize = parseFloat(style.fontSize);
        if (fontSize < 10) {
          errors.push(`図鑑 Card #${idx + 1}: フォントが小さすぎます (${fontSize}px < 10px)`);
        }
      }
    });

    return { totalEncyclopediaCards: encCards.length, handCards: handCards.length, errors };
  });

  await browser.close();
  return results;
}

if (require.main === module) {
  evaluateVisualQuality(path.join(__dirname, '../index.html')).then(res => {
    console.log('📊 視覚・幾何監査結果:', res);
    process.exit(res.errors.length === 0 ? 0 : 1);
  }).catch(err => {
    console.error('❌ 視覚監査失敗:', err);
    process.exit(1);
  });
}

module.exports = { evaluateVisualQuality };
