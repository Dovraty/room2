import { Easing } from 'react-native-reanimated';
import raw from './tokens.json';

export const tokens = raw;

export type ColorScheme = 'dark' | 'light';
export type Palette = typeof raw.color.dark;
export type ChatterColor = (typeof raw.chatter)[number];
export type Glyph = 'circle' | 'triangle' | 'square' | 'diamond' | 'star' | 'hexagon' | 'plus' | 'ring';
export type TypeVariant = keyof typeof raw.type;

export const palettes: Record<ColorScheme, Palette> = raw.color;
export const space = raw.space;
export const radius = raw.radius;
export const size = raw.size;
export const duration = raw.motion.duration;
export const spring = raw.motion.spring;

const bez = (k: keyof typeof raw.motion.easing) => {
  const [a, b, c, d] = raw.motion.easing[k];
  return Easing.bezier(a, b, c, d);
};
export const easing = {
  standard: bez('standard'),
  enter: bez('enter'),
  exit: bez('exit'),
  iris: bez('iris'),
  heartbeat: bez('heartbeat'),
};

const familyFor = (ref: string) => {
  const [group, weight] = ref.split('.') as ['display' | 'ui', string];
  return (raw.font[group] as Record<string, string>)[weight];
};

export const type = Object.fromEntries(
  Object.entries(raw.type).map(([k, v]) => [
    k,
    { fontFamily: familyFor(v.family), fontSize: v.size, lineHeight: v.lineHeight, letterSpacing: v.letterSpacing },
  ]),
) as Record<TypeVariant, { fontFamily: string; fontSize: number; lineHeight: number; letterSpacing: number }>;

export const chatterColors = raw.chatter as (ChatterColor & { glyph: Glyph })[];
export const chatterColor = (id: string) => chatterColors.find((c) => c.id === id) ?? chatterColors[0];

export { ThemeProvider, useTheme } from './ThemeProvider';
