import os
import glob
import time
from PIL import Image
import numpy as np

"""
🎛️ batch_density_boost.py (v2: +10% Enhanced Ink Density)
ダニエルズ第10版 MMT 手技図 決定論的インク濃度最適化スクリプト
- assets/mmt_backup_v21 のクリーンな元画像から再生成（劣化・多重掛けゼロ保証）
- 背景ノイズ（輝度240以上）を完全純白（255）にクランプ
- なだらかSカーブ＋追加10%インクブースト（S^0.82 * 1.43）
- 解像度 (640x400) および純白余白の完全維持
"""

def process_all_assets():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.abspath(os.path.join(script_dir, ".."))
    backup_dir = os.path.join(project_dir, "assets", "mmt_backup_v21")
    target_dir = os.path.join(project_dir, "assets", "mmt")
    
    files = sorted([f for f in glob.glob(os.path.join(backup_dir, "*.png")) if "raw" not in f])
    print(f"🚀 処理対象アセット: {len(files)} 枚 (元画像ベースから+10%追加ブースト)")
    
    t0 = time.time()
    success_count = 0
    
    for fpath in files:
        fname = os.path.basename(fpath)
        dst_path = os.path.join(target_dir, fname)
        
        img = Image.open(fpath).convert("RGB")
        arr = np.array(img, dtype=np.float32)
        
        # 1. 背景ノイズ遮断（240以上をインクゼロ = 純白へ）
        ink = np.clip((240.0 - arr) / 240.0, 0.0, 1.0)
        
        # 2. 決定論的Sカーブ + 10%増ブースト (S^0.82 * 1.43)
        ink_boost = np.clip(np.power(ink, 0.82) * 1.43, 0.0, 1.0)
        
        # 3. RGB逆変換
        out_arr = (255.0 - ink_boost * 255.0).clip(0, 255).astype(np.uint8)
        
        # 上書き保存
        out_img = Image.fromarray(out_arr)
        out_img.save(dst_path, format="PNG", optimize=True)
        success_count += 1

    dt = time.time() - t0
    print(f"✨ 完了: {success_count}/{len(files)} 枚を最適化 (所要時間: {dt:.2f}秒, {dt/len(files):.3f}s/枚)")

if __name__ == "__main__":
    process_all_assets()
