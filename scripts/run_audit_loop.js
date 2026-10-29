/**
 * 🌀 run_audit_loop.js (全領域直列統合・自律周回オーケストレーター)
 */
const { spawnSync } = require('child_process');
const path = require('path');

function runStep(cmd, args, desc) {
  console.log(`\n▶️ [周回ステップ] ${desc}...`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
  if (res.status !== 0) {
    console.error(`❌ ${desc} で落第しました (Exit Code: ${res.status})`);
    process.exit(res.status || 1);
  }
  console.log(`✅ ${desc} 合格`);
}

console.log("🌀 統合自律周回ループ発火");
runStep('python', ['harness/image_quality_gate.py'], '【領域3】MMTイラスト画像品質＆文字ノイズゼロ厳格ゲート');
runStep('node', ['harness/area7_qa_gate.js'], '【領域7】最外部ペルソナ受入ゲート');
runStep('node', ['harness/area7_ghost_student.js'], '【領域7】敵対的セマンティック査問 (Ghost Student)');
runStep('node', ['harness/critic_auditor.js'], '【領域6】臨床整合性＆UI/UX 独立監査 (Critic Auditor)');
runStep('node', ['harness/visual_geometric_harness.js'], '【領域7】Playwright実機 視覚・幾何構造監査');
runStep('node', ['harness/e2e_full_verification.js'], '【領域7】Playwright実機 全モードE2E包括的動作監査');
console.log("\n🎉 全監査ゲートを完全突破しました！");


