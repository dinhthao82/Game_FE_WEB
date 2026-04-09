# Hero Appearance Template

## Thiết kế tổng quan

```
Hero visual = Portrait (UI) + Battle Sprite (map)

Portrait   → customizable: gender + hair + skin + eye + class outfit
Battle     → đơn giản hơn: gender + class sprite sheet (2 variants per class)
```

---

## Data Schema

```typescript
enum HairStyle {
  // Male
  SHORT_NEAT   = 'SHORT_NEAT',    // gọn gàng, ngắn
  SHORT_MESSY  = 'SHORT_MESSY',   // bù xù
  SWEPT_BACK   = 'SWEPT_BACK',    // vuốt ra sau
  HALF_TIED    = 'HALF_TIED',     // buộc nửa
  // Female
  PONYTAIL     = 'PONYTAIL',      // đuôi ngựa
  TWIN_TAILS   = 'TWIN_TAILS',    // hai đuôi
  SHORT_BOB    = 'SHORT_BOB',     // bob ngắn
  LONG_LOOSE   = 'LONG_LOOSE',    // dài xõa
  BRAIDED      = 'BRAIDED',       // bím tóc
}

enum HairColor {
  BLACK   = 'BLACK',
  BROWN   = 'BROWN',
  BLONDE  = 'BLONDE',
  RED     = 'RED',
  SILVER  = 'SILVER',
  WHITE   = 'WHITE',
}

enum SkinTone {
  LIGHT  = 'LIGHT',
  MEDIUM = 'MEDIUM',
  DARK   = 'DARK',
}

enum EyeColor {
  BROWN  = 'BROWN',
  BLUE   = 'BLUE',
  GREEN  = 'GREEN',
  GREY   = 'GREY',
  RED    = 'RED',    // rare — roll riêng
  GOLD   = 'GOLD',   // rare — chỉ Major Holy Blood
}

interface HeroAppearance {
  hairStyle: HairStyle;
  hairColor: HairColor;
  skinTone: SkinTone;
  eyeColor: EyeColor;
  // gender: lấy từ HeroData.gender
  // outfit: determined by currentClass — không lưu ở đây
}
```

---

## Random Generation Rules

```typescript
function generateAppearance(gender: HeroGender, holyBloods: HeroHolyBlood[], rng: RNG): HeroAppearance {
  const hairStyle = gender === 'MALE'
    ? rng.pick([SHORT_NEAT, SHORT_MESSY, SWEPT_BACK, HALF_TIED])
    : rng.pick([PONYTAIL, TWIN_TAILS, SHORT_BOB, LONG_LOOSE, BRAIDED]);

  const hairColor = rng.weightedPick([
    { value: HairColor.BLACK,  weight: 30 },
    { value: HairColor.BROWN,  weight: 30 },
    { value: HairColor.BLONDE, weight: 20 },
    { value: HairColor.RED,    weight: 10 },
    { value: HairColor.SILVER, weight: 7  },
    { value: HairColor.WHITE,  weight: 3  },
  ]);

  const skinTone = rng.weightedPick([
    { value: SkinTone.LIGHT,  weight: 40 },
    { value: SkinTone.MEDIUM, weight: 40 },
    { value: SkinTone.DARK,   weight: 20 },
  ]);

  // Eye color — GOLD chỉ cho Major Holy Blood
  const hasMajorBlood = holyBloods.some(b => b.rank === BloodRank.MAJOR);
  const eyeColor = hasMajorBlood && rng.next() < 0.6
    ? EyeColor.GOLD
    : rng.weightedPick([
        { value: EyeColor.BROWN, weight: 35 },
        { value: EyeColor.BLUE,  weight: 30 },
        { value: EyeColor.GREEN, weight: 20 },
        { value: EyeColor.GREY,  weight: 10 },
        { value: EyeColor.RED,   weight: 5  },
      ]);

  return { hairStyle, hairColor, skinTone, eyeColor };
}
```

---

## Class → Outfit Mapping

Outfit tự động theo class, không lưu trong HeroAppearance:

| Class | Outfit | Màu chủ đạo |
|-------|--------|-------------|
| DARK_KNIGHT | Giáp đen, cape tím | Black / Purple |
| PALADIN | Giáp trắng, ánh vàng | White / Gold |
| DRAGOON | Giáp xanh dương, mũ sừng | Blue / Silver |
| HOLY_DRAGOON | Giáp xanh nhạt, cánh nhỏ | Cyan / White |
| MONK | Áo choàng đỏ, không giáp | Red / Orange |
| MASTER_MONK | Áo trắng, dây vàng | White / Gold |
| NINJA | Áo đen ôm, mặt nạ | Black / Dark Red |
| EDGE_MASTER | Áo đen-xám, không mặt nạ | Black / Grey |
| KNIGHT | Giáp nặng xám, khiên | Grey / Silver |
| GRAND_KNIGHT | Giáp vàng, áo hoàng gia | Gold / Crimson |
| HUNTER | Áo da, mũ rộng vành | Brown / Green |
| SNIPER | Áo da xanh, kính nhắm | Dark Green / Brown |
| BARD | Áo sặc sỡ, mũ lông | Colorful |
| TROUBADOUR | Áo tím, đàn bạc | Purple / Silver |
| MACHINIST | Đồ công nghiệp, kính bảo hộ | Brown / Brass |
| ENGINEER | Đồ kỹ thuật, nhiều túi | Dark Brown / Copper |
| WHITE_MAGE | Áo trắng dài, mũ nhọn | White / Gold |
| ARCHBISHOP | Áo thánh, vầng hào quang | White / Holy Gold |
| BLACK_MAGE | Áo đen, mũ to | Black / Dark Blue |
| ARCHMAGE | Áo đen-tím, phù văn | Black / Purple |
| CALLER | Áo xanh lá, biểu tượng thú | Green / Teal |
| SUMMONER | Áo xanh đậm, ngọc triệu hồi | Deep Blue / Gem |
| EIDOLON_MASTER | Áo vàng-xanh, hào quang | Gold / Azure |
| MYSTIC | Áo xám-xanh, nhiều chú văn | Grey / Blue |
| SAGE | Áo trắng-vàng, cả 2 phù văn | White / Gold |

---

## Hero Card Preview Template

```
┌─────────────────────────────────┐
│  [Portrait 64×64]               │
│  ┌──────────────────────────┐   │
│  │  Hair: Silver, Ponytail  │   │
│  │  Eyes: Gold ✦ (Major)    │   │
│  │  Skin: Light             │   │
│  │  Outfit: White Mage      │   │
│  └──────────────────────────┘   │
│                                 │
│  Rosa        White Mage Lv1    │
│  FEMALE  ·  [Major Naga Blood] │
│                                 │
│  HP 18  MAG 6  RES 7           │
│  Starting weapon: Heal          │
└─────────────────────────────────┘
```

---

## Sprite Architecture

```
Battle Sprite (map):
  spritesheet: class_gender.png
  e.g. WHITE_MAGE_FEMALE.png
  Frames: idle(4) walk(4) attack(4) death(4) = 16 frames per unit

  Không cần render hair/skin trên battle sprite
  → giữ đơn giản, 2 variants per class (MALE / FEMALE)
  → Total: 25 classes × 2 = 50 sprite sheets

Portrait (UI — hero card, info panel):
  Render layered:
    Layer 1: base face (skin tone)
    Layer 2: hair (style + color)
    Layer 3: eyes (color)
    Layer 4: class outfit overlay

  → Dùng composite image hoặc pre-generated per combination
  → Nếu pre-generate: SkinTone(3) × HairStyle(9) × HairColor(6) × EyeColor(6) = quá nhiều
  → Khuyến nghị: runtime layer composite (Phaser RenderTexture)
```

### Phaser RenderTexture — Portrait Composite

```typescript
function buildPortrait(
  scene: Phaser.Scene,
  gender: HeroGender,
  appearance: HeroAppearance,
  heroClass: HeroClass
): Phaser.GameObjects.RenderTexture {
  const rt = scene.add.renderTexture(0, 0, 64, 64);

  // Layer 1 — base face + skin
  rt.draw(`face_${gender}_${appearance.skinTone}`, 0, 0);
  // Layer 2 — hair
  rt.draw(`hair_${appearance.hairStyle}_${appearance.hairColor}`, 0, 0);
  // Layer 3 — eyes
  rt.draw(`eyes_${appearance.eyeColor}`, 0, 0);
  // Layer 4 — class outfit
  rt.draw(`outfit_${heroClass}_${gender}`, 0, 0);

  return rt;
}
```

---

## HeroData — Appearance Field

Thêm vào `HeroData`:

```typescript
interface HeroData {
  // ... existing fields ...
  appearance: HeroAppearance;   // generated once, không đổi
}
```

`appearance` được generate cùng lúc với hero, không thay đổi kể cả sau promote
(outfit thay đổi theo `currentClass` nhưng hair/skin/eye giữ nguyên).

---

## Edge Cases

| Scenario | Xử lý |
|----------|--------|
| Major Blood → Eye Gold không roll được | Fallback về Brown |
| Resurrect hero | appearance giữ nguyên từ lúc sinh |
| Promote → class đổi | outfit đổi theo currentClass, appearance không đổi |
| Male hero → PONYTAIL style | Không xảy ra — hairStyle pool tách theo gender |
