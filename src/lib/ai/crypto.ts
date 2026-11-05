import { db, getSetting, setSetting } from '../db'

/**
 * The Gemini key is encrypted with AES-GCM using a non-extractable CryptoKey that lives only in this
 * browser's IndexedDB (the raw key material can never be read back by script, nor exported in backups).
 */
async function deviceKey(): Promise<CryptoKey> {
  const row = await db.keys.get('ai')
  if (row) return row.key
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
  await db.keys.put({ id: 'ai', key })
  return key
}

const b64 = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

export async function saveApiKey(apiKey: string) {
  if (!apiKey) {
    await setSetting('aiKey', null)
    return
  }
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await deviceKey(), new TextEncoder().encode(apiKey))
  await setSetting('aiKey', { iv: b64(iv), data: b64(data) })
}

export async function loadApiKey(): Promise<string | null> {
  const v = await getSetting<{ iv: string; data: string } | null>('aiKey', null)
  if (!v) return null
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(v.iv) }, await deviceKey(), unb64(v.data))
    return new TextDecoder().decode(plain)
  } catch {
    return null
  }
}

export async function hasApiKey() {
  return !!(await getSetting('aiKey', null))
}
