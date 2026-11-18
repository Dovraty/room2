import React from 'react';
import { View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { previewDevice } from '@/lib/platform';
import { useTheme } from '@/theme';
import { Text } from './Text';

/**
 * Web-only review aid: simulates iPhone 15 / Pixel-class safe areas, status bar and system nav
 * so browser screenshots read like the device. Does nothing on iOS/Android builds.
 */
export function DevicePreview({ children }: { children: React.ReactNode }) {
  const { c, scheme } = useTheme();
  if (!previewDevice) return <>{children}</>;
  const ios = previewDevice === 'ios';
  const insets = ios ? { top: 59, bottom: 34, left: 0, right: 0 } : { top: 36, bottom: 24, left: 0, right: 0 };
  const fg = scheme === 'dark' ? '#FFFFFF' : '#000000';
  return (
    <SafeAreaInsetsContext.Provider value={insets}>
      <View style={{ flex: 1 }}>
        {children}
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: ios ? 34 : 20, paddingTop: ios ? 6 : 0, zIndex: 999 }}>
          <Text variant="headline" color={fg} style={{ fontSize: ios ? 17 : 14, fontFamily: 'Inter_600SemiBold' }} maxFontSizeMultiplier={1}>{ios ? '9:41' : '9:41'}</Text>
          {ios && <View style={{ position: 'absolute', left: '50%', marginLeft: -62, top: 11, width: 124, height: 36, borderRadius: 18, backgroundColor: '#000' }} />}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5 }}>
            {[6, 9, 12, 15].map((h) => <View key={h} style={{ width: 3.5, height: h * (ios ? 0.8 : 0.7), borderRadius: 1, backgroundColor: fg }} />)}
            <View style={{ marginLeft: 6, width: ios ? 25 : 18, height: ios ? 12 : 11, borderRadius: 3, borderWidth: 1.2, borderColor: fg, padding: 1.5 }}>
              <View style={{ flex: 1, width: '78%', borderRadius: 1, backgroundColor: fg }} />
            </View>
          </View>
        </View>
        <View pointerEvents="none" style={{ position: 'absolute', bottom: ios ? 8 : 9, left: '50%', marginLeft: ios ? -67 : -54, width: ios ? 134 : 108, height: ios ? 5 : 4, borderRadius: 3, backgroundColor: fg, opacity: 0.9, zIndex: 999 }} />
        <View pointerEvents="none" style={{ position: 'absolute', inset: 0, borderWidth: 0, borderColor: c.house }} />
      </View>
    </SafeAreaInsetsContext.Provider>
  );
}
