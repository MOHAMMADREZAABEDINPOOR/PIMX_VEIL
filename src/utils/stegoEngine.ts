/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// AegisCrypt magic signature sequence (16 bytes)
export const STEGO_MAGIC = new Uint8Array([
  0xAE, 0x69, 0x73, 0x43, 0x72, 0x79, 0x70, 0x74, // "AegisCry"
  0x5F, 0x53, 0x45, 0x43, 0x55, 0x52, 0x45, 0x21  // "_SECURE!"
]);

export interface StegoMetadata {
  name: string;
  type: string;
  originalHash: string;
  encryptedHash: string;
}

/**
 * Searches for a subarray inside a larger Uint8Array scanning backwards.
 * Extremely efficient for EOF padding because the signature appears near the end.
 */
function findMagicBackward(source: Uint8Array, pattern: Uint8Array): number {
  if (pattern.length === 0 || source.length < pattern.length) return -1;
  const limit = source.length - pattern.length;

  for (let i = limit; i >= 0; i--) {
    let match = true;
    for (let j = 0; j < pattern.length; j++) {
      if (source[i + j] !== pattern[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  return -1;
}

/**
 * Packs carrier file, stealth magic sequence, metadata description, and encrypted secret data.
 */
export function embedPayload(
  carrierBuffer: ArrayBuffer,
  encryptedPayload: ArrayBuffer,
  metadata: Omit<StegoMetadata, 'encryptedHash'>,
  encryptedHash: string
): ArrayBuffer {
  const carrier = new Uint8Array(carrierBuffer);
  const payload = new Uint8Array(encryptedPayload);

  // Serialize metadata
  const fullMeta: StegoMetadata = {
    ...metadata,
    encryptedHash
  };
  const encoder = new TextEncoder();
  const metaBytes = encoder.encode(JSON.stringify(fullMeta));
  const metaLen = metaBytes.length;

  // Create a 4-byte Uint32 length identifier for metadata
  const metaLenBytes = new Uint8Array(4);
  const dataView = new DataView(metaLenBytes.buffer);
  dataView.setUint32(0, metaLen, false); // Big Endian representation

  // Total allocated length:
  // Carrier bytes + Magic Signature (16) + Meta length (4) + Metadata + Payload
  const totalLength = carrier.length + STEGO_MAGIC.length + 4 + metaLen + payload.length;
  const output = new Uint8Array(totalLength);

  // Assemble the polyglot packet structure
  let offset = 0;
  output.set(carrier, offset);
  offset += carrier.length;

  output.set(STEGO_MAGIC, offset);
  offset += STEGO_MAGIC.length;

  output.set(metaLenBytes, offset);
  offset += 4;

  output.set(metaBytes, offset);
  offset += metaLen;

  output.set(payload, offset);

  return output.buffer;
}

/**
 * Unpacks carrier, searches for signature, and extracts metadata + encrypted payload.
 */
export function extractPayload(fullStegoBuffer: ArrayBuffer): {
  carrierOnlyBuffer: ArrayBuffer;
  encryptedPayloadBuffer: ArrayBuffer;
  metadata: StegoMetadata;
} {
  const fullArray = new Uint8Array(fullStegoBuffer);
  const idx = findMagicBackward(fullArray, STEGO_MAGIC);

  if (idx === -1) {
    throw new Error('Steg-analyses complete. No AegisCrypt-compliant signature detected in carrier byte stream.');
  }

  // Carrier data occupies everything before the MAGIC
  const carrierOnlyBuffer = fullArray.slice(0, idx).buffer;

  // Retrieve the 4-byte metadata length
  const metaLenStart = idx + STEGO_MAGIC.length;
  if (metaLenStart + 4 > fullArray.length) {
    throw new Error('Payload corruption detected: Missing steganography packets headers.');
  }

  const metaLenBytes = fullArray.slice(metaLenStart, metaLenStart + 4);
  const dataView = new DataView(metaLenBytes.buffer);
  const metaLen = dataView.getUint32(0, false); // Big Endian read

  const metaStart = metaLenStart + 4;
  const metaEnd = metaStart + metaLen;

  if (metaEnd > fullArray.length) {
    throw new Error('Payload corruption detected: Manifest boundaries out of range.');
  }

  // Parse metadata
  const metaBytes = fullArray.slice(metaStart, metaEnd);
  const decoder = new TextDecoder();
  let metadata: StegoMetadata;
  try {
    metadata = JSON.parse(decoder.decode(metaBytes));
  } catch (err) {
    throw new Error('Payload corruption detected: Manifest is not valid JSON metadata.');
  }

  // The rest of the stream is the encrypted portion
  const encryptedPayloadBuffer = fullArray.slice(metaEnd).buffer;

  return {
    carrierOnlyBuffer,
    encryptedPayloadBuffer,
    metadata
  };
}
