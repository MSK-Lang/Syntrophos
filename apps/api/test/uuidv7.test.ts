import { describe, expect, it } from 'vitest';
import { extractTimestampFromUuidv7, isUuidv7, uuidv7 } from '../src/lib/uuidv7.js';

describe('UUIDv7 Generator', () => {
  it('generates valid RFC 9562 UUIDv7 strings', () => {
    const id = uuidv7();
    expect(isUuidv7(id)).toBe(true);
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('embeds accurate millisecond timestamps in the most significant 48 bits', () => {
    const now = 1718000000000; // Fixed timestamp
    const id = uuidv7(now);
    const extracted = extractTimestampFromUuidv7(id);
    expect(extracted).toBe(now);
  });

  it('maintains strict chronological ordering for sequentially generated IDs', () => {
    const ids: string[] = [];
    for (let i = 0; i < 100; i++) {
      ids.push(uuidv7());
    }

    // Verify each successive ID is lexicographically greater than or equal to previous
    for (let i = 1; i < ids.length; i++) {
      const prev = ids[i - 1]!;
      const curr = ids[i]!;
      expect(curr >= prev).toBe(true);
    }
  });

  it('generates unique IDs with zero collisions under rapid loop', () => {
    const set = new Set<string>();
    const count = 1000;
    for (let i = 0; i < count; i++) {
      set.add(uuidv7());
    }
    expect(set.size).toBe(count);
  });
});
