import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatterColor, radius, space, useTheme } from '@/theme';
import { getChatter, type Conversation } from '@/data';
import { haptic } from '@/lib/haptics';
import { Text } from './Text';
import { Tap } from './Tap';
import { Icon, type IconName } from './Icon';
import { LiveBadge } from './LiveBadge';
import { ViewerCount } from './ViewerCount';
import { ChatterAvatar } from './Avatar';
import { Glyph } from './Glyph';
import { FollowButton } from './FollowButton';

export function GlassButton({ icon, label, onPress }: { icon: IconName; label: string; onPress?: () => void }) {
  const { c, scheme } = useTheme();
  return (
    <Tap onPress={onPress} accessibilityLabel={label} style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: c.stageLine }}>
      <BlurView intensity={30} tint={scheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: c.stageRaised, opacity: 0.6 }]} />
      <Icon name={icon} size={20} color={c.textPrimary} />
    </Tap>
  );
}

/** Stage header: back · title · live status · audience size. Quiet so the chat stays the hero. */
export function StageHeader({ convo, viewers, label = 'peeping', status = 'live', right }: { convo: Conversation; viewers: number; label?: string; status?: 'live' | 'ended' | 'replay'; right?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + space.xs, paddingHorizontal: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <GlassButton icon="back" label="Leave chat" onPress={() => (router.canGoBack() ? router.back() : router.replace('/discover'))} />
      <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
        <Text variant="callout" numberOfLines={1} style={{ fontFamily: 'Inter_600SemiBold' }} accessibilityRole="header">{convo.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          {status === 'live' ? <LiveBadge compact /> : <LiveBadge kind={status === 'ended' ? 'ended' : 'replay'} label={status === 'ended' ? 'Ended' : 'Replay'} compact />}
          <ViewerCount count={viewers} label={label} size="sm" />
        </View>
      </View>
      {right ?? <GlassButton icon="share" label="Share this chat" onPress={() => haptic('react')} />}
    </View>
  );
}

/**
 * The cast strip establishes who's who before the first bubble: position (left/right),
 * colour, glyph and name. In a 2-person chat it mirrors bubble sides exactly.
 */
export function CastStrip({ ids, speaking, showFollow = true }: { ids: string[]; speaking?: string | null; showFollow?: boolean }) {
  const { scheme } = useTheme();
  if (ids.length === 2) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, gap: space.sm }}>
        {ids.map((id, i) => {
          const ch = getChatter(id);
          const col = chatterColor(ch.color);
          return (
            <React.Fragment key={id}>
              {i === 1 && <Text variant="quote" tone="textTertiary" style={{ marginHorizontal: 2 }}>×</Text>}
              <Tap minHit={false} scaleTo={0.97} onPress={() => router.push(`/chatter/${id}`)} accessibilityLabel={`${ch.name}, ${i === 0 ? 'left' : 'right'} side. Open profile`} style={{ flex: 1, flexDirection: i === 0 ? 'row' : 'row-reverse', alignItems: 'center', gap: space.sm, padding: space.sm, borderRadius: radius.lg, backgroundColor: scheme === 'dark' ? col.bubbleDark : col.bubbleLight }}>
                <ChatterAvatar id={id} size={40} speaking={speaking === id} />
                <View style={{ flex: 1, alignItems: i === 0 ? 'flex-start' : 'flex-end' }}>
                  <View style={{ flexDirection: i === 0 ? 'row' : 'row-reverse', alignItems: 'center', gap: 4 }}>
                    <Glyph name={col.glyph} size={9} color={scheme === 'dark' ? col.base : col.ink} />
                    <Text variant="caption" numberOfLines={1}>{ch.name.split(' ')[0]}</Text>
                  </View>
                  {showFollow ? <View style={{ marginTop: 2 }}><FollowButton name={ch.name} size="sm" initial={id === 'marisol'} /></View> : <Text variant="caption" tone="textSecondary" numberOfLines={1}>@{ch.handle}</Text>}
                </View>
              </Tap>
            </React.Fragment>
          );
        })}
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: space.lg, gap: space.sm }}>
      {ids.map((id) => {
        const ch = getChatter(id);
        const col = chatterColor(ch.color);
        return (
          <Tap key={id} minHit={false} scaleTo={0.95} onPress={() => router.push(`/chatter/${id}`)} accessibilityLabel={`${ch.name}. Open profile`} style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: space.sm, borderRadius: radius.md, backgroundColor: scheme === 'dark' ? col.bubbleDark : col.bubbleLight }}>
            <ChatterAvatar id={id} size={36} speaking={speaking === id} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Glyph name={col.glyph} size={8} color={scheme === 'dark' ? col.base : col.ink} />
              <Text variant="caption" numberOfLines={1}>{ch.name.split(' ')[0]}</Text>
            </View>
          </Tap>
        );
      })}
    </View>
  );
}

export function useDimColor() {
  const { scheme } = useTheme();
  return scheme === 'dark' ? '#000' : '#1B1512';
}
