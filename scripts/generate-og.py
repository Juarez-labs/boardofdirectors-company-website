#!/usr/bin/env python3
"""Generate /public/og-default.png for D5 — 1200x630 OG image."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

W, H = 1200, 630
BG = (10, 10, 10)            # #0a0a0a
SURFACE = (17, 17, 17)       # #111111
BORDER = (42, 42, 42)        # #2a2a2a
TEXT_PRIMARY = (245, 245, 245)
TEXT_SECONDARY = (170, 170, 170)
YELLOW = (234, 179, 8)       # #eab308
PURPLE = (168, 85, 247)      # #a855f7

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "og-default.png"

LIB_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
LIB_REG = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
MONO_BOLD = "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf"

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img, "RGBA")

# Subtle vignette / accent gradient — yellow glow top-left
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gdraw = ImageDraw.Draw(glow)
# Concentric soft circles for a glow
for r in range(700, 0, -50):
    alpha = int(18 * (1 - r / 700))
    gdraw.ellipse((-300 - r // 2, -300 - r // 2, 200 + r, 200 + r),
                  fill=(234, 179, 8, alpha))
# Purple glow bottom-right
for r in range(700, 0, -50):
    alpha = int(14 * (1 - r / 700))
    gdraw.ellipse((W - 200 - r, H - 200 - r, W + 300 + r // 2, H + 300 + r // 2),
                  fill=(168, 85, 247, alpha))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
draw = ImageDraw.Draw(img, "RGBA")

# Subtle grid pattern overlay
for x in range(0, W, 60):
    draw.line([(x, 0), (x, H)], fill=(255, 255, 255, 6), width=1)
for y in range(0, H, 60):
    draw.line([(0, y), (W, y)], fill=(255, 255, 255, 6), width=1)

# Border frame (inset)
INSET = 32
draw.rectangle((INSET, INSET, W - INSET, H - INSET), outline=BORDER, width=2)

# Top-left wordmark dot + label
DOT_X, DOT_Y = 80, 90
draw.ellipse((DOT_X, DOT_Y, DOT_X + 20, DOT_Y + 20), fill=YELLOW)
label_font = ImageFont.truetype(MONO_BOLD, 22)
draw.text((DOT_X + 36, DOT_Y - 4), "BOARD OF DIRECTORS COMPANY",
          fill=TEXT_PRIMARY, font=label_font)

# Top-right meta tag
tag_font = ImageFont.truetype(MONO_BOLD, 18)
tag = "EST. 2026  ·  AI-OPERATED"
tw = draw.textlength(tag, font=tag_font)
draw.text((W - 80 - tw, DOT_Y - 2), tag, fill=TEXT_SECONDARY, font=tag_font)

# Headline
head_font = ImageFont.truetype(LIB_BOLD, 76)
sub_font = ImageFont.truetype(LIB_BOLD, 76)
headline_l1 = "A software company"
headline_l2 = "run by AI agents."

draw.text((80, 200), headline_l1, fill=TEXT_PRIMARY, font=head_font)
# second line, "run by " regular, "AI agents." colored accent? Keep solid white for clarity, accent on period.
draw.text((80, 290), headline_l2, fill=TEXT_PRIMARY, font=sub_font)

# Accent underline beneath headline
draw.rectangle((80, 400, 200, 406), fill=YELLOW)

# Tagline / supporting line
tag_font2 = ImageFont.truetype(LIB_REG, 30)
tagline = "Real directives. Real products. Real code."
draw.text((80, 430), tagline, fill=TEXT_SECONDARY, font=tag_font2)

# Footer URL bar
foot_font = ImageFont.truetype(MONO_BOLD, 22)
draw.text((80, H - 90), "boardofdirectors.company", fill=YELLOW, font=foot_font)

# Footer right: tag chips
chips = ["GOVERNANCE", "EXECUTION", "BUILT IN PUBLIC"]
chip_font = ImageFont.truetype(MONO_BOLD, 16)
x = W - 80
for chip in reversed(chips):
    cw = draw.textlength(chip, font=chip_font) + 28
    draw.rounded_rectangle((x - cw, H - 95, x, H - 65), radius=6,
                           outline=BORDER, width=1, fill=(20, 20, 20, 255))
    draw.text((x - cw + 14, H - 90), chip, fill=TEXT_SECONDARY, font=chip_font)
    x -= cw + 12

OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, format="PNG", optimize=True)
size = OUT.stat().st_size
print(f"Wrote {OUT} ({size} bytes, {size/1024:.1f} KB)")
