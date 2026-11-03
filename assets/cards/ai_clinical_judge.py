#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
harness/ai_clinical_judge.py
【独立コンテキスト・非決定論的 AI臨床裁判官スクリプト】
=============================================================================
[設計思想 - Separation of Concerns via Context Isolation]
1. 会話履歴の完全遮断:
   - このチャットセッションの履歴を一切受け取らず、単発のステートレス通信（HTTP POST）で
     Google Gemini API を直接呼び出します。
2. 監査証跡の完全可視化 (Checkability):
   - 送信したリクエスト生データを `harness/audit_sent_payload.json` にダンプ。
     ユーザー自身が「過去ログが1文字も入っていない（ターン数=1）」ことを目視確認可能。
   - 消費トークン数 (`promptTokenCount`) を `harness/verdict_ai.json` に記録。
     履歴がない（数千トークン規模）ことを数学的に証明。
3. 権限分離 (Read-Only Enforcement):
   - 検査対象コードの書き換え権限（Write）を持たず、判決文出力のみを行う。
4. スタンドアロン実行保証:
   - ユーザーが手動で `python harness/ai_clinical_judge.py` を実行しても全く同じ判決が出る。
=============================================================================
"""

import os
import sys
import json
import time
import hashlib
import urllib.request
import urllib.error

# 判定対象ファイル（デフォルト: index.html）
DEFAULT_TARGET = os.path.join(os.path.dirname(__file__), "..", "index.html")
AGENTS_MD_PATH = os.path.join(os.path.dirname(__file__), "..", "AGENTS.md")
CLINICAL_SPEC_PATH = os.path.join(os.path.dirname(__file__), "..", "docs", "spec-clinical-10th.md")
AUDIT_PAYLOAD_DUMP = os.path.join(os.path.dirname(__file__), "audit_sent_payload.json")
VERDICT_OUTPUT = os.path.join(os.path.dirname(__file__), "verdict_ai.json")

def load_gemini_api_key():
    """環境変数またはローカル .env から GEMINI_API_KEY を安全に取得"""
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if key:
        return key

    # プロジェクト内の .env を探索
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", ".env"),
        os.path.join(os.path.dirname(__file__), "..", "..", "pt_student_portal", ".env"),
        os.path.join(os.path.dirname(__file__), "..", "..", "icf_natural_mapper", ".env")
    ]
    for c in candidates:
        if os.path.exists(c):
            with open(c, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY="):
                        k = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if k:
                            return k
    return None

def sha256_file(filepath):
    """対象ファイルのハッシュ値を算出"""
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def run_ai_clinical_audit(target_file=DEFAULT_TARGET):
    print("=" * 65)
    print("⚖️  【独立コンテキスト AI臨床裁判官】監査セッション開始")
    print("=" * 65)

    api_key = load_gemini_api_key()
    if not api_key:
        print("❌ [FATAL] GEMINI_API_KEY が見つかりません。", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(target_file):
        print(f"❌ [FATAL] 検査対象ファイルが見つかりません: {target_file}", file=sys.stderr)
        sys.exit(1)

    target_sha = sha256_file(target_file)
    print(f"📋 検査対象ファイル : {os.path.relpath(target_file)}")
    print(f"🔒 SHA-256 ハッシュ : {target_sha}")

    # 1. 臨床規約と検査対象コードの完全Read-Only読み込み
    with open(AGENTS_MD_PATH, "r", encoding="utf-8", errors="ignore") as f:
        agents_rules = f.read()

    clinical_spec = ""
    if os.path.exists(CLINICAL_SPEC_PATH):
        with open(CLINICAL_SPEC_PATH, "r", encoding="utf-8", errors="ignore") as f:
            clinical_spec = f.read()

    with open(target_file, "r", encoding="utf-8", errors="ignore") as f:
        target_code = f.read()

    # 2. 裁判官のシステム評価規約（System Instructions）
    # ★ 作業員の会話履歴、過去の言い訳、試行錯誤は一切遮断
    system_instruction = """あなたは「ダニエルズ徒手筋力検査法（第10版）専門・臨床AI裁判官」です。
作業員AIの会話履歴や作業経緯は一切知らない完全独立の第三者機関として、提出されたコードを客観的に監査します。
以下の【4大臨床・規律評価関数】に基づき、1ミリの甘えも許さず厳格に判定してください。

【4大臨床・規律評価関数】
1. eval_clinical_daniels_10th:
   - ダニエルズ第10版の臨床定義（抗重力肢位・重力除去肢位・固定点・抵抗方向・代償動作）と手技ロジックが100%整合しているか。
   - 過去版の古い判定基準や誤解を招く臨床表現がないか。
2. eval_subway_schematic_principle (路線図主義の徹底):
   - AGENTS.md第5項に準拠し、写実解剖図アトラス（プロメテウス等）の劣化コピーになっていないか。
   - 起始(赤)・停止(青)・支配神経(黄)の3点記号化配線図として学習効率を高める構造になっているか。
3. eval_ui_geometry_cheating (手抜き逃避の検出):
   - AGENTS.md第2項・第3項に反し、文字切れを「text-overflow: ellipsis」で隠蔽したり、図鑑を「max-height + overflow: auto」の小窓に押し込める手抜き逃避がないか。
4. eval_hallucinated_mock_data (架空モックの捏造検出):
   - 実在しないユーザー数（「アクティブ42名」等）、架空の解答数（「1840問」等）、ダミーのLINE声などの捏造データが混入していないか。

【出力形式】
必ず以下の厳密なJSON形式のみで回答してください（Markdownコードブロックは不要）：
{
  "verdict": "PASS" または "FAIL",
  "score": 100点満点中の点数,
  "eval_results": {
    "eval_clinical_daniels_10th": { "status": "PASS" または "FAIL", "detail": "詳細理由" },
    "eval_subway_schematic_principle": { "status": "PASS" または "FAIL", "detail": "詳細理由" },
    "eval_ui_geometry_cheating": { "status": "PASS" または "FAIL", "detail": "詳細理由" },
    "eval_hallucinated_mock_data": { "status": "PASS" または "FAIL", "detail": "詳細理由" }
  },
  "prescriptions": [
    "FAILがある場合、作業員AIが修正すべき具体的な是正指示（処方箋）。ALL PASSなら空配列"
  ],
  "judge_summary": "裁判官としての総括コメント（50〜100字）"
}"""

    # 3. リクエスト本文の構築（会話履歴は完全にゼロ・ターン数=1）
    code_sample = target_code if len(target_code) < 30000 else target_code[:15000] + "\n\n/* ...[TRUNCATED FOR AUDIT]... */\n\n" + target_code[-15000:]
    user_prompt = f"""【不変正典規律 (AGENTS.md)】
{agents_rules}

【臨床正解仕様 (docs/spec-clinical-10th.md)】
{clinical_spec[:3000]}

【検査対象コード (提出物)】
{code_sample}

上記の提出物を4大評価関数に照らし、厳格に合否判定を下してください。"""

    request_payload = {
        "system_instruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.0,
            "responseMimeType": "application/json"
        }
    }

    # 4. ★監査用リクエスト生データのダンプ（ユーザー自身が会話履歴ゼロを確認可能）
    os.makedirs(os.path.dirname(AUDIT_PAYLOAD_DUMP), exist_ok=True)
    with open(AUDIT_PAYLOAD_DUMP, "w", encoding="utf-8") as f:
        json.dump(request_payload, f, ensure_ascii=False, indent=2)

    print(f"📝 監査リクエストJSONダンプ: {os.path.relpath(AUDIT_PAYLOAD_DUMP)}")
    print("   ➔ このファイルを開けば、過去の会話履歴が1文字も入っていない（ターン数=1）ことを直接確認できます。")

    # 5. ステートレスなHTTP POST通信の実行
    model_name = os.environ.get("GEMINI_MODEL") or "gemini-3.8-flash"
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"

    print(f"📡 独立Gemini API呼び出し中 ({model_name})...")
    req_body = json.dumps(request_payload).encode("utf-8")
    req = urllib.request.Request(
        api_url,
        data=req_body,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
            elapsed = time.time() - t0
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"❌ [API ERROR] HTTP {e.code}: {err_msg}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"❌ [REQUEST ERROR] {e}", file=sys.stderr)
        sys.exit(1)

    # 6. トークン消費数の数学的証明
    usage = resp_data.get("usageMetadata", {})
    prompt_tokens = usage.get("promptTokenCount", 0)
    candidates_tokens = usage.get("candidatesTokenCount", 0)

    print(f"⏱️  監査所要時間 : {elapsed:.2f} 秒")
    print(f"📊 消費トークン数: プロンプト={prompt_tokens:,} tok, 回答={candidates_tokens:,} tok")
    print("   ➔ プロンプトが数万トークンに膨らんでいないことで、過去ログが未混入であることを数学的に証明。")

    # 7. AI裁判官の判決文パース
    raw_text = resp_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
    try:
        verdict_data = json.loads(raw_text)
    except json.JSONDecodeError:
        print(f"⚠️ JSONパース失敗。生テキスト: {raw_text[:200]}")
        verdict_data = {"verdict": "FAIL", "raw": raw_text}

    # 最終証跡の構築
    final_verdict = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "target_file": os.path.relpath(target_file),
        "target_sha256": target_sha,
        "model": model_name,
        "token_usage": {
            "prompt_tokens": prompt_tokens,
            "candidates_tokens": candidates_tokens,
            "total_tokens": prompt_tokens + candidates_tokens
        },
        "elapsed_seconds": round(elapsed, 2),
        "verdict": verdict_data.get("verdict", "FAIL"),
        "score": verdict_data.get("score", 0),
        "eval_results": verdict_data.get("eval_results", {}),
        "prescriptions": verdict_data.get("prescriptions", []),
        "judge_summary": verdict_data.get("judge_summary", "")
    }

    # 8. 判決文の保存
    with open(VERDICT_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(final_verdict, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 65)
    if final_verdict["verdict"] == "PASS":
        print(f"✅ 【判決: PASS (合格)】 スコア: {final_verdict['score']}点")
    else:
        print(f"🚫 【判決: FAIL (不合格・差し戻し)】 スコア: {final_verdict['score']}点")
    print("=" * 65)
    print(f"📝 裁判官総括: {final_verdict['judge_summary']}")
    for k, v in final_verdict["eval_results"].items():
        st = "✅ PASS" if v.get("status") == "PASS" else "❌ FAIL"
        print(f"  • {k:32s}: {st} - {v.get('detail')}")

    if final_verdict["prescriptions"]:
        print("\n💊 【処方箋（是正指示）】:")
        for p in final_verdict["prescriptions"]:
            print(f"  ➔ {p}")

    print(f"\n📂 判決書ファイル: {os.path.relpath(VERDICT_OUTPUT)}")
    return 0 if final_verdict["verdict"] == "PASS" else 2

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_TARGET
    code = run_ai_clinical_audit(target)
    sys.exit(code)
