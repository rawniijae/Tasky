import { StateStorage } from 'zustand/middleware';

// ─── Universal storage adapter ───────────────────────────────
// Tries MMKV first (fastest, native only, requires dev build).
// Falls back to AsyncStorage (supported in Expo Go and Dev Client).
// Last resort is memory (no persistence).

const memoryStore = new Map<string, string>();
const memoryStorage: StateStorage = {
  getItem: (name: string) => memoryStore.get(name) ?? null,
  setItem: (name: string, value: string) => { memoryStore.set(name, value); },
  removeItem: (name: string) => { memoryStore.delete(name); },
};

// Try to create MMKV — will only succeed in development builds
function createMMKVStorage(): StateStorage | null {
  try {
    const { MMKV } = require('react-native-mmkv');
    const instance = new MMKV({ id: 'tasky-storage' });
    instance.set('__test__', 'ok');
    instance.delete('__test__');
    return {
      getItem: (name: string) => instance.getString(name) ?? null,
      setItem: (name: string, value: string) => instance.set(name, value),
      removeItem: (name: string) => instance.delete(name),
    };
  } catch {
    return null;
  }
}

// AsyncStorage adapter with safety check for native module availability
function createAsyncStorageSafe(): StateStorage | null {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    // If we're in an old build without the native module, it might exist but fail on use.
    // We'll wrap it to catch any immediate native-module-null errors.
    return {
      getItem: async (name: string) => {
        try { return await AsyncStorage.getItem(name); } catch { return null; }
      },
      setItem: async (name: string, value: string) => {
        try { await AsyncStorage.setItem(name, value); } catch { /* ignore */ }
      },
      removeItem: async (name: string) => {
        try { await AsyncStorage.removeItem(name); } catch { /* ignore */ }
      },
    };
  } catch {
    return null;
  }
}

// Resolve best available storage: MMKV > AsyncStorage > memory
export const zustandMMKVStorage: StateStorage =
  createMMKVStorage() ?? createAsyncStorageSafe() ?? memoryStorage;
