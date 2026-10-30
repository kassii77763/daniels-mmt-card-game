# Daniels MMT Tactical Card Game — AGENTS.md

## 1. プロジェクト概要 & 技術スタック
- **目的**: ダニエルズ徒手筋力検査法（第10版）準拠 160枚完備の臨床学習Webカードゲーム。
- **スタック**: Vanilla HTML5 / CSS3 / JavaScript (ES6+), OpenCV / Python 3, Playwright (E2E)。
- **本番環境**: GitHub Pages (`gh-pages` ブランチ)。

## 2. 絶対遵守のコア規律（Three Inviolable Rules）
1. **裁判官（harness/）の不可侵**:
   - `harness/` 配下のスクリプトおよび合否判定基準を作業員AIが改ざん・緩和することを禁止する。
2. **フォールバック（別画像すり替え）の完全禁止**:
   - 抽出不能・座標不整合時は別画像で穴埋めせず、`PROGRESS.md` にエラーとして記録し停止せよ。
3. **UI幾何制約の死守**:
   - 図鑑コンテナの小窓スクロール（`max-height` + `overflow: auto`）および文字切れ（`text-overflow: ellipsis`）は禁止。

## 3. 監査・検証コマンド（Definition of Done）
作業完了前に、必ず以下のコマンドを実行し ALL PASS（Exit Code 0）を確認すること：
```bash
# 第1層＆第2層：構文・画像品質ゲート
python harness/image_quality_gate.py

# 第3層：実機幾何＆レスポンシブE2E監査
node harness/e2e_full_verification.js
```

## 4. 詳細仕様インデックス
- 臨床ルール・第10版判定 ➔ docs/spec-clinical-10th.md
- UI幾何・レスポンシブ制約 ➔ docs/spec-ui.md
- 全160枚確定座標カタログ ➔ docs/dictionary-mapping.json
- 現在の作業状態と次タスク ➔ PROGRESS.md
