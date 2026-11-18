import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ScrollViewInstance } from 'react-native';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, space, useTheme } from '@/theme';
import { gallery, getConvo, polls } from '@/data';
import { compact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { Spotlight } from '@/components/Spotlight';
import { StageHeader } from '@/components/Stage';
import { ChatBubble, TypingPulse, type Reaction } from '@/components/ChatBubble';
import { useTicker } from '@/components/ViewerCount';
import { Text } from '@/components/Text';
import { Tap } from '@/components/Tap';
import { Icon } from '@/components/Icon';
import { AudienceAvatar } from '@/components/Avatar';

const ME = 'marisol';
type Msg = { id: string; from: string; text: string };

/**
 * What a chatter sees. It's a messaging app for them: own bubbles on the right, a composer,
 * and a single control over the audience: "Show audience reactions".
 * Turning it off hides reactions/polls/comments from *this chatter only*. The gallery carries on.
 */
export default function StudioLive() {
  const { audience } = useLocalSearchParams<{ audience?: string }>();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const convo = getConvo('reveal')!;
  const [show, setShow] = useState(audience !== 'off');
  const [msgs, setMsgs] = useState<Msg[]>(() => (convo.seed ?? []).map((m, i) => ({ ...m, id: `s${i}` })));
  const [typing, setTyping] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const viewers = useTicker(convo.viewers ?? 0);
  const scroll = useRef<ScrollViewInstance>(null);
  const poll = polls[convo.poll!];
  const pollTotal = poll.options.reduce((s, o) => s + o.votes, 0);
  const [ticker, setTicker] = useState(0);

  // Dex keeps replying
  useEffect(() => {
    const lines = (convo.script ?? []).filter((m) => m.from !== ME);
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const step = () => {
      const next = lines[i];
      if (!next) return;
      setTyping(next.from);
      t = setTimeout(() => {
        setTyping(null);
        setMsgs((m) => [...m, { ...next, id: `d${i}` }]);
        i++;
        t = setTimeout(step, 3500);
      }, 1800);
    };
    t = setTimeout(step, 1500);
    const tk = setInterval(() => setTicker((x) => x + 1), 3800);
    return () => { clearTimeout(t); clearInterval(tk); };
  }, [convo]);

  const reactionsFor = useMemo(() => (i: number): Reaction[] | undefined => (i % 3 === 2 ? [{ icon: 'flame', count: 900 + i * 311 }, { icon: 'laugh', count: 120 + i * 57 }] : i % 4 === 0 ? [{ icon: 'gasp', count: 400 + i * 90 }] : undefined), []);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    haptic('react');
    setMsgs((m) => [...m, { id: `me${Date.now()}`, from: ME, text: t }]);
    setDraft('');
  };

  const incoming = gallery.incoming[ticker % gallery.incoming.length];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.stage }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Spotlight heat={0.8} />
      <StageHeader convo={convo} viewers={viewers} label="peeping" />

      {/* The one audience control a chatter needs */}
      <View style={{ marginHorizontal: space.lg, marginTop: space.md, padding: space.md, borderRadius: radius.lg, backgroundColor: c.stageRaised, borderWidth: 1, borderColor: show ? c.spotlight : c.stageLine, flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: show ? c.spotlightGlow : c.stage }}>
          <Icon name={show ? 'eye' : 'eyeOff'} size={18} color={show ? c.spotlightInk : c.textSecondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="headline" style={{ fontSize: 15 }}>Show audience reactions</Text>
          <Text variant="caption" tone="textSecondary" style={{ fontFamily: 'Inter_400Regular' }}>{show ? 'Reactions, polls and top comments are visible to you' : 'Only you are affected. The gallery keeps going.'}</Text>
        </View>
        <Switch
          value={show}
          onValueChange={(v) => { haptic('follow'); setShow(v); }}
          trackColor={{ true: c.spotlight, false: c.stageLine }}
          thumbColor={Platform.OS === 'android' ? (show ? c.onSpotlight : c.textSecondary) : undefined}
          ios_backgroundColor={c.stageLine}
          accessibilityLabel="Show audience reactions to me"
        />
      </View>

      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.lg }} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })} showsVerticalScrollIndicator={false}>
        {msgs.map((m, i) => (
          <ChatBubble
            key={m.id}
            from={m.from}
            text={m.text}
            side={m.from === ME ? 'right' : 'left'}
            variant={m.from === ME ? 'mine' : 'stage'}
            first={msgs[i - 1]?.from !== m.from}
            last={msgs[i + 1]?.from !== m.from}
            showAvatar={false}
            reactions={show ? reactionsFor(i) : undefined}
            animate={i >= (convo.seed?.length ?? 0)}
          />
        ))}
        {typing && <TypingPulse from={typing} />}
      </ScrollView>

      {/* Audience strip */}
      <Animated.View layout={LinearTransition.springify().damping(22)} style={{ marginHorizontal: space.lg, marginBottom: space.sm }}>
        {show ? (
          <Animated.View key="on" entering={FadeInDown.duration(240)} exiting={FadeOut.duration(150)} style={{ borderRadius: radius.lg, backgroundColor: c.gallery, borderWidth: 1, borderColor: c.galleryLine, padding: space.md, gap: space.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="crowd" size={14} color={c.galleryAccent} />
              <Text variant="caption" color={c.galleryText}>Gallery pulse</Text>
              <Text variant="caption" color={c.galleryTextSecondary} style={{ fontFamily: 'Inter_400Regular' }}>· {compact(convo.galleryCount ?? 0)} talking</Text>
            </View>
            <Animated.View key={ticker} entering={FadeIn.duration(250)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <AudienceAvatar id={incoming.by} size={20} />
              <Text variant="footnote" color={c.galleryText} numberOfLines={1} style={{ flex: 1 }}>{incoming.text}</Text>
            </Animated.View>
            <View style={{ height: 26, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: c.galleryRaised, justifyContent: 'center' }}>
              <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(poll.options[0].votes / pollTotal) * 100}%`, backgroundColor: c.spotlightGlow }} />
              <Text variant="caption" color={c.galleryText} style={{ paddingHorizontal: space.sm }} numberOfLines={1}>Your poll: “{poll.options[0].label}” leads · {Math.round((poll.options[0].votes / pollTotal) * 100)}%</Text>
            </View>
          </Animated.View>
        ) : (
          <Animated.View key="off" entering={FadeInDown.duration(240)} exiting={FadeOut.duration(150)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.lg, borderWidth: 1, borderStyle: 'dashed', borderColor: c.stageLine }} accessible accessibilityLabel={`Audience reactions hidden for you. ${viewers} people are still watching.`}>
            <Icon name="eyeOff" size={16} color={c.textTertiary} />
            <Text variant="footnote" tone="textSecondary" style={{ flex: 1 }}>Reactions hidden for you. {compact(viewers)} are still peeping and the gallery is still talking.</Text>
          </Animated.View>
        )}
      </Animated.View>

      {/* Composer — chatters only */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: insets.bottom + space.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.stageLine, backgroundColor: c.stage }}>
        <View style={{ flex: 1, minHeight: 46, borderRadius: radius.lg, backgroundColor: c.stageRaised, borderWidth: 1, borderColor: c.stageLine, paddingHorizontal: space.lg, justifyContent: 'center' }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message Dex. 48K are reading"
            placeholderTextColor={c.textTertiary}
            multiline
            style={{ color: c.textPrimary, fontFamily: 'Inter_400Regular', fontSize: 16, paddingVertical: 10, maxHeight: 120 }}
            accessibilityLabel="Message to your co-chatter. Everyone watching will see it."
          />
        </View>
        <Tap onPress={send} accessibilityLabel="Send message" style={{ width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: draft ? c.spotlight : c.stageRaised }}>
          <Icon name="send" size={20} color={draft ? c.onSpotlight : c.textTertiary} />
        </Tap>
      </View>
    </KeyboardAvoidingView>
  );
}
