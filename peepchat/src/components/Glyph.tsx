import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { Glyph as GlyphName } from '@/theme';

/** Shape paired with each chatter colour so identity never relies on colour alone. */
export function Glyph({ name, size = 12, color, stroke }: { name: GlyphName; size?: number; color: string; stroke?: string }) {
  const p = { fill: color, stroke: stroke ?? 'none', strokeWidth: stroke ? 1.5 : 0 };
  const shape = (() => {
    switch (name) {
      case 'circle': return <Circle cx={12} cy={12} r={8} {...p} />;
      case 'triangle': return <Path d="M12 3.5l9 16H3l9-16z" {...p} />;
      case 'square': return <Rect x={4.5} y={4.5} width={15} height={15} rx={2.5} {...p} />;
      case 'diamond': return <Path d="M12 2.5l9.5 9.5-9.5 9.5L2.5 12 12 2.5z" {...p} />;
      case 'star': return <Path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8L12 2.5z" {...p} />;
      case 'hexagon': return <Path d="M12 2.5l8.5 4.9v9.2L12 21.5l-8.5-4.9V7.4L12 2.5z" {...p} />;
      case 'plus': return <Path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z" {...p} />;
      case 'ring': return <Circle cx={12} cy={12} r={6.5} fill="none" stroke={color} strokeWidth={4} />;
    }
  })();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" pointerEvents="none">
      {shape}
    </Svg>
  );
}
