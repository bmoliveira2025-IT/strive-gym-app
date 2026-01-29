import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { WorkoutHistoryRecord } from '../../context/WorkoutHistoryContext';
import { useState } from 'react';

interface TrainingHistoryListProps {
    history: WorkoutHistoryRecord[];
    onViewAll?: () => void;
    maxItems?: number;
}

export function TrainingHistoryList({ history, onViewAll, maxItems = 10 }: TrainingHistoryListProps) {
    const { theme } = useTheme();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const displayHistory = history.slice(0, maxItems);

    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoje';
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 7) return `${diffDays} dias atrás`;

        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}min`;
    };

    if (displayHistory.length === 0) {
        return (
            <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }} className="rounded-2xl p-8 border items-center">
                <Ionicons name="calendar-outline" size={48} color={theme.colors.textMuted} />
                <Text style={{ color: theme.colors.textMuted }} className="text-base mt-4 text-center">
                    Nenhum treino registrado ainda
                </Text>
                <Text style={{ color: theme.colors.textMuted }} className="text-sm mt-2 text-center">
                    Complete seu primeiro treino para ver seu histórico
                </Text>
            </View>
        );
    }

    return (
        <View>
            <View className="flex-row items-center justify-between mb-4">
                <Text style={{ color: theme.colors.textMuted }} className="text-xs uppercase tracking-widest font-bold">
                    Histórico de Treinos
                </Text>
                {onViewAll && history.length > maxItems && (
                    <TouchableOpacity onPress={onViewAll}>
                        <Text style={{ color: theme.colors.primary }} className="text-sm">Ver todos</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }} className="rounded-2xl border overflow-hidden">
                {displayHistory.map((record, index) => {
                    const isExpanded = expandedId === record.id;
                    const isLast = index === displayHistory.length - 1;

                    return (
                        <View key={record.id}>
                            <TouchableOpacity
                                onPress={() => setExpandedId(isExpanded ? null : record.id)}
                                style={!isLast ? { borderBottomColor: theme.colors.cardBorder, borderBottomWidth: 1 } : {}}
                                className="p-4"
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text style={{ color: theme.colors.text }} className="text-base font-bold flex-1" numberOfLines={1}>
                                        {record.workoutName}
                                    </Text>
                                    <Ionicons
                                        name={isExpanded ? "chevron-up" : "chevron-down"}
                                        size={18}
                                        color={theme.colors.textMuted}
                                    />
                                </View>

                                <View className="flex-row items-center gap-4">
                                    <View className="flex-row items-center">
                                        <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
                                        <Text style={{ color: theme.colors.textMuted }} className="text-xs ml-1">
                                            {formatDate(record.date)}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
                                        <Text style={{ color: theme.colors.textMuted }} className="text-xs ml-1">
                                            {formatDuration(record.duration)}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Ionicons name="barbell-outline" size={14} color={theme.colors.textMuted} />
                                        <Text style={{ color: theme.colors.textMuted }} className="text-xs ml-1">
                                            {record.totalVolume.toFixed(0)}kg
                                        </Text>
                                    </View>
                                </View>

                                {isExpanded && (
                                    <View style={{ borderTopColor: theme.colors.cardBorder }} className="mt-3 pt-3 border-t">
                                        <Text style={{ color: theme.colors.textSecondary }} className="text-xs font-medium mb-2">
                                            Exercícios ({record.exercises.length})
                                        </Text>
                                        {record.exercises.map((ex, exIndex) => (
                                            <View
                                                key={`${ex.id}-${exIndex}`}
                                                className="flex-row items-center py-1.5"
                                            >
                                                <View style={{ backgroundColor: theme.colors.textMuted }} className="w-1.5 h-1.5 rounded-full mr-2" />
                                                <Text style={{ color: theme.colors.textSecondary }} className="text-sm flex-1" numberOfLines={1}>
                                                    {ex.name}
                                                </Text>
                                                <Text style={{ color: theme.colors.textMuted }} className="text-xs">
                                                    {ex.sets?.length || 0} séries
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
