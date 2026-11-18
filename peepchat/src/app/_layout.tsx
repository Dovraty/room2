import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, ThemeProvider as NavThemeProvider, DarkTheme, DefaultTheme, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SystemUI from 'expo-system-ui';
import { useFonts, Fraunces_600SemiBold, Fraunces_700Bold, Fraunces_900Black, Fraunces_600SemiBold_Italic } from '@expo-google-fonts/fraunces';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { ThemeProvider, useTheme } from '@/theme';
import { DevicePreview } from '@/components/DevicePreview';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Shell() {
  const { c, scheme } = useTheme();
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.house).catch(() => {});
  }, [c.house]);
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = { ...base, colors: { ...base.colors, background: c.house, card: c.house, text: c.textPrimary, border: c.stageLine, primary: c.spotlight } };
  return (
    <NavThemeProvider value={navTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.house }, animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'default' }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        {/* The aperture transition is drawn by the live screens themselves, so the stack only cross-fades. */}
        <Stack.Screen name="live/[id]" options={{ animation: 'fade', animationDuration: 160, gestureEnabled: true, fullScreenGestureEnabled: true }} />
        <Stack.Screen name="audio/[id]" options={{ animation: 'fade', animationDuration: 160, gestureEnabled: true, fullScreenGestureEnabled: true }} />
        <Stack.Screen name="replay/[id]" />
        <Stack.Screen name="chatter/[id]" />
        <Stack.Screen name="studio-live" options={{ animation: 'fade', animationDuration: 160 }} />
      </Stack>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fraunces_600SemiBold, Fraunces_700Bold, Fraunces_900Black, Fraunces_600SemiBold_Italic,
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
  });
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <DevicePreview>
          <Shell />
        </DevicePreview>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
