import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSavedWorkouts } from '../../context/SavedWorkoutsContext';

export function RecentWorkouts() {
    const router = useRouter();
    const { savedWorkouts } = useSavedWorkouts();

    // Get workouts sorted by last done
    const recentWorkouts = [...savedWorkouts]
        .filter(w => w.lastDone)
        .sort((a, b) => new Date(b.lastDone!).getTime() - new Date(a.lastDone!).getTime())
        .slice(0, 3);

    if (recentWorkouts.length === 0) {
        return null;
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Hoje';
        if (days === 1) return 'Ontem';
        if (days < 7) return `${days} dias atrás`;
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    return (
        <View className="mb-4">
            <Text className="text-white text-sm font-bold mb-2">Histórico Recente</Text>

            {recentWorkouts.map((workout, index) => (
                <TouchableOpacity
                    key={workout.id}
                    activeOpacity={0.8}
                    onPress={() => router.push({ pathname: '/workout', params: { loadWorkoutId: workout.id, preview: 'true' } })}
                    className="bg-surface rounded-lg p-3 border border-surfaceHighlight/30 mb-2 flex-row items-center"
                >
                    <View className="bg-primary/10 w-9 h-9 rounded items-center justify-center mr-3">
                        <Ionicons name="fitness" size={18} color="#4F8FF7" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-text text-sm font-medium" numberOfLines={1}>{workout.name}</Text>
                        <Text className="text-text-dim text-[10px]">
                            {workout.exercises.length} exercícios • {formatDate(workout.lastDone!)}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#64748B" />
                </TouchableOpacity>
            ))}
        </View>
    );
}
