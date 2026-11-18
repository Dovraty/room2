import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { radius, space, useTheme } from '@/theme';
import { haptic } from '@/lib/haptics';
import { Tap } from './Tap';
import { Text } from './Text';
import { Icon } from './Icon';

export function FollowButton({ name, initial = false, size = 'md', onChange }: { name: string; initial?: boolean; size?: 'sm' | 'md' | 'lg'; onChange?: (v: boolean) => void }) {
  const { c } = useTheme();
  const [on, setOn] = useState(initial);
  const h = size === 'lg' ? 48 : size === 'md' ? 36 : 30;
  return (
    <Tap
      accessibilityLabel={on ? `Following ${name}. Double tap to unfollow` : `Follow ${name}`}
      accessibilityState={{ selected: on }}
      onPress={() => {
        haptic('follow');
        setOn((v) => {
          onChange?.(!v);
          return !v;
        });
      }}
      style={{ justifyContent: 'center' }}
    >
      <View
        style={{
          height: h, paddingHorizontal: size === 'lg' ? space.xxl : space.lg, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', gap: 6,
          backgroundColor: on ? 'transparent' : c.spotlight, borderWidth: 1.5, borderColor: on ? c.stageLine : c.spotlight,
        }}
      >
        {on && (
          <Animated.View entering={ZoomIn.springify()}>
            <Icon name="check" size={14} color={c.textPrimary} strokeWidth={2.4} />
          </Animated.View>
        )}
        <Text variant={size === 'lg' ? 'headline' : 'caption'} color={on ? c.textPrimary : c.onSpotlight} style={{ fontFamily: 'Inter_700Bold' }}>
          {on ? 'Following' : 'Follow'}
        </Text>
      </View>
    </Tap>
  );
}

export function NotifyButton({ name, initial = false, size = 'md' }: { name: string; initial?: boolean; size?: 'md' | 'lg' }) {
  const { c } = useTheme();
  const [on, setOn] = useState(initial);
  const h = size === 'lg' ? 48 : 36;
  return (
    <Tap
      accessibilityLabel={on ? `Notifications on for ${name}` : `Notify me when ${name} goes live`}
      accessibilityState={{ selected: on }}
      onPress={() => { haptic('react'); setOn((v) => !v); }}
      style={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <View style={{ width: h, height: h, borderRadius: h / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: on ? c.spotlight : c.stageLine, backgroundColor: on ? c.spotlightGlow : 'transparent' }}>
        <Icon name={on ? 'bellOn' : 'bell'} size={size === 'lg' ? 22 : 18} color={on ? c.spotlightInk : c.textPrimary} />
      </View>
    </Tap>
  );
}
