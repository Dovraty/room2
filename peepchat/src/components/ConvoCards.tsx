import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { chatterColor, radius, space, useTheme } from '@/theme';
import { getChatter, type Conversation } from '@/data';
import { useLiveScript } from '@/hooks/useLiveScript';
import { clock, compact } from '@/lib/format';
import { Text } from './Text';
import { Tap } from './Tap';
import { LiveBadge } from './LiveBadge';
import { useTicker, ViewerCount } from './ViewerCount';
import { AvatarStack, ChatterAvatar } from './Avatar';
import { ChatBubble, TypingPulse } from './ChatBubble';
import { Spotlight } from './Spotlight';
import { Icon } from './Icon';
import { NotifyButton } from './FollowButton';
import { Glyph } from './Glyph';

export const openConvo = (cv: Conversation) => {
  if (cv.status === 'ended') router.push(`/replay/${cv.id}`);
  else if (cv.kind === 'audio') router.push(`/audio/${cv.id}`);
  else router.push(`/live/${cv.id}`);
};

const names = (ids: string[]) => {
  const n = ids.map((i) => getChatter(i).name.split(' ')[0]);
  return n.length <= 2 ? n.join(' × ') : `${n.slice(0, -1).join(', ')} & ${n[n.length - 1]}`;
};

function HeatMeter({ heat }: { heat: number }) {
  const { c } = useTheme();
  const label = heat > 0.85 ? 'On fire' : heat > 0.6 ? 'Heating up' : 'Warming up';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} accessible accessibilityLabel={`Heat: ${label}`}>
      <Icon name="flame" size={14} color={c.spotlightInk} strokeWidth={2} />
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={{ width: 8, height: 4, borderRadius: 2, backgroundColor: i < Math.round(heat * 5) ? c.spotlight : c.stageLine }} />
        ))}
      </View>
      <Text variant="caption" tone="spotlightInk">{label}</Text>
    </View>
  );
}

/** The showpiece card: the live conversation itself is the thumbnail. Messages land in real time. */
export function LiveHeroCard({ convo, width }: { convo: Conversation; width: number }) {
  const { c, scheme } = useTheme();
  const { messages, typing } = useLiveScript(convo, { speed: 0.8 });
  const viewers = useTicker(convo.viewers ?? 0);
  const recent = messages.slice(-3);
  const left = convo.chatters[0];
  const tintA = chatterColor(getChatter(convo.chatters[0]).color).base;
  const tintB = chatterColor(getChatter(convo.chatters[1] ?? convo.chatters[0]).color).base;
  return (
    <Tap
      scaleTo={0.98}
      minHit={false}
      onPress={() => openConvo(convo)}
      accessibilityLabel={`Live: ${convo.title}. ${names(convo.chatters)}. ${viewers} peeping. Opens the chat`}
      style={{ width, height: 440, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: c.stage, borderWidth: 1, borderColor: c.stageLine }}
    >
      <LinearGradient colors={[`${tintA}33`, 'transparent', `${tintB}22`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', inset: 0 } as ViewStyle} />
      <Spotlight heat={convo.heat} />
      <View style={{ padding: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <LiveBadge />
        <ViewerCount count={viewers} />
        <View style={{ flex: 1 }} />
        <Text variant="overline" tone="textSecondary">{convo.tag}</Text>
      </View>
      <View style={{ flex: 1, paddingHorizontal: space.lg, justifyContent: 'flex-end', overflow: 'hidden' }} pointerEvents="none">
        {recent.map((m, i) => {
          const prev = recent[i - 1];
          return <ChatBubble key={m.id} from={m.from} text={m.text} side={m.from === left || convo.chatters.length > 2 ? 'left' : 'right'} first={!prev || prev.from !== m.from} showAvatar={false} />;
        })}
        {typing && <TypingPulse from={typing} side={typing === left || convo.chatters.length > 2 ? 'left' : 'right'} />}
        <LinearGradient colors={[c.stage, `${c.stage}00`]} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 48 }} />
      </View>
      <LinearGradient colors={['transparent', scheme === 'dark' ? 'rgba(14,11,10,0.92)' : 'rgba(255,252,248,0.95)']} style={{ padding: space.lg, paddingTop: space.x3, gap: space.sm }}>
        <Text variant="title1" numberOfLines={2}>{convo.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <AvatarStack ids={convo.chatters} size={28} />
          <Text variant="footnote" tone="textSecondary" style={{ flex: 1 }} numberOfLines={1}>{names(convo.chatters)}</Text>
          <HeatMeter heat={convo.heat ?? 0.5} />
        </View>
      </LinearGradient>
    </Tap>
  );
}

export function LiveRailCard({ convo }: { convo: Conversation }) {
  const { c } = useTheme();
  const viewers = useTicker(convo.viewers ?? 0, { every: 2600 });
  const last = (convo.seed ?? []).slice(-1)[0];
  return (
    <Tap scaleTo={0.97} minHit={false} onPress={() => openConvo(convo)} accessibilityLabel={`Live ${convo.kind === 'audio' ? 'audio' : ''} chat: ${convo.title}. ${viewers} peeping`} style={{ width: 236, height: 168, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: c.stage, borderWidth: 1, borderColor: c.stageLine, padding: space.md, justifyContent: 'space-between' }}>
      <Spotlight heat={(convo.heat ?? 0.5) * 0.7} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <LiveBadge compact />
        {convo.kind === 'audio' && <LiveBadge kind="audio" label="Audio" compact />}
        <View style={{ flex: 1 }} />
        <ViewerCount count={viewers} size="sm" label="" />
      </View>
      {last && (
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }}>
          <View style={{ marginTop: 4 }}><Glyph name={chatterColor(getChatter(last.from).color).glyph} size={10} color={chatterColor(getChatter(last.from).color).base} /></View>
          <Text variant="footnote" tone="textSecondary" numberOfLines={2} style={{ flex: 1, fontStyle: 'italic' }}>“{last.text}”</Text>
        </View>
      )}
      <View style={{ gap: 6 }}>
        <Text variant="headline" numberOfLines={1}>{convo.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <AvatarStack ids={convo.chatters} size={22} />
          <Text variant="caption" tone="textSecondary" numberOfLines={1} style={{ flex: 1 }}>{names(convo.chatters)}</Text>
        </View>
      </View>
    </Tap>
  );
}

export function UpcomingCard({ convo }: { convo: Conversation }) {
  const { c } = useTheme();
  const [day, time] = (convo.startsAt ?? '').split(' · ');
  return (
    <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center', paddingVertical: space.md }} accessible={false}>
      <View style={{ width: 64, height: 64, borderRadius: radius.md, borderWidth: 1, borderColor: c.stageLine, alignItems: 'center', justifyContent: 'center', backgroundColor: c.stageRaised }} accessible accessibilityLabel={`Starts ${day} at ${time}`}>
        <Text variant="overline" tone="spotlightInk">{day}</Text>
        <Text variant="caption" tone="textPrimary">{time}</Text>
      </View>
      <Tap minHit={false} scaleTo={0.99} onPress={() => openConvo(convo)} style={{ flex: 1, gap: 4 }} accessibilityLabel={`${convo.title}, with ${names(convo.chatters)}`}>
        <Text variant="headline" numberOfLines={2}>{convo.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <AvatarStack ids={convo.chatters} size={20} />
          <Text variant="caption" tone="textSecondary" numberOfLines={1} style={{ flex: 1 }}>{names(convo.chatters)} · {compact(convo.reminders ?? 0)} waiting</Text>
        </View>
      </Tap>
      <NotifyButton name={names(convo.chatters)} />
    </View>
  );
}

/** Replay card: a pull-quote from the chat as the "thumbnail". */
export function ReplayCard({ convo, progress = 0 }: { convo: Conversation; progress?: number }) {
  const { c } = useTheme();
  const quote = (convo.messages ?? []).find((m) => m.moment)?.text ?? convo.title;
  const from = (convo.messages ?? []).find((m) => m.moment)?.from ?? convo.chatters[0];
  const col = chatterColor(getChatter(from).color);
  return (
    <Tap scaleTo={0.97} minHit={false} onPress={() => openConvo(convo)} accessibilityLabel={`Replay: ${convo.title}. ${clock(convo.duration ?? 0)}. ${compact(convo.viewers ?? 0)} watched`} style={{ width: 260, gap: space.sm }}>
      <View style={{ height: 150, borderRadius: radius.lg, backgroundColor: c.stage, borderWidth: 1, borderColor: c.stageLine, padding: space.lg, justifyContent: 'space-between', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: col.base }} />
        <Text variant="quote" numberOfLines={3}>“{quote}”</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Glyph name={col.glyph} size={10} color={col.base} />
          <Text variant="caption" tone="textSecondary" style={{ flex: 1 }}>{getChatter(from).name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, height: 22, borderRadius: 11, backgroundColor: c.stageRaised }}>
            <Icon name={convo.kind === 'audio' ? 'mic' : 'play'} size={10} color={c.textPrimary} />
            <Text variant="caption" tabular>{clock(convo.duration ?? 0)}</Text>
          </View>
        </View>
        {progress > 0 && (
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, backgroundColor: c.stageLine }}>
            <View style={{ width: `${progress * 100}%`, height: 3, backgroundColor: c.spotlight }} />
          </View>
        )}
      </View>
      <View style={{ gap: 2, paddingHorizontal: 2 }}>
        <Text variant="headline" numberOfLines={1}>{convo.title}</Text>
        <Text variant="caption" tone="textSecondary">{names(convo.chatters)} · {compact(convo.viewers ?? 0)} watched · {convo.endedAgo}</Text>
      </View>
    </Tap>
  );
}

export function FeaturedChatter({ id, live }: { id: string; live?: boolean }) {
  const ch = getChatter(id);
  return (
    <Tap minHit={false} scaleTo={0.94} onPress={() => router.push(`/chatter/${id}`)} accessibilityLabel={`${ch.name}${live ? ', live now' : ''}. Open profile`} style={{ width: 84, alignItems: 'center', gap: 6 }}>
      <ChatterAvatar id={id} size={72} live={live} />
      <Text variant="caption" numberOfLines={1} align="center">{ch.name.split(' ')[0]}</Text>
    </Tap>
  );
}
