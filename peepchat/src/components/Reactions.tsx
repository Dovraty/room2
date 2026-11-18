import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { Icon, type IconName } from './Icon';

type P = { id: number; icon: IconName; x: number };

export function useReactionBurst() {
  const [items, setItems] = useState<P[]>([]);
  const fire = useCallback((icon: IconName) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s.slice(-10), { id, icon, x: Math.random() * 60 }]);
    setTimeout(() => setItems((s) => s.filter((p) => p.id !== id)), 1600);
  }, []);
  return { items, fire };
}

function Particle({ icon, x }: { icon: IconName; x: number }) {
  const { c } = useTheme();
  const y = useSharedValue(0);
  React.useEffect(() => {
    y.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const st = useAnimatedStyle(() => ({
    opacity: 1 - y.value,
    transform: [{ translateY: -y.value * 150 }, { translateX: Math.sin(y.value * 6 + x) * 10 }, { scale: 0.8 + y.value * 0.4 }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', right: x, bottom: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: c.galleryRaised, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.galleryLine }, st]}>
      <Icon name={icon} size={16} color={c.galleryAccent} />
    </Animated.View>
  );
}

/** Reactions float up along the right edge, inside the gallery's lane, never across the bubbles. */
export function ReactionBurst({ burst, bottom }: { burst: ReturnType<typeof useReactionBurst>; bottom: number }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', right: 16, bottom, width: 90, height: 170, zIndex: 5 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {burst.items.map((p) => <Particle key={p.id} icon={p.icon} x={p.x} />)}
    </View>
  );
}
