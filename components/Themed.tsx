import { View, Text, ViewProps, TextProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// ThemedView - wrapper auto que aplica background do tema
export function ThemedView({ style, children, ...props }: ViewProps) {
    const { theme } = useTheme();
    return (
        <View style={[{ backgroundColor: theme.colors.background }, style]} {...props}>
            {children}
        </View>
    );
}

// ThemedText - wrapper que aplica cor de texto do tema
export function ThemedText({ style, children, variant = 'default', ...props }: TextProps & { variant?: 'default' | 'secondary' | 'muted' }) {
    const { theme } = useTheme();

    const color = variant === 'secondary'
        ? theme.colors.textSecondary
        : variant === 'muted'
            ? theme.colors.textMuted
            : theme.colors.text;

    return (
        <Text style={[{ color }, style]} {...props}>
            {children}
        </Text>
    );
}

// ThemedCard - wrapper para cards com theme
export function ThemedCard({ style, children, ...props }: ViewProps) {
    const { theme } = useTheme();
    return (
        <View
            style={[
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.cardBorder
                },
                style
            ]}
            {...props}
        >
            {children}
        </View>
    );
}
