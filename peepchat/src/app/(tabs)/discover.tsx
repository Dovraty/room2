import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { radius, space, useTheme } from '@/theme';
import { chatters, conversations, liveNow, replays, upcoming } from '@/data';
import { compact } from '@/lib/format';
import { Text } from '@/components/Text';
import { Tap } from '@/components/Tap';
import { Icon } from '@/components/Icon';
import { PeepholeMark } from '@/components/Aperture';
import { Spotlight, TopScrim } from '@/components/Spotlight';
import { SkeletonDiscover } from '@/components/Skeleton';
import { FeaturedChatter, LiveHeroCard, openConvo, ReplayCard, UpcomingCard } from '@/components/ConvoCards';
import { LiveBadge } from '@/components/LiveBadge';
import { AvatarStack } from '@/components/Avatar';

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: space.xl, marginBottom: space.md }}>
      <Text variant="title1" accessibilityRole="header">{title}</Text>
      {action && (
        <Tap minHit onPress={onAction} accessibilityLabel={action} style={{ justifyContent: 'center' }}>
          <Text variant="callout" tone="spotlightInk">{action}</Text>
        </Tap>
      )}
    </View>
  );
}

export default function Discover() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);
  const live = liveNow();
  const liveIds = new Set(live.flatMap((l) => l.chatters));
  const cardW = width - space.xl * 2;
  const trending = [...conversations].filter((x) => x.status !== 'upcoming').sort((a, b) => (b.viewers ?? 0) - (a.viewers ?? 0)).slice(0, 4);
  const totalPeeping = live.reduce((s, l) => s + (l.viewers ?? 0), 0);

  return (
    <View style={{ flex: 1, backgroundColor: c.house }}>
      <Spotlight heat={0.35} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Masthead */}
        <View style={{ paddingHorizontal: space.xl, flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <PeepholeMark size={30} />
          <Text variant="title2" style={{ fontFamily: 'Fraunces_900Black', fontSize: 22, flex: 1 }}>PeepChat</Text>
          <Tap accessibilityLabel="Search chats and chatters" style={{ alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 22, backgroundColor: c.stageRaised }}>
            <Icon name="search" size={20} color={c.textPrimary} />
          </Tap>
        </View>
        <View style={{ paddingHorizontal: space.xl, marginTop: space.xxl, marginBottom: space.xl, gap: space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <LiveBadge label={`${live.length} live`} />
            <Text variant="footnote" tone="textSecondary">{compact(totalPeeping)} people peeping right now</Text>
          </View>
          <Text variant="hero" accessibilityRole="header">Pull up{'\n'}a seat.</Text>
        </View>

        {loading ? (
          <SkeletonDiscover />
        ) : (
          <Animated.View entering={FadeIn.duration(400)}>
            {/* Live now — swipe between stages */}
            <FlatList
              data={live}
              horizontal
              pagingEnabled={false}
              snapToInterval={cardW + space.md}
              decelerationRate="fast"
              keyExtractor={(i) => i.id}
              contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.md }}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / (cardW + space.md)))}
              renderItem={({ item }) => <LiveHeroCard convo={item} width={cardW} />}
              accessibilityLabel="Live now"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: space.md }} accessible accessibilityLabel={`Live chat ${page + 1} of ${live.length}`}>
              {live.map((l, i) => <View key={l.id} style={{ width: i === page ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === page ? c.live : c.stageLine }} />)}
            </View>

            {/* Featured chatters */}
            <View style={{ marginTop: space.x4 }}>
              <SectionHeader title="On the call sheet" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.sm }}>
                {[...chatters].sort((a, b) => Number(liveIds.has(b.id)) - Number(liveIds.has(a.id))).map((ch) => (
                  <FeaturedChatter key={ch.id} id={ch.id} live={liveIds.has(ch.id)} />
                ))}
              </ScrollView>
            </View>

            {/* Trending */}
            <View style={{ marginTop: space.x4 }}>
              <SectionHeader title="Trending" />
              <View style={{ paddingHorizontal: space.xl }}>
                {trending.map((cv, i) => (
                  <Tap key={cv.id} minHit scaleTo={0.99} onPress={() => openConvo(cv)} accessibilityLabel={`Number ${i + 1}: ${cv.title}`} style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingVertical: space.md, borderBottomWidth: i < trending.length - 1 ? 1 : 0, borderBottomColor: c.stageLine }}>
                    <Text variant="display" tone={i === 0 ? 'spotlightInk' : 'textTertiary'} style={{ fontFamily: 'Fraunces_900Black', width: 30 }}>{i + 1}</Text>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text variant="headline" numberOfLines={2}>{cv.title}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {cv.status === 'live' ? <LiveBadge compact /> : <LiveBadge kind="replay" label="Replay" compact />}
                        <Text variant="caption" tone="textSecondary">{compact(cv.viewers ?? 0)} {cv.status === 'live' ? 'peeping' : 'watched'}</Text>
                      </View>
                    </View>
                    <AvatarStack ids={cv.chatters} size={30} />
                  </Tap>
                ))}
              </View>
            </View>

            {/* Upcoming */}
            <View style={{ marginTop: space.x4 }}>
              <SectionHeader title="Coming up" />
              <View style={{ paddingHorizontal: space.xl }}>
                {upcoming().map((u) => <UpcomingCard key={u.id} convo={u} />)}
              </View>
            </View>

            {/* Catch up */}
            <View style={{ marginTop: space.x4 }}>
              <SectionHeader title="What you missed" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.md }}>
                {replays().filter((r) => (r.messages ?? []).length).map((r, i) => <ReplayCard key={r.id} convo={r} progress={i === 0 ? 0.35 : 0} />)}
                {replays().filter((r) => !(r.messages ?? []).length).map((r) => <ReplayCard key={r.id} convo={{ ...r, messages: [{ from: r.chatters[0], text: r.id === 'finale-leak' ? "I'm not saying who. I'm saying it wasn't me." : 'Matte is a personality, not a finish.', moment: 'x' }] }} />)}
              </ScrollView>
            </View>

            <View style={{ marginTop: space.x4, marginHorizontal: space.xl, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: c.stageLine, flexDirection: 'row', alignItems: 'center', gap: space.md }} accessible accessibilityLabel="Be a fly on the wall to your favorite chats.">
              <PeepholeMark size={36} />
              <Text variant="quote" style={{ flex: 1 }}>Be a fly on the wall to your favorite chats.</Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
      <TopScrim />
    </View>
  );
}
