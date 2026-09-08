/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calculates a SHA-256 checksum of the given ArrayBuffer and returns its hex string representation.
 */
export async function calculateSHA256(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Derives an AES-GCM 256-bit key from a password and salt using PBKDF2.
 */
export async function deriveKey(
  passwordText: string,
  salt: Uint8Array,
  iterations = 600000
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passwordText),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-GCM (256-bit) and PBKDF2 derived key.
 * Output structure:
 * [SALT: 16 bytes] + [IV: 12 bytes] + [CIPHERTEXT with Auth Tag (variable)]
 */
export async function encryptData(
  plainData: ArrayBuffer,
  passwordText: string,
  onStatus?: (status: string) => void
): Promise<ArrayBuffer> {
  onStatus?.('Generating cryptographic salt (16 bytes)...');
  const salt = crypto.getRandomValues(new Uint8Array(16));

  onStatus?.('Generating initialization vector (12 bytes)...');
  const iv = crypto.getRandomValues(new Uint8Array(12));

  onStatus?.('Deriving cryptographic key using PBKDF2 (600,000 rounds)...');
  const key = await deriveKey(passwordText, salt, 600000);

  onStatus?.('Performing authenticated encryption via AES-GCM-256...');
  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    plainData
  );

  onStatus?.('Assembling secure envelope packages...');
  const result = new Uint8Array(16 + 12 + encryptedContent.byteLength);
  result.set(salt, 0);
  result.set(iv, 16);
  result.set(new Uint8Array(encryptedContent), 16 + 12);

  return result.buffer;
}

/**
 * Decrypts data that was encrypted with encryptData.
 * Input structure:
 * [SALT: 16 bytes] + [IV: 12 bytes] + [CIPHERTEXT with Auth Tag]
 */
export async function decryptData(
  envelopeBuffer: ArrayBuffer,
  passwordText: string,
  onStatus?: (status: string) => void
): Promise<ArrayBuffer> {
  if (envelopeBuffer.byteLength < 28) {
    throw new Error('Payload is too small to contain valid cryptographic envelopes.');
  }

  const envelope = new Uint8Array(envelopeBuffer);

  onStatus?.('Extracting salt envelope (16 bytes)...');
  const salt = envelope.slice(0, 16);

  onStatus?.('Extracting initialization vector (12 bytes)...');
  const iv = envelope.slice(16, 28);

  const ciphertext = envelope.slice(28);

  onStatus?.('Deriving cryptographic key using PBKDF2 (600,000 rounds)...');
  const key = await deriveKey(passwordText, salt, 600000);

  onStatus?.('Decrypting and verifying authentic integrity via AES-GCM-256...');
  try {
    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );
    return decryptedContent;
  } catch (err) {
    throw new Error('Decryption failed. Incorrect password, or the payload has been corrupted or tampered with.');
  }
}
