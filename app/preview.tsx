
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSavedWorkouts } from '../context/SavedWorkoutsContext';
import { useWorkout } from '../context/WorkoutContext';
import { PROGRAMS } from '../constants/programs';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { MUSCLE_IMAGES } from '../constants/muscleImages';
import { MUSCLE_INFO } from '../constants/muscleInfo';

const exercisesData = require('../assets/exercises.json');





export default function WorkoutPreviewScreen() {
    const params = useLocalSearchParams<{ id: string, type: 'program' | 'saved', dayIndex?: string }>();
    const router = useRouter();
    const { savedWorkouts } = useSavedWorkouts();
    const { loadWorkout, isWorkoutActive, clearWorkout } = useWorkout();
    const { theme } = useTheme();

    // Video Modal State
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [activeExerciseForVideo, setActiveExerciseForVideo] = useState<any | null>(null);
    const video = React.useRef<Video>(null);
    const [status, setStatus] = useState<any>({});

    // Helper to get muscle image with consistent mapping
    const getMuscleImage = (part: string) => {
        if (!part) return null;
        const key = part.toLowerCase().trim();

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

        const displayName = map[key] || part.charAt(0).toUpperCase() + part.slice(1);
        return (MUSCLE_IMAGES as any)[displayName] || null;
    };


    // Resolve Workout Data
    const workout = React.useMemo(() => {
        if (params.type === 'program') {
            const program = PROGRAMS.find(p => p.id === params.id);
            if (!program) return null;

            // Programs often have days. If dayIndex provided, show that, else first day
            const dayIndex = params.dayIndex ? parseInt(params.dayIndex) : 0;
            const day = program.days[dayIndex];

            // Map exercise IDs to full objects
            const exercises = day.exerciseIds.map(id => {
                const ex = exercisesData.find((e: any) => e.id.toString() === id);
                return ex ? { ...ex, sets: [{ reps: '10', kg: '0', completed: false }] } : null;
            }).filter(Boolean);

            return {
                id: program.id,
                name: `${program.title} - ${day.name}`,
                lastDone: 'Never',
                createdAt: new Date().toISOString(),
                exercises: exercises
            };
        } else {
            return savedWorkouts.find(w => w.id === params.id);
        }
    }, [params.id, params.type, params.dayIndex, savedWorkouts]);

    if (!workout) {
        return (
            <View style={{ backgroundColor: theme.colors.background }} className="flex-1 justify-center items-center">
                <Text style={{ color: theme.colors.text }}>Treino não encontrado</Text>
            </View>
        );
    }

    const handleOpenVideo = (exercise: any) => {
        setActiveExerciseForVideo(exercise);
        setShowVideoModal(true);
    };

    const handleStartWorkout = () => {
        if (!workout) return;

        loadWorkout(workout.name, workout.exercises);

        // Construct persistent return path
        const returnTo = `/preview?id=${params.id}&type=${params.type}&dayIndex=${params.dayIndex || 0}`;

        router.push({
            pathname: '/workout',
            params: { returnTo }
        });
    };

    return (
        <View style={{ backgroundColor: theme.colors.background }} className="flex-1">
            <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={{ backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }} className="pt-12 pb-4 px-4 border-b flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View className="flex-1 ml-4">
                    <Text style={{ color: theme.colors.text }} className="text-xl font-bold" numberOfLines={1}>
                        {workout.name}
                    </Text>
                    <Text style={{ color: theme.colors.textMuted }} className="text-sm">
                        {workout.exercises.length} Exercícios
                    </Text>
                </View>
            </View>

            {/* Exercise List */}
            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                {workout.exercises.map((exercise: any, index: number) => (
                    <View key={`${exercise.id}-${index}`} className="bg-transparent mb-5">
                        <View className="flex-row items-center">
                            <TouchableOpacity
                                onPress={() => {
                                    if (exercise.video_url) {
                                        handleOpenVideo(exercise);
                                    } else {
                                        router.push({ pathname: '/exercise/[id]', params: { id: exercise.id, source: 'preview' } });
                                    }
                                }}
                                style={{ backgroundColor: theme.colors.card }}
                                className="rounded-xl overflow-hidden w-20 h-20 justify-center items-center"
                            >
                                {exercise.image_url ? (
                                    <View>
                                        <Image
                                            source={{ uri: exercise.image_url }}
                                            className="w-20 h-20"
                                            resizeMode="cover"
                                        />
                                        {exercise.video_url && (
                                            <View className="absolute inset-0 items-center justify-center bg-black/20">
                                                <Ionicons name="play" size={20} color="white" />
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <View className="w-20 h-20 items-center justify-center">
                                        <Ionicons name="barbell" size={28} color={theme.colors.textMuted} />
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 ml-4"
                                onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exercise.id, source: 'preview' } })}
                            >
                                <View>
                                    <Text style={{ color: theme.colors.text }} className="font-bold text-xl mb-1" numberOfLines={2}>
                                        {exercise.name}
                                    </Text>
                                    <Text style={{ color: theme.colors.textSecondary }} className="text-lg">
                                        {exercise.sets ? exercise.sets.length : 3} Séries • {exercise.sets && exercise.sets[0] ? exercise.sets[0].reps : '10'} reps
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                <View className="h-32" />
            </ScrollView>

            {/* Bottom Actions */}
            {!isWorkoutActive ? (
                <View style={{ backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }} className="px-4 pb-8 pt-4 border-t absolute bottom-0 left-0 right-0">
                    <TouchableOpacity
                        onPress={handleStartWorkout}
                        style={{ backgroundColor: theme.colors.primary }}
                        className="rounded-full py-4 flex-row items-center justify-center"
                        activeOpacity={0.8}
                    >
                        <Text style={{ color: '#FFFFFF' }} className="font-bold text-xl ml-2">
                            Iniciar Treino
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                // Active Workout Footer
                <View className="absolute bottom-[20px] left-4 right-4 z-50">
                    <View
                        style={{
                            backgroundColor: theme.colors.card,
                            borderColor: theme.colors.border,
                            shadowColor: theme.colors.shadow,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 10,
                        }}
                        className="border p-4 rounded-xl shadow-lg"
                    >
                        <Text style={{ color: theme.colors.text }} className="text-center font-medium mb-3">Treino em Andamento</Text>

                        <View className="flex-row justify-between items-center px-4">
                            <TouchableOpacity
                                onPress={() => {
                                    // Resume logic
                                    const returnTo = `/preview?id=${params.id}&type=${params.type}&dayIndex=${params.dayIndex || 0}`;
                                    router.push({
                                        pathname: '/workout',
                                        params: { returnTo }
                                    });
                                }}
                                className="flex-row items-center"
                            >
                                <Ionicons name="play" size={18} color={theme.colors.primary} />
                                <Text style={{ color: theme.colors.primary }} className="font-bold ml-2">Retomar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    const { Alert } = require('react-native');
                                    Alert.alert(
                                        "Descartar Treino",
                                        "Tem certeza que deseja descartar o treino atual?",
                                        [
                                            { text: "Cancelar", style: "cancel" },
                                            {
                                                text: "Descartar",
                                                style: "destructive",
                                                onPress: () => {
                                                    clearWorkout();
                                                    router.back(); // Or replace('/')
                                                }
                                            }
                                        ]
                                    );
                                }}
                                className="flex-row items-center"
                            >
                                <Ionicons name="close" size={18} color="#EF4444" />
                                <Text className="text-red-500 font-bold ml-2">Descartar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Video Modal */}
            <Modal
                visible={showVideoModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowVideoModal(false)}
            >
                <View style={{ backgroundColor: theme.colors.background }} className="flex-1">
                    {/* Close Button - Floating Fixed */}
                    <TouchableOpacity
                        onPress={() => setShowVideoModal(false)}
                        style={{ backgroundColor: theme.colors.card }}
                        className="absolute top-12 right-6 z-50 p-2 rounded-full shadow-lg"
                    >
                        <Ionicons name="close" size={24} color={theme.colors.text} />
                    </TouchableOpacity>

                    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                        {activeExerciseForVideo && activeExerciseForVideo.video_url && (
                            <View style={{ backgroundColor: theme.colors.background }} className="w-full pt-20">
                                {/* Video Player Container */}
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPress={() => {
                                        if (status.isPlaying) {
                                            video.current?.pauseAsync();
                                        } else {
                                            video.current?.playAsync();
                                        }
                                    }}
                                    className="w-full aspect-square mb-6 relative justify-center items-center"
                                    style={{ backgroundColor: theme.colors.background }}
                                >
                                    <Video
                                        ref={video}
                                        source={{ uri: activeExerciseForVideo.video_url }}
                                        rate={1.0}
                                        volume={1.0}
                                        isMuted={false}
                                        resizeMode={ResizeMode.CONTAIN}
                                        shouldPlay={true}
                                        isLooping
                                        useNativeControls={false}
                                        style={{ width: '100%', height: '100%' }}
                                        onPlaybackStatusUpdate={status => setStatus(() => status)}
                                    />

                                    {/* Play/Pause Overlay */}
                                    {!status.isPlaying && (
                                        <View className="absolute p-4 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                                            <Ionicons name="play" size={48} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {/* Info Content */}
                                <View className="px-6">
                                    {/* Title */}
                                    <Text style={{ color: theme.colors.text }} className="text-3xl font-extrabold mb-2 text-center leading-tight">
                                        {activeExerciseForVideo.name}
                                    </Text>

                                    {/* Tags Row (Body Part & Equipment) */}
                                    <View className="flex-row flex-wrap justify-center gap-2 mb-8">
                                        {/* Body Parts Tag */}
                                        {activeExerciseForVideo.body_parts && (
                                            <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="px-3 py-1 rounded-lg border">
                                                <Text style={{ color: theme.colors.primary }} className="text-xs font-bold uppercase tracking-wider">
                                                    {Array.isArray(activeExerciseForVideo.body_parts)
                                                        ? activeExerciseForVideo.body_parts[0]
                                                        : activeExerciseForVideo.body_parts}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Equipment Tag */}
                                        {activeExerciseForVideo.equipment && (
                                            <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="px-3 py-1 rounded-lg border">
                                                <Text style={{ color: theme.colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider">
                                                    {Array.isArray(activeExerciseForVideo.equipment)
                                                        ? activeExerciseForVideo.equipment[0]
                                                        : activeExerciseForVideo.equipment}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Muscle Map Section */}
                                    <View className="mb-10 w-full">
                                        <Text style={{ color: theme.colors.textMuted }} className="uppercase text-xs font-bold tracking-widest mb-4 pl-1">
                                            MÚSCULOS ALVO
                                        </Text>
                                        <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="w-full h-64 rounded-3xl items-center justify-center p-4 border">
                                            {(() => {
                                                // Priority 1: High Quality Muscle Map (Transparent)
                                                const primaryPart = Array.isArray(activeExerciseForVideo.body_parts)
                                                    ? activeExerciseForVideo.body_parts[0]
                                                    : activeExerciseForVideo.body_parts;
                                                const muscleImage = getMuscleImage(primaryPart);

                                                if (muscleImage) {
                                                    return (
                                                        <Image
                                                            source={muscleImage}
                                                            className="w-full h-full"
                                                            resizeMode="contain"
                                                        />
                                                    );
                                                }

                                                // Priority 2: High Quality Exercise Image (GymVisual) - Fallback
                                                if (activeExerciseForVideo.image_url) {
                                                    return (
                                                        <Image
                                                            source={{ uri: activeExerciseForVideo.image_url }}
                                                            className="w-full h-full"
                                                            resizeMode="contain"
                                                        />
                                                    );
                                                }

                                                return <Ionicons name="body" size={64} color={theme.colors.textMuted} />;
                                            })()}
                                        </View>
                                    </View>

                                    {/* Description Section */}
                                    {activeExerciseForVideo.description && (
                                        <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="mb-8 p-6 rounded-2xl border">
                                            <View className="flex-row items-center mb-3">
                                                <Ionicons name="information-circle-outline" size={20} color={theme.colors.textMuted} />
                                                <Text style={{ color: theme.colors.textMuted }} className="uppercase text-xs font-bold tracking-widest ml-2">
                                                    SOBRE
                                                </Text>
                                            </View>
                                            <Text style={{ color: theme.colors.textSecondary }} className="leading-7 text-base">
                                                {activeExerciseForVideo.description}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Instructions Section (if description is missing or short) */}
                                    {activeExerciseForVideo.instructions && (
                                        <View>
                                            <Text style={{ color: theme.colors.textMuted }} className="uppercase text-xs font-bold tracking-widest mb-4">
                                                INSTRUÇÕES
                                            </Text>
                                            {activeExerciseForVideo.instructions.map((inst: string, idx: number) => (
                                                <View key={idx} className="flex-row mb-4">
                                                    <Text style={{ color: theme.colors.primary }} className="font-bold mr-3">{idx + 1}.</Text>
                                                    <Text style={{ color: theme.colors.textSecondary }} className="flex-1 leading-6">{inst}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}
