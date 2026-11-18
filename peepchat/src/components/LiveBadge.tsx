import React from 'react';
import { View } from 'react-native';
import { radius, space, useTheme } from '@/theme';
import { Text } from './Text';
import { Heartbeat } from './Pulse';
import { Icon } from './Icon';

type Kind = 'live' | 'upcoming' | 'ended' | 'replay' | 'audio';

/** Status badge. LIVE = tally-light red with a heartbeat dot; others are quiet. Always text + shape, never colour alone. */
export function LiveBadge({ kind = 'live', label, compact }: { kind?: Kind; label?: string; compact?: boolean }) {
  const { c } = useTheme();
  if (kind === 'live') {
    return (
      <View
        accessible
        accessibilityLabel="Live"
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.live, paddingHorizontal: compact ? 7 : 9, height: compact ? 20 : 24, borderRadius: radius.pill }}
      >
        <Heartbeat style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.onLive }} />
        <Text variant="overline" tone="onLive" style={{ letterSpacing: 1.2 }}>{label ?? 'Live'}</Text>
      </View>
    );
  }
  const icon = kind === 'upcoming' ? 'clock' : kind === 'audio' ? 'mic' : kind === 'replay' ? 'play' : 'check';
  return (
    <View
      accessible
      accessibilityLabel={label ?? kind}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: space.sm, height: compact ? 20 : 24, borderRadius: radius.pill, borderWidth: 1, borderColor: c.stageLine, backgroundColor: c.stageRaised }}
    >
      <Icon name={icon} size={12} color={c.textSecondary} strokeWidth={2.2} />
      <Text variant="overline" tone="textSecondary" style={{ letterSpacing: 1 }}>{label ?? kind}</Text>
    </View>
  );
}
