import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';
import { duration, easing, useTheme } from '@/theme';
import { haptic } from '@/lib/haptics';

/**
 * The PeepChat mark: a peephole lens whose ring grows a speech-bubble tail.
 * "Looking in" and "a conversation" in one shape.
 */
export function PeepholeMark({ size = 48, ring, lens, glow = true }: { size?: number; ring?: string; lens?: string; glow?: boolean }) {
  const { c } = useTheme();
  const ringColor = ring ?? c.spotlight;
  const lensColor = lens ?? c.spotlight;
  return (
    <View style={{ width: size, height: size }} accessible accessibilityRole="image" accessibilityLabel="PeepChat">
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="lens" cx="46%" cy="40%" r="60%">
          <Stop offset="0" stopColor={lensColor} stopOpacity={glow ? 0.95 : 0.6} />
          <Stop offset="0.55" stopColor={lensColor} stopOpacity={glow ? 0.35 : 0.15} />
          <Stop offset="1" stopColor={lensColor} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={52} cy={46} r={26} fill="url(#lens)" />
      <Circle cx={52} cy={46} r={33} stroke={ringColor} strokeWidth={11} fill="none" />
      <Path d="M24.5 62 C 23 76, 17 86, 8 93 C 22 92, 34 86, 41 77 Z" fill={ringColor} />
      <Circle cx={43} cy={37} r={5.5} fill={ringColor} opacity={0.9} />
    </Svg>
    </View>
  );
}

/** Camera-iris aperture built from 6 tangent blades. `open` = hole radius as fraction of size. */
export function Iris({ size, open = 0.08, color, seam, twist = 0 }: { size: number; open?: number; color: string; seam: string; twist?: number }) {
  const R = 50;
  const r = Math.max(0.5, open * 100);
  const blades = Array.from({ length: 6 }, (_, i) => {
    const th = ((i * 60 + twist) * Math.PI) / 180;
    const cx = 50 + r * Math.cos(th);
    const cy = 50 + r * Math.sin(th);
    const dx = -Math.sin(th), dy = Math.cos(th);
    const ox = Math.cos(th), oy = Math.sin(th);
    const L = 2 * R;
    const pts = [
      [cx - L * dx * 0.08, cy - L * dy * 0.08],
      [cx + L * dx, cy + L * dy],
      [cx + L * dx + L * ox, cy + L * dy + L * oy],
      [cx - L * dx * 0.08 + L * ox, cy - L * dy * 0.08 + L * oy],
    ];
    return `M${pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L')} Z`;
  });
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" pointerEvents="none">
      <Defs>
        <ClipPath id="irisClip">
          <Circle cx={50} cy={50} r={R} />
        </ClipPath>
      </Defs>
      <G clipPath="url(#irisClip)">
        {blades.map((d, i) => (
          <Path key={i} d={d} fill={color} stroke={seam} strokeWidth={0.6} />
        ))}
      </G>
    </Svg>
  );
}

const { width: W, height: H } = Dimensions.get('window');
const DIAG = Math.sqrt(W * W + H * H);

/**
 * Signature animation #1 — aperture open.
 * Mounted on top of a stage: starts as a nearly-closed iris (you're at the peephole),
 * then spins open to reveal the conversation. Falls back to a fade under reduce-motion.
 */
export function ApertureTransition({ onDone }: { onDone?: () => void }) {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const scale = useSharedValue(1);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(1);
  const S = DIAG * 1.05;
  const open0 = 0.06;
  const finalScale = (DIAG / 2 / (open0 * S)) * 1.15;

  useEffect(() => {
    haptic('apertureOpen');
    const done = () => onDone?.();
    if (reduce) {
      opacity.value = withTiming(0, { duration: duration.quick }, (f) => f && runOnJS(done)());
      return;
    }
    scale.value = withDelay(140, withTiming(finalScale, { duration: duration.aperture, easing: easing.iris }));
    rot.value = withDelay(140, withTiming(60, { duration: duration.aperture, easing: easing.iris }));
    opacity.value = withDelay(140 + duration.aperture * 0.6, withTiming(0, { duration: duration.aperture * 0.4 }, (f) => f && runOnJS(done)()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { rotate: `${rot.value}deg` }],
  }));
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[{ width: S, height: S }, style]}>
        <Iris size={S} open={open0} color={c.house} seam={c.stageLine} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center', zIndex: 100 } });
