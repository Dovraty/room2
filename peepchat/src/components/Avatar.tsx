import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { chatterColor, useTheme } from '@/theme';
import { getAudience, getChatter } from '@/data';
import { Text } from './Text';
import { Glyph } from './Glyph';
import { Halo } from './Pulse';

const initials = (name: string) => name.split(' ').map((p) => p[0]).slice(0, 2).join('');

function GradientDisc({ size, a, b, seed }: { size: number; a: string; b: string; seed: number }) {
  const id = `g${seed}-${size}`;
  const angle = (seed * 47) % 360;
  const rad = (angle * Math.PI) / 180;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
      <Defs>
        <LinearGradient id={id} x1={0.5 - Math.cos(rad) / 2} y1={0.5 - Math.sin(rad) / 2} x2={0.5 + Math.cos(rad) / 2} y2={0.5 + Math.sin(rad) / 2}>
          <Stop offset="0" stopColor={a} />
          <Stop offset="1" stopColor={b} />
        </LinearGradient>
      </Defs>
      <Circle cx={50} cy={50} r={50} fill={`url(#${id})`} />
      <Circle cx={30 + (seed % 5) * 8} cy={28 + (seed % 3) * 6} r={26} fill="#FFFFFF" opacity={0.14} />
      <Circle cx={78} cy={84} r={34} fill="#000000" opacity={0.18} />
    </Svg>
  );
}

const hash = (s: string) => s.split('').reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 997, 7);

/**
 * Avatar with the aperture ring. The ring carries the chatter's identity colour,
 * the badge carries their glyph (shape), the centre carries initials — three
 * redundant identity cues, never colour alone.
 */
export function ChatterAvatar({ id, size = 44, live = false, speaking = false, showGlyph = true, ring = true }: { id: string; size?: number; live?: boolean; speaking?: boolean; showGlyph?: boolean; ring?: boolean }) {
  const { c } = useTheme();
  const ch = getChatter(id);
  const col = chatterColor(ch.color);
  const ringW = Math.max(2, Math.round(size * 0.06));
  const gap = Math.max(2, Math.round(size * 0.05));
  const inner = size - (ringW + gap) * 2;
  const badge = Math.max(14, Math.round(size * 0.32));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={`${ch.name}${live ? ', live now' : ''}`} accessible>
      {(live || speaking) && <Halo color={speaking ? col.base : c.live} size={size} />}
      {ring && (
        <View
          style={{
            position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: ringW,
            borderColor: live ? c.live : col.base,
          }}
        />
      )}
      <View style={{ width: inner, height: inner, borderRadius: inner / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
        <GradientDisc size={inner} a={col.base} b={col.bubbleDark} seed={hash(id)} />
        <Text
          variant={size >= 64 ? 'display' : 'headline'}
          color="#FFFFFF"
          style={{ fontFamily: 'Fraunces_700Bold', fontSize: inner * 0.38, lineHeight: inner * 0.46, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6 }}
          maxFontSizeMultiplier={1}
        >
          {initials(ch.name)}
        </Text>
      </View>
      {showGlyph && size >= 32 && (
        <View
          style={{
            position: 'absolute', right: -2, bottom: -2, width: badge, height: badge, borderRadius: badge / 2,
            backgroundColor: c.house, alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Glyph name={col.glyph} size={badge * 0.62} color={col.base} />
        </View>
      )}
    </View>
  );
}

/** Audience members are deliberately quieter: cool, desaturated, no ring, no glyph. */
export function AudienceAvatar({ id, size = 28 }: { id: string; size?: number }) {
  const { scheme } = useTheme();
  const a = getAudience(id);
  const bg = scheme === 'dark' ? `hsl(${a.hue}, 22%, 30%)` : `hsl(${a.hue}, 30%, 84%)`;
  const fg = scheme === 'dark' ? `hsl(${a.hue}, 40%, 86%)` : `hsl(${a.hue}, 45%, 25%)`;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }} accessible={false}>
      <Text variant="caption" color={fg} style={{ fontSize: size * 0.42, lineHeight: size * 0.5 }} maxFontSizeMultiplier={1}>
        {a.handle[0].toUpperCase()}
      </Text>
    </View>
  );
}

export function AvatarStack({ ids, size = 28 }: { ids: string[]; size?: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {ids.map((id, i) => (
        <View key={id} style={{ marginLeft: i === 0 ? 0 : -size * 0.3, zIndex: ids.length - i }}>
          <ChatterAvatar id={id} size={size} showGlyph={false} />
        </View>
      ))}
    </View>
  );
}
