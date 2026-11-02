# Daniels MMT & PT Portal Cockpit v2.0 Setup Guide

## 1. 概要
本コックピットは、PTポータル・MMTカードバトル・立腰体操・解剖動画生成の各プロジェクト課題をJiraライクなUIで一元管理し、`tasks.yaml` および `shards/*.yaml` の変更を Server-Sent Events (SSE) でリアルタイム検知・同期するローカル専用ダッシュボードです。

- **URL**: `http://localhost:8795/` (または `http://127.0.0.1:8795/`)
- **台帳**: `tasks.yaml` / `shards/*.yaml`
- **サーバー**: `server.py` (軽量 Python HTTP/SSE サーバー)

---

## 2. 起動・停止方法

### 即時起動（コンソールなしバックグラウンド実行）
```cmd
launch_cockpit.bat
```
- `pythonw server.py` により、黒いコマンド画面を出さずに完全バックグラウンドで常駐起動します。
- 起動後、ブラウザで [http://localhost:8795/](http://localhost:8795/) にアクセスしてください。

### サーバーの停止
```cmd
stop_cockpit.bat
```
- ポート 8795 で稼働中のプロセスを検出し、安全に停止します。

---

## 3. Windows PC起動時 / ログオン時の常時自動起動

### 方法 A: 自動登録スクリプトを実行（推奨）
プロジェクトルートの `register_task.bat` を右クリックし、「管理者として実行」してください。
- タスク名: `DanielsCockpitDashboard`
- トリガー: ユーザーログオン時
- 実行内容: `launch_cockpit.bat`

※ 登録解除したい場合は `unregister_task.bat` を実行してください。

### 方法 B: Windows タスクスケジューラでの手動登録
1. `Win + R` を押し、`taskschd.msc` と入力して Enter。
2. 右側メニューの「タスクの作成」をクリック。
3. **全般タブ**:
   - 名前: `DanielsCockpitDashboard`
   - 「最上位の特権で実行する」にチェック。
4. **トリガータブ**:
   - 「新規」➔ タスクの開始:「ログオン時」➔ OK。
5. **操作タブ**:
   - 「新規」➔ 操作:「プログラムの開始」
   - プログラム/スクリプト: `C:\Users\四季　かしま\.gemini\antigravity\projects\mmt_card_game\launch_cockpit.bat`
   - 開始 (オプション): `C:\Users\四季　かしま\.gemini\antigravity\projects\mmt_card_game\`
6. **条件タブ**:
   - 「コンピューターを AC 電源で使用している場合のみタスクを開始する」のチェックを外す（ノートPCでも起動するため）。
7. OK をクリックして保存。

---

## 4. リアルタイムSSEとAtomic排他制御の仕様
1. **SSE LIVE監視 (127.0.0.1:8795/events)**:
   - `server.py` が毎秒 `tasks.yaml` の SHA-256 指紋を検知。
   - 人間またはAIがファイルを編集・保存すると、0.1秒以内にブラウザ上のカンバンカードがアニメーション更新されます。
2. **Atomic CAS置換 (`os.replace`)**:
   - 書き込み時は一時ファイル `.tmp` へ一度出力し、構文検証が通った段階で OS カーネルのアトミック操作で一瞬で差し替えるため、複数AIの同時書き込みでもファイル破損が発生しません。
3. **Shard分割 ＆ Done自動退避**:
   - タスクが増えてもプロジェクトごとの `shards/*.yaml` に分散管理され、完了カードは `archive/done_history.jsonl` へ退避できるため、AIのコンテキスト負荷（Context Rot）を恒久的に防ぎます。
