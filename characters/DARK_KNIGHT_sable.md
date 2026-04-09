# Sable — Dark Knight

## Identity

| Field | Value |
|-------|-------|
| Name | Sable |
| Gender | Female |
| Age archetype | Teenage (16–17) |
| Class | DARK_KNIGHT |
| Holy Blood | Minor Odo (15% roll — tóc bạch kim hint) |

---

## Appearance

| Field | Value |
|-------|-------|
| Hair Style | SHORT_BOB — cúp gọn, che một bên mắt |
| Hair Color | WHITE (bạch kim — hiệu ứng Minor Odo blood) |
| Skin Tone | LIGHT |
| Eye Color | RED (rare 5% roll — đặc trưng dark class) |

**Outfit — Dark Knight (teenage variant):**
```
- Giáp đen nhẹ hơn full plate — phù hợp vóc dáng teen, vẫn coverage tốt
- Vai phải có spaulder nhỏ màu đen mờ ánh tím
- Cape ngắn màu tím đậm, rách nhẹ ở viền (battle-worn)
- Không có mũ giáp — để lộ tóc bob trắng
- Găng tay đen đến khuỷu tay
- Mắt đỏ nổi bật trên nền da trắng, ánh nhìn lạnh
```

---

## Portrait Design (64×64 px — FE4 style)

```
Palette (16 màu):
  Background : #1a1a2e (xanh đêm)
  Skin       : #f5d6b8 #e8c09a #c49a6c  (light, shadow, deep shadow)
  Hair       : #f0f0ff #d0d0f0 #a0a0d0  (trắng bạch kim, bóng)
  Eyes       : #cc2222 #ff4444 #ffffff  (đỏ đậm, đỏ sáng, highlight)
  Armor      : #1a1a1a #2d2d3a #4a3f5c  (đen, đen tím, tím đậm)
  Cape       : #3d1f5c #5c2d8a          (tím đậm, tím sáng)
  Accent     : #8b5cf6                   (tím ánh sáng — edge highlight)
```

```
Vùng portrait 64×64 — layout zones:

  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ← bg: xanh đêm gradient
  ░░░░░░░▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░   ← hair (trắng bạch kim)
  ░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░   ← hair phủ che mắt trái
  ░░░▓▓▓░░░░░░░░░▓░▓▓▓░░░░░░░░░░░   ← mặt (skin light) + hair bob
  ░░▓▓▓░░(eyes)░░░░░░▓▓░░░░░░░░░░   ← mắt: trái ẩn sau tóc, phải đỏ
  ░░▓▓░░░░░░░░░░░░░░░▓▓░░░░░░░░░░   ← mũi, má
  ░░▓▓░░░░░(mouth)░░░▓▓░░░░░░░░░░   ← môi — expression nghiêm lạnh
  ░░▓▓▓░░░░░░░░░░░░▓▓▓░░░░░░░░░░░   ← cằm + cổ
  ░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░   ← vai + spaulder đen tím
  ░░░░████████████████░░░░░░░░░░░░   ← áo giáp đen (chest)
  ░░░░████████████████░░░░░░░░░░░░   ← cape tím góc dưới trái
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

**Expression:** lạnh lùng, không smile — ánh nhìn phía trước hơi xuống
**Đặc điểm nhận ra:** tóc bob trắng che mắt trái + mắt phải đỏ

---

## Battle Sprite (24×24 px — FE4 style)

```
Palette tương tự portrait, rút gọn còn 8 màu chính:
  Skin · Hair-white · Eye-red · Armor-black · Armor-purple · Cape-purple · Outline · BG-trans

Frame layout (idle animation — 2 frames):
  Frame 1: đứng thẳng, tay trái cầm kiếm xuôi
  Frame 2: thở nhẹ — shoulder dịch lên 1px, cape đu nhẹ

Attack animation (3 frames):
  Frame 1: raise sword (kiếm lên trên đầu)
  Frame 2: slash (kiếm kéo chéo xuống — motion blur 1px)
  Frame 3: return stance
```

---

## Stats — Dark Knight Lv 1

| Stat | Base | With Minor Odo (+5 STR) |
|------|------|--------------------------|
| HP   | 20   | 20 |
| STR  | 7    | **12** |
| MAG  | 1    | 1 |
| DEF  | 6    | 6 |
| RES  | 2    | 2 |
| SPD  | 5    | 5 |
| SKL  | 5    | 5 |
| LCK  | 3    | 3 |

> Minor Odo blood bonus (+5 STR) tính runtime, không lưu vào baseStats

**Starting Weapon:** Iron Sword `[50/50]`
**Skills:** DARKWAVE · SHADOW_STEP · COVER

---

## Lore Flavor

```
Tóc trắng không phải do tuổi — là dấu hiệu của Minor Odo blood
chảy trong người cô từ thế hệ trước, biểu hiện sớm hơn thường.

Cô chọn Dark Knight không phải vì muốn tăm tối —
mà vì đó là class duy nhất chấp nhận cô khi còn trẻ như vậy.
```

---

## HeroAppearance Object

```typescript
const sable_appearance: HeroAppearance = {
  hairStyle: HairStyle.SHORT_BOB,
  hairColor: HairColor.WHITE,
  skinTone:  SkinTone.LIGHT,
  eyeColor:  EyeColor.RED,
};

const sable: HeroData = {
  heroId: 'demo-sable-001',
  runId: 'run-000',
  gender: 'FEMALE',
  nameRecord: { originalName: 'Sable', changedName: null, changeUsed: false },
  lifecycleState: 'ACTIVE',
  deathSnapshot: null,
  baseClass: 'DARK_KNIGHT',
  currentClass: 'DARK_KNIGHT',
  isPromoted: false,
  level: 1,
  promotionLevel: null,
  experience: 0,
  baseStats: { hp:20, str:7, mag:1, def:6, res:2, spd:5, skl:5, lck:3 },
  stats:     { hp:20, str:12, mag:1, def:6, res:2, spd:5, skl:5, lck:3 }, // +5 STR Odo runtime
  knownSkillIds: ['DARKWAVE', 'SHADOW_STEP', 'COVER'],
  combatLoadout: [{ defId: 'IRON_SWORD', currentDurability: 50 }],
  holyBloods: [{ blood: HolyBlood.ODO, rank: BloodRank.MINOR }],
  appearance: sable_appearance,
  isResurrected: false,
};
```
