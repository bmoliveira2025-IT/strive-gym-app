import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Switch, Image, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useWorkoutHistory } from '../context/WorkoutHistoryContext';
import { useTheme } from '../context/ThemeContext';

interface WorkoutFinishModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: {
        workoutName: string;
        notes: string;
        date: Date;
        duration: number;
        updateRoutineValues: boolean;
        shareToStrava: boolean;
        shareToHealthConnect: boolean;
        media: string[];
    }) => void;
    defaultWorkoutName?: string;
    duration: number;
}

export function WorkoutFinishModal({
    visible,
    onClose,
    onSave,
    defaultWorkoutName = '',
    duration
}: WorkoutFinishModalProps) {
    const { theme } = useTheme();
    const { history } = useWorkoutHistory();
    const [workoutName, setWorkoutName] = useState(defaultWorkoutName);
    const [notes, setNotes] = useState('');
    const [date] = useState(new Date());
    const [updateRoutineValues, setUpdateRoutineValues] = useState(true);
    const [shareToStrava, setShareToStrava] = useState(false);
    const [shareToHealthConnect, setShareToHealthConnect] = useState(false);
    const [media, setMedia] = useState<string[]>([]);

    // Calculate Streak (Current consecutive weeks with at least one workout)
    const streakWeeks = useMemo(() => {
        if (history.length === 0) return 1; // This one counts!

        const activeDays = new Set<string>();
        // Add current day if we are finishing today
        activeDays.add(new Date().toISOString().split('T')[0]);

        history.forEach(h => {
            const dateStr = new Date(h.date).toISOString().split('T')[0];
            activeDays.add(dateStr);
        });

        const getWeekKey = (date: Date) => {
            const year = date.getFullYear();
            const firstDayOfYear = new Date(year, 0, 1);
            const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
            const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            return `${year}-W${weekNumber}`;
        };

        const weeksWithWorkouts = new Set<string>();
        activeDays.forEach(dateStr => {
            const date = new Date(dateStr);
            weeksWithWorkouts.add(getWeekKey(date));
        });

        const today = new Date();
        let streakCount = 0;

        // Count backwards for consecutive weeks
        while (true) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - (7 * streakCount));
            const weekToCheck = getWeekKey(checkDate);

            if (weeksWithWorkouts.has(weekToCheck)) {
                streakCount++;
            } else {
                break;
            }
        }

        return streakCount || 1;
    }, [history, visible]);

    const pickMedia = async () => {
        // Request permissions
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permissão necessária', 'É necessário permitir acesso à galeria de fotos.');
            return;
        }

        // Open image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets) {
            const newMedia = result.assets.map(asset => asset.uri);
            setMedia([...media, ...newMedia]);
        }
    };

    const removeMedia = (index: number) => {
        setMedia(media.filter((_, i) => i !== index));
    };


    const handleSave = () => {
        onSave({
            workoutName,
            notes,
            date,
            duration,
            updateRoutineValues,
            shareToStrava,
            shareToHealthConnect,
            media
        });
        onClose();
    };

    const formatDate = (date: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return `Hoje às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Ontem às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } else {
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) +
                ` às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                {/* Header */}
                <View style={{ borderBottomColor: theme.colors.border }} className="pt-12 pb-4 px-4 border-b">
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity onPress={onClose} className="p-2">
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                        <Text style={{ color: theme.colors.text }} className="text-xl font-bold">Finalizar Treino</Text>
                        <View className="w-10" />
                    </View>
                </View>

                <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
                    {/* Streak Celebration Card */}
                    <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="mb-6 rounded-2xl p-6 border flex-row items-center">
                        <View className="bg-orange-500/10 p-4 rounded-full mr-5">
                            <Ionicons name="flame" size={32} color="#FF9500" />
                        </View>
                        <View className="flex-1">
                            <Text style={{ color: theme.colors.text }} className="text-4xl font-black leading-tight">
                                {streakWeeks}
                            </Text>
                            <Text style={{ color: theme.colors.textSecondary }} className="text-lg font-bold">
                                semanas de sequência!
                            </Text>
                        </View>
                    </View>
                    {/* Workout Name */}
                    <View className="mb-4">
                        <TextInput
                            value={workoutName}
                            onChangeText={setWorkoutName}
                            placeholder="Nome do treino"
                            placeholderTextColor={theme.colors.textMuted}
                            style={{ backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }}
                            className="rounded-lg px-4 py-3 text-base border"
                        />
                    </View>

                    {/* Notes */}
                    <View className="mb-4">
                        <TextInput
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Como foi? Compartilhe mais sobre o seu treino."
                            placeholderTextColor={theme.colors.textMuted}
                            multiline
                            numberOfLines={3}
                            style={{ backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border, minHeight: 80, textAlignVertical: 'top' }}
                            className="rounded-lg px-4 py-3 text-base border"
                        />
                    </View>

                    {/* Add Photos/Videos */}
                    {media.length === 0 ? (
                        <TouchableOpacity
                            onPress={pickMedia}
                            style={{ backgroundColor: theme.mode === 'light' ? theme.colors.card : 'rgba(79, 143, 247, 0.05)', borderColor: theme.colors.border }}
                            className="mb-4 rounded-lg border-2 border-dashed py-12 items-center"
                        >
                            <Ionicons name="camera-outline" size={32} color={theme.colors.primary} />
                            <Text style={{ color: theme.colors.primary }} className="text-base mt-2">Adicionar Fotos/Vídeos</Text>
                        </TouchableOpacity>
                    ) : (
                        <View className="mb-4">
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                                {media.map((uri, index) => (
                                    <View key={index} className="mr-3 relative">
                                        <Image
                                            source={{ uri }}
                                            className="w-24 h-24 rounded-lg"
                                            resizeMode="cover"
                                        />
                                        <TouchableOpacity
                                            onPress={() => removeMedia(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                                        >
                                            <Ionicons name="close" size={16} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                            <TouchableOpacity
                                onPress={pickMedia}
                                style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
                                className="rounded-lg border py-3 flex-row items-center justify-center"
                            >
                                <Ionicons name="add" size={20} color={theme.colors.primary} />
                                <Text style={{ color: theme.colors.primary }} className="text-base ml-2">Adicionar mais</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Date Display */}
                    <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="mb-4 rounded-lg px-4 py-3 flex-row items-center border">
                        <Ionicons name="calendar-outline" size={20} color={theme.colors.textMuted} />
                        <Text style={{ color: theme.colors.text }} className="text-base ml-3">{formatDate(date)}</Text>
                    </View>

                    {/* Duration Display */}
                    <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="mb-4 rounded-lg px-4 py-3 flex-row items-center border">
                        <Ionicons name="time-outline" size={20} color={theme.colors.textMuted} />
                        <Text style={{ color: theme.colors.text }} className="text-base ml-3">{formatDuration(duration)}</Text>
                    </View>

                    {/* Update Routine Values */}
                    <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="mb-4 rounded-lg px-4 py-3 flex-row items-center justify-between border">
                        <View className="flex-row items-center flex-1">
                            <Text style={{ color: theme.colors.text }} className="text-base flex-1">Atualizar valores da rotina</Text>
                            <TouchableOpacity className="ml-2">
                                <Ionicons name="information-circle-outline" size={20} color={theme.colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <Switch
                            value={updateRoutineValues}
                            onValueChange={setUpdateRoutineValues}
                            trackColor={{ false: theme.mode === 'light' ? '#E5E7EB' : '#333', true: theme.colors.primary }}
                            thumbColor={Platform.OS === 'ios' ? undefined : (updateRoutineValues ? '#fff' : '#999')}
                        />
                    </View>

                    {/* Integrations Section */}
                    <Text style={{ color: theme.colors.text }} className="text-lg font-bold mb-3">Integrações</Text>

                    {/* Strava */}
                    <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="mb-3 rounded-lg px-4 py-3 flex-row items-center justify-between border">
                        <View className="flex-row items-center flex-1">
                            <View className="w-8 h-8 bg-[#FC4C02] rounded-sm items-center justify-center mr-3">
                                <Ionicons name="flash" size={18} color="white" />
                            </View>
                            <Text style={{ color: theme.colors.text }} className="text-base">Postar no Strava</Text>
                        </View>
                        <Switch
                            value={shareToStrava}
                            onValueChange={setShareToStrava}
                            trackColor={{ false: theme.mode === 'light' ? '#E5E7EB' : '#333', true: theme.colors.primary }}
                            thumbColor={Platform.OS === 'ios' ? undefined : (shareToStrava ? '#fff' : '#999')}
                        />
                    </View>

                    {/* Health Connect */}
                    <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="mb-6 rounded-lg px-4 py-3 flex-row items-center justify-between border">
                        <View className="flex-row items-center flex-1">
                            <View className="w-8 h-8 bg-[#0077CC] rounded-sm items-center justify-center mr-3">
                                <Ionicons name="fitness" size={18} color="white" />
                            </View>
                            <Text style={{ color: theme.colors.text }} className="text-base">Postar no Health Connect</Text>
                        </View>
                        <Switch
                            value={shareToHealthConnect}
                            onValueChange={setShareToHealthConnect}
                            trackColor={{ false: theme.mode === 'light' ? '#E5E7EB' : '#333', true: theme.colors.primary }}
                            thumbColor={Platform.OS === 'ios' ? undefined : (shareToHealthConnect ? '#fff' : '#999')}
                        />
                    </View>

                    <View className="h-32" />
                </ScrollView>

                {/* Save Button */}
                <View style={{ backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }} className="px-4 pb-8 pt-4 border-t">
                    <TouchableOpacity
                        onPress={handleSave}
                        style={{ backgroundColor: theme.colors.text }}
                        className="rounded-full py-4 items-center"
                    >
                        <Text style={{ color: theme.colors.background }} className="text-base font-bold">Salvar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
