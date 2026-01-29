import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSavedWorkouts } from '../../context/SavedWorkoutsContext';

export function AIInsights() {
    const router = useRouter();
    const { savedWorkouts } = useSavedWorkouts();

    // Generate insights based on workout data
    const totalWorkouts = savedWorkouts.length;
    const favoriteCount = savedWorkouts.filter(w => w.isFavorite).length;

    // Mock muscle group analysis (in real app, analyze exercises)
    const insights = [
        {
            icon: 'analytics',
            title: 'Análise de Treino',
            subtitle: totalWorkouts > 0
                ? `${totalWorkouts} treino${totalWorkouts > 1 ? 's' : ''} criado${totalWorkouts > 1 ? 's' : ''}`
                : 'Crie seu primeiro treino',
            color: '#6366F1',
        },
        {
            icon: 'flash',
            title: 'Sugestão IA',
            subtitle: totalWorkouts < 3
                ? 'Adicione mais treinos para análises'
                : 'Varie grupos musculares',
            color: '#F59E0B',
        },
    ];

    return (
        <View className="mb-4">
            <Text className="text-white text-sm font-bold mb-2">Inteligência Artificial</Text>

            <View className="flex-row gap-3">
                {insights.map((insight, index) => (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.8}
                        onPress={() => router.push('/workout')}
                        className="flex-1 bg-surface rounded-lg p-3 border border-surfaceHighlight/30 mr-2 last:mr-0"
                        style={index === insights.length - 1 ? { marginRight: 0 } : {}}
                    >
                        <View className="flex-row items-center mb-1.5">
                            <View
                                className="w-7 h-7 rounded items-center justify-center mr-2"
                                style={{ backgroundColor: `${insight.color}15` }}
                            >
                                <Ionicons name={insight.icon as any} size={14} color={insight.color} />
                            </View>
                            <Text className="text-text text-xs font-semibold flex-1" numberOfLines={1}>
                                {insight.title}
                            </Text>
                        </View>
                        <Text className="text-text-dim text-[10px]" numberOfLines={2}>
                            {insight.subtitle}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
