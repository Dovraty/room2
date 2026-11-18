import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming, type SharedValue } from 'react-native-reanimated';

function WaveBar({ i, n, phase, level, color, height, width }: { i: number; n: number; phase: SharedValue<number>; level: SharedValue<number>; color: string; height: number; width: number }) {
  const st = useAnimatedStyle(() => {
    const t = phase.value * Math.PI * 2;
    const env = Math.sin((i / (n - 1)) * Math.PI); // taller in the middle
    const a = Math.abs(Math.sin(t * 3 + i * 0.9) * 0.55 + Math.sin(t * 5.3 + i * 1.7) * 0.35 + Math.sin(t * 1.3 + i * 0.4) * 0.25);
    const h = Math.max(0.1, 0.12 + a * env * level.value);
    return { height: Math.min(1, h) * height, opacity: 0.45 + level.value * 0.55 };
  });
  return <Animated.View style={[{ width, borderRadius: width / 2, backgroundColor: color }, st]} />;
}

/**
 * Live waveform for a speaker. `active` drives the envelope up; idle speakers keep a low
 * idle shimmer so the room still feels alive. Static bars under reduce-motion.
 */
export function Waveform({ active, color, bars = 22, height = 36, barWidth = 3, gap = 3 }: { active: boolean; color: string; bars?: number; height?: number; barWidth?: number; gap?: number }) {
  const reduce = useReducedMotion();
  const phase = useSharedValue(0);
  const level = useSharedValue(active ? 1 : 0.15);
  useEffect(() => {
    if (reduce) return;
    phase.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.linear }), -1);
    return () => cancelAnimation(phase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);
  useEffect(() => {
    level.value = withTiming(active ? 1 : 0.15, { duration: 260 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'center', gap }} accessible={false}>
      {Array.from({ length: bars }, (_, i) => (
        <WaveBar key={i} i={i} n={bars} phase={phase} level={level} color={color} height={height} width={barWidth} />
      ))}
    </View>
  );
}
