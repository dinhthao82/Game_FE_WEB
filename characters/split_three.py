"""
Split DarkKnight_Paladin_DarkPaladin_Avata.png:
  1. Remove green background
  2. Split into 3 separate character avatars by finding gaps between them
  3. Save: DarkKnight2_Avatar.png, Paladin_Avatar.png, DarkPaladin_Avatar.png
"""

from PIL import Image
import numpy as np
import os

SRC = os.path.join(os.path.dirname(__file__), 'DarkKnight_Paladin_DarkPaladin_Avata.png')
DIR = os.path.dirname(__file__)

img = Image.open(SRC).convert('RGBA')
W, H = img.size
print(f"Source: {W}x{H}px")

# ── BACKGROUND REMOVAL (same as split_sprite.py) ─────────────────
px = np.array(img).astype(np.int32)
R, G, B = px[...,0], px[...,1], px[...,2]

is_green = (
    (G > R) & (G > B) &
    (G - R > 15) &
    (G - B > 10) &
    (G > 40) & (G < 160) &
    (R < 120) & (B < 100)
)

is_dark_green = (
    (G > R) & (G > B) &
    (G - R > 10) & (G - B > 8) &
    (G > 25) & (G < 80) &
    (R < 70) & (B < 55)
)

mask = is_green | is_dark_green
out = px.copy().astype(np.uint8)
out[mask.astype(bool), 3] = 0

# Fringe cleanup
out2 = out.astype(np.int32)
R2, G2, B2, A2 = out2[...,0], out2[...,1], out2[...,2], out2[...,3]
fringe = (A2 > 0) & (A2 < 200) & (G2 > R2) & (G2 > B2) & (G2 > 40)
out2[fringe, 3] = 0
result = Image.fromarray(out2.astype(np.uint8), 'RGBA')

print("Background removed.")

# ── FIND COLUMN GAPS ─────────────────────────────────────────────
alpha = out2[..., 3]  # shape: H x W

# Sum alpha per column -> high = character content, low = gap
col_sum = alpha.sum(axis=0).astype(np.float32)

# Smooth to avoid noise
kernel = 5
col_smooth = np.convolve(col_sum, np.ones(kernel)/kernel, mode='same')

# Find 2 local minima in the middle 80% of the image (skip edges)
# This finds the valley points between 3 characters even if they overlap slightly
x_start = int(W * 0.10)
x_end   = int(W * 0.90)

# For 3 chars, search in two sub-ranges: 1st third and 2nd third
third = (x_end - x_start) // 3

range1 = col_smooth[x_start           : x_start + third]
range2 = col_smooth[x_start + third   : x_start + 2*third]

min1_local = int(np.argmin(range1))
min2_local = int(np.argmin(range2))

split_x = [
    x_start + min1_local,
    x_start + third + min2_local,
]
print(f"Auto split at x = {split_x}  (col values: {col_smooth[split_x[0]]:.0f}, {col_smooth[split_x[1]]:.0f})")

char_bounds = [
    (0,           split_x[0]),
    (split_x[0],  split_x[1]),
    (split_x[1],  W),
]

# ── AUTO-CROP ─────────────────────────────────────────────────────
def autocrop(im, padding=8):
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

# ── SAVE EACH CHARACTER ───────────────────────────────────────────
names = ['DarkKnight2_Avatar.png', 'Paladin_Avatar.png', 'DarkPaladin_Avatar.png']

for i, (x0, x1) in enumerate(char_bounds):
    crop = result.crop((x0, 0, x1, H))
    final = autocrop(crop, padding=8)
    path = os.path.join(DIR, names[i])
    final.save(path)
    print(f"{names[i]}: {final.width}x{final.height}px  (from x={x0}..{x1})")

print("Done.")
