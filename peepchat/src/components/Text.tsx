import React from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { type, useTheme, type TypeVariant, type Palette } from '@/theme';

type Tone = keyof Pick<Palette, 'textPrimary' | 'textSecondary' | 'textTertiary' | 'spotlightInk' | 'galleryText' | 'galleryTextSecondary' | 'galleryAccent' | 'onSpotlight' | 'onLive' | 'live'>;

export type TProps = TextProps & {
  variant?: TypeVariant;
  tone?: Tone;
  color?: string;
  align?: TextStyle['textAlign'];
  upper?: boolean;
  tabular?: boolean;
};

/** Every string in the app goes through this. Font scaling stays on (Dynamic Type / Android font scale),
 * capped per-variant so display type can't explode layouts. */
export function Text({ variant = 'body', tone = 'textPrimary', color, align, upper, tabular, style, ...rest }: TProps) {
  const { c } = useTheme();
  const t = type[variant];
  const cap = variant === 'hero' || variant === 'display' ? 1.3 : variant === 'overline' || variant === 'caption' ? 1.6 : 2;
  return (
    <RNText
      allowFontScaling
      maxFontSizeMultiplier={cap}
      {...rest}
      style={[
        t,
        { color: color ?? c[tone], textAlign: align },
        upper && { textTransform: 'uppercase' },
        tabular && { fontVariant: ['tabular-nums'] },
        style,
      ]}
    />
  );
}
