import { Platform } from 'react-native';

/**
 * Which platform *look* to render. On device it's the real OS. On web (used only for design review
 * screenshots) it can be forced with ?device=ios|android, remembered for the session.
 */
function readPreview(): 'ios' | 'android' | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  try {
    const q = new URLSearchParams(window.location.search).get('device');
    if (q === 'ios' || q === 'android') {
      window.sessionStorage.setItem('pc-device', q);
      return q;
    }
    const s = window.sessionStorage.getItem('pc-device');
    return s === 'ios' || s === 'android' ? s : null;
  } catch {
    return null;
  }
}

export const previewDevice = readPreview();
export const look: 'ios' | 'android' = Platform.OS === 'android' ? 'android' : Platform.OS === 'ios' ? 'ios' : previewDevice ?? 'ios';
