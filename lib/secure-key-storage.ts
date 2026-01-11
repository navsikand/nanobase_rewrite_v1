/**
 * Secure storage for encryption keys with 24-hour expiration
 * Compatible with architecture document Issue 1 solution
 * Uses localStorage for cross-tab access
 */

const STORAGE_KEY = 'enc_key_data';

interface StoredKeyData {
  key: string; // base64 encoded
  expiresAt: number; // timestamp
}

/**
 * Store encryption key with 24-hour expiration
 */
export function storeEncryptionKey(keyBase64: string, expiresAt: number): void {
  const data: StoredKeyData = {
    key: keyBase64,
    expiresAt
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('[SecureKeyStorage] Encryption key stored until', new Date(expiresAt));
  } catch (error) {
    console.error('[SecureKeyStorage] Failed to store key:', error);
    throw new Error('Failed to store encryption key');
  }
}

/**
 * Retrieve encryption key if not expired
 * Returns null if expired or not found
 */
export function getEncryptionKey(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      console.log('[SecureKeyStorage] No key found in storage');
      return null;
    }

    const data: StoredKeyData = JSON.parse(stored);

    // Check expiration
    if (Date.now() >= data.expiresAt) {
      console.warn('[SecureKeyStorage] Key expired, clearing');
      clearEncryptionKey();
      return null;
    }

    const remainingHours = Math.round((data.expiresAt - Date.now()) / 1000 / 60 / 60);
    console.log(`[SecureKeyStorage] Retrieved valid key (expires in ${remainingHours} hours)`);
    return data.key;

  } catch (error) {
    console.error('[SecureKeyStorage] Failed to retrieve key:', error);
    clearEncryptionKey();
    return null;
  }
}

/**
 * Clear stored encryption key
 */
export function clearEncryptionKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[SecureKeyStorage] Encryption key cleared');
  } catch (error) {
    console.error('[SecureKeyStorage] Failed to clear key:', error);
  }
}

/**
 * Check if valid key exists
 */
export function hasValidKey(): boolean {
  return getEncryptionKey() !== null;
}

/**
 * Get time remaining until key expires (in milliseconds)
 */
export function getKeyExpirationTime(): number | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: StoredKeyData = JSON.parse(stored);
    const remaining = data.expiresAt - Date.now();

    return remaining > 0 ? remaining : null;
  } catch {
    return null;
  }
}
