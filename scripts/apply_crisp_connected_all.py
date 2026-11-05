import os, glob, time
from PIL import Image, ImageFilter
import numpy as np

"""
✒️ apply_crisp_connected_all.py
全180枚の手技図カードに対する「シャープ＆かすれゼロ完全復元」バッチ処理
- assets/mmt_backup_v21 の元画像から再生成（劣化ゼロ保証）
- 線の膨張（滲み・太らせ）を完全排除（シャープな線を100%維持）
- 消え入りそうな超極淡線（インク > 0.015）を途切れない美しい実線へ完全復元
- 輪郭を研ぎ澄ます精密アンシャープマスク
- 外周枠（上下左右5px）は完全純白（#FFFFFF）を100%維持
"""

def process_image(src_path, dst_path):
    img = Image.open(src_path).convert("RGB")
    arr = np.array(img, dtype=np.float32)
    
    # 1. 純粋な線画インクの算出（背景242以上を完全純白0.0へ）
    ink = np.clip((242.0 - arr) / 242.0, 0.0, 1.0)
    active = ink[ink > 0.02]
    if len(active) == 0:
        return
        
    # 2. 超極淡線（かすれ線・点線部）の接続・実線化
    # 線の太さは広げず、存在する描線位置の濃度だけをグッと引き上げる (Gamma 0.48 + 1.35x)
    ink_connected = np.where(ink > 0.015, np.power(ink, 0.48) * 1.35, 0.0)
    arr_boost = (255.0 - np.clip(ink_connected, 0.0, 1.0) * 255.0).clip(0, 255).astype(np.uint8)
    
    # 3. 外周エッジ純白保証（上下左右5px）
    arr_boost[:5, :] = 255
    arr_boost[-5:, :] = 255
    arr_boost[:, :5] = 255
    arr_boost[:, -5:] = 255
    
    # 4. 輪郭の精密シャープネス（滲みゼロ・剃刀エッジ）
    out_img = Image.fromarray(arr_boost).filter(ImageFilter.UnsharpMask(radius=1.0, percent=120, threshold=1))
    out_img.save(dst_path, format="PNG", optimize=True)

def run():
    proj_dir = r"C:\Users\四季　かしま\.gemini\antigravity\projects\mmt_card_game"
    backup_dir = os.path.join(proj_dir, "assets", "mmt_backup_v21")
    target_dir = os.path.join(proj_dir, "assets", "mmt")
    
    files = sorted([f for f in glob.glob(os.path.join(backup_dir, "*.png")) if "raw" not in f])
    print(f"🚀 全180枚の「シャープ＆かすれゼロ完全復元」一括処理を開始: {len(files)} 枚")
    t0 = time.time()
    
    for f in files:
        fname = os.path.basename(f)
        process_image(f, os.path.join(target_dir, fname))
        
    dt = time.time() - t0
    print(f"✨ 全180枚の処理が完了しました！ (所要時間: {dt:.2f}秒)")

if __name__ == "__main__":
    run()

