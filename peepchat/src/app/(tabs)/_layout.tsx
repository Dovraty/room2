import React from 'react';
import { Tabs } from 'expo-router/js-tabs';
import { TabBar } from '@/components/TabBar';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const { c } = useTheme();
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.house } }}>
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="following" />
      <Tabs.Screen name="studio" />
      <Tabs.Screen name="system" />
    </Tabs>
  );
}
