import React, { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { radius, space, useTheme } from '@/theme';
import type { Moment } from '@/data';
import { clock } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { Text } from './Text';
import { Icon } from './Icon';

/**
 * Scrubbable replay timeline.
 *  - top: comment-density histogram (where the gallery got loud), in the cool gallery colour
 *  - middle: track with spotlight progress + knob
 *  - markers: key moments (star) and polls (bars icon)
 */
export function ReplayTimeline({ duration, position, onSeek, density = [], moments = [] }: { duration: number; position: number; onSeek: (t: number) => void; density?: number[]; moments?: Moment[] }) {
  const { c } = useTheme();
  const [w, setW] = useState(1);
  const lastMoment = useSharedValue<number>(-1);
  const maxD = Math.max(1, ...density);
  const pct = Math.min(1, position / duration);

  const seekX = (x: number) => {
    const t = Math.max(0, Math.min(duration, (x / w) * duration));
    const near = moments.find((m) => Math.abs(m.t - t) < duration * 0.012);
    if (near && lastMoment.get() !== near.t) {
      lastMoment.set(near.t);
      haptic('scrubTick');
    }
    onSeek(t);
  };

  // runOnJS(true): scrubbing drives React state, so handle it on the JS thread
  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .onBegin((e) => seekX(e.x))
    .onUpdate((e) => seekX(e.x));

  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  return (
    <View style={{ gap: space.sm }}>
      <GestureDetector gesture={pan}>
        <View
          onLayout={onLayout}
          style={{ height: 64, justifyContent: 'flex-end' }}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Replay timeline"
          accessibilityValue={{ text: `${clock(position)} of ${clock(duration)}` }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => onSeek(Math.max(0, Math.min(duration, position + (e.nativeEvent.actionName === 'increment' ? 30 : -30))))}
        >
          {/* density histogram */}
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 14, height: 30, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }} pointerEvents="none">
            {density.map((d, i) => {
              const played = (i + 0.5) / density.length <= pct;
              return <View key={i} style={{ flex: 1, height: 3 + (d / maxD) * 27, borderRadius: 2, backgroundColor: played ? c.spotlightGlow : c.galleryLine }} />;
            })}
          </View>
          {/* moment markers */}
          {moments.map((m) => (
            <View key={m.t} pointerEvents="none" style={{ position: 'absolute', left: (m.t / duration) * w - 9, top: 0, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: m.t <= position ? c.spotlight : c.stageRaised, borderWidth: 1, borderColor: c.stageLine }}>
              <Icon name={m.kind === 'poll' ? 'poll' : 'star'} size={10} color={m.t <= position ? c.onSpotlight : c.textSecondary} strokeWidth={2.4} />
            </View>
          ))}
          {/* track */}
          <View style={{ height: 6, borderRadius: radius.pill, backgroundColor: c.stageLine, marginBottom: 4 }}>
            <View style={{ width: `${pct * 100}%`, height: 6, borderRadius: radius.pill, backgroundColor: c.spotlight }} />
          </View>
          <View pointerEvents="none" style={{ position: 'absolute', left: pct * w - 9, bottom: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: c.spotlight, borderWidth: 3, borderColor: c.house, shadowColor: c.spotlight, shadowOpacity: 0.7, shadowRadius: 10 }} />
        </View>
      </GestureDetector>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="caption" tone="textSecondary" tabular>{clock(position)}</Text>
        <Text variant="caption" tone="textTertiary" tabular>-{clock(duration - position)}</Text>
      </View>
    </View>
  );
}
