import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Modal, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useWorkoutHistory, WorkoutHistoryRecord } from '../context/WorkoutHistoryContext';
import { useTheme } from '../context/ThemeContext';
import { useUserProfile } from '../context/UserProfileContext';

const screenWidth = Dimensions.get('window').width;

const RANGE_LABELS = {
    'W': 'Semana',
    'M': 'Mês',
    'T': 'Total'
};

export default function ProgressScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { history } = useWorkoutHistory();
    const { profile, updateProfile } = useUserProfile();
    const [selectedRange, setSelectedRange] = useState<'W' | 'M' | 'T'>('M');
    const [showWeightModal, setShowWeightModal] = useState(false);
    const [showAllEvolution, setShowAllEvolution] = useState(false);
    const [newWeight, setNewWeight] = useState(profile?.weight?.toString() || '');

    // Calculate Summary Stats based on range
    const summaryStats = useMemo(() => {
        const now = new Date();
        let start = new Date();

        if (selectedRange === 'W') {
            start.setDate(now.getDate() - 7);
        } else if (selectedRange === 'M') {
            start.setMonth(now.getMonth() - 1);
        } else {
            start = new Date(0); // All time
        }
        start.setHours(0, 0, 0, 0);

        const filtered = history.filter(h => new Date(h.date) >= start);

        const totalWorkouts = filtered.length;
        const totalDurationRaw = filtered.reduce((acc, curr) => acc + (curr.duration || 0), 0);

        const formatDuration = (seconds: number) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            return h > 0 ? `${h}h ${m}m` : `${m}m`;
        };

        // Average frequency (times per week)
        let frequency = 0;
        if (selectedRange === 'M') {
            frequency = totalWorkouts / 4.3; // Approx weeks in month
        } else if (selectedRange === 'T' && history.length > 0) {
            const oldest = new Date(history[history.length - 1].date);
            const weeks = Math.max(1, (now.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24 * 7));
            frequency = totalWorkouts / weeks;
        } else {
            frequency = totalWorkouts; // Just the count if weekly
        }

        return {
            count: totalWorkouts,
            duration: formatDuration(totalDurationRaw),
            frequency: frequency.toFixed(1),
            label: selectedRange === 'W' ? 'Semana' : selectedRange === 'M' ? 'Mês' : 'Total'
        };
    }, [history, selectedRange]);

    // Calculate Load Evolution for top exercises
    const loadEvolution = useMemo(() => {
        // Find exercises that appear multiple times in history
        const exerciseHistory: Record<string, number[]> = {};

        // Reverse history to process oldest to newest
        [...history].reverse().forEach(workout => {
            workout.exercises.forEach(ex => {
                const maxWeight = Math.max(...ex.sets.map(s => s.kg));
                if (!exerciseHistory[ex.name]) exerciseHistory[ex.name] = [];
                exerciseHistory[ex.name].push(maxWeight);
            });
        });

        const evolution = Object.entries(exerciseHistory)
            .map(([name, weights]) => {
                if (weights.length < 2) return null;
                const latest = weights[weights.length - 1];
                const previous = weights[weights.length - 2];
                const diff = latest - previous;

                return {
                    name,
                    latest,
                    previous,
                    diff,
                    isUp: diff > 0
                };
            })
            .filter(e => e !== null)
            .sort((a, b) => (b?.latest || 0) - (a?.latest || 0)); // Show heaviest first

        return evolution;
    }, [history]);

    // Calculate Consistency (Streak & Monthly Presence)
    const consistency = useMemo(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const activeDaysThisMonth = new Set(
            history
                .filter(h => new Date(h.date) >= startOfMonth)
                .map(h => new Date(h.date).toISOString().split('T')[0])
        ).size;

        const totalDaysInMonth = today.getDate(); // Current progress through month

        // Streak logic (simplified)
        // Note: For full accuracy we should use the same logic as streak.tsx
        // but for progress view we just need the number. 
        // Assuming streak logic is already in history context if complex, 
        // or just calculate briefly here.

        return {
            currentMonthCount: activeDaysThisMonth,
            totalDaysElapsed: totalDaysInMonth,
            percentage: Math.round((activeDaysThisMonth / 30) * 100) // Of a full month
        }
    }, [history]);

    // Calculate Weight Trend
    const weightTrend = useMemo(() => {
        if (!profile?.weightHistory || profile.weightHistory.length < 2) return null;

        const historySorted = [...profile.weightHistory].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const latest = historySorted[0].value;
        const previous = historySorted[1].value;
        const diff = latest - previous;

        return {
            diff: Math.abs(diff).toFixed(1),
            isDown: diff < 0
        };
    }, [profile?.weightHistory]);

    const handleUpdateWeight = async () => {
        const weightNum = parseFloat(newWeight);
        if (!isNaN(weightNum)) {
            await updateProfile({ weight: weightNum });
            setShowWeightModal(false);
        }
    };

    // Calculate Intelligent Highlights
    const highlights = useMemo(() => {
        const list: { title: string, message: string, icon: string }[] = [];

        // 1. Weight Evolution Highlight
        const lastWorkout = history[0];
        if (lastWorkout) {
            const increasedExercises = lastWorkout.exercises.filter(ex => {
                const maxCurrent = Math.max(...ex.sets.map(s => s.kg));
                let maxPrev = 0;
                for (let i = 1; i < history.length; i++) {
                    const prevEx = history[i].exercises.find(e => e.name === ex.name);
                    if (prevEx) {
                        maxPrev = Math.max(...prevEx.sets.map(s => s.kg));
                        break;
                    }
                }
                return maxCurrent > maxPrev && maxPrev > 0;
            });

            if (increasedExercises.length > 0) {
                list.push({
                    title: 'Resumo da Vitória 🏆',
                    message: `Você aumentou carga em ${increasedExercises.length} exercícios no último treino. Sua força está explodindo! 🔥`,
                    icon: 'sparkles'
                });
            }
        }

        // 2. Consistency Highlight
        if (summaryStats.count >= 4 && selectedRange === 'W') {
            list.push({
                title: 'Máquina de Treino 🦾',
                message: `Você já treinou ${summaryStats.count} vezes esta semana. Mantenha o ritmo!`,
                icon: 'flash-outline'
            });
        }

        // Default if empty
        if (list.length === 0) {
            list.push({
                title: 'Foco no Objetivo 🎯',
                message: 'A consistência é o que traz resultados. Continue firme no seu plano!',
                icon: 'rocket-outline'
            });
        }

        return list;
    }, [history, summaryStats, selectedRange]);

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />

            {/* Header */}
            <View style={{ backgroundColor: theme.colors.background }} className="flex-row items-center justify-between px-6 pt-14 pb-4">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-6">
                        <Ionicons name="arrow-back" size={26} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={{ color: theme.colors.text }} className="text-xl font-bold">Progresso</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="share-outline" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Quick Filters */}
                <View className="px-6 py-4">
                    <View style={{ backgroundColor: theme.colors.card }} className="flex-row rounded-full p-1 self-start">
                        {(['W', 'M', 'T'] as const).map((r) => (
                            <TouchableOpacity
                                key={r}
                                onPress={() => setSelectedRange(r)}
                                style={{
                                    backgroundColor: selectedRange === r ? theme.colors.text : 'transparent',
                                    paddingHorizontal: 20
                                }}
                                className="py-2 rounded-full"
                            >
                                <Text
                                    style={{
                                        color: selectedRange === r ? theme.colors.background : theme.colors.textMuted
                                    }}
                                    className="text-xs font-bold"
                                >
                                    {RANGE_LABELS[r]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 📊 Quick Summary Header */}
                <View className="px-6 mt-2 mb-8">
                    <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="rounded-3xl p-6 border flex-row justify-between shadow-sm">
                        <View className="items-center">
                            <Text style={{ color: theme.colors.textMuted }} className="text-[10px] font-bold uppercase tracking-widest mb-2">📅 {summaryStats.label}</Text>
                            <Text style={{ color: theme.colors.text }} className="text-2xl font-black">{summaryStats.count}</Text>
                            <Text style={{ color: theme.colors.textMuted }} className="text-[10px] uppercase font-bold mt-1">treinos</Text>
                        </View>
                        <View style={{ width: 1, backgroundColor: theme.colors.border }} className="h-full" />
                        <View className="items-center">
                            <Text style={{ color: theme.colors.textMuted }} className="text-[10px] font-bold uppercase tracking-widest mb-2">⏱️ Tempo</Text>
                            <Text style={{ color: theme.colors.text }} className="text-2xl font-black">{summaryStats.duration}</Text>
                            <Text style={{ color: theme.colors.textMuted }} className="text-[10px] uppercase font-bold mt-1">total</Text>
                        </View>
                        <View style={{ width: 1, backgroundColor: theme.colors.border }} className="h-full" />
                        <View className="items-center">
                            <Text style={{ color: theme.colors.textMuted }} className="text-[10px] font-bold uppercase tracking-widest mb-2">🔥 Freq</Text>
                            <Text style={{ color: theme.colors.text }} className="text-2xl font-black">{summaryStats.frequency}</Text>
                            <Text style={{ color: theme.colors.textMuted }} className="text-[10px] uppercase font-bold mt-1">p/sem</Text>
                        </View>
                    </View>
                </View>

                {/* 📈 Evolution of Load */}
                <View className="px-6 mb-10">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text style={{ color: theme.colors.text }} className="text-xl font-bold">Evolução de Carga</Text>
                        {loadEvolution.length > 3 && (
                            <TouchableOpacity onPress={() => setShowAllEvolution(!showAllEvolution)}>
                                <Text style={{ color: theme.colors.primary }} className="text-xs font-bold">
                                    {showAllEvolution ? 'Ver menos' : 'Ver todos'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="gap-3">
                        {loadEvolution.slice(0, showAllEvolution ? undefined : 3).map((ex, index) => (
                            <View
                                key={index}
                                style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
                                className="rounded-2xl p-4 border flex-row items-center justify-between shadow-sm"
                            >
                                <View className="flex-row items-center flex-1">
                                    <View style={{ backgroundColor: theme.colors.primary + '15' }} className="w-10 h-10 rounded-full items-center justify-center mr-4">
                                        <Ionicons name="barbell-outline" size={20} color={theme.colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={{ color: theme.colors.text }} className="font-bold text-base">{ex!.name}</Text>
                                        <Text style={{ color: theme.colors.textMuted }} className="text-xs">
                                            Melhor carga: {ex!.latest}kg
                                        </Text>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <View className="flex-row items-center">
                                        <Text style={{ color: theme.colors.textMuted }} className="text-sm mr-2">{ex!.previous}kg</Text>
                                        <Ionicons name="arrow-forward" size={12} color={theme.colors.textMuted} />
                                        <Text style={{ color: ex!.isUp ? '#22C55E' : theme.colors.text }} className="text-lg font-black ml-2">
                                            {ex!.latest}kg
                                        </Text>
                                    </View>
                                    {ex!.isUp && (
                                        <Text className="text-green-500 text-[10px] font-bold">+{ex!.diff}kg nesta semana 🔥</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                        {loadEvolution.length === 0 && (
                            <Text style={{ color: theme.colors.textMuted }} className="text-center py-4 italic">Continue treinando para ver sua evolução</Text>
                        )}
                    </View>
                </View>

                {/* 🔥 Consistency Section */}
                <View className="px-6 mb-10">
                    <Text style={{ color: theme.colors.text }} className="text-xl font-bold mb-4">Consistência</Text>
                    <View className="flex-row gap-4">
                        <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="flex-1 rounded-3xl p-5 border shadow-sm">
                            <Ionicons name="flame" size={32} color="#FF9500" className="mb-2" />
                            <Text style={{ color: theme.colors.text }} className="text-2xl font-black">6 dias</Text>
                            <Text style={{ color: theme.colors.textMuted }} className="text-xs font-bold uppercase mt-1">streak atual</Text>
                        </View>
                        <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="flex-1 rounded-3xl p-5 border shadow-sm">
                            <Ionicons name="calendar-outline" size={32} color={theme.colors.primary} className="mb-2" />
                            <Text style={{ color: theme.colors.text }} className="text-2xl font-black">{consistency.currentMonthCount}/30</Text>
                            <Text style={{ color: theme.colors.textMuted }} className="text-xs font-bold uppercase mt-1">dias no mês</Text>
                        </View>
                    </View>
                </View>

                {/* 📏 Body Progress */}
                <View className="px-6 mb-10">
                    <Text style={{ color: theme.colors.text }} className="text-xl font-bold mb-4">Progresso Corporal</Text>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setShowWeightModal(true)}
                        style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
                        className="rounded-3xl p-6 border shadow-sm"
                    >
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text style={{ color: theme.colors.textMuted }} className="text-xs font-bold uppercase mb-1">Peso Atual</Text>
                                <View className="flex-row items-end">
                                    <Text style={{ color: theme.colors.text }} className="text-3xl font-black">{profile?.weight || '--'}</Text>
                                    <Text style={{ color: theme.colors.textMuted }} className="text-lg font-bold ml-1 mb-1">kg</Text>
                                </View>
                            </View>
                            <View className="bg-green-500/10 px-4 py-2 rounded-full flex-row items-center border border-green-500/20">
                                <Ionicons name={weightTrend?.isDown ? "caret-down" : "caret-up"} size={14} color={weightTrend?.isDown ? "#22C55E" : "#F43F5E"} />
                                <Text style={{ color: weightTrend?.isDown ? "#22C55E" : "#F43F5E" }} className="font-bold ml-1">
                                    {weightTrend ? `${weightTrend.isDown ? '-' : '+'}${weightTrend.diff}kg` : 'Peso monitorado'}
                                </Text>
                            </View>
                        </View>

                        <View style={{ height: 60, width: '100%', justifyContent: 'center' }}>
                            <View style={{ height: 8, backgroundColor: theme.colors.border, borderRadius: 4, width: '100%' }}>
                                <View style={{ height: 8, backgroundColor: theme.colors.primary, borderRadius: 4, width: '70%' }} />
                            </View>
                            <View className="flex-row justify-between mt-2">
                                <Text style={{ color: theme.colors.textMuted }} className="text-[10px] font-bold">Clique para atualizar peso</Text>
                                <Ionicons name="create-outline" size={12} color={theme.colors.textMuted} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* 🏆 Destaques Inteligentes */}
                <View className="px-6">
                    {highlights.map((h, i) => (
                        <View
                            key={i}
                            style={{ backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary + '30' }}
                            className="rounded-2xl p-4 border flex-row items-center mb-3"
                        >
                            <View className="bg-white/20 p-2 rounded-full mr-4">
                                <Ionicons name={h.icon as any} size={20} color={theme.colors.primary} />
                            </View>
                            <View className="flex-1">
                                <Text style={{ color: theme.colors.text }} className="font-bold text-sm">{h.title}</Text>
                                <Text style={{ color: theme.colors.textSecondary }} className="text-xs">{h.message}</Text>
                            </View>
                        </View>
                    ))}
                </View>

            </ScrollView>

            {/* Weight Update Modal */}
            <Modal
                visible={showWeightModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowWeightModal(false)}
            >
                <View className="flex-1 bg-black/60 justify-center items-center px-6">
                    <View style={{ backgroundColor: theme.colors.card }} className="w-full rounded-3xl p-6 shadow-2xl">
                        <Text style={{ color: theme.colors.text }} className="text-xl font-bold mb-4">Atualizar Peso</Text>
                        <View style={{ backgroundColor: theme.colors.background }} className="rounded-xl p-4 mb-6">
                            <Text style={{ color: theme.colors.textMuted }} className="text-xs font-bold uppercase mb-2">Peso Atual (kg)</Text>
                            <View className="flex-row items-center">
                                <Ionicons name="scale-outline" size={24} color={theme.colors.primary} className="mr-3" />
                                <View className="flex-1 border-b border-zinc-300 dark:border-zinc-700">
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ flex: 1 }}>
                                            <TextInput
                                                style={{
                                                    color: theme.colors.text,
                                                    fontSize: 24,
                                                    fontWeight: 'bold',
                                                    paddingVertical: 10
                                                }}
                                                value={newWeight}
                                                onChangeText={setNewWeight}
                                                placeholder="00.0"
                                                keyboardType="numeric"
                                                placeholderTextColor={theme.colors.textMuted}
                                            />
                                        </View>
                                        <Text style={{ color: theme.colors.textMuted }} className="text-lg font-bold ml-2">kg</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setShowWeightModal(false)}
                                style={{ backgroundColor: theme.colors.background }}
                                className="flex-1 py-4 rounded-xl items-center border border-zinc-200 dark:border-zinc-800"
                            >
                                <Text style={{ color: theme.colors.text }} className="font-bold">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleUpdateWeight}
                                style={{ backgroundColor: theme.colors.primary }}
                                className="flex-1 py-4 rounded-xl items-center shadow-lg"
                            >
                                <Text className="text-white font-bold">Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
