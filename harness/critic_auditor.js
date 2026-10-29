/**
 * MMT GRADE — Clinical & UX Critic Auditor
 * 臨床正確性・カード画像配置・肢位整合性の自動監査エンジン
 */

const fs = require('fs');
const path = require('path');

const CARDS_PATH = path.join(__dirname, '../data/cards.json');
const ASSETS_DIR = path.join(__dirname, '../assets/cards');

function runAudit() {
  console.log("==================================================");
  console.log("🔍 MMT GRADE — 臨床＆UI/UX 独立監査（Critic Auditor）");
  console.log("==================================================");

  let passed = 0;
  let warnings = 0;
  let errors = 0;

  // 1. カード辞書の検証
  if (!fs.existsSync(CARDS_PATH)) {
    console.error("❌ ERROR: cards.json が見つかりません");
    return;
  }

  const cards = JSON.parse(fs.readFileSync(CARDS_PATH, 'utf-8'));
  console.log(`📋 登録カード数: ${cards.length} 枚`);

  // 2. 肢位・筋肉・グレードの整合性検証
  const imageUsageMap = new Map(); // 画像ごとの使用状況追跡

  cards.forEach(c => {
    // 肢位の有効性チェック（ダニエルズ第10版 股関節屈曲拘縮時・TFL特殊肢位を含む）
    const validPositions = ["背臥位", "腹臥位", "座位", "端座位", "側臥位", "前腕支持", "前腕中間位", "立位", "立位前傾", "長座位"];
    if (!validPositions.includes(c.pos)) {
      console.error(`❌ [ID:${c.id}] 不正な肢位: ${c.pos}`);
      errors++;
    } else {
      passed++;
    }

    // 画像アセットの存在確認 ＆ グレード追跡
    if (c.image) {
      const fullPath = path.join(__dirname, '..', c.image);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ [ID:${c.id}] ${c.title} — 画像アセット正常確認: ${path.basename(c.image)}`);
        passed++;

        // 画像使い回し追跡
        if (!imageUsageMap.has(c.image)) {
          imageUsageMap.set(c.image, []);
        }
        imageUsageMap.get(c.image).push(c);
      } else {
        console.warn(`⚠️ [ID:${c.id}] ${c.title} — 画像ファイル未配置: ${c.image}`);
        warnings++;
      }
    } else {
      console.log(`ℹ️ [ID:${c.id}] ${c.title} — プレースホルダー表示モード`);
      passed++;
    }
  });

  // 3. 評価関数コア強化: 異肢位・異グレードでの画像使い回し（Cross-Grade Collision）厳格監査
  console.log("\n🔬 画像ユニーク性＆肢位・グレード整合性ディープ監査:");
  for (const [imagePath, usedCards] of imageUsageMap.entries()) {
    if (usedCards.length > 1) {
      // 肢位が異なるカード間で同じ画像が使われていないか？
      const positions = [...new Set(usedCards.map(c => c.pos))];
      const grades = [...new Set(usedCards.map(c => c.grade))];
      
      if (positions.length > 1) {
        console.error(`❌ FATAL CLINICAL ERROR: 画像 '${path.basename(imagePath)}' が異なる肢位 [${positions.join(' ⇔ ')}] で使い回されています！(カード: ${usedCards.map(c => c.title).join(', ')})`);
        errors++;
      } else if (grades.some(g => g.includes('2') || g.includes('G2')) && grades.some(g => g.includes('5') || g.includes('4') || g.includes('G5'))) {
        // 第10版同一肢位・同一セッティング例外（前腕回外回内・前脛骨筋など、画像にg5432を含み肢位が完全一致する場合）
        const isUnifiedSetting = usedCards.every(c => c.pos === usedCards[0].pos) && imagePath.includes('g5432');
        if (!isUnifiedSetting) {
          console.error(`❌ FATAL CLINICAL ERROR: 画像 '${path.basename(imagePath)}' が抵抗位(G5/G4)と重力除去位(G2)で混同されています！(カード: ${usedCards.map(c => c.title).join(', ')})`);
          errors++;
        } else {
          console.log(`ℹ️ 合法画像共有（第10版同一肢位・全Grade共用）: ${path.basename(imagePath)} -> ${usedCards.map(c => c.title).join(', ')}`);
          passed++;
        }
      } else {
        console.log(`ℹ️ 画像共有（同一肢位）: ${path.basename(imagePath)} -> ${usedCards.map(c => c.title).join(', ')}`);
        passed++;
      }
    } else {
      passed++;
    }
  }

  console.log("\n--------------------------------------------------");
  console.log(`🎯 監査完了: 合格 ${passed} | 警告 ${warnings} | エラー ${errors}`);
  console.log("--------------------------------------------------");
  if (errors === 0) {
    console.log("✨ 臨床整合性＆UI/UX監査: ALL PASS");
    process.exit(0);
  } else {
    console.error(`🚨 臨床整合性＆UI/UX監査: ${errors} 件のエラーでREJECTされました`);
    process.exit(1);
  }
}

runAudit();
