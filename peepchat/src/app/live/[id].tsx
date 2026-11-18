import React, { useMemo, useRef, useState } from 'react';
import type { ScrollViewInstance } from 'react-native';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeInDown, runOnJS, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, space, useTheme } from '@/theme';
import { getConvo, liveNow, type Conversation } from '@/data';
import { useLiveScript } from '@/hooks/useLiveScript';
import { haptic } from '@/lib/haptics';
import { compact } from '@/lib/format';
import { ApertureTransition } from '@/components/Aperture';
import { Spotlight } from '@/components/Spotlight';
import { CastStrip, StageHeader } from '@/components/Stage';
import { ChatBubble, StageNote, TypingPulse, type Reaction } from '@/components/ChatBubble';
import { GALLERY_PEEK, GallerySheet, useStageRecede } from '@/components/GallerySheet';
import { useTicker } from '@/components/ViewerCount';
import { Text } from '@/components/Text';
import { Tap } from '@/components/Tap';
import { Icon, type IconName } from '@/components/Icon';
import { NotFound } from '@/components/States';

const REACTS: IconName[] = ['flame', 'gasp', 'laugh', 'heart'];
const seededReactions = (id: string, i: number): Reaction[] | undefined => {
  if (i % 3 !== 1 && i % 5 !== 0) return undefined;
  const h = id.split('').reduce((a, ch) => a + ch.charCodeAt(0), i * 7);
  return [{ icon: REACTS[h % 4], count: 200 + (h * 37) % 4200 }, ...(i % 2 ? [{ icon: REACTS[(h + 1) % 4], count: 40 + (h * 13) % 900 }] : [])];
};

export default function LiveTextScreen() {
  const { id, ended } = useLocalSearchParams<{ id: string; ended?: string }>();
  const convo = getConvo(id);
  if (!convo || convo.kind !== 'text') return <NotFound />;
  return <LiveText key={convo.id} convo={convo} ended={ended === '1'} />;
}

function LiveText({ convo, ended }: { convo: Conversation; ended: boolean }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const all = useMemo(() => [...(convo.seed ?? []), ...(convo.script ?? [])].map((m, i) => ({ ...m, id: `e${i}`, at: 0 })), [convo]);
  const live = useLiveScript(convo, { paused: ended });
  const messages = ended ? all : live.messages;
  const typing = ended ? null : live.typing;
  const viewers = useTicker(convo.viewers ?? 0);
  const index = useSharedValue(0);
  const { height: winH } = useWindowDimensions();
  const { stage, dim } = useStageRecede(index, winH * 0.6 - GALLERY_PEEK - insets.bottom);
  const scroll = useRef<ScrollViewInstance>(null);
  const [aperture, setAperture] = useState(true);
  const [extra, setExtra] = useState<Record<string, number>>({});
  const group = convo.chatters.length > 2;
  const sideOf = (from: string) => (group || from === convo.chatters[0] ? 'left' : 'right') as 'left' | 'right';

  // swipe between live chats
  const lives = liveNow();
  const pos = lives.findIndex((l) => l.id === convo.id);
  const go = (dir: number) => {
    const next = lives[(pos + dir + lives.length) % lives.length];
    haptic('galleryDetent');
    router.replace(next.kind === 'audio' ? `/audio/${next.id}` : `/live/${next.id}`);
  };
  const swipe = Gesture.Pan()
    .activeOffsetX([-40, 40])
    .failOffsetY([-14, 14])
    .onEnd((e) => {
      if (e.translationX < -90) runOnJS(go)(1);
      else if (e.translationX > 90 && e.absoluteX - e.translationX > 40) runOnJS(go)(-1);
    });

  const react = (msgId: string, icon: IconName) => {
    haptic('react');
    setExtra((x) => ({ ...x, [`${msgId}:${icon}`]: (x[`${msgId}:${icon}`] ?? 0) + 1 }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.house }}>
      <Animated.View style={[{ flex: 1, overflow: 'hidden', backgroundColor: c.stage }, stage]}>
        <Spotlight heat={ended ? 0.15 : convo.heat} />
        <StageHeader convo={convo} viewers={ended ? convo.viewers ?? 0 : viewers} label={ended ? 'watched live' : 'peeping'} status={ended ? 'ended' : 'live'} />
        {!ended && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: space.sm }} accessible accessibilityLabel={`Live chat ${pos + 1} of ${lives.length}. Swipe left or right for other live chats`}>
            {lives.map((l, i) => <View key={l.id} style={{ width: i === pos ? 14 : 5, height: 5, borderRadius: 3, backgroundColor: i === pos ? c.textSecondary : c.stageLine }} />)}
          </View>
        )}
        <View style={{ marginTop: space.md }}>
          <CastStrip ids={convo.chatters} speaking={typing} />
        </View>
        <GestureDetector gesture={swipe}>
          <ScrollView
            ref={scroll}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: GALLERY_PEEK + insets.bottom + (ended ? 220 : 24) }}
            onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
            accessibilityLabel="Conversation"
          >
            <StageNote text={`${convo.startedMinAgo ?? 0} min ago · ${convo.chatters.length} chatters · viewers can't type here`} icon="lock" />
            {messages.map((m, i) => {
              const prev = messages[i - 1];
              const next = messages[i + 1];
              const base = seededReactions(convo.id, i) ?? [];
              const bumped = REACTS.map((r) => ({ icon: r, count: (base.find((b) => b.icon === r)?.count ?? 0) + (extra[`${m.id}:${r}`] ?? 0) })).filter((r) => r.count > 0);
              return (
                <ChatBubble
                  key={m.id}
                  from={m.from}
                  text={m.text}
                  side={sideOf(m.from)}
                  first={!prev || prev.from !== m.from}
                  last={!next || next.from !== m.from}
                  showAvatar={group}
                  reactions={bumped.length ? bumped : undefined}
                  onLongPress={() => react(m.id, 'flame')}
                  animate={!ended && i >= (convo.seed?.length ?? 0)}
                />
              );
            })}
            {typing && <TypingPulse from={typing} side={sideOf(typing)} />}
            {ended && <StageNote text="Chat ended · the conversation is saved exactly as it happened" icon="check" />}
          </ScrollView>
        </GestureDetector>
        {ended && <EndedCurtain convo={convo} />}
      </Animated.View>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, dim]} />
      <GallerySheet pollId={ended ? undefined : convo.poll} count={convo.galleryCount ?? 0} animatedIndex={index} />
      {aperture && <ApertureTransition onDone={() => setAperture(false)} />}
    </View>
  );
}

function EndedCurtain({ convo }: { convo: Conversation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Animated.View entering={FadeInDown.springify().damping(20)} style={{ position: 'absolute', left: space.lg, right: space.lg, bottom: GALLERY_PEEK + insets.bottom + space.md, padding: space.xl, borderRadius: radius.xl, backgroundColor: c.stageRaised, borderWidth: 1, borderColor: c.stageLine, gap: space.md, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8 }}>
      <Text variant="overline" tone="spotlightInk" upper>Curtain</Text>
      <Text variant="display" accessibilityRole="header">That’s a wrap.</Text>
      <Text variant="callout" tone="textSecondary">{compact(convo.viewers ?? 0)} people watched this live. The replay keeps every message, every poll, and where the gallery got loud.</Text>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Tap onPress={() => router.replace(`/replay/${convo.id}`)} accessibilityLabel="Watch the replay" style={{ flex: 1, height: 48, borderRadius: radius.pill, backgroundColor: c.spotlight, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
          <Icon name="play" size={16} color={c.onSpotlight} />
          <Text variant="headline" tone="onSpotlight">Watch replay</Text>
        </Tap>
        <Tap onPress={() => router.push(`/chatter/${convo.chatters[0]}`)} accessibilityLabel="See who's next" style={{ flex: 1, height: 48, borderRadius: radius.pill, borderWidth: 1.5, borderColor: c.stageLine, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="headline">Up next</Text>
        </Tap>
      </View>
    </Animated.View>
  );
}
