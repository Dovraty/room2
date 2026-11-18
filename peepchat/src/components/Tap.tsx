import React from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { size, spring } from '@/theme';
import { look } from '@/lib/platform';

const APressable = Animated.createAnimatedComponent(Pressable);

/** Pressable with a spring press-in and guaranteed 44pt (iOS) / 48dp (Android) hit area. */
export function Tap({ style, children, scaleTo = 0.96, minHit = true, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; scaleTo?: number; minHit?: boolean; children?: React.ReactNode }) {
  const s = useSharedValue(1);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const min = look === 'android' ? size.touchMinAndroid : size.touchMin;
  return (
    <APressable
      accessibilityRole="button"
      hitSlop={minHit ? 8 : undefined}
      onPressIn={() => s.set(withSpring(scaleTo, spring.pop))}
      onPressOut={() => s.set(withSpring(1, spring.pop))}
      style={[minHit && { minHeight: min, minWidth: min }, style, st]}
      {...rest}
    >
      {children}
    </APressable>
  );
}
