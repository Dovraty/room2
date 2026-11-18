import React, { useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, space, useTheme } from '@/theme';
import { conversations, getChatter } from '@/data';
import { compact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { Text } from '@/components/Text';
import { Tap } from '@/components/Tap';
import { Icon, type IconName } from '@/components/Icon';
import { ChatterAvatar } from '@/components/Avatar';
import { LiveBadge } from '@/components/LiveBadge';
import { Spotlight, TopScrim } from '@/components/Spotlight';
import { UpcomingCard } from '@/components/ConvoCards';

function Pref({ icon, title, body, initial }: { icon: IconName; title: string; body: string; initial: boolean }) {
  const { c } = useTheme();
  const [on, setOn] = useState(initial);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md }}>
      <Icon name={icon} size={20} color={c.textSecondary} />
      <View style={{ flex: 1 }}>
        <Text variant="headline" style={{ fontSize: 15 }}>{title}</Text>
        <Text variant="footnote" tone="textSecondary">{body}</Text>
      </View>
      <Switch value={on} onValueChange={(v) => { haptic('follow'); setOn(v); }} trackColor={{ true: c.spotlight, false: c.stageLine }} ios_backgroundColor={c.stageLine} accessibilityLabel={title} />
    </View>
  );
}

/** Studio: the chatter-side entry point (demo signs you in as Marisol). */
export default function Studio() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const me = getChatter('marisol');
  const live = conversations.find((cv) => cv.id === 'reveal')!;
  const mine = conversations.filter((cv) => cv.status === 'upcoming' && cv.chatters.includes(me.id));
  return (
    <View style={{ flex: 1, backgroundColor: c.house }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: 120, paddingHorizontal: space.xl, gap: space.xl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <ChatterAvatar id={me.id} size={52} live />
          <View style={{ flex: 1 }}>
            <Text variant="overline" tone="textTertiary" upper>Studio · demo chatter</Text>
            <Text variant="title1">{me.name}</Text>
          </View>
        </View>

        <Tap minHit={false} scaleTo={0.98} onPress={() => router.push('/studio-live')} accessibilityLabel={`You're live in ${live.title}. Return to your chat`} style={{ borderRadius: radius.xl, overflow: 'hidden', padding: space.xl, backgroundColor: c.stage, borderWidth: 1, borderColor: c.live, gap: space.md }}>
          <Spotlight heat={0.9} color={c.live} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <LiveBadge label="You're live" />
            <Text variant="caption" tone="textSecondary">{compact(live.viewers ?? 0)} peeping</Text>
          </View>
          <Text variant="display">{live.title}</Text>
          <Text variant="callout" tone="textSecondary">with Dex Okafor · 18 min in</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', height: 44, paddingHorizontal: space.lg, borderRadius: radius.pill, backgroundColor: c.spotlight }}>
            <Text variant="headline" tone="onSpotlight">Back to your chat</Text>
            <Icon name="chevronRight" size={16} color={c.onSpotlight} strokeWidth={2.4} />
          </View>
        </Tap>

        <View>
          <Text variant="title2" style={{ marginBottom: space.xs }}>Your audience settings</Text>
          <Text variant="footnote" tone="textSecondary" style={{ marginBottom: space.sm }}>These change what you see. Viewers can always watch, react and vote in the gallery.</Text>
          <Pref icon="eye" title="Show audience reactions to me" body="Reaction counts on your bubbles, the gallery pulse and poll results." initial />
          <Pref icon="poll" title="Let me launch polls" body="Ask the gallery a question mid-chat." initial />
          <Pref icon="hash" title="Allow side rooms" body="Viewers can split off into smaller discussions." initial />
        </View>

        <View>
          <Text variant="title2">Scheduled</Text>
          {mine.map((m) => <UpcomingCard key={m.id} convo={m} />)}
        </View>

        <Tap minHit onPress={() => haptic('goLive')} accessibilityLabel="Start a new chat" style={{ height: 56, borderRadius: radius.pill, borderWidth: 1.5, borderColor: c.stageLine, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: space.sm }}>
          <Icon name="plus" size={18} color={c.textPrimary} />
          <Text variant="headline">Start a new chat</Text>
        </Tap>
      </ScrollView>
      <TopScrim />
    </View>
  );
}
