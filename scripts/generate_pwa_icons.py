# PWA Icon Generator for Daniels MMT
import os, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_pwa_icon(size=1024):
    scale = size / 512.0
    img = Image.new('RGBA', (size, size), (249, 248, 246, 255))
    draw = ImageDraw.Draw(img)

    border_col = (226, 232, 240, 255)
    draw.rounded_rectangle(
        [(int(8 * scale), int(8 * scale)), (int((512 - 8) * scale), int((512 - 8) * scale))],
        radius=int(96 * scale),
        outline=border_col,
        width=int(2 * scale)
    )

    back_card = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    back_draw = ImageDraw.Draw(back_card)
    card_w, card_h = int(270 * scale), int(360 * scale)
    card_rx = int(24 * scale)
    
    shadow_card = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_card)
    bx0, by0 = (size - card_w) // 2 + int(12 * scale), (size - card_h) // 2 + int(10 * scale)
    shadow_draw.rounded_rectangle(
        [(bx0, by0), (bx0 + card_w, by0 + card_h)],
        radius=card_rx,
        fill=(30, 41, 59, 35)
    )
    shadow_card = shadow_card.rotate(7, resample=Image.BICUBIC, center=(size // 2, size // 2))
    shadow_card = shadow_card.filter(ImageFilter.GaussianBlur(int(14 * scale)))
    img.paste(shadow_card, (0, 0), shadow_card)

    back_draw.rounded_rectangle(
        [(bx0, by0), (bx0 + card_w, by0 + card_h)],
        radius=card_rx,
        fill=(241, 245, 249, 255),
        outline=(203, 213, 225, 255),
        width=int(3 * scale)
    )
    for y_line in range(by0 + int(40 * scale), by0 + card_h - int(30 * scale), int(30 * scale)):
        back_draw.line([(bx0 + int(20 * scale), y_line), (bx0 + card_w - int(20 * scale), y_line)],
                       fill=(226, 232, 240, 180), width=int(1.5 * scale))
    back_card = back_card.rotate(7, resample=Image.BICUBIC, center=(size // 2, size // 2))
    img.paste(back_card, (0, 0), back_card)

    fx0 = (size - card_w) // 2 - int(4 * scale)
    fy0 = (size - card_h) // 2 + int(2 * scale)

    f_shadow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    fs_draw = ImageDraw.Draw(f_shadow)
    fs_draw.rounded_rectangle(
        [(fx0, fy0 + int(12 * scale)), (fx0 + card_w, fy0 + card_h + int(12 * scale))],
        radius=card_rx,
        fill=(15, 23, 42, 45)
    )
    f_shadow = f_shadow.filter(ImageFilter.GaussianBlur(int(16 * scale)))
    img.paste(f_shadow, (0, 0), f_shadow)

    front_card = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    f_draw = ImageDraw.Draw(front_card)
    f_draw.rounded_rectangle(
        [(fx0, fy0), (fx0 + card_w, fy0 + card_h)],
        radius=card_rx,
        fill=(255, 255, 255, 255),
        outline=(203, 213, 225, 255),
        width=int(3.5 * scale)
    )

    f_draw.rounded_rectangle(
        [(fx0 + int(10 * scale), fy0 + int(10 * scale)), (fx0 + card_w - int(10 * scale), fy0 + card_h - int(10 * scale))],
        radius=card_rx - int(6 * scale),
        outline=(241, 245, 249, 255),
        width=int(2 * scale)
    )

    cx, cy = fx0 + card_w // 2, fy0 + int(85 * scale)
    arc_r = int(44 * scale)
    
    f_draw.arc(
        [(cx - arc_r, cy - arc_r), (cx + arc_r, cy + arc_r)],
        start=190, end=350,
        fill=(217, 119, 6, 255),
        width=int(7 * scale)
    )
    arrow_tip_x = cx + int(arc_r * math.cos(math.radians(350)))
    arrow_tip_y = cy + int(arc_r * math.sin(math.radians(350)))
    f_draw.polygon([
        (arrow_tip_x + int(4 * scale), arrow_tip_y - int(10 * scale)),
        (arrow_tip_x + int(16 * scale), arrow_tip_y + int(3 * scale)),
        (arrow_tip_x - int(2 * scale), arrow_tip_y + int(12 * scale))
    ], fill=(217, 119, 6, 255))

    f_draw.ellipse(
        [(cx - int(7 * scale), cy - int(7 * scale)), (cx + int(7 * scale), cy + int(7 * scale))],
        fill=(30, 41, 59, 255)
    )
    for deg in range(180, 361, 30):
        rad = math.radians(deg)
        r1 = arc_r + int(10 * scale)
        r2 = arc_r + int(18 * scale)
        f_draw.line([
            (cx + int(r1 * math.cos(rad)), cy + int(r1 * math.sin(rad))),
            (cx + int(r2 * math.cos(rad)), cy + int(r2 * math.sin(rad)))
        ], fill=(217, 119, 6, 180), width=int(3 * scale))

    font_path = 'C:/Windows/Fonts/segoeuib.ttf'
    if not os.path.exists(font_path):
        font_path = 'C:/Windows/Fonts/arialbd.ttf'
    
    font_mmt = ImageFont.truetype(font_path, int(86 * scale))
    font_grade = ImageFont.truetype(font_path, int(26 * scale))
    font_badge = ImageFont.truetype(font_path, int(20 * scale))

    mmt_text = 'MMT'
    mmt_bbox = f_draw.textbbox((0, 0), mmt_text, font=font_mmt)
    mmt_w = mmt_bbox[2] - mmt_bbox[0]
    mmt_h = mmt_bbox[3] - mmt_bbox[1]
    mmt_x = cx - mmt_w // 2
    mmt_y = fy0 + int(152 * scale)
    f_draw.text((mmt_x, mmt_y), mmt_text, font=font_mmt, fill=(30, 41, 59, 255))

    grade_text = 'GRADE'
    g_bbox = f_draw.textbbox((0, 0), grade_text, font=font_grade)
    g_w = g_bbox[2] - g_bbox[0]
    g_h = g_bbox[3] - g_bbox[1]
    badge_pad_x = int(22 * scale)
    badge_pad_y = int(7 * scale)
    badge_w = g_w + badge_pad_x * 2
    badge_h = g_h + badge_pad_y * 2
    badge_x0 = cx - badge_w // 2
    badge_y0 = mmt_y + mmt_h + int(24 * scale)

    f_draw.rounded_rectangle(
        [(badge_x0, badge_y0), (badge_x0 + badge_w, badge_y0 + badge_h)],
        radius=int(badge_h // 2),
        fill=(30, 41, 59, 255)
    )
    f_draw.text((cx - g_w // 2, badge_y0 + badge_pad_y - int(1 * scale)), grade_text, font=font_grade, fill=(249, 248, 246, 255))

    dan_text = 'DANIELS 10th'
    dan_bbox = f_draw.textbbox((0, 0), dan_text, font=font_badge)
    dan_w = dan_bbox[2] - dan_bbox[0]
    f_draw.text((cx - dan_w // 2, fy0 + card_h - int(42 * scale)), dan_text, font=font_badge, fill=(148, 163, 184, 255))

    img.paste(front_card, (0, 0), front_card)
    return img

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    icons_dir = os.path.join(base_dir, 'assets', 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    master_icon = create_pwa_icon(1024)

    icon_512 = master_icon.resize((512, 512), resample=Image.LANCZOS)
    p512 = os.path.join(icons_dir, 'icon-512.png')
    icon_512.save(p512, 'PNG', optimize=True)

    icon_192 = master_icon.resize((192, 192), resample=Image.LANCZOS)
    p192 = os.path.join(icons_dir, 'icon-192.png')
    icon_192.save(p192, 'PNG', optimize=True)

    icon_180 = master_icon.resize((180, 180), resample=Image.LANCZOS)
    p180 = os.path.join(icons_dir, 'apple-touch-icon.png')
    icon_180.save(p180, 'PNG', optimize=True)
    print('PWA Icons generated successfully.')

if __name__ == '__main__':
    main()