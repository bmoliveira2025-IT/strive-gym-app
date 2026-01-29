import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSavedWorkouts } from '../../context/SavedWorkoutsContext';

export function StatsRow() {
    const { savedWorkouts } = useSavedWorkouts();

    // Calculate stats
    const totalWorkouts = savedWorkouts.length;
    const thisWeek = savedWorkouts.filter(w => {
        if (!w.lastDone) return false;
        const lastDone = new Date(w.lastDone);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return lastDone >= weekAgo;
    }).length;
    const streak = Math.min(totalWorkouts, 7);

    const stats = [
        { icon: 'barbell', value: totalWorkouts.toString(), label: 'Treinos', color: '#4F8FF7' },
        { icon: 'calendar', value: thisWeek.toString(), label: 'Semana', color: '#10B981' },
        { icon: 'flame', value: streak.toString(), label: 'Dias', color: '#F59E0B' },
    ];

    return (
        <View className="flex-row justify-between mb-4">
            {stats.map((stat, index) => (
                <View
                    key={index}
                    className="flex-1 bg-surface rounded-lg py-3 px-2 mx-1 border border-surfaceHighlight/30 items-center"
                >
                    <View className="flex-row items-center">
                        <Ionicons name={stat.icon as any} size={14} color={stat.color} />
                        <Text className="text-white text-lg font-bold ml-1.5">{stat.value}</Text>
                    </View>
                    <Text className="text-text-dim text-[10px] mt-0.5 uppercase tracking-wide">{stat.label}</Text>
                </View>
            ))}
        </View>
    );
}
