import React from 'react';
import { View, Text, Image, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SavedWorkout } from '../context/SavedWorkoutsContext';
import { useTheme } from '../context/ThemeContext';

interface WorkoutCardProps {
    workout: SavedWorkout;
    onPress: () => void;
    onDelete?: () => void;
    onToggleFavorite?: () => void;
    layout?: 'horizontal' | 'vertical';
    showFavoriteButton?: boolean;
    showDeleteButton?: boolean;
}

export function WorkoutCard({
    workout,
    onPress,
    onDelete,
    onToggleFavorite,
    layout = 'horizontal',
    showFavoriteButton = true,
    showDeleteButton = true
}: WorkoutCardProps) {
    const { theme } = useTheme();

    const handleDelete = (e: any) => {
        e.stopPropagation();

        const confirmDelete = () => {
            if (onDelete) onDelete();
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Excluir o treino "${workout.name}"?`)) {
                confirmDelete();
            }
        } else {
            Alert.alert(
                "Excluir Treino",
                `Tem certeza que deseja excluir "${workout.name}"?`,
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Excluir", style: "destructive", onPress: confirmDelete }
                ]
            );
        }
    };

    const handleToggleFavorite = (e: any) => {
        e.stopPropagation();
        if (onToggleFavorite) onToggleFavorite();
    };

    if (layout === 'vertical') {
        return (
            <TouchableOpacity
                onPress={onPress}
                style={{
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.cardBorder
                }}
                className="w-44 rounded-2xl overflow-hidden border"
                activeOpacity={0.8}
            >
                <View className="relative">
                    {workout.exercises[0]?.image_url ? (
                        <Image
                            source={{ uri: workout.exercises[0].image_url }}
                            className="w-full h-32"
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={{ backgroundColor: theme.colors.backgroundTertiary }} className="w-full h-32 items-center justify-center">
                            <Ionicons name="barbell" size={32} color={theme.colors.primary} />
                        </View>
                    )}

                    {workout.isAIGenerated && (
                        <View className="absolute top-2 right-2 bg-primary rounded-full px-2 py-0.5 shadow-lg">
                            <Text className="text-white text-[10px] font-bold">IA</Text>
                        </View>
                    )}
                </View>

                <View className="p-3">
                    <Text style={{ color: theme.colors.text }} className="font-bold text-lg mb-0.5" numberOfLines={1}>
                        {workout.name}
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary }} className="text-sm mb-2">
                        {workout.category || 'Semanal'}
                    </Text>

                    <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={12} color={theme.colors.textMuted} />
                        <Text style={{ color: theme.colors.textMuted }} className="text-xs ml-1">{workout.lastDone || 'Nunca'}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    // Horizontal layout (default)
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 1,
                shadowRadius: 3,
                elevation: 2,
            }}
            className="rounded-xl p-3 mb-3 border"
            activeOpacity={0.8}
        >
            <View className="flex-row items-center">
                {workout.exercises[0]?.image_url ? (
                    <Image
                        source={{ uri: workout.exercises[0].image_url }}
                        className="w-20 h-20 rounded-lg"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-20 h-20 rounded-lg bg-surfaceHighlight items-center justify-center">
                        <Ionicons name="barbell" size={28} color="#64748B" />
                    </View>
                )}

                <View className="flex-1 ml-4 py-1">
                    <View className="flex-row items-center">
                        <Text style={{ color: theme.colors.text }} className="font-bold text-xl flex-1" numberOfLines={1}>
                            {workout.name}
                        </Text>
                        {workout.isAIGenerated && (
                            <View className="bg-primary rounded-full px-2 py-0.5 ml-2">
                                <Text className="text-white text-xs font-bold">IA</Text>
                            </View>
                        )}
                    </View>

                    <Text style={{ color: theme.colors.textMuted }} className="text-lg mt-0.5">
                        {workout.exercises.length} exercícios
                    </Text>

                    <View className="flex-row items-center mt-2">
                        <Ionicons name="time-outline" size={14} color="#64748B" />
                        <Text className="text-text-muted text-base ml-1">{workout.lastDone}</Text>
                        {workout.category && (
                            <>
                                <Text className="text-text-muted mx-1">•</Text>
                                <Text className="text-text-muted text-base">{workout.category}</Text>
                            </>
                        )}
                    </View>
                </View>

                <View className="flex-row items-center gap-2 ml-2">
                    {showFavoriteButton && onToggleFavorite && (
                        <TouchableOpacity onPress={handleToggleFavorite} className="p-2">
                            <Ionicons
                                name={workout.isFavorite ? "heart" : "heart-outline"}
                                size={20}
                                color={workout.isFavorite ? "#EF4444" : "#64748B"}
                            />
                        </TouchableOpacity>
                    )}

                    {showDeleteButton && onDelete && (
                        <TouchableOpacity onPress={handleDelete} className="p-2">
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
