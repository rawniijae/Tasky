import { useSettingsStore } from '../stores/settingsStore';
import Constants from 'expo-constants';

// Replace this with your actual GitHub RAW URL for update.json
// Example: https://raw.githubusercontent.com/rawniijae/Tasky/main/update.json
const UPDATE_MANIFEST_URL = 'https://raw.githubusercontent.com/rawniijae/Tasky/main/update.json';

export interface UpdateManifest {
  version: string;
  url: string;
  releaseNotes: string;
  isMandatory: boolean;
  broadcast?: {
    id: string;
    text: string;
    type?: 'info' | 'announcement' | 'personal';
  };
}

/**
 * Checks if a newer version of the app is available online.
 * Returns the manifest if update available, null otherwise.
 */
export async function checkForUpdates(): Promise<UpdateManifest | null> {
  try {
    const currentVersion = Constants.expoConfig?.version || '1.0.0';
    
    // In a real scenario, you'd fetch from a URL
    // For now, I'll return null to avoid errors until you have a real URL,
    // but I'll provide the logic here:
    
    /*
    const response = await fetch(UPDATE_MANIFEST_URL, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    const manifest: UpdateManifest = await response.json();
    
    if (isVersionGreater(manifest.version, currentVersion)) {
      return manifest;
    }
    */
    
    return null;
  } catch (error) {
    console.warn('Update check failed:', error);
    return null;
  }
}

/**
 * Simple semantic version comparison (e.g., 1.1.0 > 1.0.9)
 */
function isVersionGreater(latest: string, current: string): boolean {
  const v1 = latest.split('.').map(Number);
  const v2 = current.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const n1 = v1[i] || 0;
    const n2 = v2[i] || 0;
    if (n1 > n2) return true;
    if (n1 < n2) return false;
  }
  return false;
}

/**
 * Global update sync function to be called on app mount
 */
export async function syncUpdateStatus() {
  const { setUpdateInfo, setBroadcastMessage } = useSettingsStore.getState();
  const manifest = await checkForUpdates();
  
  if (manifest) {
    setUpdateInfo({
      latestVersion: manifest.version,
      updateUrl: manifest.url,
      releaseNotes: manifest.releaseNotes,
      isMandatory: manifest.isMandatory,
      lastChecked: new Date().toISOString(),
    });

    if (manifest.broadcast) {
      setBroadcastMessage(manifest.broadcast);
    } else {
      setBroadcastMessage(null);
    }
  }
}
