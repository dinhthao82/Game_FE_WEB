import type { TerrainType, MovementType } from '@/types';

export interface TerrainDef {
  id:          TerrainType;
  displayName: string;
  defBonus:    number;
  avoidBonus:  number;
  moveCost:    Record<MovementType, number | null>; // null = impassable
  color:       number;   // Phaser tint hex
}

export const TERRAIN: Record<TerrainType, TerrainDef> = {
  PLAIN: {
    id: 'PLAIN', displayName: 'Plain',
    defBonus: 0, avoidBonus: 0,
    moveCost: { WALK: 1, CAVALRY: 1, FLY: 1, ARMORED: 1 },
    color: 0x4a7c3a,
  },
  FOREST: {
    id: 'FOREST', displayName: 'Forest',
    defBonus: 1, avoidBonus: 20,
    moveCost: { WALK: 2, CAVALRY: 3, FLY: 1, ARMORED: 3 },
    color: 0x1e5c14,
  },
  MOUNTAIN: {
    id: 'MOUNTAIN', displayName: 'Mountain',
    defBonus: 2, avoidBonus: 40,
    moveCost: { WALK: 4, CAVALRY: null, FLY: 1, ARMORED: null },
    color: 0x7a6a5a,
  },
  FORT: {
    id: 'FORT', displayName: 'Fort',
    defBonus: 2, avoidBonus: 20,
    moveCost: { WALK: 2, CAVALRY: 1, FLY: 1, ARMORED: 1 },
    color: 0x8a8070,
  },
  SEA: {
    id: 'SEA', displayName: 'Sea',
    defBonus: 0, avoidBonus: 0,
    moveCost: { WALK: null, CAVALRY: null, FLY: 1, ARMORED: null },
    color: 0x1a4a8a,
  },
  VILLAGE: {
    id: 'VILLAGE', displayName: 'Village',
    defBonus: 0, avoidBonus: 0,
    moveCost: { WALK: 1, CAVALRY: 1, FLY: 1, ARMORED: 1 },
    color: 0xc8a060,
  },
  THRONE: {
    id: 'THRONE', displayName: 'Throne',
    defBonus: 3, avoidBonus: 30,
    moveCost: { WALK: 1, CAVALRY: 1, FLY: 1, ARMORED: 1 },
    color: 0x7a3a8a,
  },
};
