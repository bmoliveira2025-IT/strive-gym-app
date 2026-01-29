import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { TrainingObjective } from '../../context/UserProfileContext';

interface ObjectiveCardProps {
    currentObjective?: TrainingObjective;
    onPress: () => void;
}

const objectiveData: Record<TrainingObjective, {
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
}> = {
    'hipertrofia': {
        label: 'Hipertrofia',
        description: 'Ganho de massa muscular',
        icon: 'fitness',
        color: '#4F8FF7',
        bgColor: 'rgba(79, 143, 247, 0.1)',
    },
    'força': {
        label: 'Força',
        description: 'Aumento de força máxima',
        icon: 'barbell',
        color: '#EF4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
    },
    'cutting': {
        label: 'Definição',
        description: 'Perda de gordura',
        icon: 'flame',
        color: '#22C55E',
        bgColor: 'rgba(34, 197, 94, 0.1)',
    },
};

export function ObjectiveCard({ currentObjective, onPress }: ObjectiveCardProps) {
    const { theme } = useTheme();
    const objective = currentObjective ? objectiveData[currentObjective] : null;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }}
            className="rounded-2xl p-5 border"
            activeOpacity={0.7}
        >
            <View className="flex-row items-center justify-between mb-3">
                <Text style={{ color: theme.colors.textMuted }} className="text-xs font-medium uppercase tracking-wider">Objetivo</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </View>

            {objective ? (
                <View className="flex-row items-center">
                    <View
                        className="p-3 rounded-full mr-3"
                        style={{ backgroundColor: objective.bgColor }}
                    >
                        <Ionicons name={objective.icon} size={24} color={objective.color} />
                    </View>
                    <View className="flex-1">
                        <Text style={{ color: theme.colors.text }} className="text-lg font-bold">{objective.label}</Text>
                        <Text style={{ color: theme.colors.textMuted }} className="text-sm mt-0.5">{objective.description}</Text>
                    </View>
                </View>
            ) : (
                <View className="flex-row items-center">
                    <View style={{ backgroundColor: theme.colors.backgroundTertiary }} className="p-3 rounded-full mr-3">
                        <Ionicons name="help" size={24} color={theme.colors.textMuted} />
                    </View>
                    <View className="flex-1">
                        <Text style={{ color: theme.colors.textMuted }} className="text-base">Defina seu objetivo</Text>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
}
