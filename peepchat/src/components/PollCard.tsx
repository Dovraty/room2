import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSpring, ZoomIn } from 'react-native-reanimated';
import { radius, space, spring, useTheme } from '@/theme';
import { getChatter, type Poll } from '@/data';
import { compact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { Text } from './Text';
import { Tap } from './Tap';
import { Icon } from './Icon';
import { ChatterAvatar } from './Avatar';
import { Heartbeat } from './Pulse';

function Bar({ pct, index, leader, revealed, selected }: { pct: number; index: number; leader: boolean; revealed: boolean; selected: boolean }) {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const p = useSharedValue(revealed && reduce ? 1 : 0);
  useEffect(() => {
    if (!revealed) return;
    p.value = reduce ? 1 : withDelay(index * 80, withSpring(1, spring.gentle));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);
  const st = useAnimatedStyle(() => ({ width: `${Math.max(0, pct * p.value)}%` }));
  return (
    <Animated.View
      style={[
        { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: radius.md, backgroundColor: leader ? c.spotlightGlow : c.galleryLine },
        selected && { borderWidth: 1.5, borderColor: leader ? c.spotlight : c.galleryAccent },
        st,
      ]}
    />
  );
}

/**
 * Signature animation #4 — poll reveal. Voting is a live-event moment: haptic thunk,
 * bars race out on a staggered spring, the leader gets the spotlight, counts keep ticking.
 */
export function PollCard({ poll, live = true, initialVote, compactMode }: { poll: Poll; live?: boolean; initialVote?: string; compactMode?: boolean }) {
  const { c } = useTheme();
  const [vote, setVote] = useState<string | undefined>(initialVote);
  const [votes, setVotes] = useState(() => Object.fromEntries(poll.options.map((o) => [o.id, o.votes])) as Record<string, number>);
  const [left, setLeft] = useState(poll.closesIn);
  const revealed = !!vote || !live || poll.closesIn === 0;

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setVotes((v) => {
        const n = { ...v };
        poll.options.forEach((o, i) => (n[o.id] += Math.round(Math.random() * (40 - i * 8))));
        return n;
      });
      setLeft((l) => Math.max(0, l - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [live, poll]);

  const total = useMemo(() => Object.values(votes).reduce((a, b) => a + b, 0), [votes]);
  const leaderId = useMemo(() => Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0], [votes]);
  const asker = getChatter(poll.askedBy);

  const onVote = (id: string) => {
    if (vote || !live) return;
    haptic('pollVote');
    setVote(id);
    setVotes((v) => ({ ...v, [id]: v[id] + 1 }));
    setTimeout(() => haptic('pollReveal'), 520);
  };

  return (
    <View
      style={{ backgroundColor: c.galleryRaised, borderRadius: radius.lg, padding: compactMode ? space.md : space.lg, borderWidth: 1, borderColor: c.galleryLine, gap: space.md }}
      accessibilityLabel={`Poll from ${asker.name}: ${poll.question}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <ChatterAvatar id={poll.askedBy} size={28} showGlyph={false} />
        <View style={{ flex: 1 }}>
          <Text variant="caption" color={c.galleryTextSecondary}>{asker.name.split(' ')[0]} asked the gallery</Text>
        </View>
        {live && left > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Heartbeat style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.live }} />
            <Text variant="caption" color={c.galleryTextSecondary} tabular>{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')} left</Text>
          </View>
        ) : (
          <Text variant="caption" color={c.galleryTextSecondary}>Final results</Text>
        )}
      </View>
      <Text variant={compactMode ? 'headline' : 'title2'} color={c.galleryText} style={{ fontFamily: 'Fraunces_700Bold' }}>{poll.question}</Text>
      <View style={{ gap: space.sm }} accessibilityRole="radiogroup">
        {poll.options.map((o, i) => {
          const pct = total ? (votes[o.id] / total) * 100 : 0;
          const leader = revealed && o.id === leaderId;
          const selected = vote === o.id;
          return (
            <Tap
              key={o.id}
              minHit
              scaleTo={0.98}
              disabled={revealed}
              onPress={() => onVote(o.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled: revealed }}
              accessibilityLabel={`${o.label}${revealed ? `, ${Math.round(pct)} percent` : ''}${selected ? ', your vote' : ''}`}
              style={{ minHeight: 48, borderRadius: radius.md, borderWidth: revealed ? 0 : 1.5, borderColor: c.galleryLine, justifyContent: 'center', overflow: 'hidden', backgroundColor: revealed ? 'transparent' : c.gallery }}
            >
              {revealed && <Bar pct={pct} index={i} leader={leader} revealed={revealed} selected={selected} />}
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, gap: space.sm }}>
                {selected && (
                  <Animated.View entering={ZoomIn.springify()}>
                    <Icon name="check" size={16} color={leader ? c.spotlightInk : c.galleryAccent} strokeWidth={2.6} />
                  </Animated.View>
                )}
                <Text variant="callout" color={c.galleryText} style={{ flex: 1, fontFamily: leader ? 'Inter_700Bold' : 'Inter_500Medium' }}>{o.label}</Text>
                {revealed && (
                  <Animated.View entering={FadeIn.delay(200 + i * 80)}>
                    <Text variant="callout" color={leader ? c.spotlightInk : c.galleryTextSecondary} tabular style={{ fontFamily: 'Inter_700Bold' }}>{Math.round(pct)}%</Text>
                  </Animated.View>
                )}
              </View>
            </Tap>
          );
        })}
      </View>
      <Text variant="caption" color={c.galleryTextSecondary}>
        {compact(total)} votes{vote ? ' · You\'re in. Results update live.' : live ? ' · Tap to vote. Chatters see results only if they choose to.' : ''}
      </Text>
    </View>
  );
}
