# -*- coding: utf-8 -*-
"""
PWA Icon Generator for MMT GRADE
Generates clean, professional icons without any copyright-infringing names.
Theme: Warm Bone (#F9F8F6), Slate (#1E293B), Amber Gold (#D97706).
"""
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_pwa_icon():
    size = 1024
    img = Image.new("RGBA", (size, size), (249, 248, 246, 255)) # #F9F8F6 Warm Bone

    # 1. Background subtle layered card (giving depth)
    back_card = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    back_draw = ImageDraw.Draw(back_card)
    card_w, card_h = 580, 760
    card_r = 54
    bx0, by0 = (size - card_w) // 2 + 20, (size - card_h) // 2 + 25

    # Shadow for back card
    b_shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bs_draw = ImageDraw.Draw(b_shadow)
    bs_draw.rounded_rectangle([(bx0, by0), (bx0 + card_w, by0 + card_h)], radius=card_r, fill=(30, 41, 59, 25))
    b_shadow = b_shadow.rotate(5, resample=Image.BICUBIC, center=(size // 2, size // 2))
    b_shadow = b_shadow.filter(ImageFilter.GaussianBlur(24))
    img.paste(b_shadow, (0, 0), b_shadow)

    # Back card body
    back_draw.rounded_rectangle([(bx0, by0), (bx0 + card_w, by0 + card_h)], radius=card_r, fill=(241, 245, 249, 255), outline=(226, 232, 240, 255), width=6)
    for y_line in range(by0 + 80, by0 + card_h - 60, 60):
        back_draw.line([(bx0 + 40, y_line), (bx0 + card_w - 40, y_line)], fill=(226, 232, 240, 180), width=3)
    back_card = back_card.rotate(5, resample=Image.BICUBIC, center=(size // 2, size // 2))
    img.paste(back_card, (0, 0), back_card)

    # 2. Main Front Card
    fx0 = (size - card_w) // 2 - 10
    fy0 = (size - card_h) // 2 - 10

    # Front card shadow
    f_shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    fs_draw = ImageDraw.Draw(f_shadow)
    fs_draw.rounded_rectangle([(fx0, fy0 + 20), (fx0 + card_w, fy0 + card_h + 20)], radius=card_r, fill=(15, 23, 42, 50))
    f_shadow = f_shadow.filter(ImageFilter.GaussianBlur(30))
    img.paste(f_shadow, (0, 0), f_shadow)

    # Front card body
    front = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    f_draw = ImageDraw.Draw(front)
    f_draw.rounded_rectangle([(fx0, fy0), (fx0 + card_w, fy0 + card_h)], radius=card_r, fill=(255, 255, 255, 255), outline=(203, 213, 225, 255), width=6)

    # Inner decorative frame
    f_draw.rounded_rectangle([(fx0 + 24, fy0 + 24), (fx0 + card_w - 24, fy0 + card_h - 24)], radius=card_r - 12, outline=(241, 245, 249, 255), width=4)

    # --- TOP EMBLEM: Biomechanics / Goniometer Vector Arc ---
    cx = fx0 + card_w // 2
    cy = fy0 + 200
    arc_r = 85

    # Goniometer degree tick marks
    for deg in range(160, 381, 20):
        rad = math.radians(deg)
        r1 = arc_r + 14
        r2 = arc_r + (28 if deg % 40 == 0 else 20)
        p1 = (cx + r1 * math.cos(rad), cy + r1 * math.sin(rad))
        p2 = (cx + r2 * math.cos(rad), cy + r2 * math.sin(rad))
        f_draw.line([p1, p2], fill=(217, 119, 6, 200), width=4)

    # Vector Arc
    f_draw.arc([(cx - arc_r, cy - arc_r), (cx + arc_r, cy + arc_r)], start=170, end=350, fill=(217, 119, 6, 255), width=12)

    # Dynamic Arrow Head at the end of arc (350 deg)
    tip_rad = math.radians(350)
    tx = cx + arc_r * math.cos(tip_rad)
    ty = cy + arc_r * math.sin(tip_rad)
    f_draw.polygon([
        (tx + 8, ty - 20),
        (tx + 28, ty + 4),
        (tx - 4, ty + 20)
    ], fill=(217, 119, 6, 255))

    # Center Pivot point (Joint fulcrum)
    f_draw.ellipse([(cx - 16, cy - 16), (cx + 16, cy + 16)], fill=(30, 41, 59, 255))
    f_draw.ellipse([(cx - 8, cy - 8), (cx + 8, cy + 8)], fill=(249, 248, 246, 255))

    # --- TYPOGRAPHY: MMT ---
    font_path = "C:/Windows/Fonts/segoeuib.ttf"
    if not os.path.exists(font_path):
        font_path = "C:/Windows/Fonts/arialbd.ttf"

    font_mmt = ImageFont.truetype(font_path, 130)
    font_grade = ImageFont.truetype(font_path, 36)
    font_sub = ImageFont.truetype(font_path, 22)

    mmt_text = "MMT"
    mmt_bbox = f_draw.textbbox((0, 0), mmt_text, font=font_mmt)
    mmt_w = mmt_bbox[2] - mmt_bbox[0]
    mmt_h = mmt_bbox[3] - mmt_bbox[1]
    mmt_x = cx - mmt_w // 2
    mmt_y = fy0 + 330
    # Render MMT
    f_draw.text((mmt_x, mmt_y - mmt_bbox[1]), mmt_text, font=font_mmt, fill=(30, 41, 59, 255))

    # --- BADGE: GRADE ---
    grade_text = "G R A D E"
    g_bbox = f_draw.textbbox((0, 0), grade_text, font=font_grade)
    g_w = g_bbox[2] - g_bbox[0]
    g_h = g_bbox[3] - g_bbox[1]

    badge_w = 280
    badge_h = 60
    badge_x0 = cx - badge_w // 2
    # Place badge 50px below MMT bottom
    badge_y0 = mmt_y + mmt_h + 45

    # Pill background
    f_draw.rounded_rectangle(
        [(badge_x0, badge_y0), (badge_x0 + badge_w, badge_y0 + badge_h)],
        radius=badge_h // 2,
        fill=(30, 41, 59, 255)
    )
    # Centered text in pill
    text_x = cx - g_w // 2
    text_y = badge_y0 + (badge_h - g_h) // 2 - g_bbox[1]
    f_draw.text((text_x, text_y), grade_text, font=font_grade, fill=(249, 248, 246, 255))

    # --- BOTTOM ACCENT: "CLINICAL CARDS" ---
    sub_text = "CLINICAL CARDS"
    sub_bbox = f_draw.textbbox((0, 0), sub_text, font=font_sub)
    sub_w = sub_bbox[2] - sub_bbox[0]
    sub_h = sub_bbox[3] - sub_bbox[1]
    sub_x = cx - sub_w // 2
    sub_y = badge_y0 + badge_h + 60
    f_draw.text((sub_x, sub_y - sub_bbox[1]), sub_text, font=font_sub, fill=(148, 163, 184, 255))

    img.paste(front, (0, 0), front)
    return img

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    icons_dir = os.path.join(base_dir, "assets", "icons")
    os.makedirs(icons_dir, exist_ok=True)

    master_icon = create_pwa_icon()

    # 1. icon-512.png (512x512)
    icon_512 = master_icon.resize((512, 512), resample=Image.LANCZOS)
    p512 = os.path.join(icons_dir, "icon-512.png")
    icon_512.save(p512, "PNG", optimize=True)
    print(f"Generated: {p512} ({os.path.getsize(p512)} bytes)")

    # 2. icon-192.png (192x192)
    icon_192 = master_icon.resize((192, 192), resample=Image.LANCZOS)
    p192 = os.path.join(icons_dir, "icon-192.png")
    icon_192.save(p192, "PNG", optimize=True)
    print(f"Generated: {p192} ({os.path.getsize(p192)} bytes)")

    # 3. apple-touch-icon.png (180x180)
    icon_180 = master_icon.resize((180, 180), resample=Image.LANCZOS)
    p180 = os.path.join(icons_dir, "apple-touch-icon.png")
    icon_180.save(p180, "PNG", optimize=True)
    print(f"Generated: {p180} ({os.path.getsize(p180)} bytes)")

if __name__ == "__main__":
    main()
