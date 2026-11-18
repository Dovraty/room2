import React, { useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatterColor, radius, space, useTheme } from '@/theme';
import { chatters, conversations } from '@/data';
import { compact } from '@/lib/format';
import { Spotlight } from '@/components/Spotlight';
import { GlassButton } from '@/components/Stage';
import { ChatterAvatar } from '@/components/Avatar';
import { Text } from '@/components/Text';
import { Tap } from '@/components/Tap';
import { Glyph } from '@/components/Glyph';
import { Icon } from '@/components/Icon';
import { FollowButton, NotifyButton } from '@/components/FollowButton';
import { LiveHeroCard, ReplayCard, UpcomingCard, FeaturedChatter } from '@/components/ConvoCards';
import { EmptyState, NotFound } from '@/components/States';

type Seg = 'upcoming' | 'past';

export default function ChatterProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [seg, setSeg] = useState<Seg>('upcoming');
  const ch = chatters.find((x) => x.id === id);
  if (!ch) return <NotFound />;
  const col = chatterColor(ch.color);
  const mine = conversations.filter((cv) => cv.chatters.includes(ch.id));
  const live = mine.find((cv) => cv.status === 'live');
  const up = mine.filter((cv) => cv.status === 'upcoming');
  const past = mine.filter((cv) => cv.status === 'ended');
  const costars = Array.from(new Set(mine.flatMap((m) => m.chatters))).filter((x) => x !== ch.id);

  return (
    <View style={{ flex: 1, backgroundColor: c.house }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.x4 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: insets.top + space.xs, paddingBottom: space.xxl, overflow: 'hidden' }}>
          <Spotlight heat={0.9} color={col.base} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.lg }}>
            <GlassButton icon="back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/discover'))} />
            <GlassButton icon="more" label="More options" />
          </View>
          <View style={{ alignItems: 'center', gap: space.md, marginTop: space.lg, paddingHorizontal: space.xl }}>
            <ChatterAvatar id={ch.id} size={112} live={!!live} />
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text variant="display" align="center" accessibilityRole="header">{ch.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Glyph name={col.glyph} size={12} color={scheme === 'dark' ? col.base : col.ink} />
                <Text variant="callout" tone="textSecondary">@{ch.handle}</Text>
                {ch.verified && <Icon name="check" size={14} color={c.spotlightInk} strokeWidth={2.6} />}
              </View>
              <View style={{ marginTop: 4, paddingHorizontal: space.md, height: 26, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: scheme === 'dark' ? col.bubbleDark : col.bubbleLight }}>
                <Text variant="caption" color={scheme === 'dark' ? col.base : col.ink}>{ch.role}</Text>
              </View>
            </View>
            <Text variant="body" tone="textSecondary" align="center">{ch.bio}</Text>
            <View style={{ flexDirection: 'row', gap: space.x3, marginTop: space.sm }}>
              {[
                [compact(ch.followers), 'followers'],
                [String(ch.chats), 'chats'],
                [compact(Math.round(ch.followers * 0.11)), 'avg. peeping'],
              ].map(([n, l]) => (
                <View key={l} style={{ alignItems: 'center' }} accessible accessibilityLabel={`${n} ${l}`}>
                  <Text variant="title2" tabular>{n}</Text>
                  <Text variant="caption" tone="textTertiary">{l}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.sm, alignItems: 'center' }}>
              <FollowButton name={ch.name} size="lg" initial={ch.id === 'marisol'} />
              <NotifyButton name={ch.name} size="lg" initial={ch.id === 'marisol'} />
              <Tap accessibilityLabel={`Share ${ch.name}'s profile`} style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: c.stageLine }}>
                <Icon name="share" size={20} color={c.textPrimary} />
              </Tap>
            </View>
          </View>
        </View>

        {live ? (
          <View style={{ paddingHorizontal: space.xl, gap: space.md }}>
            <Text variant="title1">Live right now</Text>
            <LiveHeroCard convo={live} width={width - space.xl * 2} />
          </View>
        ) : (
          <View style={{ marginHorizontal: space.xl, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: c.stageLine, flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Icon name="bell" size={20} color={c.textSecondary} />
            <Text variant="callout" tone="textSecondary" style={{ flex: 1 }}>Not live right now. Turn on alerts and we’ll knock when {ch.name.split(' ')[0]} starts a chat.</Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: space.xl, marginTop: space.x3 }} accessibilityRole="tablist">
          {(['upcoming', 'past'] as Seg[]).map((s) => (
            <Tap key={s} minHit={false} onPress={() => setSeg(s)} accessibilityRole="tab" accessibilityState={{ selected: seg === s }} style={{ height: 40, paddingHorizontal: space.lg, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: seg === s ? c.textPrimary : 'transparent', borderWidth: 1, borderColor: seg === s ? c.textPrimary : c.stageLine }}>
              <Text variant="callout" color={seg === s ? c.house : c.textSecondary} style={{ fontFamily: 'Inter_600SemiBold' }}>{s === 'upcoming' ? `Upcoming · ${up.length}` : `Past chats · ${past.length}`}</Text>
            </Tap>
          ))}
        </View>
        <View style={{ paddingHorizontal: space.xl, marginTop: space.md }}>
          {seg === 'upcoming' && (up.length ? up.map((u) => <UpcomingCard key={u.id} convo={u} />) : <EmptyState title="Nothing scheduled" body={`${ch.name.split(' ')[0]} hasn't booked a chat yet. Follow to hear first.`} />)}
          {seg === 'past' && (past.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md }}>
              {past.map((p) => <ReplayCard key={p.id} convo={p.messages?.length ? p : { ...p, messages: [{ from: p.chatters[0], text: p.title, moment: 'x' }] }} />)}
            </ScrollView>
          ) : <EmptyState title="No replays yet" body="Past chats show up here with their key moments." />)}
        </View>

        {costars.length > 0 && (
          <View style={{ marginTop: space.x3, gap: space.md }}>
            <Text variant="title1" style={{ paddingHorizontal: space.xl }}>Often chats with</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.sm }}>
              {costars.map((id) => <FeaturedChatter key={id} id={id} live={conversations.some((cv) => cv.status === 'live' && cv.chatters.includes(id))} />)}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
