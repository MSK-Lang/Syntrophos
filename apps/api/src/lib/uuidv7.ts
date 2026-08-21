import crypto from 'node:crypto';

let lastTimestamp = -1;
let sequenceCounter = 0;

/**
 * Generates an RFC 9562 compliant UUIDv7 (time-ordered, cryptographically random).
 * Embeds a 48-bit Unix timestamp in milliseconds for chronological sorting,
 * ensuring high B-Tree indexing performance in PostgreSQL.
 *
 * @param customTimestamp Optional timestamp in ms (primarily for testing/deterministic generation).
 * @returns UUIDv7 string formatted as 8-4-4-4-12 hex string.
 */
export function uuidv7(customTimestamp?: number): string {
  let timestamp = customTimestamp ?? Date.now();

  if (customTimestamp === undefined) {
    if (timestamp === lastTimestamp) {
      sequenceCounter = (sequenceCounter + 1) & 0xfff;
      if (sequenceCounter === 0) {
        // Counter overflow within same ms, wait for next ms tick
        while (timestamp <= lastTimestamp) {
          timestamp = Date.now();
        }
      }
    } else if (timestamp > lastTimestamp) {
      lastTimestamp = timestamp;
      sequenceCounter = crypto.randomInt(0, 0x3ff); // Randomize start of sub-millisecond sequence
    } else {
      // Clock moved backwards, use monotonic last timestamp
      timestamp = lastTimestamp;
      sequenceCounter = (sequenceCounter + 1) & 0xfff;
    }
  }

  const bytes = crypto.randomBytes(16);

  // 48 bits (6 bytes) Unix timestamp in milliseconds
  bytes[0] = (timestamp / 0x10000000000) & 0xff;
  bytes[1] = (timestamp / 0x100000000) & 0xff;
  bytes[2] = (timestamp / 0x1000000) & 0xff;
  bytes[3] = (timestamp / 0x10000) & 0xff;
  bytes[4] = (timestamp / 0x100) & 0xff;
  bytes[5] = timestamp & 0xff;

  // 4 bits version (0x7) + 12 bits sequence/rand_a
  const randA = customTimestamp !== undefined ? 0x000 : sequenceCounter;
  bytes[6] = 0x70 | ((randA >> 8) & 0x0f);
  bytes[7] = randA & 0xff;

  // 2 bits variant (10xx) + 62 bits rand_b
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  // Format as canonical 8-4-4-4-12 hex string
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Extracts the Unix millisecond timestamp from an RFC 9562 UUIDv7 string.
 */
export function extractTimestampFromUuidv7(uuid: string): number {
  const clean = uuid.replace(/-/g, '');
  if (clean.length !== 32) {
    throw new Error(`Invalid UUID format: ${uuid}`);
  }
  const timestampHex = clean.slice(0, 12);
  return parseInt(timestampHex, 16);
}

/**
 * Validates whether a string matches the UUIDv7 canonical pattern.
 */
export function isUuidv7(uuid: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}
