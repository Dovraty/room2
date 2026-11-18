import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'back' | 'close' | 'bell' | 'bellOn' | 'eye' | 'eyeOff' | 'chat' | 'crowd' | 'mic' | 'micOff' | 'play' | 'pause'
  | 'flame' | 'heart' | 'gasp' | 'laugh' | 'share' | 'more' | 'send' | 'plus' | 'check' | 'chevronRight' | 'chevronDown'
  | 'grid' | 'sparkle' | 'clock' | 'sun' | 'moon' | 'captions' | 'reply' | 'pin' | 'lock' | 'skipBack' | 'skipForward'
  | 'poll' | 'star' | 'stage' | 'search' | 'phone' | 'hash';

type Props = { name: IconName; size?: number; color: string; strokeWidth?: number };

export function Icon({ name, size = 24, color, strokeWidth = 1.8 }: Props) {
  const s = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const f = { fill: color };
  const body = (() => {
    switch (name) {
      case 'back': return <Path d="M15 5l-7 7 7 7" {...s} />;
      case 'close': return <Path d="M6 6l12 12M18 6L6 18" {...s} />;
      case 'bell': return <><Path d="M6 16v-5a6 6 0 1112 0v5l1.5 2h-15L6 16z" {...s} /><Path d="M10 20.5a2 2 0 004 0" {...s} /></>;
      case 'bellOn': return <><Path d="M6 16v-5a6 6 0 1112 0v5l1.5 2h-15L6 16z" {...s} fill={color} /><Path d="M10 20.5a2 2 0 004 0" {...s} /><Path d="M3 7.5C3.6 5.6 4.6 4.2 6 3M21 7.5c-.6-1.9-1.6-3.3-3-4.5" {...s} /></>;
      case 'eye': return <><Path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" {...s} /><Circle cx={12} cy={12} r={3} {...s} /></>;
      case 'eyeOff': return <><Path d="M2 12s3.6-7 10-7c2 0 3.8.7 5.2 1.6M22 12s-3.6 7-10 7c-2 0-3.8-.7-5.2-1.6" {...s} /><Path d="M4 20L20 4" {...s} /></>;
      case 'chat': return <Path d="M4 5h13a2 2 0 012 2v7a2 2 0 01-2 2H10l-4.5 3.5V16H4a2 2 0 01-2-2V7a2 2 0 012-2z" {...s} />;
      case 'crowd': return <><Circle cx={8} cy={8.5} r={2.8} {...s} /><Circle cx={16.5} cy={8.5} r={2.8} {...s} /><Path d="M2.5 19c.4-3 2.7-5 5.5-5s5 2 5.5 5M13.4 14.4c.9-.3 1.9-.4 3.1-.4 2.8 0 5 2 5.5 5" {...s} /></>;
      case 'mic': return <><Rect x={9} y={3} width={6} height={11} rx={3} {...s} /><Path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" {...s} /></>;
      case 'micOff': return <><Rect x={9} y={3} width={6} height={11} rx={3} {...s} /><Path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21M4 20L20 4" {...s} /></>;
      case 'play': return <Path d="M7.5 4.8v14.4a.8.8 0 001.2.7l11.6-7.2a.8.8 0 000-1.4L8.7 4.1a.8.8 0 00-1.2.7z" {...f} />;
      case 'pause': return <><Rect x={6} y={4.5} width={4} height={15} rx={1.2} {...f} /><Rect x={14} y={4.5} width={4} height={15} rx={1.2} {...f} /></>;
      case 'flame': return <Path d="M12 2.8c1.2 3.2 5.6 5.4 5.6 10.6a5.6 5.6 0 01-11.2 0c0-2.3 1.1-3.9 2.3-5 0 2.1 1 3.3 2.2 3.3.1-3.2-1.1-5.4 1.1-8.9z" {...s} />;
      case 'heart': return <Path d="M12 20s-7.5-4.4-7.5-10.1A4.3 4.3 0 0112 7.3a4.3 4.3 0 017.5 2.6C19.5 15.6 12 20 12 20z" {...s} />;
      case 'gasp': return <><Circle cx={12} cy={12} r={9} {...s} /><Circle cx={12} cy={15.2} r={2.2} {...s} /><Path d="M8.6 9.4h.01M15.4 9.4h.01" {...s} strokeWidth={strokeWidth * 1.6} /></>;
      case 'laugh': return <><Circle cx={12} cy={12} r={9} {...s} /><Path d="M7.6 13.2a4.6 4.6 0 008.8 0z" {...s} /><Path d="M8 9.6l1.6-.9M16 9.6l-1.6-.9" {...s} /></>;
      case 'share': return <><Path d="M12 3.5v11M7.5 8l4.5-4.5L16.5 8" {...s} /><Path d="M5 12.5V19a1.5 1.5 0 001.5 1.5h11A1.5 1.5 0 0019 19v-6.5" {...s} /></>;
      case 'more': return <><Circle cx={5.5} cy={12} r={1.6} {...f} /><Circle cx={12} cy={12} r={1.6} {...f} /><Circle cx={18.5} cy={12} r={1.6} {...f} /></>;
      case 'send': return <Path d="M4 11.6L20 4l-6.4 16-2.6-6.8L4 11.6z" {...s} />;
      case 'plus': return <Path d="M12 5v14M5 12h14" {...s} />;
      case 'check': return <Path d="M5 12.5l4.5 4.5L19 7.5" {...s} />;
      case 'chevronRight': return <Path d="M9 5l7 7-7 7" {...s} />;
      case 'chevronDown': return <Path d="M5 9l7 7 7-7" {...s} />;
      case 'grid': return <><Rect x={3.5} y={3.5} width={7} height={7} rx={2} {...s} /><Rect x={13.5} y={3.5} width={7} height={7} rx={2} {...s} /><Rect x={3.5} y={13.5} width={7} height={7} rx={2} {...s} /><Circle cx={17} cy={17} r={3.5} {...s} /></>;
      case 'sparkle': return <Path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" {...s} />;
      case 'clock': return <><Circle cx={12} cy={12} r={9} {...s} /><Path d="M12 7v5l3 2" {...s} /></>;
      case 'sun': return <><Circle cx={12} cy={12} r={4} {...s} /><Path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" {...s} /></>;
      case 'moon': return <Path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" {...s} />;
      case 'captions': return <><Rect x={2.5} y={5} width={19} height={14} rx={3} {...s} /><Path d="M10 10.2a2.4 2.4 0 100 3.6M17 10.2a2.4 2.4 0 100 3.6" {...s} /></>;
      case 'reply': return <Path d="M9.5 6L4 11.5 9.5 17M4.5 11.5H14a6 6 0 016 6V19" {...s} />;
      case 'pin': return <Path d="M9 3.5h6l-1 5 3.5 3.5h-11L10 8.5l-1-5zM12 12v8.5" {...s} />;
      case 'lock': return <><Rect x={4.5} y={10.5} width={15} height={10} rx={2.5} {...s} /><Path d="M8 10.5V8a4 4 0 018 0v2.5" {...s} /></>;
      case 'skipBack': return <><Path d="M4 12a8 8 0 108-8H8.5" {...s} /><Path d="M10.5 1.5L8 4l2.5 2.5" {...s} /></>;
      case 'skipForward': return <><Path d="M20 12a8 8 0 11-8-8h3.5" {...s} /><Path d="M13.5 1.5L16 4l-2.5 2.5" {...s} /></>;
      case 'poll': return <><Rect x={3.5} y={4} width={17} height={4} rx={2} {...s} /><Rect x={3.5} y={10} width={11} height={4} rx={2} {...s} /><Rect x={3.5} y={16} width={7} height={4} rx={2} {...s} /></>;
      case 'star': return <Path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5z" {...s} />;
      case 'stage': return <><Path d="M3 20h18M5 20V9M19 20V9" {...s} /><Path d="M3 9c2 0 3.5-1.5 4.5-4h9c1 2.5 2.5 4 4.5 4" {...s} /><Path d="M9.5 20v-4.5a2.5 2.5 0 015 0V20" {...s} /></>;
      case 'search': return <><Circle cx={11} cy={11} r={6.5} {...s} /><Path d="M16 16l4.5 4.5" {...s} /></>;
      case 'phone': return <Rect x={6.5} y={2.5} width={11} height={19} rx={2.5} {...s} />;
      case 'hash': return <Path d="M9 4L7.5 20M16.5 4L15 20M4.5 9h16M3.5 15h16" {...s} />;
    }
  })();
  return (
    <View pointerEvents="none" style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
        {body}
      </Svg>
    </View>
  );
}
