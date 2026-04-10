import type { HeroClass, ClassCategory, MovementType, WeaponType } from './enums';
import type { StatBlock, StatGrowths } from './StatBlock';

export interface PromotionPath {
  promotedClass:   HeroClass;
  requiredItem:    string;       // PromotionItemDefinition.id
  requiredLevel:   number;       // default 10
  statBonus:       Partial<StatBlock>;
}

export interface ClassDefinition {
  id:              HeroClass;
  displayName:     string;
  category:        ClassCategory;
  isBaseClass:     boolean;
  movementType:    MovementType;
  movementRange:   number;
  usableWeapons:   WeaponType[];
  baseStats:       StatBlock;
  growths:         StatGrowths;
  classSkillIds:   string[];
  promotionPaths:  PromotionPath[];
  promotedFrom:    HeroClass | null;
  alternatePromotionSources: HeroClass[];
}
