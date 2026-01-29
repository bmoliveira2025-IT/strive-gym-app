import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { WorkoutHistoryRecord } from '../../context/WorkoutHistoryContext';

interface IntelligentFeedbackProps {
    history: WorkoutHistoryRecord[];
}

interface Insight {
    id: string;
    type: 'pr' | 'frequency' | 'progression' | 'welcome';
    title: string;
    message: string;
    icon: string;
    color: string;
}

export function IntelligentFeedback({ history }: IntelligentFeedbackProps) {
    const { theme } = useTheme();
    const screenWidth = Dimensions.get('window').width;

    const insights = useMemo(() => {
        const result: Insight[] = [];

        if (history.length === 0) {
            result.push({
                id: 'welcome',
                type: 'welcome',
                title: 'Comece sua jornada',
                message: 'Inicie seu primeiro treino para começar a receber feedbacks inteligentes! 💪',
                icon: 'rocket-outline',
                color: '#4F8FF7'
            });
            return result;
        }

        // 1. PR Check (Recorde Pessoal)
        // Find if last workout had a PR
        const lastWorkout = history[0];
        let hadPR = false;
        let prExercise = '';

        lastWorkout.exercises.forEach(ex => {
            const currentMax = Math.max(...ex.sets.map(s => s.kg));

            // Check previous sessions of the same exercise
            let prevMax = 0;
            for (let i = 1; i < history.length; i++) {
                const prevEx = history[i].exercises.find(e => e.name === ex.name);
                if (prevEx) {
                    const m = Math.max(...prevEx.sets.map(s => s.kg));
                    if (m > prevMax) prevMax = m;
                }
            }

            if (currentMax > prevMax && prevMax > 0) {
                hadPR = true;
                prExercise = ex.name;
            }
        });

        if (hadPR) {
            result.push({
                id: 'pr',
                type: 'pr',
                title: 'Novo Recorde! 🔥',
                message: `Você bateu seu recorde no ${prExercise} no último treino!`,
                icon: 'trophy-outline',
                color: '#FFD700'
            });
        }

        // 2. Frequency Check (Treino atrasado)
        const muscleLastTrained: Record<string, Date> = {};

        // Muscle groups mapping (simplified)
        const majorGroups = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços'];

        history.forEach(workout => {
            const wDate = new Date(workout.date);
            workout.exercises.forEach(ex => {
                // Determine muscle group from name or placeholder
                const name = ex.name.toLowerCase();
                let group = '';
                if (name.includes('supino') || name.includes('peito') || name.includes('fly')) group = 'Peito';
                else if (name.includes('remada') || name.includes('puxada') || name.includes('barra fixa')) group = 'Costas';
                else if (name.includes('agachamento') || name.includes('leg') || name.includes('perna') || name.includes('extensora')) group = 'Pernas';
                else if (name.includes('desenvolvimento') || name.includes('lateral') || name.includes('ombro')) group = 'Ombros';
                else if (name.includes('rosca') || name.includes('tríceps') || name.includes('bíceps')) group = 'Braços';

                if (group && (!muscleLastTrained[group] || wDate > muscleLastTrained[group])) {
                    muscleLastTrained[group] = wDate;
                }
            });
        });

        const today = new Date();
        majorGroups.forEach(group => {
            const lastDate = muscleLastTrained[group];
            if (lastDate) {
                const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays >= 5) {
                    result.push({
                        id: `freq-${group}`,
                        type: 'frequency',
                        title: 'Consistência é a Chave 🔑',
                        message: `Seu último treino de ${group.toLowerCase()} foi há ${diffDays} dias. Que tal hoje?`,
                        icon: 'calendar-outline',
                        color: '#FF9500'
                    });
                }
            }
        });

        // 3. Progression Tip (Aumentar carga)
        // If an exercise was done with high reps in the last session, suggest increase
        lastWorkout.exercises.forEach(ex => {
            const avgReps = ex.sets.reduce((acc, s) => acc + s.reps, 0) / ex.sets.length;
            if (avgReps >= 11) {
                result.push({
                    id: `prog-${ex.name}`,
                    type: 'progression',
                    title: 'Evolução Constante 🚀',
                    message: `Você parece dominar o peso no ${ex.name}. Hoje é um bom dia para aumentar a carga! 💪`,
                    icon: 'trending-up-outline',
                    color: '#22C55E'
                });
            }
        });

        // Default if no insights (Welcome or general)
        if (result.length === 0) {
            result.push({
                id: 'daily',
                type: 'welcome',
                title: 'Pronto para hoje?',
                message: 'Cada treino te aproxima mais do seu objetivo. Vamos nessa!',
                icon: 'fitness-outline',
                color: '#4F8FF7'
            });
        }

        return result;
    }, [history]);

    // Show only the 2 most relevant insights to keep it clean
    const displayInsights = insights.slice(0, 2);

    return (
        <View className="px-6 mb-8">
            <Text style={{ color: theme.colors.textMuted }} className="text-xs uppercase tracking-widest font-bold mb-3">Feedback Inteligente</Text>

            <View className="gap-3">
                {displayInsights.map((insight) => (
                    <View
                        key={insight.id}
                        style={{
                            backgroundColor: theme.colors.card,
                            borderColor: theme.colors.border,
                            borderLeftWidth: 4,
                            borderLeftColor: insight.color
                        }}
                        className="rounded-xl p-4 border flex-row items-center shadow-sm"
                    >
                        <View style={{ backgroundColor: `${insight.color}15` }} className="w-10 h-10 rounded-full items-center justify-center mr-4">
                            <Ionicons name={insight.icon as any} size={20} color={insight.color} />
                        </View>
                        <View className="flex-1">
                            <Text style={{ color: theme.colors.text }} className="font-bold text-sm mb-0.5">{insight.title}</Text>
                            <Text style={{ color: theme.colors.textSecondary }} className="text-xs leading-4">{insight.message}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}
