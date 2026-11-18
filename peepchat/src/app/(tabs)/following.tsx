import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { radius, space, useTheme } from '@/theme';
import { chatters, getConvo, liveNow, notifications, polls, type Notification } from '@/data';
import { Text } from '@/components/Text';
import { TopScrim } from '@/components/Spotlight';
import { Tap } from '@/components/Tap';
import { Icon, type IconName } from '@/components/Icon';
import { ChatterAvatar } from '@/components/Avatar';
import { openConvo } from '@/components/ConvoCards';
import { EmptyState } from '@/components/States';
import { Heartbeat } from '@/components/Pulse';

type Filter = 'all' | 'live' | 'poll' | 'scheduled' | 'mentions';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'poll', label: 'Polls' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'mentions', label: 'Mentions' },
];

const kindIcon: Record<string, IconName> = { live: 'eye', heat: 'flame', poll: 'poll', scheduled: 'clock', reply: 'reply' };

function Row({ n }: { n: Notification }) {
  const { c } = useTheme();
  const cv = getConvo(n.convo);
  const poll = n.kind === 'poll' && cv?.poll ? polls[cv.poll] : undefined;
  const pTotal = poll ? poll.options.reduce((s, o) => s + o.votes, 0) : 0;
  return (
    <Tap minHit scaleTo={0.99} onPress={() => cv && openConvo(cv)} accessibilityLabel={`${n.unread ? 'Unread. ' : ''}${n.title}. ${n.body}. ${n.ago} ago`} style={{ flexDirection: 'row', gap: space.md, paddingVertical: space.md, paddingHorizontal: space.xl, backgroundColor: n.kind === 'heat' ? c.spotlightGlow : 'transparent' }}>
      <View style={{ alignSelf: 'flex-start' }}>
        <ChatterAvatar id={n.chatter} size={48} live={n.kind === 'live'} showGlyph={false} />
        <View style={{ position: 'absolute', right: -4, bottom: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: n.kind === 'live' ? c.live : c.stageRaised, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.house }}>
          <Icon name={kindIcon[n.kind]} size={11} color={n.kind === 'live' ? c.onLive : n.kind === 'heat' ? c.spotlightInk : c.textPrimary} strokeWidth={2.4} />
        </View>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="headline" style={{ flex: 1, fontSize: 15 }} numberOfLines={2}>{n.title}</Text>
          <Text variant="caption" tone="textTertiary">{n.ago}</Text>
        </View>
        <Text variant="footnote" tone="textSecondary">{n.body}</Text>
        {poll && (
          <View style={{ gap: 4, marginTop: 6 }}>
            {poll.options.map((o, i) => {
              const pct = Math.round((o.votes / pTotal) * 100);
              return (
                <View key={o.id} style={{ height: 24, borderRadius: radius.xs, overflow: 'hidden', justifyContent: 'center', backgroundColor: c.stageRaised }}>
                  <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, backgroundColor: i === 0 ? c.spotlightGlow : c.stageLine }} />
                  <Text variant="caption" style={{ paddingHorizontal: 8 }}>{pct}% · {o.label}</Text>
                </View>
              );
            })}
          </View>
        )}
        {n.kind === 'live' && (
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: space.md, borderRadius: radius.pill, backgroundColor: c.live }}>
              <Heartbeat style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.onLive }} />
              <Text variant="caption" tone="onLive">Peep in</Text>
            </View>
          </View>
        )}
      </View>
      {n.unread && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.spotlight, marginTop: 6 }} accessibilityElementsHidden />}
    </Tap>
  );
}

export default function Following() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('all');
  const liveIds = new Set(liveNow().flatMap((l) => l.chatters));
  const list = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'live') return n.kind === 'live' || n.kind === 'heat';
    if (filter === 'mentions') return false;
    return n.kind === filter;
  });
  const sections = ['Now', 'Earlier'].map((s) => ({ s, items: list.filter((n) => n.section === s) })).filter((x) => x.items.length);

  return (
    <View style={{ flex: 1, backgroundColor: c.house }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: 120 }} showsVerticalScrollIndicator={false} stickyHeaderIndices={[2]}>
        <View style={{ paddingHorizontal: space.xl, gap: 4 }}>
          <Text variant="display" accessibilityRole="header">Following</Text>
          <Text variant="callout" tone="textSecondary">Who’s talking, what’s heating up, how the gallery voted.</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.lg, paddingVertical: space.xl }}>
          {[...chatters].sort((a, b) => Number(liveIds.has(b.id)) - Number(liveIds.has(a.id))).map((ch) => (
            <Tap key={ch.id} minHit={false} onPress={() => router.push(`/chatter/${ch.id}`)} accessibilityLabel={`${ch.name}${liveIds.has(ch.id) ? ', live now' : ''}`} style={{ alignItems: 'center', gap: 6, width: 60 }}>
              <ChatterAvatar id={ch.id} size={56} live={liveIds.has(ch.id)} showGlyph={false} />
              <Text variant="caption" numberOfLines={1} tone={liveIds.has(ch.id) ? 'textPrimary' : 'textTertiary'}>{ch.name.split(' ')[0]}</Text>
            </Tap>
          ))}
        </ScrollView>
        <View style={{ backgroundColor: c.house, paddingBottom: space.sm }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.sm }} accessibilityRole="tablist">
            {FILTERS.map((f) => {
              const on = f.id === filter;
              return (
                <Tap key={f.id} minHit={false} onPress={() => setFilter(f.id)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ height: 36, paddingHorizontal: space.lg, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: on ? c.textPrimary : 'transparent', borderWidth: 1, borderColor: on ? c.textPrimary : c.stageLine }}>
                  <Text variant="caption" color={on ? c.house : c.textSecondary}>{f.label}</Text>
                </Tap>
              );
            })}
          </ScrollView>
        </View>
        <Animated.View layout={LinearTransition}>
          {sections.length === 0 && (
            <EmptyState title="Nothing to peep at yet" body="When a chatter mentions you or replies to your gallery comment, it lands here." action="Find live chats" onAction={() => router.navigate('/discover')} />
          )}
          {sections.map(({ s, items }) => (
            <Animated.View key={`${filter}-${s}`} entering={FadeInDown.duration(260)}>
              <Text variant="overline" tone="textTertiary" upper style={{ paddingHorizontal: space.xl, marginTop: space.lg, marginBottom: space.xs }}>{s}</Text>
              {items.map((n) => <Row key={n.id} n={n} />)}
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>
      <TopScrim />
    </View>
  );
}
