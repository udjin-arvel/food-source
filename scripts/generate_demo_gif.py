"""Generate demo.gif for README (two-frame UI preview)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "demo.gif"

W, H = 960, 540
BG = (245, 244, 240)
INK = (26, 26, 26)
YELLOW = (255, 209, 0)
MUTED = (120, 120, 120)


def frame(title: str, subtitle: str, badge: str | None = None) -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    try:
        font_l = ImageFont.truetype("arial.ttf", 28)
        font_m = ImageFont.truetype("arial.ttf", 18)
        font_s = ImageFont.truetype("arial.ttf", 14)
    except OSError:
        font_l = font_m = font_s = ImageFont.load_default()

    d.rounded_rectangle((24, 24, 72, 72), radius=12, fill=YELLOW)
    d.text((38, 38), "F", fill=INK, font=font_l)
    d.text((88, 32), "FoodSource", fill=INK, font=font_l)
    d.text((88, 68), "помощник закупщика", fill=MUTED, font=font_s)

    if badge:
        d.rounded_rectangle((W - 200, 36, W - 36, 68), radius=16, fill=(255, 240, 180))
        d.text((W - 190, 44), badge, fill=INK, font=font_s)

    d.rounded_rectangle((24, 100, 280, H - 24), radius=16, fill=(255, 255, 255))
    d.text((44, 120), "Фильтры", fill=INK, font=font_m)
    d.text((44, 160), "Категория · Регион", fill=MUTED, font=font_s)
    d.text((44, 190), "Сертификаты · MOQ", fill=MUTED, font=font_s)

    d.rounded_rectangle((300, 100, W - 24, 180), radius=16, fill=(255, 255, 255))
    d.text((320, 120), title, fill=INK, font=font_m)
    d.text((320, 148), subtitle, fill=MUTED, font=font_s)

    for i, name in enumerate(
        ["Мельница «Зерновой двор»", "Томская ягода", "Крахмал-Центр"], start=0
    ):
        y = 200 + i * 110
        d.rounded_rectangle((300, y, W - 24, y + 96), radius=16, fill=(255, 255, 255))
        d.text((320, y + 16), name, fill=INK, font=font_m)
        d.text((320, y + 44), "Скор 92 · ХАССП · MOQ от 100 кг", fill=MUTED, font=font_s)
        if i == 0 and badge == "Лучший выбор":
            d.rounded_rectangle((W - 180, y + 16, W - 44, y + 44), radius=10, fill=YELLOW)
            d.text((W - 170, y + 22), "Лучший выбор", fill=INK, font=font_s)

    if "Сравнение" in title:
        cols = 3
        cw = (W - 348) // cols
        for c in range(cols):
            x = 300 + c * (cw + 12)
            d.rounded_rectangle((x, 200, x + cw, H - 24), radius=12, fill=(255, 255, 255))
            d.text((x + 12, 216), f"Поставщик {c + 1}", fill=INK, font=font_s)
            d.text((x + 12, 246), "MOQ · Цена · Сертиф.", fill=MUTED, font=font_s)
            if c == 0:
                d.rectangle((x + 8, 280, x + cw - 8, 320), outline=YELLOW, width=3)

    return img


def main() -> None:
    frames = [
        frame(
            "Мой запрос: ингредиенты",
            "Рекомендации для вашего запроса · ранжирование по скору",
            badge="Лучший выбор",
        ),
        frame(
            "Сравнение 3 поставщиков",
            "Side-by-side · подсветка лучших MOQ и цены",
        ),
    ]
    frames[0].save(
        OUT,
        save_all=True,
        append_images=frames[1:],
        duration=2200,
        loop=0,
        optimize=True,
    )
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
