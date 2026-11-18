import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { radius, space, useTheme } from '@/theme';
import { Text } from './Text';
import { Tap } from './Tap';
import { Iris } from './Aperture';

/** Empty state: a closed iris. Nothing to peep at… yet. */
export function EmptyState({ title, body, action, onAction }: { title: string; body: string; action?: string; onAction?: () => void }) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: space.md, paddingVertical: space.x4, paddingHorizontal: space.xxl }} accessible accessibilityLabel={`${title}. ${body}`}>
      <View style={{ width: 120, height: 120, borderRadius: 60, overflow: 'hidden', borderWidth: 6, borderColor: c.stageLine, alignItems: 'center', justifyContent: 'center', backgroundColor: c.spotlightGlow }}>
        <Iris size={120} open={0.1} color={c.stageRaised} seam={c.stageLine} twist={15} />
      </View>
      <Text variant="title1" align="center">{title}</Text>
      <Text variant="callout" tone="textSecondary" align="center">{body}</Text>
      {action && (
        <Tap onPress={onAction} accessibilityLabel={action} style={{ marginTop: space.sm, height: 44, paddingHorizontal: space.xl, borderRadius: radius.pill, borderWidth: 1.5, borderColor: c.stageLine, justifyContent: 'center' }}>
          <Text variant="headline">{action}</Text>
        </Tap>
      )}
    </View>
  );
}

export function NotFound() {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: c.house, justifyContent: 'center' }}>
      <EmptyState title="This door's closed" body="That chat doesn't exist or has been taken down." action="Back to Discover" onAction={() => router.replace('/discover')} />
    </View>
  );
}
