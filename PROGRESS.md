# PROGRESS.md — MMT Tactical Card Game 進捗ホワイトボード

## 1. 現在のステータス概要
- **総カード数**: 160枚（手指・足趾を含む全160枚、100%確定手技図適用済み v9）
- **テスト状態**:
  - 第1層＆第2層: `python harness/image_quality_gate.py` PASS (180/180)
  - 第3層: `node harness/e2e_full_verification.js` PASS (E2E & レスポンシブ幾何制約 100% 合格)
- **アーキテクチャ**:
  - System of Record 構造配備完了
  - `AGENTS.md`（100行俯瞰地図）配備完了
  - `docs/` 配下への仕様階層化（`spec-clinical-10th.md`, `spec-ui.md`, `dictionary-mapping.json`）配備完了

## 2. 完了済みタスク（Changelog）
- [x] 原本スライド全233枚（Slide 31〜270）の配置と欠落解消（手指 157〜193、足趾 259〜270 完備）
- [x] 全160カードの手技ポーズ確定座標カタログ作成（`docs/dictionary-mapping.json`）
- [x] 解剖図・断面図・骨格図の完全排除および手技図（被検者＋検者）への統一（v9）
- [x] スクロール小窓（二重スクロール）および三点リーダー省略の物理的排除
- [x] 裁判官（harness/）の不可侵保護とDoD検証パイプラインの確立

## 3. 次のタスク（Next Actions）
- [ ] ハーネス運用の定着および定期的な自動監査パイプライン維持
- [ ] 実機スマートフォン環境での定期操作感チェック
