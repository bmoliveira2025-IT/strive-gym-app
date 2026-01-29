import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSavedWorkouts } from '../../context/SavedWorkoutsContext';

export function HeroCard() {
    const router = useRouter();
    const { savedWorkouts } = useSavedWorkouts();

    const featuredWorkout = savedWorkouts.find(w => w.isFavorite) || savedWorkouts[0];

    if (!featuredWorkout) {
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push('/workout')}
                className="bg-gradient-to-r from-primary to-primaryDark rounded-xl p-4 mb-4 relative overflow-hidden"
            >
                <View className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/5" />
                <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                        <Text className="text-primary text-xs font-bold uppercase mb-1">Novo Treino</Text>
                        <Text className="text-white text-lg font-bold mb-1">Comece Agora</Text>
                        <Text className="text-text-muted text-xs">Crie seu primeiro plano</Text>
                    </View>
                    <View className="bg-primary w-12 h-12 rounded-xl items-center justify-center">
                        <Ionicons name="add" size={28} color="#FFFFFF" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push({ pathname: '/workout', params: { loadWorkoutId: featuredWorkout.id } })}
            className="bg-surface rounded-xl p-4 mb-4 border border-surfaceHighlight/30 relative overflow-hidden"
        >
            <View className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/5" />

            <View className="flex-row items-center mb-2">
                <View className="bg-primary/20 px-2 py-0.5 rounded-full mr-2">
                    <Text className="text-primary text-[10px] font-bold uppercase">Treino do Dia</Text>
                </View>
                <Text className="text-text-dim text-[10px]">{featuredWorkout.exercises.length} exerc.</Text>
                {featuredWorkout.isFavorite && (
                    <Ionicons name="heart" size={12} color="#EF4444" style={{ marginLeft: 6 }} />
                )}
            </View>

            <View className="flex-row items-center justify-between">
                <View className="flex-1">
                    <Text className="text-white text-lg font-bold" numberOfLines={1}>{featuredWorkout.name}</Text>
                    <Text className="text-text-dim text-xs mt-1" numberOfLines={1}>
                        {featuredWorkout.exercises.slice(0, 3).map(e => e.name).join(' • ')}
                    </Text>
                </View>
                <View className="bg-primary w-10 h-10 rounded-lg items-center justify-center ml-3">
                    <Ionicons name="play" size={20} color="#FFFFFF" />
                </View>
            </View>
        </TouchableOpacity>
    );
}
