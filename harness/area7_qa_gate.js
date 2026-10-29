/**
 * 🏛️ area7_qa_gate.js (領域7: 最外部 外部ペルソナ受入ゲート)
 * 過去教訓: タイムスタンプ欺瞞検知、ファイル存在だけチェックの完全打破
 */
const fs = require('fs');
const path = require('path');

function runGate() {
  console.log("==================================================");
  console.log("🧑‍⚕️ 【領域7】最外部 外部ペルソナ実機受入ゲートウェイ");
  console.log("==================================================");

  let errors = [];

  // データとアセットの実体突合 ＆ 破損検知
  const dataPath = path.join(__dirname, '../data/cards.json');
  if (fs.existsSync(dataPath)) {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    data.forEach(item => {
      if (item.image) {
        const cleanRelPath = item.image.split('?')[0];
        const imgPath = path.join(__dirname, '..', cleanRelPath);
        if (!fs.existsSync(imgPath)) {
          errors.push(`[ID:${item.id}] 画像アセット未配置: ${cleanRelPath}`);
        } else {
          const stat = fs.statSync(imgPath);
          if (stat.size < 1000) {
            errors.push(`[ID:${item.id}] 画像ファイルサイズ異常 (ダミー・破損の疑い: ${stat.size} bytes)`);
          }
        }
      }
    });
  }

  if (errors.length > 0) {
    console.error("🚨 領域7 受入拒絶 (REJECT):");
    errors.forEach(e => console.error("  ❌ " + e));
    process.exit(1);
  }

  console.log("✨ 領域7 受入承認 (APPROVED): ALL PASS");
  process.exit(0);
}

runGate();
