import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { SavedWorkout } from '../context/SavedWorkoutsContext';
import { useWorkout } from '../context/WorkoutContext';
import { useRouter, usePathname, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

interface WorkoutPreviewModalProps {
    visible: boolean;
    workout: SavedWorkout | null;
    onClose: () => void;
    onStart: () => void;
    onToggleFavorite?: () => void;
    children?: React.ReactNode;
}

export function WorkoutPreviewModal({
    visible,
    workout,
    onClose,
    onStart,
    onToggleFavorite,
    children
}: WorkoutPreviewModalProps) {
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
    const { isWorkoutActive, clearWorkout } = useWorkout();
    const router = useRouter();
    const pathname = usePathname();
    const params = useLocalSearchParams();
    const { theme } = useTheme();

    // Helper to construct current return path
    const getReturnPath = () => {
        // Simple reconstruction of current URL params
        const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        return queryString ? `${pathname}?${queryString}` : pathname;
    };

    if (!workout) return null;

    const handleOpenVideo = (videoUrl: string) => {
        setActiveVideoUrl(videoUrl);
        setShowVideoModal(true);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />
                {/* Header */}
                <View style={{ backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }} className="pt-12 pb-4 px-4 border-b">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1 mr-4">
                            <Text style={{ color: theme.colors.text }} className="text-2xl font-bold mb-1">
                                {workout.name}
                            </Text>
                            <Text style={{ color: theme.colors.textSecondary }} className="text-sm">
                                Última vez: {workout.lastDone === 'Agora' ? 'Hoje' : workout.lastDone}
                            </Text>
                            <Text style={{ color: theme.colors.textMuted }} className="text-sm">
                                {new Date(workout.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>

                        <TouchableOpacity onPress={onClose} style={{ backgroundColor: theme.colors.backgroundTertiary }} className="p-2 rounded-full">
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                {children}

                {/* Exercise List */}
                <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                    <Text style={{ color: theme.colors.text }} className="text-lg font-bold mb-3">Exercícios</Text>

                    {workout.exercises.map((exercise, index) => (
                        <View
                            key={`${exercise.id}-${index}`}
                            className="bg-transparent mb-5"
                        >
                            <View className="flex-row items-center">
                                {/* Exercise Image - Now opens Video Modal if possible */}
                                <TouchableOpacity
                                    onPress={() => {
                                        if (exercise.video_url) {
                                            handleOpenVideo(exercise.video_url);
                                        } else {
                                            // Fallback to details if no video
                                            const { router } = require('expo-router');
                                            router.push({ pathname: '/exercise/[id]', params: { id: exercise.id, source: 'preview' } });
                                        }
                                    }}
                                    style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
                                    className="rounded-xl overflow-hidden border"
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
                                    onPress={() => {
                                        const { router } = require('expo-router');
                                        router.push({ pathname: '/exercise/[id]', params: { id: exercise.id, source: 'preview' } });
                                    }}
                                >
                                    <View>
                                        <Text style={{ color: theme.colors.text }} className="font-bold text-xl mb-1" numberOfLines={2}>
                                            {exercise.name}
                                        </Text>

                                        {exercise.sets && exercise.sets.length > 0 ? (
                                            <Text style={{ color: theme.colors.textSecondary }} className="text-lg">
                                                {exercise.sets.length} Séries • {exercise.sets[0].reps} reps
                                            </Text>
                                        ) : (
                                            <Text style={{ color: theme.colors.textSecondary }} className="text-lg">
                                                3 Séries • 10 reps
                                            </Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    <View className="h-32" />
                </ScrollView>

                {/* Bottom Button */}
                {!isWorkoutActive ? (
                    <View style={{ backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }} className="px-4 pb-8 pt-4 border-t">
                        <TouchableOpacity
                            onPress={onStart}
                            style={{ backgroundColor: theme.colors.primary }}
                            className="rounded-full py-5 flex-row items-center justify-center shadow-sm"
                            activeOpacity={0.8}
                        >
                            <Text style={{ color: '#FFFFFF' }} className="font-bold text-xl ml-2">
                                Iniciar Treino
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // Active Workout Notification Footer (Injected)
                    <View className="absolute bottom-[20px] left-4 right-4 z-50">
                        <View
                            style={{
                                backgroundColor: theme.colors.card,
                                borderColor: theme.colors.border,
                                shadowColor: theme.mode === 'light' ? '#000' : '#000',
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
                                        onClose();
                                        // Pass specific return path to ensure minimizing returns here
                                        router.push({
                                            pathname: '/workout',
                                            params: { returnTo: getReturnPath() }
                                        });
                                    }}
                                    className="flex-row items-center"
                                >
                                    <Ionicons name="play" size={18} color={theme.colors.primary} />
                                    <Text style={{ color: theme.colors.primary }} className="font-bold ml-2">Retomar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        const { Alert, Platform } = require('react-native');
                                        Alert.alert(
                                            "Descartar Treino",
                                            "Tem certeza que deseja descartar o treino atual?",
                                            [
                                                {
                                                    text: "Cancelar",
                                                    style: "cancel"
                                                },
                                                {
                                                    text: "Descartar",
                                                    style: "destructive",
                                                    onPress: () => {
                                                        clearWorkout();
                                                        onClose();
                                                        router.replace('/');
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

                {/* Internal Video Modal */}
                <Modal
                    visible={showVideoModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowVideoModal(false)}
                >
                    <View style={{ backgroundColor: theme.colors.background }} className="flex-1 justify-center">
                        <TouchableOpacity
                            onPress={() => setShowVideoModal(false)}
                            style={{ backgroundColor: theme.colors.card }}
                            className="absolute top-12 right-6 z-50 p-2 rounded-full shadow-sm"
                        >
                            <Ionicons name="close" size={28} color={theme.colors.text} />
                        </TouchableOpacity>

                        {activeVideoUrl && (
                            <View className="w-full aspect-square" style={{ backgroundColor: theme.colors.background }}>
                                <Video
                                    source={{ uri: activeVideoUrl }}
                                    rate={1.0}
                                    volume={1.0}
                                    isMuted={false}
                                    resizeMode={ResizeMode.CONTAIN}
                                    shouldPlay
                                    isLooping
                                    useNativeControls
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </View>
                        )}
                    </View>
                </Modal>
            </View>
        </Modal>
    );
}
