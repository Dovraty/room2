import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { compact } from '@/lib/format';
import { Text } from './Text';
import { PeepholeMark } from './Aperture';

/** Ticks a number up/down like a live audience. */
export function useTicker(base: number, opts: { every?: number; spread?: number; drift?: number } = {}) {
  const { every = 1800, spread = 0.004, drift = 0.0015 } = opts;
  const [n, setN] = useState(base);
  const ref = useRef(base);
  useEffect(() => {
    const id = setInterval(() => {
      const delta = Math.round(ref.current * ((Math.random() - 0.35) * spread + drift));
      ref.current = Math.max(0, ref.current + delta);
      setN(ref.current);
    }, every);
    return () => clearInterval(id);
  }, [every, spread, drift]);
  return n;
}

/** "48.2K peeping now" — peephole glyph + rolling digits. */
export function ViewerCount({ count, label = 'peeping', size = 'md', tone = 'stage' }: { count: number; label?: string; size?: 'sm' | 'md'; tone?: 'stage' | 'gallery' }) {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const text = compact(count);
  const color = tone === 'gallery' ? c.galleryTextSecondary : c.textSecondary;
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${count.toLocaleString()} ${label} now`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
    >
      <PeepholeMark size={size === 'sm' ? 13 : 16} ring={color} lens={c.spotlight} glow={false} />
      <Animated.View key={text} entering={reduce ? undefined : FadeInDown.duration(220)}>
        <Text variant={size === 'sm' ? 'caption' : 'callout'} color={tone === 'gallery' ? c.galleryText : c.textPrimary} tabular style={{ fontFamily: 'Inter_700Bold' }}>
          {text}
        </Text>
      </Animated.View>
      <Text variant={size === 'sm' ? 'caption' : 'footnote'} color={color}>{label}</Text>
    </View>
  );
}
