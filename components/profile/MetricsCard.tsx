import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface MetricsCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    unit?: string;
    onPress?: () => void;
}

export function MetricsCard({ icon, label, value, unit, onPress }: MetricsCardProps) {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }}
            className="flex-1 rounded-2xl p-4 border"
            activeOpacity={0.7}
        >
            <View className="flex-row items-center mb-3">
                <View style={{ backgroundColor: theme.colors.backgroundTertiary }} className="p-2 rounded-full mr-2">
                    <Ionicons name={icon} size={18} color={theme.colors.primary} />
                </View>
                <Text style={{ color: theme.colors.textSecondary }} className="text-xs font-medium">{label}</Text>
            </View>

            {value ? (
                <View className="flex-row items-baseline">
                    <Text style={{ color: theme.colors.text }} className="text-3xl font-bold">{value}</Text>
                    {unit && <Text style={{ color: theme.colors.textMuted }} className="text-sm ml-1">{unit}</Text>}
                </View>
            ) : (
                <Text style={{ color: theme.colors.textMuted }} className="text-base">--</Text>
            )}
        </TouchableOpacity>
    );
}
