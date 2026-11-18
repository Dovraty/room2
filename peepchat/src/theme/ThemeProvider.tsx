import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { palettes, type ColorScheme, type Palette } from './index';

type Mode = 'system' | ColorScheme;
type Ctx = { scheme: ColorScheme; c: Palette; mode: Mode; setMode: (m: Mode) => void };

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<Mode>('system');
  const scheme: ColorScheme = mode === 'system' ? (system === 'light' ? 'light' : 'dark') : mode;
  const value = useMemo(() => ({ scheme, c: palettes[scheme], mode, setMode }), [scheme, mode]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
