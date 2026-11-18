import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { chatterColor, radius, space, spring, useTheme } from '@/theme';
import { getChatter } from '@/data';
import { compact } from '@/lib/format';
import { Text } from './Text';
import { Glyph } from './Glyph';
import { Icon, type IconName } from './Icon';
import { ChatterAvatar } from './Avatar';
import { Heartbeat } from './Pulse';
import { Tap } from './Tap';

export type Reaction = { icon: IconName; count: number };
export type BubbleSide = 'left' | 'right';
export type BubbleVariant = 'stage' | 'transcript' | 'mine';

type Props = {
  from: string;
  text: string;
  side?: BubbleSide;
  first?: boolean;
  last?: boolean;
  showAvatar?: boolean;
  variant?: BubbleVariant;
  reactions?: Reaction[];
  moment?: string;
  time?: string;
  animate?: boolean;
  dimmed?: boolean;
  onLongPress?: () => void;
};

/** Signature animation #2 — message land: rises ~14pt on spring.land and fades in. */
export const landIn = FadeInDown.springify().damping(spring.land.damping).stiffness(spring.land.stiffness).mass(spring.land.mass);

/**
 * The stage bubble. Built for spectators following 2–4 voices at once:
 *  - tinted fill in the chatter's identity colour
 *  - a "key light" accent bar on the speaker's outer edge (broadcast lower-third feel)
 *  - first bubble in a run carries glyph + name, so identity is never colour-only
 */
export function ChatBubble({ from, text, side = 'left', first = true, last = true, showAvatar = false, variant = 'stage', reactions, moment, time, animate = true, dimmed, onLongPress }: Props) {
  const { c, scheme } = useTheme();
  const reduce = useReducedMotion();
  const ch = getChatter(from);
  const col = chatterColor(ch.color);
  const isRight = side === 'right';
  const fill = scheme === 'dark' ? col.bubbleDark : col.bubbleLight;
  const nameColor = scheme === 'dark' ? col.base : col.ink;
  const big = radius.bubble, tail = radius.bubbleTail;
  const corners = isRight
    ? { borderTopLeftRadius: big, borderBottomLeftRadius: big, borderTopRightRadius: first ? big : tail, borderBottomRightRadius: last ? tail : tail }
    : { borderTopRightRadius: big, borderBottomRightRadius: big, borderTopLeftRadius: first ? big : tail, borderBottomLeftRadius: last ? tail : tail };

  const body = (
    <View style={{ flexDirection: isRight ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: space.sm, opacity: dimmed ? 0.45 : 1 }}>
      {showAvatar !== false && !isRight && (
        <View style={{ width: 32 }}>{last && showAvatar ? <ChatterAvatar id={from} size={32} showGlyph={false} /> : null}</View>
      )}
      <View style={{ maxWidth: '80%', alignItems: isRight ? 'flex-end' : 'flex-start' }}>
        {first && (
          <View style={{ flexDirection: isRight ? 'row-reverse' : 'row', alignItems: 'center', gap: 6, marginBottom: 4, paddingHorizontal: 4 }}>
            <Glyph name={col.glyph} size={10} color={nameColor} />
            <Text variant="caption" color={nameColor} style={{ fontFamily: 'Inter_700Bold' }}>
              {variant === 'mine' ? 'You' : ch.name.split(' ')[0]}
            </Text>
            {variant === 'transcript' && <Icon name="mic" size={12} color={c.textTertiary} />}
            {time && <Text variant="caption" tone="textTertiary">{time}</Text>}
          </View>
        )}
        <View
          style={[
            { backgroundColor: fill, paddingVertical: 10, paddingHorizontal: 14, overflow: 'hidden' },
            corners,
            variant === 'transcript' && { backgroundColor: 'transparent', borderWidth: 1, borderColor: scheme === 'dark' ? col.bubbleDark : col.bubbleLight },
          ]}
        >
          <View style={{ position: 'absolute', top: 0, bottom: 0, [isRight ? 'right' : 'left']: 0, width: 3, backgroundColor: scheme === 'dark' ? col.base : col.ink, opacity: first ? 1 : 0.55 }} />
          {moment && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <Icon name="star" size={11} color={c.spotlightInk} strokeWidth={2.4} />
              <Text variant="overline" tone="spotlightInk" style={{ letterSpacing: 0.8 }}>Key moment</Text>
            </View>
          )}
          <Text variant="bubble" tone="textPrimary">{text}</Text>
        </View>
        {reactions && reactions.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 4, marginTop: -6, [isRight ? 'marginRight' : 'marginLeft']: 10 }} accessibilityLabel={`Audience reactions: ${reactions.map((r) => `${r.count} ${r.icon}`).join(', ')}`} accessible>
            {reactions.map((r) => (
              <View key={r.icon} style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, height: 22, borderRadius: radius.pill, backgroundColor: c.galleryRaised, borderWidth: 1, borderColor: c.galleryLine }}>
                <Icon name={r.icon} size={12} color={c.galleryAccent} strokeWidth={2} />
                <Text variant="caption" color={c.galleryTextSecondary} tabular>{compact(r.count)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const a11y = `${variant === 'mine' ? 'You' : ch.name} ${variant === 'transcript' ? 'said aloud' : 'said'}: ${text}`;
  const content = onLongPress ? (
    <Tap minHit={false} scaleTo={0.98} onLongPress={onLongPress} accessibilityLabel={a11y} accessibilityHint="Long press to react from the gallery">
      {body}
    </Tap>
  ) : (
    <View accessible accessibilityLabel={a11y}>{body}</View>
  );

  return (
    <Animated.View entering={animate && !reduce ? landIn : undefined} style={{ marginTop: first ? space.md : 3 }}>
      {content}
    </Animated.View>
  );
}

/** Typing indicator as a heartbeat: an ECG pulse in the typer's colour. */
export function TypingPulse({ from, side = 'left' }: { from: string; side?: BubbleSide }) {
  const { scheme } = useTheme();
  const ch = getChatter(from);
  const col = chatterColor(ch.color);
  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${ch.name} is typing`}
      style={{ flexDirection: side === 'right' ? 'row-reverse' : 'row', alignItems: 'center', gap: space.sm, marginTop: space.md, paddingLeft: side === 'left' ? 40 : 0 }}
    >
      <Heartbeat style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 34, borderRadius: radius.pill, backgroundColor: scheme === 'dark' ? col.bubbleDark : col.bubbleLight }}>
        <EcgLine color={col.base} />
      </Heartbeat>
      <Text variant="caption" tone="textTertiary">{ch.name.split(' ')[0]} is typing</Text>
    </Animated.View>
  );
}

function EcgLine({ color }: { color: string }) {
  return (
    <Svg width={34} height={16} viewBox="0 0 34 16">
      <Path d="M1 9h8l2.5-6 4 11 3-8 1.8 3H33" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Centered system line on the stage: joins, poll launches, "chat ended". */
export function StageNote({ text, icon = 'sparkle' }: { text: string; icon?: IconName }) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', marginVertical: space.lg }} accessible accessibilityLabel={text}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 26, borderRadius: radius.pill, borderWidth: 1, borderColor: c.stageLine }}>
        <Icon name={icon} size={12} color={c.textTertiary} />
        <Text variant="caption" tone="textTertiary">{text}</Text>
      </View>
    </View>
  );
}
