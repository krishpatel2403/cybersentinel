import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";

const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const MAX_MEMORY = 64 * 1024 * 1024;

const HASH_PREFIX = "scrypt";

function deriveKey(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

/**
 * A real hash used to equalize timing when an email does not exist.
 * The plaintext is not a valid account password and is only used for verification work.
 */
export const DUMMY_PASSWORD_HASH =
  "scrypt$16384$8$1$gqrvcWyOamuf1nOe834DLw$MJrpTH8TP8mCgoLR2Lcll-lNx0LmKstHoHK1VD5BAwRxngFD31g3WgCRv32AmZ-FKEz3bQxZgQVeagP6bWCsvg";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await deriveKey(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: MAX_MEMORY,
  });

  return [
    HASH_PREFIX,
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [prefix, nRaw, rRaw, pRaw, saltRaw, hashRaw] = stored.split("$");
    if (prefix !== HASH_PREFIX || !nRaw || !rRaw || !pRaw || !saltRaw || !hashRaw) return false;

    const n = Number(nRaw);
    const r = Number(rRaw);
    const p = Number(pRaw);
    if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return false;

    const salt = Buffer.from(saltRaw, "base64url");
    const expected = Buffer.from(hashRaw, "base64url");
    const derived = await deriveKey(password, salt, expected.length, {
      N: n,
      r,
      p,
      maxmem: MAX_MEMORY,
    });

    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
