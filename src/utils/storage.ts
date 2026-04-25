import { StateStorage } from 'zustand/middleware';

// ─── Universal storage adapter ───────────────────────────────
// Tries MMKV first (fastest, native only, requires dev build).
// Falls back to localStorage (web) or in-memory map (Expo Go).
// This ensures the app never crashes due to missing native modules.

// In-memory fallback — data won't survive app restarts in Expo Go,
// but the app will work. MMKV will work automatically once you
// switch to a development build (`npx expo run:android/ios`).
const memoryStore = new Map<string, string>();

const memoryStorage: StateStorage = {
  getItem: (name: string) => memoryStore.get(name) ?? null,
  setItem: (name: string, value: string) => { memoryStore.set(name, value); },
  removeItem: (name: string) => { memoryStore.delete(name); },
};

// Try to create MMKV — will only succeed in development builds
function createMMKVStorage(): StateStorage | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MMKV } = require('react-native-mmkv');
    const instance = new MMKV({ id: 'tasky-storage' });

    // Verify it actually works (native bridge is available)
    instance.set('__test__', 'ok');
    instance.delete('__test__');

    return {
      getItem: (name: string) => instance.getString(name) ?? null,
      setItem: (name: string, value: string) => instance.set(name, value),
      removeItem: (name: string) => instance.delete(name),
    };
  } catch {
    // MMKV native module not available (Expo Go or web)
    return null;
  }
}

// Try localStorage for web
function createWebStorage(): StateStorage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    // Verify it works
    localStorage.setItem('__test__', 'ok');
    localStorage.removeItem('__test__');

    return {
      getItem: (name: string) => {
        try { return localStorage.getItem(name); } catch { return null; }
      },
      setItem: (name: string, value: string) => {
        try { localStorage.setItem(name, value); } catch { /* quota */ }
      },
      removeItem: (name: string) => {
        try { localStorage.removeItem(name); } catch { /* ignore */ }
      },
    };
  } catch {
    return null;
  }
}

// Resolve best available storage: MMKV > localStorage > memory
export const zustandMMKVStorage: StateStorage =
  createMMKVStorage() ?? createWebStorage() ?? memoryStorage;
