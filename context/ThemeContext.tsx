import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const THEME_STORAGE_KEY = '@app_theme';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
    // Backgrounds
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    card: string;
    cardBorder: string;

    // Text
    text: string;
    textSecondary: string;
    textMuted: string;

    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;

    // Status colors
    success: string;
    error: string;
    warning: string;

    // UI elements
    border: string;
    divider: string;
    overlay: string;
    shadow: string;

    // Tab bar
    tabBarBackground: string;
    tabBarBorder: string;
    tabBarActive: string;
    tabBarInactive: string;
}

export interface Theme {
    mode: ThemeMode;
    colors: ThemeColors;
}

// Light theme - Clean & Professional
const lightTheme: ThemeColors = {
    // Backgrounds - Tudo branco, cards diferenciados apenas por bordas
    background: '#FFFFFF',         // Branco puro
    backgroundSecondary: '#FFFFFF', // Branco puro
    backgroundTertiary: '#F9FAFB',  // Cinza muito claro apenas para elementos internos
    card: '#FFFFFF',                // Cards mesma cor do fundo (branco)
    cardBorder: '#D1D5DB',          // Borda escura para diferenciar cards

    // Text - Cores otimizadas para máximo contraste e legibilidade
    text: '#0F172A',           // Preto intenso (slate-900)
    textSecondary: '#334155',  // Cinza muito escuro (slate-700)
    textMuted: '#64748B',      // Cinza escuro legível (slate-500)

    // Primary - Blue accent
    primary: '#4F8FF7',
    primaryLight: '#7BA9F9',
    primaryDark: '#3A75DB',

    // Status colors
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',

    // UI elements
    border: '#E5E7EB',
    divider: '#E5E7EB',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.08)',  // Sombra mais visível para cards

    // Tab bar
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E9ECEF',
    tabBarActive: '#4F8FF7',
    tabBarInactive: '#868E96',
};

// Dark theme - Current style
const darkTheme: ThemeColors = {
    // Backgrounds
    background: '#000000',
    backgroundSecondary: '#0D0D0D',
    backgroundTertiary: '#1A1A1A',
    card: 'rgba(39, 39, 42, 0.5)',
    cardBorder: '#27272A',

    // Text
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',

    // Primary
    primary: '#4F8FF7',
    primaryLight: '#7BA9F9',
    primaryDark: '#3A75DB',

    // Status colors
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',

    // UI elements
    border: '#27272A',
    divider: '#27272A',
    overlay: 'rgba(0, 0, 0, 0.8)',
    shadow: 'rgba(0, 0, 0, 0.5)',

    // Tab bar
    tabBarBackground: 'rgba(13, 13, 13, 0.95)',
    tabBarBorder: 'rgba(28, 28, 28, 0.6)',
    tabBarActive: '#4F8FF7',
    tabBarInactive: '#64748B',
};

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState<ThemeMode>('light'); // Default to light
    const [isLoading, setIsLoading] = useState(true);

    // Load saved theme preference
    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme) {
                setThemeMode(savedTheme as ThemeMode);
            } else {
                // Default to light theme (user preference: "visual limpo e claro")
                const defaultTheme: ThemeMode = 'light';
                setThemeMode(defaultTheme);
                await AsyncStorage.setItem(THEME_STORAGE_KEY, defaultTheme);
            }
        } catch (error) {
            console.error('Failed to load theme', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setTheme = async (mode: ThemeMode) => {
        try {
            setThemeMode(mode);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (error) {
            console.error('Failed to save theme', error);
        }
    };

    const toggleTheme = async () => {
        const newMode = themeMode === 'light' ? 'dark' : 'light';
        await setTheme(newMode);
    };

    const theme: Theme = {
        mode: themeMode,
        colors: themeMode === 'light' ? lightTheme : darkTheme,
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
