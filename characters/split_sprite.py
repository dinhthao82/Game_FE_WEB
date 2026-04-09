"""
Split DarkKnight_Avata_Animation.png:
  1. Remove green background via flood-fill from corners (precise, no character damage)
  2. DarkKnight_Avatar.png    -- portrait only
  3. DarkKnight_Animation.png -- 4 sprite walk frames
"""

from PIL import Image, ImageDraw
import numpy as np
import os

SRC = os.path.join(os.path.dirname(__file__), 'DarkKnight_Avata_Animation.png')
DIR = os.path.dirname(__file__)

img = Image.open(SRC).convert('RGBA')
W, H = img.size
print(f"Source: {W}x{H}px")

# ── BACKGROUND REMOVAL via color-range mask ─────────────────────
# Use aggressive range — character has no green at all
# Background greens: #3c5e2e (60,94,46) and #476e38 (71,110,56)
# Grid lines:        #2a3e1e (42,62,30) and similar dark greens

px = np.array(img).astype(np.int32)
R, G, B = px[...,0], px[...,1], px[...,2]

# A pixel is background if:
# - Green is clearly dominant (G > R and G > B)
# - In the expected luminance range for grass tiles
# - Not purple/dark (which would be character armor/cape)

is_green = (
    (G > R) & (G > B) &          # green dominant
    (G - R > 15) &               # meaningfully more green than red
    (G - B > 10) &               # meaningfully more green than blue
    (G > 40) &                   # not pure black
    (G < 160) &                  # not too bright (avoid white hair edge fringe)
    (R < 120) &                  # low red rules out skin
    (B < 100)                    # low blue rules out cape purple
)

# Also remove the dark green grid line borders
is_dark_green = (
    (G > R) & (G > B) &
    (G - R > 10) & (G - B > 8) &
    (G > 25) & (G < 80) &
    (R < 70) & (B < 55)
)

mask = is_green | is_dark_green

out = px.copy().astype(np.uint8)
out[mask.astype(bool), 3] = 0

result = Image.fromarray(out, 'RGBA')

# ── EDGE CLEANUP: remove stray semi-transparent green fringe ────
# Do a second pass: if pixel is semi-transparent AND greenish, kill it
out2 = np.array(result).astype(np.int32)
R2, G2, B2, A2 = out2[...,0], out2[...,1], out2[...,2], out2[...,3]
fringe = (A2 > 0) & (A2 < 200) & (G2 > R2) & (G2 > B2) & (G2 > 40)
out2[fringe, 3] = 0
result = Image.fromarray(out2.astype(np.uint8), 'RGBA')

# ── AUTO-CROP ───────────────────────────────────────────────────
def autocrop(im, padding=6):
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    return im.crop((
        max(0, l - padding),
        max(0, t - padding),
        min(im.width,  r + padding),
        min(im.height, b + padding),
    ))

# ── AVATAR: left 36%, full height ───────────────────────────────
avatar_x_end = int(W * 0.365)
avatar_raw   = result.crop((0, 0, avatar_x_end, H))
avatar       = autocrop(avatar_raw, padding=8)
avatar.save(os.path.join(DIR, 'DarkKnight_Avatar.png'))
print(f"Avatar:    {avatar.width}x{avatar.height}px")

# ── ANIMATION: right portion, skip portrait overlap ──────────────
# Push x_start past portrait edge + gap
# Nameplate is at bottom-right — exclude it (take only y 5%–75%)
anim_x = int(W * 0.43)       # 43% pushes past any portrait edge
anim_y1 = int(H * 0.05)
anim_y2 = int(H * 0.76)

anim_raw = result.crop((anim_x, anim_y1, W, anim_y2))
anim     = autocrop(anim_raw, padding=6)
anim.save(os.path.join(DIR, 'DarkKnight_Animation.png'))
print(f"Animation: {anim.width}x{anim.height}px")

# ── FULL NoBG ────────────────────────────────────────────────────
result.save(os.path.join(DIR, 'DarkKnight_NoBG.png'))
print(f"NoBG:      {W}x{H}px")
print("Done.")
