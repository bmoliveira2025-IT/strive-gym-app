/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Premium Palette Colors
const primary = '#3B82F6';
const background = '#020617';
const surface = '#0F172A';
const text = '#F8FAFC';
const secondaryText = '#94A3B8';
const secondary = '#475569';

export const Colors = {
  light: {
    // For now, we are prioritizing dark mode, but we can set light mode to a clean white/slate theme
    text: '#0F172A',
    background: '#FFFFFF',
    tint: primary,
    icon: '#64748B',
    tabIconDefault: '#64748B',
    tabIconSelected: primary,
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
  },
  dark: {
    text: text,
    background: background,
    tint: primary,
    icon: secondary,
    tabIconDefault: secondary,
    tabIconSelected: primary,
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
