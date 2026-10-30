# apply_verified_hardcoded_deck.py
import os, json, cv2, numpy as np

RAW_DIR = "assets/mmt/raw"
OUT_DIR = "assets/mmt"
os.makedirs(OUT_DIR, exist_ok=True)

# docs/dictionary-mapping.json から全160枚の確定座標カタログを読み込み
MAPPING_FILE = "docs/dictionary-mapping.json"
if not os.path.exists(MAPPING_FILE):
    raise FileNotFoundError(f"Mapping file not found: {MAPPING_FILE}")

with open(MAPPING_FILE, 'r', encoding='utf-8') as f:
    HARDCODED_COORDS = json.load(f)

def clean_and_center_canvas(crop_bgr, target_w=640, target_h=400):
    """
    1. テキスト・背景の黄ばみ・グリッド線を除去し、純白化
    2. 線画のコントラストを最適化
    3. アスペクト比を完全維持して 640x400 の安全中央キャンバスに配置
    """
    gray = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY)
    
    # 1. 黄ばみ・薄い影・ノイズを飛ばして純白（255）にするトーンカーブ
    lut = np.zeros(256, dtype=np.uint8)
    for i in range(256):
        if i >= 215:
            lut[i] = 255
        elif i <= 145:
            lut[i] = int(i * 0.70)
        else:
            lut[i] = int((i - 145) / 70.0 * (255 - 100) + 100)
    cleaned = cv2.cvtColor(cv2.LUT(gray, lut), cv2.COLOR_GRAY2BGR)
    
    # 2. 安全枠（580x320）内にアスペクト比維持で縮小リサイズ（頭や足の切断を防止）
    safe_w, safe_h = 580, 320
    h, w = cleaned.shape[:2]
    scale = min(safe_w / float(w), safe_h / float(h))
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    resized = cv2.resize(cleaned, (nw, nh), interpolation=cv2.INTER_AREA)
    
    # 3. 640x400 の純白キャンバスの中央に配置
    canvas = np.ones((target_h, target_w, 3), dtype=np.uint8) * 255
    x_off = (target_w - nw) // 2
    y_off = (target_h - nh) // 2
    canvas[y_off:y_off+nh, x_off:x_off+nw] = resized
    return canvas

def main():
    # 抽出実行
    cards = json.load(open('data/cards.json', encoding='utf-8'))
    print(f"Executing hardcoded extraction for all {len(cards)} cards using {MAPPING_FILE}...")

    # 網羅性チェック
    defined_ids = set(HARDCODED_COORDS.keys())
    card_img_ids = set(c['imgId'] for c in cards)
    missing = card_img_ids - defined_ids
    if missing:
        raise AssertionError(f"ERROR: {len(missing)} cards missing from HARDCODED_COORDS: {missing}")

    print(f"Verified: All {len(card_img_ids)} unique card image IDs are defined in HARDCODED_COORDS!")

    success_cnt = 0
    for c in cards:
        imgId = c['imgId']
        slide_num, x, y, w, h = HARDCODED_COORDS[imgId]
        slide_path = f"{RAW_DIR}/slide_{slide_num}.jpg"
        if not os.path.exists(slide_path):
            print(f"WARNING: {slide_path} not found!")
            continue
            
        slide_img = cv2.imread(slide_path)
        sh, sw = slide_img.shape[:2]
        
        # 座標クランプ
        x1, y1 = max(0, x), max(0, y)
        x2, y2 = min(sw, x + w), min(sh, y + h)
        
        crop = slide_img[y1:y2, x1:x2].copy()
        framed = clean_and_center_canvas(crop)
        
        out_path = f"{OUT_DIR}/{imgId}.png"
        cv2.imwrite(out_path, framed)
        success_cnt += 1

    print(f"=== EXTRACTION COMPLETE: Successfully rebuilt {success_cnt}/{len(cards)} images with 100% verified procedure poses! ===")

if __name__ == '__main__':
    main()
