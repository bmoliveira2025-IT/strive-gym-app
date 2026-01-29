import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSavedWorkouts } from '../../context/SavedWorkoutsContext';

export function TopExercises() {
    const router = useRouter();
    const { savedWorkouts } = useSavedWorkouts();

    // Count exercise frequency across all workouts
    const exerciseCount: { [key: string]: { exercise: any, count: number } } = {};

    savedWorkouts.forEach(workout => {
        workout.exercises.forEach(ex => {
            if (exerciseCount[ex.id]) {
                exerciseCount[ex.id].count++;
            } else {
                exerciseCount[ex.id] = { exercise: ex, count: 1 };
            }
        });
    });

    // Sort by count and take top 5
    const topExercises = Object.values(exerciseCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    if (topExercises.length === 0) {
        return null; // Don't render if no exercises
    }

    return (
        <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white text-sm font-bold">Exercícios Favoritos</Text>
                <TouchableOpacity onPress={() => router.push('/workout?tab=library')}>
                    <Text className="text-text-dim text-xs">Ver todos</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-row">
                {topExercises.map((item, index) => (
                    <TouchableOpacity
                        key={item.exercise.id}
                        activeOpacity={0.8}
                        onPress={() => router.push(`/exercise/${item.exercise.id}`)}
                        className="mr-3"
                        style={{ width: 64 }}
                    >
                        <View className="bg-surface rounded-lg p-1.5 border border-surfaceHighlight/30 items-center mb-1">
                            {item.exercise.image_url ? (
                                <Image
                                    source={{ uri: item.exercise.image_url }}
                                    className="w-12 h-12 rounded"
                                    resizeMode="contain"
                                />
                            ) : (
                                <View className="w-12 h-12 rounded bg-surfaceHighlight items-center justify-center">
                                    <Ionicons name="barbell" size={20} color="#64748B" />
                                </View>
                            )}
                        </View>
                        <Text className="text-text-muted text-[10px] text-center" numberOfLines={2}>
                            {item.exercise.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
