import React, { useEffect, useRef, useState } from 'react';
import type { ScrollViewInstance } from 'react-native';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatterColor, space, spring, useTheme } from '@/theme';
import { getChatter, getConvo, type Conversation } from '@/data';
import { useLiveScript } from '@/hooks/useLiveScript';
import { ApertureTransition } from '@/components/Aperture';
import { Spotlight } from '@/components/Spotlight';
import { GlassButton, StageHeader } from '@/components/Stage';
import { ChatBubble } from '@/components/ChatBubble';
import { GALLERY_PEEK, GallerySheet, useStageRecede } from '@/components/GallerySheet';
import { useTicker } from '@/components/ViewerCount';
import { Text } from '@/components/Text';
import { Waveform } from '@/components/Waveform';
import { ChatterAvatar } from '@/components/Avatar';
import { Glyph } from '@/components/Glyph';
import { Icon } from '@/components/Icon';
import { NotFound } from '@/components/States';

export default function AudioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const convo = getConvo(id);
  if (!convo || convo.kind !== 'audio') return <NotFound />;
  return <AudioRoom key={convo.id} convo={convo} />;
}

function Seat({ id, active }: { id: string; active: boolean }) {
  const { scheme } = useTheme();
  const ch = getChatter(id);
  const col = chatterColor(ch.color);
  const s = useSharedValue(1);
  useEffect(() => {
    s.value = withSpring(active ? 1.08 : 0.94, spring.gentle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: space.sm }} accessible accessibilityLabel={`${ch.name}${active ? ', speaking now' : ''}`}>
      <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, st]}>
        {active && <View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: col.base, opacity: scheme === 'dark' ? 0.16 : 0.22 }} />}
        <ChatterAvatar id={id} size={88} speaking={active} />
      </Animated.View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Glyph name={col.glyph} size={10} color={scheme === 'dark' ? col.base : col.ink} />
        <Text variant="headline" style={{ fontSize: 15 }}>{ch.name.split(' ')[0]}</Text>
      </View>
      <Waveform active={active} color={scheme === 'dark' ? col.base : col.ink} bars={13} height={28} barWidth={3} gap={3} />
      <Text variant="caption" tone={active ? 'textPrimary' : 'textTertiary'}>{active ? 'Speaking' : 'Listening'}</Text>
    </View>
  );
}

function AudioRoom({ convo }: { convo: Conversation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { messages, typing, pending } = useLiveScript(convo, { speed: 0.7 });
  const listeners = useTicker(convo.viewers ?? 0);
  const index = useSharedValue(0);
  const { height: winH } = useWindowDimensions();
  const { stage, dim } = useStageRecede(index, winH * 0.6 - GALLERY_PEEK - insets.bottom);
  const [aperture, setAperture] = useState(true);
  const [captions, setCaptions] = useState(true);
  const [now, setNow] = useState(0);
  const scroll = useRef<ScrollViewInstance>(null);
  const speaker = typing ?? messages[messages.length - 1]?.from ?? convo.chatters[0];

  useEffect(() => {
    if (!pending) return;
    const t = setInterval(() => setNow(Date.now()), 110);
    return () => clearInterval(t);
  }, [pending]);

  const partial = (() => {
    if (!pending) return null;
    const words = pending.msg.text.split(' ');
    const k = Math.min(1, Math.max(0, (now - pending.startedAt) / pending.ms));
    return words.slice(0, Math.max(1, Math.ceil(words.length * k))).join(' ');
  })();

  return (
    <View style={{ flex: 1, backgroundColor: c.house }}>
      <Animated.View style={[{ flex: 1, overflow: 'hidden', backgroundColor: c.stage }, stage]}>
        <Spotlight heat={convo.heat} color={chatterColor(getChatter(speaker).color).base} />
        <StageHeader
          convo={convo}
          viewers={listeners}
          label="listening"
          right={<GlassButton icon="captions" label={captions ? 'Hide live transcript' : 'Show live transcript'} onPress={() => setCaptions((v) => !v)} />}
        />
        <View style={{ flexDirection: 'row', paddingHorizontal: space.lg, marginTop: space.xl, alignItems: 'flex-start' }}>
          {convo.chatters.map((id) => <Seat key={id} id={id} active={id === typing} />)}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.xl, marginTop: space.xl }}>
          <View style={{ flex: 1, height: 1, backgroundColor: c.stageLine }} />
          <Icon name={captions ? 'captions' : 'mic'} size={14} color={c.textTertiary} />
          <Text variant="overline" tone="textTertiary" upper>{captions ? 'Live transcript' : 'Audio only'}</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: c.stageLine }} />
        </View>
        {captions ? (
          <ScrollView
            ref={scroll}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: GALLERY_PEEK + insets.bottom + 24 }}
            onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
            accessibilityLabel="Live transcript"
          >
            {messages.map((m, i) => (
              <ChatBubble key={m.id} from={m.from} text={m.text} variant="transcript" first={messages[i - 1]?.from !== m.from} showAvatar={false} animate={i >= (convo.seed?.length ?? 0)} />
            ))}
            {pending && partial && (
              <View accessibilityLiveRegion="polite">
                <ChatBubble key={`p-${pending.startedAt}`} from={pending.msg.from} text={`${partial}…`} variant="transcript" first={messages[messages.length - 1]?.from !== pending.msg.from} showAvatar={false} animate={false} dimmed />
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: GALLERY_PEEK + insets.bottom, gap: space.lg }}>
            <Waveform active={!!typing} color={chatterColor(getChatter(speaker).color).base} bars={32} height={80} barWidth={4} gap={4} />
            <Text variant="quote" tone="textSecondary">{getChatter(speaker).name.split(' ')[0]} {typing ? 'is speaking' : 'spoke last'}</Text>
          </View>
        )}
      </Animated.View>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, dim]} />
      <GallerySheet pollId={convo.poll} count={convo.galleryCount ?? 0} animatedIndex={index} />
      {aperture && <ApertureTransition onDone={() => setAperture(false)} />}
    </View>
  );
}
