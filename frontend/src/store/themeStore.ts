import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { themes, defaultTheme, Theme } from '../config/theme';

interface ThemeState {
  currentTheme: string;
  theme: Theme;
  setTheme: (themeName: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: defaultTheme,
      theme: themes[defaultTheme],
      setTheme: (themeName) => {
        if (themes[themeName]) {
          set({ currentTheme: themeName, theme: themes[themeName] });
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);