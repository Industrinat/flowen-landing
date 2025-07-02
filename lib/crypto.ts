// lib/crypto.ts

// Generera random encryption key
export async function generateEncryptionKey(): Promise<Uint8Array> {
  return crypto.getRandomValues(new Uint8Array(32));
}

// Konvertera key till base64 för URL/storage
export function keyToBase64(key: Uint8Array): string {
  return btoa(String.fromCharCode(...key))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Konvertera base64 tillbaka till key
export function base64ToKey(base64: string): Uint8Array {
  // Återställ URL-safe base64 till standard base64
  base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
}

// Kryptera fil
export async function encryptFile(fileBuffer: ArrayBuffer, key: Uint8Array): Promise<{encryptedData: Uint8Array, iv: Uint8Array}> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw', 
    key, 
    'AES-GCM', 
    false, 
    ['encrypt']
  );
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    cryptoKey,
    fileBuffer
  );
  
  return {
    encryptedData: new Uint8Array(encrypted),
    iv: iv
  };
}

// Dekryptera fil
export async function decryptFile(encryptedData: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    'AES-GCM',
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    cryptoKey,
    encryptedData
  );
  
  return new Uint8Array(decrypted);
}