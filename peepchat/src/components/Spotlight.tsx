import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme';

/**
 * The stage light. A warm elliptical cone from above, plus a faint floor bounce.
 * `heat` (0–1) brightens it: hot chats literally glow more.
 */
export function Spotlight({ heat = 0.6, color, style, origin = 'top' }: { heat?: number; color?: string; style?: ViewStyle; origin?: 'top' | 'center' }) {
  const { c, scheme } = useTheme();
  const col = color ?? c.spotlight;
  const k = scheme === 'dark' ? 1 : 0.55;
  const cy = origin === 'top' ? '-8%' : '40%';
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="spot" cx="50%" cy={cy} rx="75%" ry="62%" fx="50%" fy={cy}>
            <Stop offset="0" stopColor={col} stopOpacity={(0.26 + heat * 0.18) * k} />
            <Stop offset="0.45" stopColor={col} stopOpacity={(0.08 + heat * 0.06) * k} />
            <Stop offset="1" stopColor={col} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="floor" cx="50%" cy="104%" rx="70%" ry="22%">
            <Stop offset="0" stopColor={col} stopOpacity={0.08 * k} />
            <Stop offset="1" stopColor={col} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#spot)" />
        <Ellipse cx="50%" cy="104%" rx="70%" ry="22%" fill="url(#floor)" />
      </Svg>
    </View>
  );
}

/** Keeps the status bar legible when content scrolls under it (tab screens have no nav bar). */
export function TopScrim() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[c.house, `${c.house}E6`, `${c.house}00`]}
      locations={[0, 0.6, 1]}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 16 }}
    />
  );
}
