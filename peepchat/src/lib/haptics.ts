import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { tokens } from '@/theme';

type HapticKey = keyof typeof tokens.haptic;

/** Brand haptic patterns, defined in tokens.json → haptic. No-ops on web. */
export function haptic(key: HapticKey) {
  if (Platform.OS === 'web') return;
  const h = tokens.haptic[key] as { type: string; style?: string };
  try {
    if (h.type === 'selection') Haptics.selectionAsync();
    else if (h.type === 'impact') {
      const map = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
        soft: Haptics.ImpactFeedbackStyle.Soft,
        rigid: Haptics.ImpactFeedbackStyle.Rigid,
      } as const;
      Haptics.impactAsync(map[(h.style ?? 'light') as keyof typeof map]);
    } else if (h.type === 'notification') {
      const map = {
        success: Haptics.NotificationFeedbackType.Success,
        warning: Haptics.NotificationFeedbackType.Warning,
        error: Haptics.NotificationFeedbackType.Error,
      } as const;
      Haptics.notificationAsync(map[(h.style ?? 'success') as keyof typeof map]);
    }
  } catch {
    // haptics are a nicety; never crash on unsupported hardware
  }
}
