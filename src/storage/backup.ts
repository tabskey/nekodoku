// Backup code: the profile as text the player can copy to another device.
// Base64url of the SaveData JSON, a dot, and a checksum. Not encrypted on
// purpose; see "Backup code" in docs/ARCHITECTURE.md.
import { migrate } from './migrations';
import { isSaveData, type SaveData } from './save';

export type BackupResult =
  | { ok: true; save: SaveData }
  /** 'checksum': mistyped or cut short. 'invalid': readable but not a profile. */
  | { ok: false; error: 'checksum' | 'invalid' };

// FNV-1a over the encoded text, as 8 hex digits: catches typos and cuts.
function checksum(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(code: string): string {
  const base64 = code.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
  return new TextDecoder().decode(
    Uint8Array.from(binary, (char) => char.charCodeAt(0)),
  );
}

/** The backup code for a profile. */
export function encodeBackup(save: SaveData): string {
  const payload = toBase64Url(JSON.stringify(save));
  return `${payload}.${checksum(payload)}`;
}

/**
 * Reads a backup code: checks the checksum, decodes, migrates an older save
 * and validates the shape. Spaces and line breaks from copying are ignored.
 */
export function decodeBackup(code: string): BackupResult {
  const clean = code.replace(/\s+/g, '');
  const dot = clean.lastIndexOf('.');
  const payload = clean.slice(0, dot);
  if (dot <= 0 || checksum(payload) !== clean.slice(dot + 1)) {
    return { ok: false, error: 'checksum' };
  }
  try {
    const save = migrate(JSON.parse(fromBase64Url(payload)));
    return isSaveData(save)
      ? { ok: true, save }
      : { ok: false, error: 'invalid' };
  } catch {
    return { ok: false, error: 'invalid' };
  }
}
