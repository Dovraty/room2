import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatterColors, duration, palettes, radius, space, spring, tokens, type, useTheme, type TypeVariant } from '@/theme';
import { gallery, polls } from '@/data';
import { contrast } from '@/lib/contrast';
import { haptic } from '@/lib/haptics';
import { Text } from '@/components/Text';
import { Tap } from '@/components/Tap';
import { Icon } from '@/components/Icon';
import { Glyph } from '@/components/Glyph';
import { ApertureTransition, Iris, PeepholeMark } from '@/components/Aperture';
import { ChatBubble, StageNote, TypingPulse } from '@/components/ChatBubble';
import { LiveBadge } from '@/components/LiveBadge';
import { useTicker, ViewerCount } from '@/components/ViewerCount';
import { AudienceAvatar, ChatterAvatar } from '@/components/Avatar';
import { FollowButton, NotifyButton } from '@/components/FollowButton';
import { PollCard } from '@/components/PollCard';
import { CommentItem, SideRoomCard } from '@/components/Comment';
import { Waveform } from '@/components/Waveform';
import { ReplayTimeline } from '@/components/ReplayTimeline';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/States';
import { Heartbeat } from '@/components/Pulse';
import { GlassButton } from '@/components/Stage';
import { Spotlight, TopScrim } from '@/components/Spotlight';

function Section({ title, kicker, children }: { title: string; kicker?: string; children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ paddingHorizontal: space.xl, paddingVertical: space.xxl, borderTopWidth: 1, borderTopColor: c.stageLine, gap: space.lg }}>
      <View style={{ gap: 2 }}>
        {kicker && <Text variant="overline" tone="spotlightInk" upper>{kicker}</Text>}
        <Text variant="title1" accessibilityRole="header">{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text variant="caption" tone="textTertiary" style={{ marginTop: space.sm }}>{children}</Text>;
}

function Swatch({ name, value, on }: { name: string; value: string; on: string }) {
  const { c } = useTheme();
  const hex = value.startsWith('#') ? value : null;
  const ratio = hex ? contrast(hex, on) : null;
  return (
    <View style={{ width: '31%', gap: 4 }}>
      <View style={{ height: 52, borderRadius: radius.sm, backgroundColor: value, borderWidth: 1, borderColor: c.stageLine }} />
      <Text variant="caption" numberOfLines={1}>{name}</Text>
      <Text variant="caption" tone="textTertiary" numberOfLines={1} style={{ fontFamily: 'Inter_400Regular', fontSize: 10 }}>{hex ?? 'rgba'}{ratio ? ` · ${ratio.toFixed(1)}:1` : ''}</Text>
    </View>
  );
}

export default function DesignSystem() {
  const { c, scheme, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [aperture, setAperture] = useState(false);
  const [lands, setLands] = useState<{ id: number; from: string; text: string }[]>([]);
  const [pollKey, setPollKey] = useState(0);
  const [pos, setPos] = useState(900);
  const count = useTicker(48210);
  const P = palettes[scheme];
  const stageKeys = ['house', 'stage', 'stageRaised', 'textPrimary', 'textSecondary', 'textTertiary'] as const;
  const galleryKeys = ['gallery', 'galleryRaised', 'galleryText', 'galleryTextSecondary', 'galleryAccent'] as const;
  const signalKeys = ['spotlight', 'spotlightInk', 'live', 'onLive', 'success'] as const;

  return (
    <View style={{ flex: 1, backgroundColor: c.house }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: space.xl, gap: space.md, paddingBottom: space.xxl }}>
          <Text variant="overline" tone="textTertiary" upper>Footlights · v{tokens.meta.version}</Text>
          <Text variant="display" accessibilityRole="header">Design system</Text>
          <Text variant="callout" tone="textSecondary">{tokens.meta.concept}</Text>
          <View style={{ flexDirection: 'row', gap: space.sm }} accessibilityRole="radiogroup">
            {(['system', 'dark', 'light'] as const).map((m) => (
              <Tap key={m} minHit={false} onPress={() => setMode(m)} accessibilityRole="radio" accessibilityState={{ checked: mode === m }} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: space.lg, borderRadius: radius.pill, backgroundColor: mode === m ? c.textPrimary : 'transparent', borderWidth: 1, borderColor: mode === m ? c.textPrimary : c.stageLine }}>
                <Icon name={m === 'light' ? 'sun' : m === 'dark' ? 'moon' : 'phone'} size={14} color={mode === m ? c.house : c.textSecondary} />
                <Text variant="caption" color={mode === m ? c.house : c.textSecondary}>{m[0].toUpperCase() + m.slice(1)}</Text>
              </Tap>
            ))}
          </View>
        </View>

        <Section kicker="Brand" title="The peephole">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xl }}>
            <View style={{ width: 120, height: 120, borderRadius: 28, backgroundColor: palettes.dark.house, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <Spotlight heat={1} origin="center" />
              <PeepholeMark size={84} ring={palettes.dark.spotlight} lens={palettes.dark.spotlight} />
            </View>
            <View style={{ flex: 1, gap: space.sm }}>
              <Text variant="callout">A peephole lens whose ring grows a speech-bubble tail: looking in, and a conversation, in one shape.</Text>
              <Text variant="footnote" tone="textSecondary">Used for: app icon, live counts (“peeping”), the Discover tab, avatar rings, and the aperture transition.</Text>
            </View>
          </View>
          <Label>Iris states · used for the aperture-open transition and empty states</Label>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {[0.06, 0.18, 0.3, 0.42].map((o, i) => (
              <View key={o} style={{ width: 72, height: 72, borderRadius: 36, overflow: 'hidden', backgroundColor: c.spotlight }}>
                <Iris size={72} open={o} color={c.stageRaised} seam={c.stageLine} twist={i * 12} />
              </View>
            ))}
          </View>
        </Section>

        <Section kicker="Color" title={`Tokens · ${scheme}`}>
          <Label>Stage: warm, lit. The conversation lives here.</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
            {stageKeys.map((k) => <Swatch key={k} name={k} value={P[k]} on={k.startsWith('text') ? P.stage : P.textPrimary} />)}
          </View>
          <Label>Gallery: cool, glassy, quieter. The crowd lives here.</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
            {galleryKeys.map((k) => <Swatch key={k} name={k} value={P[k]} on={k.includes('Text') || k === 'galleryAccent' ? P.gallery : P.galleryText} />)}
          </View>
          <Label>Signals: spotlight (brand, heat), live (tally light)</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
            {signalKeys.map((k) => <Swatch key={k} name={k} value={P[k]} on={k === 'onLive' ? P.live : k === 'spotlight' ? P.onSpotlight : P.stage} />)}
          </View>
        </Section>

        <Section kicker="Identity" title="Chatter palette">
          <Text variant="footnote" tone="textSecondary">Eight voices, each a colour + a glyph. Bubbles always pair colour with name, glyph and side, so nobody depends on colour vision to follow a chat.</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
            {chatterColors.map((col) => (
              <View key={col.id} style={{ width: '22%', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: scheme === 'dark' ? col.bubbleDark : col.bubbleLight, borderWidth: 3, borderColor: col.base, alignItems: 'center', justifyContent: 'center' }}>
                  <Glyph name={col.glyph} size={20} color={scheme === 'dark' ? col.base : col.ink} />
                </View>
                <Text variant="caption">{col.name}</Text>
                <Text variant="caption" tone="textTertiary" style={{ fontSize: 10, fontFamily: 'Inter_400Regular' }}>{col.base}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section kicker="Type" title="Fraunces × Inter">
          <Text variant="footnote" tone="textSecondary">Fraunces (display, soft theatrical serif) for brand moments. Inter for everything you read in a chat. Both OFL via Google Fonts.</Text>
          {(Object.keys(type) as TypeVariant[]).map((k) => (
            <View key={k} style={{ gap: 2 }}>
              <Text variant="caption" tone="textTertiary">{k} · {type[k].fontSize}/{type[k].lineHeight}</Text>
              <Text variant={k} numberOfLines={1}>{k === 'overline' ? 'Live now · 3 chats' : k === 'bubble' ? 'He’s sweating. I can hear it.' : 'Pull up a seat.'}</Text>
            </View>
          ))}
        </Section>

        <Section kicker="Layout" title="Space · radius · elevation">
          <View style={{ gap: 6 }}>
            {Object.entries(tokens.space).filter(([, v]) => v > 0).map(([k, v]) => (
              <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <Text variant="caption" tone="textTertiary" style={{ width: 54 }}>{k} {v}</Text>
                <View style={{ width: v * 3, height: 10, borderRadius: 3, backgroundColor: c.spotlight }} />
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
            {Object.entries(radius).filter(([k]) => k !== 'pill').map(([k, v]) => (
              <View key={k} style={{ alignItems: 'center', gap: 4 }}>
                <View style={{ width: 56, height: 56, borderRadius: v, borderWidth: 2, borderColor: c.textSecondary }} />
                <Text variant="caption" tone="textTertiary">{k} {v}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: space.lg, paddingVertical: space.md }}>
            <View style={{ flex: 1, height: 70, borderRadius: radius.lg, backgroundColor: c.stageRaised, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8, alignItems: 'center', justifyContent: 'center' }}><Text variant="caption">stageCard</Text></View>
            <View style={{ flex: 1, height: 70, borderRadius: radius.lg, backgroundColor: c.stageRaised, shadowColor: c.spotlight, shadowOpacity: 0.55, shadowRadius: 28, alignItems: 'center', justifyContent: 'center' }}><Text variant="caption">spotGlow</Text></View>
            <View style={{ flex: 1, height: 70, borderRadius: radius.lg, backgroundColor: c.stageRaised, shadowColor: c.live, shadowOpacity: 0.6, shadowRadius: 14, alignItems: 'center', justifyContent: 'center' }}><Text variant="caption">liveGlow</Text></View>
          </View>
        </Section>

        <Section kicker="Motion" title="Signature animations">
          <View style={{ gap: 4 }}>
            {Object.entries(duration).map(([k, v]) => <Text key={k} variant="footnote" tone="textSecondary">{k}: {v}ms</Text>)}
            {Object.entries(spring).map(([k, v]) => <Text key={k} variant="footnote" tone="textSecondary">spring.{k}: damping {v.damping}, stiffness {v.stiffness}, mass {v.mass}</Text>)}
            <Text variant="footnote" tone="textSecondary">All motion respects the OS reduce-motion setting (cross-fades or static instead).</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {[
              ['1 · Aperture open', () => setAperture(true)],
              ['2 · Message land', () => setLands((l) => [...l.slice(-2), { id: Date.now(), from: l.length % 2 ? 'dex' : 'marisol', text: l.length % 2 ? 'I said A boat' : 'THE PEDAL BOAT??' }])],
              ['4 · Poll reveal', () => setPollKey((k) => k + 1)],
              ['5 · Gallery pull-up', () => router.push('/live/reveal')],
            ].map(([l, fn]) => (
              <Tap key={l as string} onPress={fn as () => void} accessibilityLabel={`Play ${l}`} style={{ height: 40, paddingHorizontal: space.md, borderRadius: radius.pill, borderWidth: 1.5, borderColor: c.spotlight, justifyContent: 'center' }}>
                <Text variant="caption" tone="spotlightInk">{l as string}</Text>
              </Tap>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Heartbeat style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c.live }} />
            <Text variant="footnote">3 · Live pulse: lub-dub, {duration.pulse}ms loop</Text>
          </View>
          <View style={{ minHeight: 120, padding: space.md, borderRadius: radius.lg, backgroundColor: c.stage }}>
            {lands.map((m, i) => <ChatBubble key={m.id} from={m.from} text={m.text} side={m.from === 'dex' ? 'right' : 'left'} first showAvatar={false} last={i === lands.length - 1} />)}
            {!lands.length && <Text variant="footnote" tone="textTertiary" align="center" style={{ marginTop: space.x3 }}>Tap “Message land”</Text>}
          </View>
          <Label>Haptic patterns (device only)</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {(Object.keys(tokens.haptic) as (keyof typeof tokens.haptic)[]).map((k) => (
              <Tap key={k} onPress={() => haptic(k)} accessibilityLabel={`Play haptic ${k}`} style={{ height: 36, paddingHorizontal: space.md, borderRadius: radius.pill, backgroundColor: c.stageRaised, justifyContent: 'center' }}>
                <Text variant="caption">{k}</Text>
              </Tap>
            ))}
          </View>
        </Section>

        <Section kicker="Components" title="Stage">
          <Label>ChatBubble · left / right, first / continued, moment, reactions</Label>
          <View style={{ padding: space.md, borderRadius: radius.lg, backgroundColor: c.stage }}>
            <ChatBubble from="marisol" text="Name one person who's been on the show who isn't in this chat" animate={false} showAvatar={false} last={false} />
            <ChatBubble from="marisol" text="I'm waiting" first={false} animate={false} showAvatar={false} reactions={[{ icon: 'laugh', count: 1840 }]} />
            <ChatBubble from="dex" text="…my cousin" side="right" animate={false} showAvatar={false} moment="The cousin rumor" reactions={[{ icon: 'gasp', count: 4210 }, { icon: 'flame', count: 980 }]} />
            <ChatBubble from="priya" text="Group bubbles carry an avatar at the end of a run." animate={false} showAvatar />
            <ChatBubble from="jules" text="Audio transcript variant" variant="transcript" animate={false} showAvatar={false} />
            <ChatBubble from="marisol" text="Chatter's own message" variant="mine" side="right" animate={false} showAvatar={false} />
            <TypingPulse from="dex" side="right" />
            <StageNote text="Stage note · system line" icon="lock" />
          </View>
          <Label>Status · audience</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, alignItems: 'center' }}>
            <LiveBadge />
            <LiveBadge compact />
            <LiveBadge kind="upcoming" label="Fri 8 PM" />
            <LiveBadge kind="replay" label="Replay" />
            <LiveBadge kind="ended" label="Ended" />
            <LiveBadge kind="audio" label="Audio" />
            <ViewerCount count={count} />
          </View>
          <Label>Avatars · aperture ring, glyph badge, live halo, speaking</Label>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
            <ChatterAvatar id="marisol" size={112} live />
            <ChatterAvatar id="dex" size={64} speaking />
            <ChatterAvatar id="priya" size={44} />
            <ChatterAvatar id="theo" size={32} />
            <AudienceAvatar id="a1" size={28} />
          </View>
          <Label>Buttons</Label>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <FollowButton name="Marisol" size="lg" />
            <FollowButton name="Dex" initial />
            <NotifyButton name="Priya" />
            <NotifyButton name="Theo" initial />
            <GlassButton icon="share" label="Glass button" />
          </View>
          <Label>Waveform · active / idle</Label>
          <View style={{ flexDirection: 'row', gap: space.xl, alignItems: 'center' }}>
            <Waveform active color={chatterColors[2].base} />
            <Waveform active={false} color={chatterColors[5].base} bars={12} />
          </View>
          <Label>Replay timeline · density, moments, poll marker (drag it)</Label>
          <ReplayTimeline duration={2472} position={pos} onSeek={setPos} density={[2, 3, 5, 9, 6, 4, 3, 6, 12, 14, 9, 6, 9, 16, 22, 18, 11, 8, 10, 15, 19, 13, 9, 12, 17, 21, 16, 9]} moments={[{ t: 160, label: 'a' }, { t: 1180, label: 'Poll', kind: 'poll' }, { t: 2210, label: 'b' }]} />
          <Label>Skeleton</Label>
          <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
            <Skeleton w={44} h={44} r={22} />
            <View style={{ flex: 1, gap: 6 }}><Skeleton w="70%" h={12} /><Skeleton w="45%" h={12} /></View>
          </View>
        </Section>

        <Section kicker="Components" title="Gallery">
          <View style={{ padding: space.md, borderRadius: radius.lg, backgroundColor: c.gallery, gap: space.md }}>
            <PollCard key={pollKey} poll={polls['reveal-mystery']} />
            <CommentItem comment={gallery.comments[0]} />
            <SideRoomCard {...gallery.sideRooms[0]} />
          </View>
        </Section>

        <Section kicker="States" title="Screens & states">
          <EmptyState title="Nothing to peep at yet" body="Empty states use the closed iris." />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {[
              ['Onboarding', '/'],
              ['Live · 2 chatters', '/live/reveal'],
              ['Live · group of 4', '/live/roundtable'],
              ['Live · audio', '/audio/afterhours'],
              ['Ended state', '/live/reveal?ended=1'],
              ['Replay', '/replay/lakehouse'],
              ['Replay · not ready', '/replay/finale-leak'],
              ['Chatter view · reactions on', '/studio-live'],
              ['Chatter view · reactions off', '/studio-live?audience=off'],
              ['Profile', '/chatter/marisol'],
              ['Profile · nothing scheduled', '/chatter/kiki'],
            ].map(([l, href]) => (
              <Tap key={href} onPress={() => router.push(href as never)} accessibilityLabel={`Open ${l}`} style={{ height: 40, paddingHorizontal: space.md, borderRadius: radius.pill, backgroundColor: c.stageRaised, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text variant="caption">{l}</Text>
                <Icon name="chevronRight" size={12} color={c.textTertiary} />
              </Tap>
            ))}
          </View>
        </Section>
      </ScrollView>
      <TopScrim />
      {aperture && <ApertureTransition onDone={() => setAperture(false)} />}
    </View>
  );
}
