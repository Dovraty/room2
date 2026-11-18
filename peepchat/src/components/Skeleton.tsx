import React, { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { radius, useTheme } from '@/theme';

/** Loading placeholder: a slow "house lights" breathe rather than a shimmer sweep. */
export function Skeleton({ w, h, r = radius.sm, style }: { w: number | `${number}%`; h: number; r?: number; style?: ViewStyle }) {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const o = useSharedValue(0);
  useEffect(() => {
    if (!reduce) o.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);
  const st = useAnimatedStyle(() => ({ opacity: 0.55 + o.value * 0.45 }));
  return (
    <Animated.View style={[{ width: w, height: h, borderRadius: r, backgroundColor: c.skeletonHighlight }, st, style]} />
  );
}

export function SkeletonDiscover() {
  const { c } = useTheme();
  return (
    <View style={{ padding: 20, gap: 16 }} accessibilityLabel="Loading conversations" accessible>
      <Skeleton w={140} h={14} />
      <Skeleton w="100%" h={360} r={radius.xl} />
      <Skeleton w={120} h={14} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Skeleton w={220} h={150} r={radius.lg} />
        <Skeleton w={220} h={150} r={radius.lg} />
      </View>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} w={64} h={64} r={32} />)}
      </View>
      <View style={{ height: 1, backgroundColor: c.stageLine }} />
    </View>
  );
}
