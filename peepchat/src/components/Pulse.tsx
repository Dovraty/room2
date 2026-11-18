import React, { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { duration, easing } from '@/theme';

/** Signature animation #3 — the live "lub-dub" heartbeat. Static under reduce-motion. */
export function Heartbeat({ children, style, active = true, intensity = 1 }: { children?: React.ReactNode; style?: StyleProp<ViewStyle>; active?: boolean; intensity?: number }) {
  const reduce = useReducedMotion();
  const s = useSharedValue(1);
  useEffect(() => {
    if (!active || reduce) {
      cancelAnimation(s);
      s.value = 1;
      return;
    }
    const D = duration.pulse;
    const a = 0.25 * intensity, b = 0.12 * intensity;
    s.value = withRepeat(
      withSequence(
        withTiming(1 + a, { duration: D * 0.12, easing: easing.heartbeat }),
        withTiming(1, { duration: D * 0.14, easing: easing.heartbeat }),
        withTiming(1 + b, { duration: D * 0.1, easing: easing.heartbeat }),
        withTiming(1, { duration: D * 0.64, easing: easing.standard }),
      ),
      -1,
    );
    return () => cancelAnimation(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduce, intensity]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return <Animated.View style={[style, st]}>{children}</Animated.View>;
}

/** Expanding halo ring that fades — used behind live dots and live avatars. */
export function Halo({ color, size, active = true }: { color: string; size: number; active?: boolean }) {
  const reduce = useReducedMotion();
  const p = useSharedValue(0);
  useEffect(() => {
    if (!active || reduce) return;
    p.value = withRepeat(withTiming(1, { duration: duration.pulse * 1.6, easing: easing.enter }), -1);
    return () => cancelAnimation(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduce]);
  const st = useAnimatedStyle(() => ({ opacity: (1 - p.value) * 0.6, transform: [{ scale: 1 + p.value * 0.6 }] }));
  if (!active || reduce) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color }, st]}
    />
  );
}
