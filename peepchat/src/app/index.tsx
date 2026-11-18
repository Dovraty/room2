import React, { useRef, useState } from 'react';
import type { ScrollViewInstance } from 'react-native';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { radius, space, useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { Tap } from '@/components/Tap';
import { ApertureTransition, PeepholeMark } from '@/components/Aperture';
import { Spotlight } from '@/components/Spotlight';
import { ChatBubble } from '@/components/ChatBubble';
import { AudienceAvatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { haptic } from '@/lib/haptics';

const PAGES = [
  { kicker: 'PeepChat', title: 'Watch the chat.', body: 'Front-row seats to live conversations between the people you follow. Reality stars, creators, hosts. Texting for real, while you read along.' },
  { kicker: 'The Gallery', title: 'Join the crowd.', body: 'React, reply, start side rooms and vote in live polls. The audience has its own space, right beside the stage.' },
  { kicker: 'House rule', title: 'Never interrupt.', body: 'Chatters talk. You watch. Nobody can type into the conversation, so it stays exactly as it happened.' },
];

function LensIllustration({ size }: { size: number }) {
  const { c } = useTheme();
  const inner = size * 0.78;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size * 1.25, height: size * 1.25, borderRadius: size, backgroundColor: c.spotlightGlow, opacity: 0.6 }} />
      <View style={{ width: inner, height: inner, borderRadius: inner / 2, overflow: 'hidden', backgroundColor: c.stage, justifyContent: 'center', paddingHorizontal: 18 }}>
        <Spotlight heat={0.9} />
        <ChatBubble from="marisol" text="Okay we're live." animate={false} showAvatar={false} />
        <ChatBubble from="dex" text="This is a terrible idea" side="right" animate={false} showAvatar={false} />
        <ChatBubble from="marisol" text="It's called a tease, Dex." first animate={false} showAvatar={false} />
      </View>
      <View style={{ position: 'absolute', width: inner + 28, height: inner + 28, borderRadius: (inner + 28) / 2, borderWidth: 14, borderColor: c.spotlight }} />
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        <Path d="M19 74 C 17 86, 11 93, 3 98 C 15 97, 25 92, 31 85 Z" fill={c.spotlight} />
      </Svg>
    </View>
  );
}

function GalleryIllustration({ w }: { w: number }) {
  const { c } = useTheme();
  return (
    <View style={{ width: w, gap: 0 }}>
      <View style={{ height: 150, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, backgroundColor: c.stage, padding: space.lg, overflow: 'hidden', transform: [{ scale: 0.94 }], opacity: 0.7 }}>
        <Spotlight heat={0.7} />
        <ChatBubble from="priya" text="Who's DJing?" animate={false} showAvatar={false} />
        <ChatBubble from="kiki" text="Me. Obviously." side="right" animate={false} showAvatar={false} />
      </View>
      <View style={{ marginTop: -24, borderRadius: radius.xl, backgroundColor: c.gallery, borderWidth: 1, borderColor: c.galleryLine, padding: space.lg, gap: space.md }}>
        <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: c.galleryTextSecondary, opacity: 0.5 }} />
        {[['a1', 'the 40 minute song was a ringtone'], ['a3', 'Theo + fire = content']].map(([id, t]) => (
          <View key={id} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
            <AudienceAvatar id={id} size={24} />
            <Text variant="footnote" color={c.galleryText}>{t}</Text>
          </View>
        ))}
        <View style={{ height: 36, borderRadius: radius.md, overflow: 'hidden', backgroundColor: c.galleryRaised, justifyContent: 'center' }}>
          <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '64%', backgroundColor: c.spotlightGlow }} />
          <Text variant="caption" color={c.galleryText} style={{ paddingHorizontal: space.md }}>Let Kiki DJ · 64%</Text>
        </View>
      </View>
    </View>
  );
}

function RopeIllustration({ w }: { w: number }) {
  const { c } = useTheme();
  const h = w * 0.62;
  return (
    <View style={{ width: w, height: h + 70, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ position: 'absolute', top: 0, width: w * 0.9, height: h * 0.75, borderRadius: radius.xl, backgroundColor: c.stage, overflow: 'hidden', padding: space.lg }}>
        <Spotlight heat={1} />
        <ChatBubble from="jules" text="Can I tease the shade names?" animate={false} showAvatar={false} />
        <ChatBubble from="priya" text="ONE. The rest drop Friday." side="right" animate={false} showAvatar={false} />
      </View>
      <Svg width={w} height={h * 0.6} viewBox="0 0 300 120">
        <Path d="M40 38 C 110 100, 190 100, 260 38" stroke={c.live} strokeWidth={9} fill="none" strokeLinecap="round" />
        <Rect x={30} y={22} width={20} height={98} rx={6} fill={c.spotlight} />
        <Rect x={250} y={22} width={20} height={98} rx={6} fill={c.spotlight} />
        <Circle cx={40} cy={20} r={13} fill={c.spotlight} />
        <Circle cx={260} cy={20} r={13} fill={c.spotlight} />
      </Svg>
    </View>
  );
}

export default function Onboarding() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const [intro, setIntro] = useState(true);
  const ref = useRef<ScrollViewInstance>(null);
  const go = (i: number) => {
    haptic('galleryDetent');
    ref.current?.scrollTo({ x: i * width, animated: true });
    setPage(i);
  };
  const finish = () => {
    haptic('apertureOpen');
    router.replace('/discover');
  };
  const art = Math.min(width - 64, 320);
  return (
    <View style={{ flex: 1, backgroundColor: c.house }}>
      <Spotlight heat={0.5} />
      <View style={{ paddingTop: insets.top + space.sm, paddingHorizontal: space.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <PeepholeMark size={30} />
          <Text variant="title2" style={{ fontFamily: 'Fraunces_900Black', fontSize: 22 }}>PeepChat</Text>
        </View>
        <Tap onPress={finish} accessibilityLabel="Skip introduction" style={{ justifyContent: 'center', paddingHorizontal: space.sm }}>
          <Text variant="callout" tone="textSecondary">Skip</Text>
        </Tap>
      </View>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={{ flex: 1 }}
      >
        {PAGES.map((p, i) => (
          <View key={i} style={{ width, paddingHorizontal: space.xxl, justifyContent: 'center', gap: space.x3 }} accessible={false}>
            <View style={{ alignItems: 'center', minHeight: art + 20, justifyContent: 'center' }}>
              {i === 0 && <LensIllustration size={art} />}
              {i === 1 && <GalleryIllustration w={art} />}
              {i === 2 && <RopeIllustration w={art} />}
            </View>
            <Animated.View entering={FadeInDown.delay(150).duration(500)} style={{ gap: space.md }}>
              <Text variant="overline" tone="spotlightInk" upper>{p.kicker}</Text>
              <Text variant="hero" accessibilityRole="header">{p.title}</Text>
              <Text variant="body" tone="textSecondary">{p.body}</Text>
            </Animated.View>
          </View>
        ))}
      </ScrollView>
      <View style={{ paddingHorizontal: space.xxl, paddingBottom: insets.bottom + space.lg, gap: space.xl }}>
        <View style={{ flexDirection: 'row', gap: space.sm, justifyContent: 'center' }} accessibilityLabel={`Page ${page + 1} of 3`} accessible>
          {PAGES.map((_, i) => (
            <View key={i} style={{ width: i === page ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: i === page ? c.spotlight : c.stageLine }} />
          ))}
        </View>
        <Tap
          onPress={() => (page < 2 ? go(page + 1) : finish())}
          accessibilityLabel={page < 2 ? 'Next' : 'Start peeping'}
          style={{ height: 56, borderRadius: radius.pill, backgroundColor: c.spotlight, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: space.sm, shadowColor: c.spotlight, shadowOpacity: 0.45, shadowRadius: 20, shadowOffset: { width: 0, height: 6 } }}
        >
          <Text variant="headline" tone="onSpotlight" style={{ fontFamily: 'Inter_700Bold' }}>{page < 2 ? 'Next' : 'Start peeping'}</Text>
          <Icon name={page < 2 ? 'chevronRight' : 'eye'} size={18} color={c.onSpotlight} strokeWidth={2.4} />
        </Tap>
      </View>
      {intro && (
        <Animated.View entering={FadeIn} style={{ position: 'absolute', inset: 0 }} pointerEvents="none">
          <ApertureTransition onDone={() => setIntro(false)} />
        </Animated.View>
      )}
    </View>
  );
}
