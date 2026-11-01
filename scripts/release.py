# -*- coding: utf-8 -*-
"""
Automatic Release & Cache-Buster Script for MMT GRADE
Executes version bumping, 3-layer DoD verification, and Git dual-branch deployment.
"""
import os
import re
import datetime
import subprocess
import sys

def run(cmd):
    print(f"  > {cmd}")
    res = subprocess.run(cmd, shell=True, text=True, capture_output=True, encoding="utf-8", errors="replace")
    if res.returncode != 0:
        print(f"❌ コマンド失敗: {cmd}\n{res.stderr}\n{res.stdout}")
        sys.exit(1)
    return res.stdout.strip()

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(script_dir)
    os.chdir(root_dir)

    custom_msg = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else ""

    # 1. 現在のバージョン番号を sw.js から抽出
    with open("sw.js", "r", encoding="utf-8") as f:
        sw_content = f.read()

    m = re.search(r"mmt-grade-cache-v(\d+)", sw_content)
    current_ver = int(m.group(1)) if m else 17
    next_ver = current_ver + 1

    today = datetime.datetime.now().strftime("%Y%m%d")
    new_cache_name = f"mmt-grade-cache-v{next_ver}"
    new_version_tag = f"{today}_v{next_ver}"

    print(f"🚀 バージョン更新開始: v{current_ver} ➔ v{next_ver} ({new_version_tag})")

    # 2. sw.js のキャッシュ名とクエリパラメータを置換
    sw_content = re.sub(r"mmt-grade-cache-v\d+", new_cache_name, sw_content)
    sw_content = re.sub(r"\?v=\d{8}_v\d+", f"?v={new_version_tag}", sw_content)
    with open("sw.js", "w", encoding="utf-8") as f:
        f.write(sw_content)
    print(f"  ✅ sw.js: {new_cache_name}")

    # 3. index.html のキャッシュバスター (?v=...) を置換
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()
    html = re.sub(r"\?v=\d{8}_v\d+", f"?v={new_version_tag}", html)
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  ✅ index.html: ?v={new_version_tag}")

    # 4. app.js のキャッシュバスター (?v=...) を置換
    if os.path.exists("app.js"):
        with open("app.js", "r", encoding="utf-8") as f:
            app_js = f.read()
        app_js = re.sub(r"\?v=\d{8}_v\d+", f"?v={new_version_tag}", app_js)
        with open("app.js", "w", encoding="utf-8") as f:
            f.write(app_js)
        print(f"  ✅ app.js: ?v={new_version_tag}")

    # 5. manifest.json のクエリパラメータを置換（存在する場合）
    if os.path.exists("manifest.json"):
        with open("manifest.json", "r", encoding="utf-8") as f:
            mf = f.read()
        mf = re.sub(r"\?v=\d{8}_v\d+", f"?v={new_version_tag}", mf)
        with open("manifest.json", "w", encoding="utf-8") as f:
            f.write(mf)
        print(f"  ✅ manifest.json: ?v={new_version_tag}")

    # 6. PROGRESS.md のステータス概要を置換
    if os.path.exists("PROGRESS.md"):
        with open("PROGRESS.md", "r", encoding="utf-8") as f:
            pg = f.read()
        pg = re.sub(r"現在のステータス概要 \(v\d+.*?\)", f"現在のステータス概要 (v{next_ver})", pg)
        pg = re.sub(r"\*\*キャッシュバスター\*\*: `\d{8}_v\d+`", f"**キャッシュバスター**: `{new_version_tag}`", pg)
        with open("PROGRESS.md", "w", encoding="utf-8") as f:
            f.write(pg)
        print(f"  ✅ PROGRESS.md: v{next_ver}")

    # 7. 3層DoDテストの自動実行
    print("\n🧪 3層DoDテストを実行中...")
    run("node -c app.js")
    run("node -c sw.js")
    run('node -e "JSON.parse(require(\'fs\').readFileSync(\'manifest.json\', \'utf8\'))"')
    print("  ✅ 第1層: 構文チェック PASS")

    run("python harness/image_quality_gate.py")
    print("  ✅ 第2層: 画像品質ゲート PASS")

    run("node harness/e2e_full_verification.js")
    print("  ✅ 第3層: 実機E2Eテスト PASS")

    # 8. Git コミット & 両ブランチへプッシュ
    if custom_msg:
        commit_msg = f"release(v{next_ver}): {custom_msg} ({new_version_tag})"
    else:
        commit_msg = f"release: bump version to v{next_ver} ({new_version_tag})"

    run("git add index.html sw.js manifest.json app.js scripts/ PROGRESS.md")
    run(f'git commit -m "{commit_msg}"')
    run("git push origin main")
    run("git checkout gh-pages")
    run("git merge main --no-edit")
    run("git push origin gh-pages")
    run("git checkout main")

    print(f"\n🎉 デプロイ完了！最新バージョン v{next_ver} が本番環境に反映されました。")

if __name__ == "__main__":
    main()
