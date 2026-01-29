import { View, Text, ScrollView, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSavedWorkouts } from '../context/SavedWorkoutsContext';
import { WorkoutCard } from '../components/WorkoutCard';
import { WorkoutPreviewModal } from '../components/WorkoutPreviewModal';
import { WeeklySummary } from '../components/dashboard/WeeklySummary';
import { QuickActions } from '../components/dashboard/QuickActions';
import { IntelligentFeedback } from '../components/dashboard/IntelligentFeedback';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useMemo, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useWorkout } from '../context/WorkoutContext';
import { useWorkoutHistory } from '../context/WorkoutHistoryContext';
import { Video, ResizeMode } from 'expo-av';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MUSCLE_INFO } from '../constants/muscleInfo';
import { MUSCLE_IMAGES } from '../constants/muscleImages';

const exercisesData = require('../assets/exercises.json');

const { width } = Dimensions.get('window');

export default function Home() {
    const { theme } = useTheme();
    const { savedWorkouts, deleteWorkout, toggleWorkoutFavorite, setIsCreatingPlan } = useSavedWorkouts();
    const { history } = useWorkoutHistory();
    const { setReturnPath } = useWorkout();
    const router = useRouter();
    const params = useLocalSearchParams<{ previewWorkoutId?: string }>();

    const [previewWorkout, setPreviewWorkout] = useState<any>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const handleClosePreview = () => {
        setShowPreviewModal(false);
        setPreviewWorkout(null);
    };

    const handleOpenPreview = (workout: any) => {
        router.push({
            pathname: '/preview',
            params: { id: workout.id, type: 'saved' }
        });
    };

    // Auto-open preview from params
    useEffect(() => {
        if (params.previewWorkoutId && savedWorkouts.length > 0) {
            router.push({
                pathname: '/preview',
                params: { id: params.previewWorkoutId, type: 'saved' }
            });
        }
    }, [params.previewWorkoutId, savedWorkouts]);

    // Video Player State
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
    const [activeMuscleInfoModal, setActiveMuscleInfoModal] = useState<string | null>(null);

    // Calculate Weekly Stats
    const stats = useMemo(() => {
        const getStats = (daysOffset: number) => {
            const now = new Date();
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1) - daysOffset;
            const start = new Date(now.setDate(diff));
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);

            const filtered = history.filter(h => {
                const date = new Date(h.date);
                return date >= start && date < end;
            });

            return {
                count: filtered.length,
                duration: filtered.reduce((acc, curr) => acc + curr.duration, 0),
                volume: filtered.reduce((acc, curr) => acc + curr.totalVolume, 0)
            };
        };

        const current = getStats(0);
        const last = getStats(7);

        const formatDuration = (seconds: number) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            if (h > 0) return `${h}h ${m}m`;
            return `${m}m`;
        };

        const formatVolume = (v: number) => {
            if (v >= 1000) {
                return v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + "kg";
            }
            return `${v.toFixed(0)}kg`;
        };

        return {
            current: {
                ...current,
                durationFormatted: formatDuration(current.duration),
                volumeFormatted: formatVolume(current.volume)
            },
            diff: {
                count: current.count - last.count,
                durationFormatted: formatDuration(Math.abs(current.duration - last.duration)),
                volumeFormatted: formatVolume(Math.abs(current.volume - last.volume)),
                isCountDown: current.count < last.count,
                isDurationDown: current.duration < last.duration,
                isVolumeDown: current.volume < last.volume
            }
        };
    }, [history]);
    // Calculate Top Exercises of the Week
    const topExercises = useMemo(() => {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);

        const filtered = history.filter(h => new Date(h.date) >= start);

        const counts: Record<string, { count: number, name: string }> = {};
        filtered.forEach(record => {
            record.exercises.forEach(ex => {
                if (!counts[ex.id]) {
                    counts[ex.id] = { count: 0, name: ex.name };
                }
                // Count Sets instead of just occurrences (to match Body Part volume logic)
                const setsCount = (ex.sets && ex.sets.length > 0) ? ex.sets.length : 1;
                counts[ex.id].count += setsCount;
            });
        });

        const sorted = Object.entries(counts)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 3)
            .map(([id, data]) => {
                const details = exercisesData.find((ex: any) => ex.id?.toString() === id);
                return {
                    id,
                    ...data,
                    image_url: details?.image_url,
                    video_url: details?.video_url,
                    body_parts: details?.body_parts
                };
            });

        return sorted;
    }, [history]);

    // Calculate Daily Status (Last workout and current day status)
    const dailyStatus = useMemo(() => {
        if (!history || history.length === 0) {
            return {
                lastWorkout: null,
                status: '❌ Treino pendente',
                color: '#EF4444'
            };
        }

        const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const last = sortedHistory[0];
        const lastDate = new Date(last.date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isToday = lastDate.toDateString() === today.toDateString();
        const isYesterday = lastDate.toDateString() === yesterday.toDateString();

        let statusText = '❌ Treino pendente';
        let statusColor = '#EF4444';

        if (isToday) {
            statusText = '✅ Concluído hoje';
            statusColor = '#10B981';
        } else if (isYesterday) {
            statusText = '⏳ Em descanso';
            statusColor = '#F59E0B';
        }

        return {
            lastWorkout: last,
            status: statusText,
            color: statusColor
        };
    }, [history]);



    /*
    // Calculate Top Body Parts of the Week
    // const topBodyParts = useMemo(() => {
 
 
 
    // Normalize and unique-ify body parts
    // Normalize and unique-ify body parts with priority logic
    const rawParts = parts.map(p => p.toLowerCase().trim());
    const hasSpecificArm = rawParts.some(p => ['biceps', 'triceps', 'forearms'].includes(p));
    const hasSpecificLeg = rawParts.some(p => ['quadriceps', 'hamstrings', 'calves', 'glutes'].includes(p));
 
    const uniqueParts = new Set<string>();
 
    rawParts.forEach(norm => {
        // Skip generic 'upper arms'/'arms' if we already have specific arm muscles
        if ((norm === 'upper arms' || norm === 'arms') && hasSpecificArm) return;
 
        // Skip generic 'thighs'/'legs' if we already have specific leg muscles
        if ((norm === 'thighs' || norm === 'thigh' || norm === 'legs') && hasSpecificLeg) return;
 
        // Remap generics ONLY if specific ones are missing (fallback)
        if (norm === 'thighs' || norm === 'thigh') norm = 'quadriceps';
        if (norm === 'upper arms' || norm === 'arms') norm = 'biceps';
        if (norm === 'legs') norm = 'quadriceps';
 
        uniqueParts.add(norm);
    });
 
    uniqueParts.forEach(normalizedPart => {
        if (!counts[normalizedPart]) counts[normalizedPart] = 0;
        counts[normalizedPart] += setsCount;
    });
});
}); */

    // Muscle Images Mapping - Premium Assets
    // Now using shared constant
    const muscleImages = MUSCLE_IMAGES;

    // Calculate Body Parts Stats (Top and Least Trained)
    const { topBodyParts, leastTrainedBodyParts } = useMemo(() => {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);

        const filtered = history.filter(h => new Date(h.date) >= start);

        // Initialize counts for all known muscles to 0
        const counts: Record<string, number> = {};
        Object.keys(MUSCLE_INFO).forEach(m => {
            counts[m] = 0;
        });

        filtered.forEach(record => {
            record.exercises.forEach(ex => {
                const setsCount = (ex.sets && ex.sets.length > 0) ? ex.sets.length : 1;
                if (setsCount === 0) return;

                let parts: string[] = [];
                if ((ex as any).body_parts && (ex as any).body_parts.length > 0) {
                    parts = (ex as any).body_parts;
                } else {
                    const details = exercisesData.find((d: any) => d.id?.toString() === ex.id?.toString());
                    if (details && details.body_parts) {
                        parts = details.body_parts;
                    }
                }

                const rawParts = parts.map(p => p.toLowerCase().trim());
                const hasSpecificArm = rawParts.some(p => ['biceps', 'triceps', 'forearms'].includes(p));
                const hasSpecificLeg = rawParts.some(p => ['quadriceps', 'hamstrings', 'calves', 'glutes'].includes(p));

                const uniqueParts = new Set<string>();

                rawParts.forEach(norm => {
                    if ((norm === 'upper arms' || norm === 'arms') && hasSpecificArm) return;
                    if ((norm === 'thighs' || norm === 'thigh' || norm === 'legs') && hasSpecificLeg) return;

                    if (norm === 'thighs' || norm === 'thigh') norm = 'quadriceps';
                    if (norm === 'upper arms' || norm === 'arms') norm = 'biceps';
                    if (norm === 'legs') norm = 'quadriceps';

                    uniqueParts.add(norm);
                });

                uniqueParts.forEach(normalizedPart => {
                    // Map back to MUSCLE_INFO keys for consistency
                    const map: Record<string, string> = {
                        'chest': 'Peito', 'peito': 'Peito',
                        'back': 'Costas', 'costas': 'Costas',
                        'shoulders': 'Ombros', 'ombros': 'Ombros',
                        'biceps': 'Bíceps', 'bíceps': 'Bíceps',
                        'triceps': 'Tríceps', 'tríceps': 'Tríceps',
                        'forearms': 'Bíceps', 'antebraços': 'Bíceps',
                        'abs': 'Abdômen', 'abdominais': 'Abdômen', 'waist': 'Abdômen', 'abdomen': 'Abdômen', 'core': 'Abdômen',
                        'quadriceps': 'Quadríceps', 'quadríceps': 'Quadríceps', 'legs': 'Quadríceps', 'thighs': 'Quadríceps', 'pernas': 'Quadríceps',
                        'hamstrings': 'Isquiotibiais', 'isquiotibiais': 'Isquiotibiais',
                        'calves': 'Panturrilhas', 'panturrilhas': 'Panturrilhas',
                        'hips': 'Glúteos', 'quadris': 'Glúteos', 'glutes': 'Glúteos',
                        'neck': 'Costas', 'pescoço': 'Costas'
                    };
                    const muscleKey = map[normalizedPart] || normalizedPart;
                    if (counts[muscleKey] !== undefined) {
                        counts[muscleKey] += setsCount;
                    }
                });
            });
        });

        const allMapped = Object.entries(counts).map(([name, count]) => {
            const displayName = name;
            let image = (muscleImages as any)[displayName];

            return {
                name: displayName,
                count,
                image
            };
        });

        return {
            topBodyParts: [...allMapped]
                .filter(p => p.count > 0) // Only show actually worked muscles
                .sort((a, b) => b.count - a.count)
                .slice(0, 6), // Show top 6 in carousel
            leastTrainedBodyParts: [...allMapped]
                .sort((a, b) => a.count - b.count)
                .filter(p => p.count < 5) // Define threshold for "less trained" (e.g., less than 5 sets)
        };
    }, [history]);

    const handleCreateWorkout = () => {
        setIsCreatingPlan(true);
        router.push('/workout');
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />

            {/* Clean Premium Header */}
            <View className="pt-14 pb-2 px-6 bg-transparent z-50">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text style={{ color: theme.colors.textMuted }} className="text-xs font-bold uppercase tracking-wider mb-0.5">
                            Bem-vindo de volta
                        </Text>
                        <Text style={{ color: theme.colors.text }} className="text-4xl font-black italic tracking-tighter">
                            STRIVE
                        </Text>
                    </View>

                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => router.push('/streak')}
                            style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
                            className="flex-row items-center px-3 h-10 rounded-full border shadow-sm"
                        >
                            <Ionicons name="flame" size={20} color="#FF9500" />
                            <Text style={{ color: theme.colors.text }} className="font-bold ml-1.5 text-sm">3</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
                            className="w-10 h-10 items-center justify-center rounded-full border shadow-sm relative"
                        >
                            <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Weekly Summary Section */}
                <WeeklySummary stats={stats} history={history} />

                {/* Quick Actions */}
                <QuickActions />

                {/* Intelligent Feedback */}
                <IntelligentFeedback history={history} />

                {/* Workout List Section */}
                {savedWorkouts && savedWorkouts.length > 0 && (
                    <View className="mb-8">
                        <View className="px-5 mb-4 flex-row items-center justify-between">
                            <Text style={{ color: theme.colors.textMuted }} className="text-xs uppercase tracking-widest font-bold">Meus Planos</Text>
                            <TouchableOpacity onPress={() => router.push('/workout')}>
                                <Text style={{ color: theme.colors.primary }} className="text-xs font-bold">Ver todos</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                        >
                            {savedWorkouts.filter(w => w && w.id).map(workout => (
                                <WorkoutCard
                                    key={workout.id}
                                    workout={workout}
                                    onPress={() => {
                                        handleOpenPreview(workout);
                                    }}
                                    onDelete={() => deleteWorkout(workout.id)}
                                    onToggleFavorite={() => toggleWorkoutFavorite(workout.id)}
                                    layout="vertical"
                                />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Top Exercises of the Week Section */}
                {topExercises.length > 0 && (
                    <View className="px-5 mt-10 mb-6">
                        <View className="mb-4">
                            <Text style={{ color: theme.colors.textMuted }} className="text-xs uppercase tracking-widest font-bold mb-1">Destaques</Text>
                            <Text style={{ color: theme.colors.text }} className="text-xl font-bold">Mais executados da semana</Text>
                        </View>

                        <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }} className="rounded-3xl p-4 border">
                            {topExercises.map((ex, index) => (
                                <TouchableOpacity
                                    key={ex.id}
                                    onPress={() => {
                                        router.push({
                                            pathname: '/exercise/[id]',
                                            params: { id: ex.id, source: 'home' }
                                        });
                                    }}
                                    style={{ borderBottomColor: theme.colors.border }}
                                    className={`flex-row items-center py-3 ${index !== topExercises.length - 1 ? 'border-b' : ''}`}
                                >
                                    <View style={{ backgroundColor: theme.mode === 'light' ? 'transparent' : theme.colors.backgroundTertiary }} className="w-16 h-16 rounded-xl overflow-hidden mr-4 items-center justify-center">
                                        {ex.image_url ? (
                                            <Image source={{ uri: ex.image_url }} className="w-full h-full" resizeMode="contain" />
                                        ) : (
                                            <View className="w-full h-full items-center justify-center">
                                                <Ionicons name="barbell" size={24} color={theme.colors.textMuted} />
                                            </View>
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text style={{ color: theme.colors.text }} className="text-base font-bold" numberOfLines={1}>{ex.name}</Text>
                                        <Text style={{ color: theme.colors.textMuted }} className="text-sm mt-0.5" numberOfLines={1}>
                                            {ex.body_parts && ex.body_parts.length > 0 ? ex.body_parts.join(', ') : 'Geral'} • {ex.count} vezes
                                        </Text>
                                    </View>
                                    {ex.video_url && (
                                        <View style={{ backgroundColor: `${theme.colors.primary}20` }} className="p-2 rounded-full">
                                            <Ionicons name="play" size={16} color="#4F8FF7" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Most Worked Body Parts Section - CAROUSEL */}
                {topBodyParts.length > 0 && (
                    <View className="mb-10">
                        <View className="px-5 mb-4">
                            <Text style={{ color: theme.colors.textMuted }} className="text-xs uppercase tracking-widest font-bold mb-1">Estatísticas</Text>
                            <Text style={{ color: theme.colors.text }} className="text-xl font-bold">Partes do corpo mais trabalhadas</Text>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
                        >
                            {topBodyParts.map((part) => (
                                <TouchableOpacity
                                    key={part.name}
                                    onPress={() => setActiveMuscleInfoModal(part.name)}
                                    activeOpacity={0.9}
                                    style={{
                                        backgroundColor: theme.colors.card,
                                        borderColor: theme.colors.cardBorder,
                                        width: 160,
                                        height: 180,
                                        shadowColor: theme.colors.shadow,
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: 4
                                    }}
                                    className="rounded-3xl overflow-hidden border relative p-4 justify-between"
                                >
                                    {/* Text Content */}
                                    <View className="z-10">
                                        <Text style={{ color: theme.colors.text }} className="text-lg font-bold capitalize">{part.name}</Text>
                                        <Text style={{ color: theme.colors.primary }} className="text-xs font-bold">{part.count} séries</Text>
                                    </View>

                                    {/* Bottom Info */}
                                    <View className="z-10 bg-white/10 self-start px-2 py-1 rounded-lg">
                                        <Text className="text-[10px] text-white/60 font-medium">+15% vs ontem</Text>
                                    </View>

                                    {/* Background Image - Positioned Bottom Right */}
                                    <View className="absolute -right-2 -bottom-2 w-28 h-32">
                                        {part.image ? (
                                            <Image
                                                source={part.image}
                                                className="w-full h-full"
                                                resizeMode="contain"
                                            />
                                        ) : (
                                            <View className="w-full h-full items-center justify-center opacity-20">
                                                <Ionicons name="body" size={40} color={theme.colors.textMuted} />
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Recommended Focus Section - 3 COL GRID */}
                {leastTrainedBodyParts.length > 0 && (
                    <View className="px-5 mb-10">
                        <View className="mb-4">
                            <Text style={{ color: theme.colors.textMuted }} className="text-xs uppercase tracking-widest font-bold mb-1">Acompanhamento</Text>
                            <Text style={{ color: theme.colors.text }} className="text-xl font-bold">Músculos para focar</Text>
                        </View>

                        <View className="flex-row flex-wrap gap-3">
                            {leastTrainedBodyParts.map((part) => (
                                <TouchableOpacity
                                    key={part.name}
                                    onPress={() => setActiveMuscleInfoModal(part.name)}
                                    activeOpacity={0.9}
                                    style={{
                                        backgroundColor: theme.colors.card,
                                        borderColor: theme.colors.cardBorder,
                                        width: (width - 40 - 24) / 3, // 3 columns with gaps
                                        height: 110,
                                        shadowColor: theme.colors.shadow,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 4,
                                        elevation: 2
                                    }}
                                    className="rounded-2xl border items-center justify-center p-2"
                                >
                                    <View className="w-12 h-12 mb-2 items-center justify-center">
                                        {part.image ? (
                                            <Image
                                                source={part.image}
                                                className="w-full h-full"
                                                resizeMode="contain"
                                            />
                                        ) : (
                                            <Ionicons name="body" size={24} color={theme.colors.textMuted} />
                                        )}
                                    </View>

                                    <Text style={{ color: theme.colors.text }} className="text-[11px] font-bold text-center capitalize mb-1" numberOfLines={1}>
                                        {part.name}
                                    </Text>

                                    <View className={`px-2 py-0.5 rounded-full ${part.count === 0 ? 'bg-red-500/10' : 'bg-orange-500/10'}`}>
                                        <Text style={{ color: part.count === 0 ? '#EF4444' : '#F59E0B' }} className="text-[9px] font-bold uppercase">
                                            {part.count === 0 ? 'Pendente' : `${part.count} séries`}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Daily Status Section */}
                <View className="px-5 mb-10">
                    <View className="mb-4">
                        <Text style={{ color: theme.colors.textMuted }} className="text-xs uppercase tracking-widest font-bold mb-1">Essencial</Text>
                        <Text style={{ color: theme.colors.text }} className="text-xl font-bold">Resumo Diário</Text>
                    </View>

                    <View
                        style={{
                            backgroundColor: theme.colors.card,
                            borderColor: theme.colors.cardBorder,
                            shadowColor: theme.colors.shadow,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 10,
                            elevation: 5
                        }}
                        className="rounded-3xl border p-5"
                    >
                        <View className="flex-row items-center justify-between mb-5">
                            <View className="flex-row items-center">
                                <View style={{ backgroundColor: theme.colors.primary + '20' }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                                    <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                                </View>
                                <View>
                                    <Text style={{ color: theme.colors.textMuted }} className="text-[10px] font-bold uppercase tracking-widest">Último treino realizado</Text>
                                    <Text style={{ color: theme.colors.text }} className="text-base font-bold">
                                        {dailyStatus.lastWorkout ? dailyStatus.lastWorkout.workoutName : 'Nenhum registro'}
                                    </Text>
                                </View>
                            </View>
                            {dailyStatus.lastWorkout && (
                                <Text style={{ color: theme.colors.textMuted }} className="text-xs">
                                    {new Date(dailyStatus.lastWorkout.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })}
                                </Text>
                            )}
                        </View>

                        <View style={{ height: 1.5, backgroundColor: theme.colors.border, opacity: 0.3 }} className="mb-5" />

                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View style={{ backgroundColor: dailyStatus.color + '20' }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                                    <Ionicons
                                        name={dailyStatus.status.includes('Concluído') ? "checkmark-circle" : (dailyStatus.status.includes('descanso') ? "time" : "alert-circle")}
                                        size={20}
                                        color={dailyStatus.color}
                                    />
                                </View>
                                <View>
                                    <Text style={{ color: theme.colors.textMuted }} className="text-[10px] font-bold uppercase tracking-widest">Status atual</Text>
                                    <Text style={{ color: dailyStatus.color }} className="text-base font-bold">
                                        {dailyStatus.status}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Muscle Info Modal */}
            <Modal
                visible={!!activeMuscleInfoModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setActiveMuscleInfoModal(null)}
            >
                <View className="flex-1 justify-end bg-black/60">
                    <TouchableOpacity
                        className="absolute inset-0"
                        activeOpacity={1}
                        onPress={() => setActiveMuscleInfoModal(null)}
                    />

                    <View
                        style={{ backgroundColor: theme.colors.background }}
                        className="rounded-t-3xl p-6 min-h-[40%] shadow-2xl"
                    >
                        {/* Handle bar */}
                        <View className="w-full items-center mb-6">
                            <View className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        </View>

                        {activeMuscleInfoModal && (() => {
                            // Normalize key lookup
                            const lookupKey = Object.keys(MUSCLE_INFO).find(
                                k => k.toLowerCase() === activeMuscleInfoModal.toLowerCase()
                            ) || 'Geral';

                            const info = MUSCLE_INFO[lookupKey];

                            if (!info) {
                                return (
                                    <View className="items-center py-10">
                                        <Text style={{ color: theme.colors.textMuted }}>Informações não disponíveis para este músculo.</Text>
                                        <TouchableOpacity
                                            onPress={() => setActiveMuscleInfoModal(null)}
                                            className="mt-6 bg-zinc-200 dark:bg-zinc-800 px-6 py-3 rounded-full"
                                        >
                                            <Text style={{ color: theme.colors.text }}>Fechar</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            }

                            return (
                                <View>
                                    <View className="flex-row items-center mb-4">
                                        <View style={{ backgroundColor: theme.colors.primary }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                                            <Ionicons name="fitness" size={20} color="white" />
                                        </View>
                                        <Text style={{ color: theme.colors.text }} className="text-2xl font-bold">
                                            {info.title}
                                        </Text>
                                    </View>

                                    <Text style={{ color: theme.colors.textSecondary }} className="text-base leading-6 mb-6">
                                        {info.description}
                                    </Text>

                                    <Text style={{ color: theme.colors.text }} className="font-bold mb-3 uppercase text-xs tracking-widest opacity-70">
                                        BENEFÍCIOS PRINCIPAIS
                                    </Text>

                                    {info.benefits.map((benefit, idx) => (
                                        <View key={idx} className="flex-row items-center mb-3">
                                            <Ionicons name="checkmark-circle" size={18} color="#4F8FF7" style={{ marginRight: 10 }} />
                                            <Text style={{ color: theme.colors.text }} className="text-base flex-1">
                                                {benefit}
                                            </Text>
                                        </View>
                                    ))}

                                    <TouchableOpacity
                                        onPress={() => setActiveMuscleInfoModal(null)}
                                        style={{ backgroundColor: theme.colors.card }}
                                        className="mt-6 w-full py-4 rounded-xl items-center border border-zinc-200 dark:border-zinc-800"
                                    >
                                        <Text style={{ color: theme.colors.text }} className="font-bold text-base">Entendi</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })()}
                    </View>
                </View>
            </Modal>

            {/* Video Player Modal */}
            <Modal
                visible={showVideoModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowVideoModal(false)}
            >
                <View className="flex-1 bg-black justify-center items-center">
                    <TouchableOpacity
                        onPress={() => setShowVideoModal(false)}
                        className="absolute top-12 right-6 z-50 p-2 bg-zinc-900/50 rounded-full"
                    >
                        <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>

                    {activeVideoUrl ? (
                        <Video
                            source={{ uri: activeVideoUrl }}
                            rate={1.0}
                            volume={1.0}
                            isMuted={false}
                            resizeMode={ResizeMode.CONTAIN}
                            shouldPlay
                            isLooping
                            useNativeControls
                            style={{ width: '100%', height: '80%' }}
                        />
                    ) : (
                        <View className="items-center justify-center">
                            <Ionicons name="videocam-off-outline" size={64} color="#333" />
                            <Text className="text-zinc-500 mt-4">Vídeo não disponível</Text>
                        </View>
                    )}
                </View>
            </Modal>
        </View >
    );
}
