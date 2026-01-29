import { useState, useRef } from 'react';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useWorkout } from '../../context/WorkoutContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useSavedWorkouts } from '../../context/SavedWorkoutsContext';
import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MUSCLE_IMAGES } from '../../constants/muscleImages';
import { MUSCLE_INFO } from '../../constants/muscleInfo';
// @ts-ignore
import exercises from '../../assets/exercises.json';

// Translation dictionaries
const BODY_PART_TRANSLATION: Record<string, string> = {
    'chest': 'Peito',
    'back': 'Costas',
    'upper back': 'Costas Superiores',
    'lower back': 'Costas Inferiores',
    'biceps': 'Bíceps',
    'triceps': 'Tríceps',
    'quadriceps': 'Quadríceps',
    'hamstrings': 'Posteriores',
    'shoulders': 'Ombros',
    'hips': 'Quadris',
    'waist': 'Cintura',
    'upper arms': 'Braços',
    'calves': 'Panturrilhas',
    'forearms': 'Antebraços',
    'neck': 'Pescoço',
    'cardio': 'Cardio',
    'glutes': 'Glúteos',
    'abs': 'Abdômen',
};

const EQUIPMENT_TRANSLATION: Record<string, string> = {
    'barbell': 'Barra',
    'dumbbell': 'Halter',
    'cable': 'Cabo',
    'machine': 'Máquina',
    'body weight': 'Peso Corporal',
    'kettlebell': 'Kettlebell',
    'resistance band': 'Faixa Elástica',
    'bench': 'Banco',
    'none': 'Nenhum',
};

export default function ExerciseDetailScreen() {
    const { id, source } = useLocalSearchParams();
    const router = useRouter();
    const { addToWorkout } = useWorkout();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { isCreatingPlan, addToPlan } = useSavedWorkouts();
    const exercise = exercises.find((e: any) => e.id.toString() === id);
    const exerciseId = id?.toString() || '';
    const isExerciseFavorite = isFavorite(exerciseId);

    // Video State
    const video = useRef<Video>(null);
    const [status, setStatus] = useState<any>({});

    const handleGoBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            // Fallback navigation if no history exists (e.g. deep link)
            router.replace('/');
        }
    };

    if (!exercise) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <Text className="text-text">Exercício não encontrado.</Text>
            </View>
        );
    }

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

    // Theme context
    const { theme } = require('../../context/ThemeContext').useTheme();

    return (
        <View style={{ backgroundColor: theme.colors.background }} className="flex-1">
            <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />

            {/* Favorite Button */}
            <Stack.Screen options={{
                headerShown: false,
            }} />

            {/* Premium Back Button */}
            <TouchableOpacity
                onPress={handleGoBack}
                style={{
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8
                }}
                className="absolute top-12 left-6 z-50 p-3 rounded-full border shadow-2xl"
            >
                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Video Section */}
                {exercise.video_url && (
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {
                            if (status.isPlaying) {
                                video.current?.pauseAsync();
                            } else {
                                video.current?.playAsync();
                            }
                        }}
                        style={{ backgroundColor: theme.colors.card }}
                        className="w-full aspect-square mb-6 relative justify-center items-center"
                    >
                        <Video
                            ref={video}
                            source={{ uri: exercise.video_url }}
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
                            <View className="absolute bg-black/40 p-4 rounded-full">
                                <Ionicons name="play" size={48} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>
                )}

                <View className="px-6">
                    {/* Header */}
                    <View className="items-center mb-8">
                        <Text style={{ color: theme.colors.text }} className="text-3xl font-extrabold text-center leading-tight mb-4">
                            {exercise.name}
                        </Text>

                        {/* Tags Row */}
                        <View className="flex-row flex-wrap justify-center gap-2">
                            {/* Body Part Tag */}
                            {exercise.body_parts && (
                                <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="px-3 py-1 rounded-lg border">
                                    <Text className="text-blue-400 text-xs font-bold uppercase tracking-wider">
                                        {Array.isArray(exercise.body_parts)
                                            ? (BODY_PART_TRANSLATION[exercise.body_parts[0].toLowerCase()] || exercise.body_parts[0])
                                            : (BODY_PART_TRANSLATION[(exercise.body_parts as string).toLowerCase()] || exercise.body_parts)}
                                    </Text>
                                </View>
                            )}

                            {/* Equipment Tag */}
                            {exercise.equipment && (
                                <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="px-3 py-1 rounded-lg border">
                                    <Text style={{ color: theme.colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider">
                                        {Array.isArray(exercise.equipment)
                                            ? (EQUIPMENT_TRANSLATION[exercise.equipment[0].toLowerCase()] || exercise.equipment[0])
                                            : (EQUIPMENT_TRANSLATION[(exercise.equipment as string).toLowerCase()] || exercise.equipment)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Quick Tools Row (Favorites, etc) - keeping minimal logic for now, matching preview style mostly but maintaining function */}
                    <View className="flex-row justify-center gap-4 mb-10">
                        <TouchableOpacity
                            onPress={() => toggleFavorite(exerciseId)}
                            style={{
                                backgroundColor: isExerciseFavorite ? 'rgba(239, 68, 68, 0.2)' : theme.colors.card,
                                borderColor: isExerciseFavorite ? '#EF4444' : theme.colors.border
                            }}
                            className={`flex-row items-center px-4 py-2 rounded-full border`}
                        >
                            <Ionicons name={isExerciseFavorite ? "heart" : "heart-outline"} size={20} color={isExerciseFavorite ? "#EF4444" : theme.colors.textMuted} />
                            <Text style={{ color: isExerciseFavorite ? '#F87171' : theme.colors.textSecondary }} className="ml-2 font-medium">
                                Favoritos
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Muscle Map Section - Professional Layout */}
                    <View className="mb-10 w-full">
                        <Text style={{ color: theme.colors.textMuted }} className="uppercase text-xs font-bold tracking-widest mb-4 pl-1">
                            MÚSCULOS ALVO
                        </Text>
                        <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="w-full h-64 rounded-3xl items-center justify-center p-4 border">
                            {(() => {
                                // Priority 1: High Quality Muscle Map (Transparent)
                                const primaryPart = Array.isArray(exercise.body_parts)
                                    ? exercise.body_parts[0]
                                    : exercise.body_parts;
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
                                if (exercise.image_url) {
                                    return (
                                        <Image
                                            source={{ uri: exercise.image_url }}
                                            className="w-full h-full"
                                            resizeMode="contain"
                                        />
                                    );
                                }

                                return <Ionicons name="body" size={64} color={theme.colors.textMuted} />;
                            })()}
                        </View>
                    </View>

                    {/* Instructions / Description */}
                    {exercise.description && (
                        <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="mb-8 p-6 rounded-2xl border">
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="information-circle-outline" size={20} color={theme.colors.textMuted} />
                                <Text style={{ color: theme.colors.textMuted }} className="uppercase text-xs font-bold tracking-widest ml-2">
                                    SOBRE
                                </Text>
                            </View>
                            <Text style={{ color: theme.colors.text }} className="leading-7 text-base">
                                {exercise.description}
                            </Text>
                        </View>
                    )}

                    {exercise.instructions && (
                        <View className="mb-8">
                            <Text style={{ color: theme.colors.textMuted }} className="uppercase text-xs font-bold tracking-widest mb-4 pl-1">
                                INSTRUÇÕES
                            </Text>
                            {exercise.instructions.map((step: string, index: number) => (
                                <View key={index} className="flex-row mb-4">
                                    <Text style={{ color: theme.colors.primary }} className="font-bold mr-4 text-lg">{index + 1}.</Text>
                                    <Text style={{ color: theme.colors.text }} className="flex-1 leading-7 text-base pt-0.5">{step}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Tips */}
                    {exercise.tips && exercise.tips.length > 0 && (
                        <View className="mt-6 bg-yellow-500/10 p-5 rounded-2xl border border-yellow-500/20">
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="bulb" size={20} color="#F59E0B" />
                                <Text className="text-yellow-600 font-bold text-sm uppercase tracking-wider ml-2">Dica Pro</Text>
                            </View>
                            {exercise.tips.map((tip: string, index: number) => (
                                <Text key={index} className="text-yellow-600/80 mb-2 leading-6 pl-2 border-l-2 border-yellow-500/30 text-sm">• {tip}</Text>
                            ))}
                        </View>
                    )}

                    <View className="h-24" />
                </View>
            </ScrollView>
        </View>
    );
}
