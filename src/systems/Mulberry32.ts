/** Mulberry32 seeded PRNG — fast, good quality for game use */
export class RNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** Returns float in [0, 1) */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  }

  /** Integer in [0, max) */
  int(max: number): number {
    return Math.floor(this.next() * max);
  }

  /** Pick random element from array */
  pick<T>(arr: T[]): T {
    return arr[this.int(arr.length)];
  }

  /** Weighted pick: [{value, weight}] */
  weightedPick<T>(entries: { value: T; weight: number }[]): T {
    const total = entries.reduce((s, e) => s + e.weight, 0);
    let r = this.next() * total;
    for (const e of entries) {
      r -= e.weight;
      if (r <= 0) return e.value;
    }
    return entries[entries.length - 1].value;
  }

  /** Fisher-Yates shuffle (returns new array) */
  shuffle<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
}
