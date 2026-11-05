import os, glob, time
from PIL import Image, ImageFilter
import numpy as np

"""
✒️ apply_pen_reinforcement_all.py
全180枚の手技図カードに対する「適応型インク濃度 ＋ 2pxペン入れ補強」
- assets/mmt_backup_v21 の元画像から再生成（劣化ゼロ保証）
- 画像ごとの最大インク深度を動的正規化
- 極細線（1px）を丸ペン調（自然な2px）に補強して小画面での線消失を根絶
- 外周枠（上下左右5px）は完全純白（#FFFFFF）を100%維持
"""

def process_image(src_path, dst_path):
    img = Image.open(src_path).convert("RGB")
    arr = np.array(img, dtype=np.float32)
    
    # 1. 背景ノイズ遮断（240以上はインク0 = 純白へ）
    ink = np.clip((240.0 - arr) / 240.0, 0.0, 1.0)
    active_ink = ink[ink > 0.05]
    if len(active_ink) == 0:
        return
        
    peak_ink = float(np.percentile(active_ink, 99.8))
    
    # 2. 適応型インク正規化（薄いスケッチほど強く墨入れ）
    gain = 0.95 / max(peak_ink, 0.40)
    gamma = 0.72 if peak_ink < 0.65 else (0.76 if peak_ink < 0.80 else 0.82)
    ink_norm = np.clip(ink * gain, 0.0, 1.0)
    ink_boosted = np.clip(np.power(ink_norm, gamma) * 0.95, 0.0, 1.0)
    arr_boost = (255.0 - ink_boosted * 255.0).clip(0, 255).astype(np.uint8)
    
    # 3. 極細線のペン入れ補強（MinFilter 3による自然な1px→2px拡張）
    boost_img = Image.fromarray(arr_boost)
    thick = boost_img.filter(ImageFilter.MinFilter(3))
    arr_thick = np.array(thick, dtype=np.float32)
    
    # 元の芯の強さに応じて太らせ具合を適応制御（細身画像ほどペン入れをしっかり適用）
    thick_weight = 0.35 if peak_ink < 0.75 else 0.25
    blended = np.minimum(arr_boost.astype(np.float32), arr_thick * thick_weight + arr_boost.astype(np.float32) * (1.0 - thick_weight))
    
    # 4. 外周エッジ（5px枠）の純白保護（ノイズゼロ保証）
    final_arr = blended.clip(0, 255).astype(np.uint8)
    final_arr[:5, :] = 255
    final_arr[-5:, :] = 255
    final_arr[:, :5] = 255
    final_arr[:, -5:] = 255
    
    out_img = Image.fromarray(final_arr)
    out_img.save(dst_path, format="PNG", optimize=True)

def run():
    proj_dir = r"C:\Users\四季　かしま\.gemini\antigravity\projects\mmt_card_game"
    backup_dir = os.path.join(proj_dir, "assets", "mmt_backup_v21")
    target_dir = os.path.join(proj_dir, "assets", "mmt")
    
    files = sorted([f for f in glob.glob(os.path.join(backup_dir, "*.png")) if "raw" not in f])
    print(f"🚀 全180枚のペン入れ補強一括処理を開始: {len(files)} 枚")
    t0 = time.time()
    
    for f in files:
        fname = os.path.basename(f)
        process_image(f, os.path.join(target_dir, fname))
        
    dt = time.time() - t0
    print(f"✨ 全180枚のペン入れ補強が完了しました！ (所要時間: {dt:.2f}秒)")

if __name__ == "__main__":
    run()

