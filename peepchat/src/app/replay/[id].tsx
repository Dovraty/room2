import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ScrollViewInstance } from 'react-native';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, space, useTheme } from '@/theme';
import { getConvo, polls, type Conversation, type Message, type Moment } from '@/data';
import { clock } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { Spotlight } from '@/components/Spotlight';
import { StageHeader } from '@/components/Stage';
import { ChatBubble, StageNote } from '@/components/ChatBubble';
import { ReplayTimeline } from '@/components/ReplayTimeline';
import { PollCard } from '@/components/PollCard';
import { Text } from '@/components/Text';
import { Tap } from '@/components/Tap';
import { Icon } from '@/components/Icon';
import { EmptyState, NotFound } from '@/components/States';

/** Builds a replay for any convo: uses recorded timing if present, else spaces live messages out. */
function buildReplay(cv: Conversation) {
  if (cv.messages?.length) return { messages: cv.messages, duration: cv.duration ?? 600, moments: cv.moments ?? [], density: cv.density ?? [] };
  const src = [...(cv.seed ?? []), ...(cv.script ?? [])];
  const messages: Message[] = src.map((m, i) => ({ ...m, t: 10 + i * 42 }));
  const duration = 10 + src.length * 42 + 30;
  const moments: Moment[] = messages.filter((m) => m.moment).map((m) => ({ t: m.t!, label: m.moment! }));
  if (cv.poll) moments.push({ t: Math.round(duration * 0.55), label: 'Poll goes live', kind: 'poll' });
  const density = Array.from({ length: 40 }, (_, i) => 3 + Math.round(10 * Math.abs(Math.sin(i * 0.55)) + (i > 20 ? 8 : 0)));
  return { messages, duration, moments: moments.sort((a, b) => a.t - b.t), density };
}

export default function ReplayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const convo = getConvo(id);
  if (!convo) return <NotFound />;
  return <Replay key={convo.id} convo={convo} />;
}

function Replay({ convo }: { convo: Conversation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { messages, duration, moments, density } = useMemo(() => buildReplay(convo), [convo]);
  const [t, setT] = useState(Math.min(duration, 900));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const scroll = useRef<ScrollViewInstance>(null);
  const pollMoment = moments.find((m) => m.kind === 'poll');
  const poll = convo.poll ? polls[convo.poll] : undefined;
  const sideOf = (from: string) => (convo.chatters.length > 2 || from === convo.chatters[0] ? 'left' : 'right') as 'left' | 'right';

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT((x) => {
      const n = x + 6 * speed;
      if (n >= duration) { setPlaying(false); return duration; }
      return n;
    }), 250);
    return () => clearInterval(id);
  }, [playing, speed, duration]);

  if (!messages.length) {
    return (
      <View style={{ flex: 1, backgroundColor: c.stage }}>
        <StageHeader convo={convo} viewers={convo.viewers ?? 0} label="watched" status="replay" />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState title="Replay is being cut" body={`${convo.endedAgo}. Key moments and gallery highlights are still being stitched together. We'll ping you when it's ready.`} action="Notify me" onAction={() => haptic('follow')} />
        </View>
      </View>
    );
  }

  const shown = messages.filter((m) => (m.t ?? 0) <= t);
  const seek = (x: number) => setT(Math.round(x));
  const jump = (m: Moment) => { haptic('scrubTick'); setT(m.t + 1); setPlaying(false); };

  return (
    <View style={{ flex: 1, backgroundColor: c.stage }}>
      <Spotlight heat={0.45} />
      <StageHeader convo={convo} viewers={convo.viewers ?? 0} label="watched" status="replay" />
      <ScrollView
        ref={scroll}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.xl }}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        <StageNote text={`Recorded ${convo.endedAgo} · ${clock(duration)}`} icon="clock" />
        {shown.map((m, i) => (
          <ChatBubble key={`${m.t}-${i}`} from={m.from} text={m.text} side={sideOf(m.from)} first={shown[i - 1]?.from !== m.from} last={shown[i + 1]?.from !== m.from} moment={m.moment} time={clock(m.t ?? 0)} showAvatar={false} animate={false} />
        ))}
        {shown.length === 0 && <StageNote text="Press play. The first message lands at 0:04." icon="play" />}
      </ScrollView>

      {/* Control deck: stage-toned, sits below the conversation, never on top of it */}
      <View style={{ paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: insets.bottom + space.md, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, backgroundColor: c.stageRaised, borderTopWidth: 1, borderColor: c.stageLine, gap: space.md }}>
        {poll && pollMoment && t >= pollMoment.t && (
          <Animated.View entering={FadeInDown.springify()}>
            <PollCard poll={{ ...poll, closesIn: 0 }} live={false} compactMode />
          </Animated.View>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
          {moments.map((m) => {
            const passed = t >= m.t;
            return (
              <Tap key={m.t} minHit={false} onPress={() => jump(m)} accessibilityLabel={`Jump to ${m.label} at ${clock(m.t)}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: space.md, borderRadius: radius.pill, backgroundColor: m.kind === 'poll' ? c.spotlightGlow : 'transparent', borderWidth: 1, borderColor: passed ? c.spotlight : c.stageLine }}>
                <Icon name={m.kind === 'poll' ? 'poll' : 'star'} size={13} color={c.spotlightInk} strokeWidth={2.2} />
                <Text variant="caption" tabular tone="textSecondary">{clock(m.t)}</Text>
                <Text variant="caption">{m.kind === 'poll' ? 'Jump to poll' : m.label}</Text>
              </Tap>
            );
          })}
        </ScrollView>
        <ReplayTimeline duration={duration} position={t} onSeek={seek} density={density} moments={moments} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xl }}>
          <Tap onPress={() => setSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))} accessibilityLabel={`Playback speed ${speed}x`} style={{ width: 52, alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="headline" tabular>{speed}×</Text>
          </Tap>
          <Tap onPress={() => setT((x) => Math.max(0, x - 15))} accessibilityLabel="Back 15 seconds" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="skipBack" size={26} color={c.textPrimary} />
          </Tap>
          <Tap onPress={() => { haptic('react'); setPlaying((p) => !p); }} accessibilityLabel={playing ? 'Pause' : 'Play'} style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.spotlight, alignItems: 'center', justifyContent: 'center', shadowColor: c.spotlight, shadowOpacity: 0.5, shadowRadius: 16 }}>
            <Icon name={playing ? 'pause' : 'play'} size={26} color={c.onSpotlight} />
          </Tap>
          <Tap onPress={() => setT((x) => Math.min(duration, x + 15))} accessibilityLabel="Forward 15 seconds" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="skipForward" size={26} color={c.textPrimary} />
          </Tap>
          <Tap accessibilityLabel="Open gallery replay" style={{ width: 52, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="crowd" size={24} color={c.textPrimary} />
          </Tap>
        </View>
      </View>
    </View>
  );
}
