# Character Art Style Guide
> Phân tích từ: DarkKnight_Avata_Animation.png

---

## Tổng quan Style

**Style**: Modern Mobile Pixel Art — không phải SNES 16-color, mà là pixel art HD
**Tham chiếu gần nhất**: Fire Emblem Heroes · Langrisser Mobile · RPG Maker MZ

```
KHÔNG phải:  Classic FE4 SNES pixel (16 màu, 16×16 sprite)
MÀ là:       Modern pixel art (32+ màu, portrait ~150px, sprite ~48px)
```

---

## Kích thước chuẩn

```
Portrait (standing art):
  Canvas:  160 × 200 px
  Char:    ~130px tall (không kể shadow)
  Dùng ở:  Hero card, roster screen, reward screen

Battle Sprite (chibi):
  Canvas:   48 × 48 px
  Char:     ~40px tall
  Outline:  2px black border (1px cho sprite nhỏ)
  Dùng ở:   Map tile (16px grid → scale down to 24px on map)

Map tile unit:
  Hiển thị: 24 × 24 px trên map (scaled từ 48px sprite)
```

---

## Color System

### Palette methodology — 3-tier shading
Mỗi vùng màu có **3 tông**: base · shadow · deep shadow
Outline luôn là **#0d0d0d** (gần đen, không phải thuần đen)

```
Vùng      | Base       | Shadow     | Deep Shadow | Highlight
----------|------------|------------|-------------|----------
Skin      | #f5d4b0    | #d4956a    | #b07040     | #fff8f0
Hair-white| #f0f0ff    | #c0c0e0    | #8888b8     | #ffffff
Armor-blk | #1a1a2a    | #0d0d18    | #08080f     | #2a2a40
Cape-purp | #5b21b6    | #3d1054    | #240a35     | #7c3aed
Gold      | #d4a017    | #a07010    | #704800     | #ffd700
Silver    | #c0c8d8    | #8090a8    | #506070     | #e8eef8
Red-eye   | #dc2626    | #991b1b    | #450a0a     | #ff6060
```

### Dark Knight specific palette

```
#0d0d18  Armor deep black
#1a1a2a  Armor black
#2a2a40  Armor highlight edge
#240a35  Cape deep purple
#3d1054  Cape shadow
#5b21b6  Cape base
#7c3aed  Cape bright edge
#d4a017  Gold brooch / trim
#f0f0ff  Hair base
#c0c0e0  Hair shadow
#8888b8  Hair deep shadow
#f5d4b0  Skin base
#d4956a  Skin shadow
#dc2626  Eye red
```

---

## Portrait Design Rules

### Proportions (160×200 canvas)
```
Đầu:       40px wide × 45px tall (từ y=10 đến y=55)
Thân:       50px wide × 60px tall (y=55 đến y=115)
Chân:       40px wide × 60px tall (y=115 đến y=175)
Shadow:     ellipse 50×8px tại y=185
Tóc:        vượt ra ngoài face bounds (±5px)
Vũ khí:     có thể vượt canvas bounds (clip OK)
```

### Layering order (vẽ từ dưới lên)
```
1. Shadow (ground)
2. Cape back
3. Body / armor
4. Arms / hands
5. Weapon (back hand)
6. Head / hair back
7. Face
8. Hair front (che phần mặt)
9. Accessories (brooch, eye)
10. Weapon (front hand)
11. Outline pass (2px stroke toàn bộ silhouette)
```

### Outline style
```
Silhouette outline:  2px, #0d0d18
Inner detail lines:  1px, #0d0d18 (40% opacity)
Không dùng anti-alias — hard pixel edges
```

---

## Battle Sprite Design Rules (48×48)

### Chibi proportions
```
Đầu:    22px wide × 20px tall  (head = ~42% total height → chibi ratio)
Thân:   18px wide × 14px tall
Chân:   16px wide × 10px tall
Vũ khí: ra ngoài bounds ~4px
```

### Animation frames — chuẩn per action

| Action | Frames | FPS | Loop |
|--------|--------|-----|------|
| IDLE   | 4 f    | 6   | yes  |
| WALK   | 4 f    | 8   | yes  |
| ATTACK | 5 f    | 12  | no   |
| HURT   | 3 f    | 10  | no   |
| DEATH  | 5 f    | 8   | no   |
| SKILL  | 6 f    | 12  | no   |

### IDLE animation (4 frames)
```
F1: base pose — neutral
F2: body +1px down, cape sway left 1px
F3: body base, cape center
F4: body +1px down, cape sway right 1px
→ F1 (loop)
```

### WALK animation (4 frames)
```
F1: left foot forward
F2: both feet center (up)
F3: right foot forward
F4: both feet center (down)
Cape: sway ngược chiều với foot
```

### ATTACK animation (5 frames)
```
F1: wind-up (weapon back, body lean back)
F2: strike start (weapon forward fast)
F3: strike hit (weapon fully extended, pause 1 frame)
F4: follow-through
F5: return to idle
Timing: 80ms · 60ms · 120ms · 80ms · 200ms
```

---

## Dark Knight — Sable Reference

Dựa trực tiếp từ DarkKnight_Avata_Animation.png:

### Portrait key elements
```
✓ Tóc:  Bob ngắn trắng bạch kim, che mắt TRÁI hoàn toàn
✓ Mắt:  Phải = đỏ tươi; Trái = ẩn sau tóc
✓ Da:   Sáng (light skin)
✓ Áo:   Giáp đen full, không hở
✓ Cape: Tím đậm, xé rách ở viền dưới, dài qua đầu gối
✓ Brooch: Vàng nhỏ ở cổ áo
✓ Vũ khí: Kiếm tay phải, khiên tròn tay trái
✓ Boots: Đen, cao đến đầu gối
```

### Battle sprite key elements
```
✓ Tóc trắng nhận ra ngay (đặc điểm nhận diện chính)
✓ Cape tím phía sau, đu lắc khi walk/idle
✓ Silhouette: hơi nghiêng về phía trước (aggressive stance)
✓ Kiếm nhỏ visible tay phải
```

### Name plate (UI)
```
Quan sát từ ảnh:
  "Linh Đánh Thuê" = display name / title
  "Odo" = blood indicator badge
  → Màu: xanh navy bg, text trắng, badge tím
```

---

## Style Guide per Class

Mỗi class có **color identity** riêng, giữ nguyên skin/hair/eye của hero:

| Class | Armor Color | Cape/Robe | Accent | Weapon |
|-------|-------------|-----------|--------|--------|
| DARK_KNIGHT | #1a1a2a black | #5b21b6 purple | #d4a017 gold | Sword + Shield |
| PALADIN | #e8e0c8 ivory | #fbbf24 gold | #60a5fa blue | Sword + Holy Shield |
| DRAGOON | #1e3a8a dark blue | — | #60a5fa blue | Lance |
| HOLY_DRAGOON | #3b82f6 blue | #f0f9ff white | #fbbf24 gold | Lance + wings |
| MONK | #dc2626 red | — | #f97316 orange | Fist wraps |
| MASTER_MONK | #f5f5f0 white | #fbbf24 gold | — | Fist wraps |
| NINJA | #1a1a1a black | #1a1a1a dark | #dc2626 red | Sword (dual) |
| EDGE_MASTER | #374151 dark grey | — | #6b7280 grey | Dual blades |
| KNIGHT | #9ca3af silver | — | #1e3a8a blue | Sword + Large shield |
| GRAND_KNIGHT | #d4a017 gold | #dc2626 crimson | — | Sword + Royal shield |
| HUNTER | #92400e leather | #15803d green | — | Bow |
| SNIPER | #166534 dark green | — | #854d0e brown | Longbow |
| BARD | #7c3aed purple | #ec4899 pink | #fbbf24 gold | Harp |
| TROUBADOUR | #5b21b6 purple | #c026d3 magenta | #fbbf24 gold | Harp + Staff |
| MACHINIST | #78350f brown | — | #b45309 brass | Crossbow + tools |
| ENGINEER | #451a03 dark brown | — | #d97706 copper | Heavy crossbow |
| WHITE_MAGE | #f5f5f0 white | #fbbf24 gold | #86efac light green | Staff |
| ARCHBISHOP | #fefce8 holy white | #fbbf24 gold | #a3e635 holy | Staff + halo |
| BLACK_MAGE | #1e1b4b dark indigo | #312e81 indigo | #818cf8 lavender | Rod |
| ARCHMAGE | #0f0a1e deep purple | #6d28d9 purple | #a78bfa light purple | Grand rod |
| CALLER | #064e3b dark teal | #065f46 teal | #34d399 green | Rod |
| SUMMONER | #0c4a6e dark ocean | #075985 ocean | #38bdf8 sky | Crystal rod |
| EIDOLON_MASTER | #713f12 gold-brown | #f59e0b gold | #fde68a bright gold | Summon gem |
| MYSTIC | #1e3a5f dark slate | #1d4ed8 blue | #93c5fd light blue | Tome |
| SAGE | #faf5eb cream | #d4a017 gold | #86efac green | Dual tome + staff |

---

## Consistency Checklist (mỗi char mới)

```
Portrait:
  [ ] Canvas 160×200
  [ ] 3-tier shading trên mỗi vùng màu
  [ ] Outline 2px #0d0d18 silhouette
  [ ] Class color palette đúng bảng trên
  [ ] Hair/skin/eye từ HeroAppearance data
  [ ] Shadow ground ellipse ở dưới
  [ ] Holy Blood badge nếu có (góc trên trái portrait)

Battle Sprite:
  [ ] Canvas 48×48
  [ ] Chibi ratio (head 42% height)
  [ ] 4 frames IDLE minimum
  [ ] Class color nhận ra được ở sprite size nhỏ
  [ ] Đặc điểm nhận diện rõ (tóc màu, cape, vũ khí)
  [ ] Sprite sheet: 48×(48×frame_count) hoặc horizontal strip
```
