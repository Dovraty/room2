import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { radius, spring, useTheme } from '@/theme';
import { haptic } from '@/lib/haptics';
import { look } from '@/lib/platform';
import { Icon, type IconName } from './Icon';
import { PeepholeMark } from './Aperture';
import { Text } from './Text';
import { Tap } from './Tap';

const ICONS: Record<string, IconName | 'peephole'> = { discover: 'peephole', following: 'bell', studio: 'stage', system: 'grid' };
const LABELS: Record<string, string> = { discover: 'Discover', following: 'Following', studio: 'Studio', system: 'System' };

/**
 * Platform-aware tab bar. iOS: translucent blurred bar, active item lit by a spotlight lens.
 * Android: opaque bar with a Material-style active indicator pill, 80dp tall.
 */
export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { c, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const ios = look === 'ios';
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: Math.max(insets.bottom, 8), borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.stageLine }} accessibilityRole="tablist">
      {ios ? (
        <>
          <BlurView intensity={40} tint={scheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: c.house, opacity: 0.72 }]} />
        </>
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: c.house, opacity: 0.97 }]} />
      )}
      <View style={{ flexDirection: 'row', paddingTop: 6 }}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const name = ICONS[route.name] ?? 'grid';
          const color = focused ? c.textPrimary : c.textTertiary;
          return (
            <Tap
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={`${LABELS[route.name]}${route.name === 'following' ? ', 3 new' : ''}`}
              onPress={() => {
                const e = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !e.defaultPrevented) {
                  haptic('galleryDetent');
                  navigateToTab(route.key);
                }
              }}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 52 }}
              scaleTo={0.9}
            >
              <View style={{ width: 56, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                <Indicator focused={focused} android={!ios} />
                {name === 'peephole' ? (
                  <PeepholeMark size={24} ring={color} lens={focused ? c.spotlight : color} glow={focused} />
                ) : (
                  <Icon name={name} size={23} color={color} strokeWidth={focused ? 2.1 : 1.8} />
                )}
                {route.name === 'following' && (
                  <View style={{ position: 'absolute', top: 1, right: 12, minWidth: 16, height: 16, paddingHorizontal: 4, borderRadius: 8, backgroundColor: c.live, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.house }}>
                    <Text variant="caption" tone="onLive" style={{ fontSize: 9, lineHeight: 11, fontFamily: 'Inter_700Bold' }} maxFontSizeMultiplier={1}>3</Text>
                  </View>
                )}
              </View>
              <Text variant="caption" color={color} style={{ fontSize: 11, fontFamily: focused ? 'Inter_700Bold' : 'Inter_500Medium' }} maxFontSizeMultiplier={1.3}>
                {LABELS[route.name]}
              </Text>
            </Tap>
          );
        })}
      </View>
    </View>
  );
}

function Indicator({ focused, android }: { focused: boolean; android: boolean }) {
  const { c } = useTheme();
  const st = useAnimatedStyle(() => ({ opacity: withSpring(focused ? 1 : 0, spring.pop), transform: [{ scaleX: withSpring(focused ? 1 : 0.4, spring.pop) }] }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: android ? 56 : 40, height: android ? 30 : 30, borderRadius: android ? radius.pill : 15, backgroundColor: android ? c.stageRaised : c.spotlightGlow },
        st,
      ]}
    />
  );
}
