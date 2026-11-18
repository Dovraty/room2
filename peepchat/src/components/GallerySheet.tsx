import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheet, { BottomSheetFooter, BottomSheetScrollView, BottomSheetTextInput, type BottomSheetBackgroundProps, type BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeOut, interpolate, runOnJS, useAnimatedReaction, useAnimatedStyle, useReducedMotion, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, space, spring, useTheme } from '@/theme';
import { gallery, polls, type Comment } from '@/data';
import { haptic } from '@/lib/haptics';
import { look } from '@/lib/platform';
import { compact } from '@/lib/format';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';
import { Tap } from './Tap';
import { CommentItem, SideRoomCard } from './Comment';
import { PollCard } from './PollCard';
import { AudienceAvatar } from './Avatar';
import { Heartbeat } from './Pulse';
import { ReactionBurst, useReactionBurst } from './Reactions';

export type GalleryTab = 'crowd' | 'rooms' | 'polls';
export const GALLERY_PEEK = 112;

type Props = {
  pollId?: string;
  count: number;
  animatedIndex: SharedValue<number>;
  initialTab?: GalleryTab;
  initialIndex?: number;
  bottomInset?: number;
  onReact?: (icon: IconName) => void;
};

/**
 * Signature animation #5 — the Gallery pull-up. A cool-toned glass sheet: clearly "the crowd",
 * never the stage. Peeks at the bottom while you watch; drag it up to join in.
 */
export function GallerySheet({ pollId, count, animatedIndex, initialTab = 'crowd', initialIndex = 0, onReact }: Props) {
  const ref = React.useRef<BottomSheet>(null);
  const { c, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<GalleryTab>(initialTab);
  const [comments, setComments] = useState<Comment[]>(gallery.comments);
    const [ticker, setTicker] = useState(gallery.incoming[0]);
  const burst = useReactionBurst();
  const peek = GALLERY_PEEK + insets.bottom;
  // top detent stops at 80% so a slice of the stage is always visible above the crowd
  const snapPoints = useMemo(() => [peek, '58%', '80%'], [peek]);
  const reveal = useFooterFade(animatedIndex);
  const poll = pollId ? polls[pollId] : undefined;

  // the crowd keeps talking
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      const inc = gallery.incoming[i % gallery.incoming.length];
      setTicker(inc);
      setComments((prev) => [{ id: `inc${i}-${Date.now()}`, by: inc.by, text: inc.text, likes: Math.round(Math.random() * 40), ago: 'now', replies: [] }, ...prev].slice(0, 30));
      i++;
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const Background = useCallback(
    ({ style }: BottomSheetBackgroundProps) => (
      <View style={[style, { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: c.galleryLine }]}>
        {look === 'ios' && <BlurView intensity={60} tint={scheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: c.gallery, opacity: look === 'ios' ? 0.86 : 0.98 }]} />
      </View>
    ),
    [c, scheme],
  );

  const sendRef = React.useRef<(t: string) => void>(() => {});
  useEffect(() => {
    sendRef.current = (t: string) => {
      haptic('react');
      setComments((prev) => [{ id: `me${Date.now()}`, by: 'a5', text: t, likes: 0, ago: 'now', replies: [] }, ...prev]);
      setTab('crowd');
    };
  }, []);
  const draftRef = React.useRef<(t: string) => void>(() => {});

  const Footer = useCallback(
    (props: BottomSheetFooterProps) => <GalleryComposer {...props} index={animatedIndex} sendRef={sendRef} draftRef={draftRef} />,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const tabs: { id: GalleryTab; label: string; icon: IconName }[] = [
    { id: 'crowd', label: 'Crowd', icon: 'crowd' },
    { id: 'rooms', label: 'Side rooms', icon: 'hash' },
    { id: 'polls', label: 'Poll', icon: 'poll' },
  ];

  const reactions: IconName[] = ['flame', 'gasp', 'laugh', 'heart'];

  return (
    <>
      <ReactionBurst burst={burst} bottom={peek + 8} />
      <BottomSheet
        ref={ref}
        index={initialIndex}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        animatedIndex={animatedIndex}
        animationConfigs={reduce ? { duration: 1 } : spring.sheet}
        backgroundComponent={Background}
        handleIndicatorStyle={{ backgroundColor: c.galleryTextSecondary, width: 40, opacity: 0.6 }}
        footerComponent={Footer}
        onChange={() => haptic('galleryDetent')}
        accessibilityLabel="The Gallery, audience space"
        keyboardBehavior="extend"
        android_keyboardInputMode="adjustResize"
      >
        {/* Peek row: always visible while watching */}
        <View style={{ paddingHorizontal: space.lg, paddingBottom: space.md, gap: space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Tap minHit scaleTo={0.98} onPress={() => ref.current?.snapToIndex(1)} accessibilityLabel={`Open the Gallery, ${count} people talking`} style={{ flex: 1, justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="crowd" size={16} color={c.galleryAccent} />
                <Text variant="headline" color={c.galleryText} numberOfLines={1} style={{ fontFamily: 'Fraunces_700Bold', fontSize: 18 }}>The Gallery</Text>
              </View>
              <Text variant="caption" color={c.galleryTextSecondary} style={{ fontFamily: 'Inter_400Regular' }}>{compact(count)} talking · tap or drag up</Text>
            </Tap>
            {reactions.map((r) => (
              <Tap
                key={r}
                onPress={() => { haptic('react'); burst.fire(r); onReact?.(r); }}
                accessibilityLabel={`React ${r}`}
                style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.galleryRaised, borderWidth: 1, borderColor: c.galleryLine }}
                minHit={false}
                hitSlop={4}
              >
                <Icon name={r} size={18} color={c.galleryText} />
              </Tap>
            ))}
          </View>
          <Animated.View key={ticker.text} entering={reduce ? undefined : FadeInDown.duration(260)} exiting={reduce ? undefined : FadeOut.duration(120)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <AudienceAvatar id={ticker.by} size={20} />
            <Text variant="footnote" color={c.galleryTextSecondary} numberOfLines={1} style={{ flex: 1 }}>
              <Text variant="footnote" color={c.galleryText} style={{ fontFamily: 'Inter_600SemiBold' }}>@{gallery.audience.find((a) => a.id === ticker.by)?.handle} </Text>
              {ticker.text}
            </Text>
          </Animated.View>
        </View>

        <Animated.View style={[{ flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.sm }, reveal]} accessibilityRole="tablist">
          {tabs.map((t) => {
            const on = tab === t.id;
            return (
              <Tap
                key={t.id}
                minHit={false}
                onPress={() => { haptic('galleryDetent'); setTab(t.id); }}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: space.md, borderRadius: radius.pill, backgroundColor: on ? c.galleryText : 'transparent', borderWidth: 1, borderColor: on ? c.galleryText : c.galleryLine }}
              >
                <Icon name={t.icon} size={14} color={on ? c.gallery : c.galleryTextSecondary} />
                <Text variant="caption" color={on ? c.gallery : c.galleryTextSecondary}>{t.label}</Text>
                {t.id === 'polls' && poll && <Heartbeat style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.live }} />}
              </Tap>
            );
          })}
        </Animated.View>

        <BottomSheetScrollView style={reveal} contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 160, gap: space.sm }} keyboardShouldPersistTaps="handled">
          {tab === 'crowd' && (
            <>
              {poll && (
                <Tap minHit={false} scaleTo={0.99} onPress={() => setTab('polls')} accessibilityLabel={`Live poll: ${poll.question}. Open to vote`} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: c.spotlightGlow, marginBottom: space.xs }}>
                  <Icon name="poll" size={16} color={c.spotlightInk} />
                  <Text variant="callout" color={c.galleryText} style={{ flex: 1, fontFamily: 'Inter_600SemiBold' }} numberOfLines={1}>{poll.question}</Text>
                  <Text variant="caption" tone="spotlightInk">Vote</Text>
                  <Icon name="chevronRight" size={14} color={c.spotlightInk} />
                </Tap>
              )}
              {comments.map((cm) => (
                <CommentItem key={cm.id} comment={cm} onReply={(r) => draftRef.current(`@${gallery.audience.find((a) => a.id === r.by)?.handle} `)} />
              ))}
            </>
          )}
          {tab === 'rooms' && (
            <>
              <Text variant="footnote" color={c.galleryTextSecondary} style={{ marginBottom: space.xs }}>
                Smaller rooms for deeper takes. Same stage, different seats.
              </Text>
              {gallery.sideRooms.map((r) => <SideRoomCard key={r.id} {...r} />)}
              <Tap minHit scaleTo={0.98} accessibilityLabel="Start a side room" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.galleryLine, padding: space.md }}>
                <Icon name="plus" size={16} color={c.galleryAccent} />
                <Text variant="callout" color={c.galleryAccent}>Start a side room</Text>
              </Tap>
            </>
          )}
          {tab === 'polls' && poll && <PollCard poll={poll} />}
          {tab === 'polls' && !poll && (
            <Text variant="callout" color={c.galleryTextSecondary} align="center" style={{ marginTop: space.x3 }}>No poll running. Chatters can start one anytime.</Text>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
}

function GalleryComposer({ index, sendRef, draftRef, ...props }: BottomSheetFooterProps & { index: SharedValue<number>; sendRef: React.RefObject<(t: string) => void>; draftRef: React.RefObject<(t: string) => void> }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  useEffect(() => {
    draftRef.current = setDraft;
  }, [draftRef]);
  const fade = useFooterFade(index);
  // invisible at the peek detent → must not steal touches from the peek row
  const [live, setLive] = useState(false);
  useAnimatedReaction(() => index.value > 0.5, (v, prev) => { if (v !== prev) runOnJS(setLive)(v); });
  const send = () => {
    const t = draft.trim();
    if (!t) return;
    sendRef.current?.(t);
    setDraft('');
  };
  return (
    <BottomSheetFooter {...props} bottomInset={0} style={{ pointerEvents: live ? 'box-none' : 'none' }}>
      <Animated.View pointerEvents={live ? 'auto' : 'none'} accessibilityElementsHidden={!live} importantForAccessibility={live ? 'auto' : 'no-hide-descendants'} style={[{ paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: Math.max(insets.bottom, space.md), backgroundColor: c.gallery, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.galleryLine }, fade]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <View style={{ flex: 1, minHeight: 44, borderRadius: radius.pill, backgroundColor: c.galleryRaised, borderWidth: 1, borderColor: c.galleryLine, justifyContent: 'center', paddingHorizontal: space.lg }}>
            <BottomSheetTextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={send}
              placeholder="Talk to the gallery…"
              placeholderTextColor={c.galleryTextSecondary}
              accessibilityLabel="Comment to the gallery. The chatters' conversation stays untouched."
              style={{ color: c.galleryText, fontFamily: 'Inter_400Regular', fontSize: 15, paddingVertical: 10 }}
              returnKeyType="send"
            />
          </View>
          <Tap onPress={send} accessibilityLabel="Send to gallery" style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: draft ? c.galleryAccent : c.galleryRaised }}>
            <Icon name="send" size={20} color={draft ? c.gallery : c.galleryTextSecondary} />
          </Tap>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, paddingHorizontal: 4 }}>
          <Icon name="lock" size={11} color={c.galleryTextSecondary} />
          <Text variant="caption" color={c.galleryTextSecondary} style={{ fontFamily: 'Inter_400Regular' }}>
            You’re in the gallery. The chat on stage can’t be interrupted.
          </Text>
        </View>
      </Animated.View>
    </BottomSheetFooter>
  );
}

function useFooterFade(index: SharedValue<number>) {
  return useAnimatedStyle(() => ({ opacity: interpolate(index.value, [0, 0.5, 1], [0, 0, 1], 'clamp') }));
}

/** Drives the stage behind the sheet: scale back + dim as the gallery rises. */
export function useStageRecede(index: SharedValue<number>, lift = 0) {
  // As the gallery rises the stage steps back (scale), lifts so its newest lines stay above the sheet,
  // and dims a little. It never disappears: the conversation is still the thing you came for.
  const stage = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(index.value, [0, 1, 2], [0, -lift, -lift * 1.4], 'clamp') },
      { scale: interpolate(index.value, [0, 1, 2], [1, 0.94, 0.9], 'clamp') },
    ],
    borderRadius: interpolate(index.value, [0, 1], [0, 28], 'clamp'),
  }));
  const dim = useAnimatedStyle(() => ({ opacity: interpolate(index.value, [0, 1, 2], [0, 0.28, 0.5], 'clamp') }));
  return { stage, dim };
}
