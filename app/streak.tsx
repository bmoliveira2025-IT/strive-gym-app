import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Modal, Share, Platform, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useWorkoutHistory } from '../context/WorkoutHistoryContext';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useRef } from 'react';

const screenWidth = Dimensions.get('window').width;

export default function StreakScreen() {
    const router = useRouter();
    const { history } = useWorkoutHistory();
    const [selectedTab, setSelectedTab] = useState<'pessoal' | 'amigos'>('pessoal');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showShareModal, setShowShareModal] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const viewShotRef = useRef<View>(null);

    const { theme } = require('../context/ThemeContext').useTheme();

    // Calculate Streak (Current consecutive weeks with at least one workout)
    const streakData = useMemo(() => {
        if (history.length === 0) return { weeks: 0, activeDays: new Set() };

        const activeDays = new Set<string>();
        history.forEach(h => {
            const dateStr = new Date(h.date).toISOString().split('T')[0];
            activeDays.add(dateStr);
        });

        // Calculate consecutive week streak
        const getWeekKey = (date: Date) => {
            const year = date.getFullYear();
            const firstDayOfYear = new Date(year, 0, 1);
            const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
            const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            return `${year}-W${weekNumber}`;
        };

        // Get all weeks with workouts
        const weeksWithWorkouts = new Set<string>();
        activeDays.forEach(dateStr => {
            const date = new Date(dateStr);
            weeksWithWorkouts.add(getWeekKey(date));
        });

        // Calculate current streak (consecutive weeks from most recent)
        const today = new Date();
        let currentWeek = getWeekKey(today);
        let streakCount = 0;

        // Check if current week has workout
        if (weeksWithWorkouts.has(currentWeek)) {
            streakCount = 1;
        } else {
            // Check last week (grace period)
            const lastWeek = new Date(today);
            lastWeek.setDate(lastWeek.getDate() - 7);
            currentWeek = getWeekKey(lastWeek);
            if (weeksWithWorkouts.has(currentWeek)) {
                streakCount = 1;
            } else {
                // No recent activity, streak is 0
                return { weeks: 0, activeDays };
            }
        }

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

        return {
            weeks: streakCount,
            activeDays
        };
    }, [history]);

    // Calendar logic for current selected month
    const calendarData = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        const days = [];
        // Fill empty days before first day of month
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: null });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({
                day: i,
                hasWorkout: streakData.activeDays.has(dateStr)
            });
        }

        const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(currentMonth);
        const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        return {
            days,
            displayTitle: `${capitalizedMonth} ${year}`
        };
    }, [currentMonth, streakData.activeDays]);

    const changeMonth = (offset: number) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(currentMonth.getMonth() + offset);
        setCurrentMonth(newMonth);
    };

    const weekLabels = ['Do', 'Se', 'Te', 'Qa', 'Qi', 'Sx', 'Sá'];

    const captureImage = async () => {
        try {
            if (!viewShotRef.current) return null;
            const uri = await captureRef(viewShotRef, {
                format: 'png',
                quality: 0.9,
            });
            return uri;
        } catch (error) {
            console.error('Failed to capture view:', error);
            Alert.alert('Erro', 'Não foi possível gerar a imagem para compartilhamento.');
            return null;
        }
    };

    const handleNativeShare = async () => {
        try {
            const uri = await captureImage();
            if (uri) {
                await Sharing.shareAsync(uri);
            } else {
                await Share.share({
                    message: `Mantive minha sequência de treinos por ${streakData.weeks} semanas! #GymApp #Strive`,
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSocialShare = async (platform: 'instagram' | 'whatsapp' | 'facebook' | 'x') => {
        setIsSharing(true);
        const uri = await captureImage();
        setIsSharing(false);

        if (!uri) return;

        const message = `Mantive minha sequência de treinos por ${streakData.weeks} semanas! #GymApp #Strive`;
        const encodedMessage = encodeURIComponent(message);

        let url = '';
        switch (platform) {
            case 'whatsapp':
                url = `whatsapp://send?text=${encodedMessage}`;
                break;
            case 'instagram':
                url = 'instagram://';
                // Note: Direct image sharing to stories/feed requires native modules or 
                // the system share sheet on most managed Expo setups.
                break;
            case 'facebook':
                url = 'fb://';
                break;
            case 'x':
                url = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
                break;
        }

        if (url && platform !== 'instagram' && platform !== 'facebook') {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
                return;
            }
        }

        // Fallback or Image-heavy sharing (WhatsApp/Instagram/Facebook benefit from the system sheet to send the actual image)
        await Sharing.shareAsync(uri, {
            dialogTitle: `Compartilhar no ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
            mimeType: 'image/png',
            UTI: 'public.png'
        });
    };

    const handleSaveImage = async () => {
        const uri = await captureImage();
        if (uri) {
            await Sharing.shareAsync(uri); // On mobile, this usually triggers the save option too
            Alert.alert('Sucesso', 'Imagem preparada com sucesso!');
        }
    };

    return (
        <View style={{ backgroundColor: theme.colors.background }} className="flex-1">
            <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />

            {/* Header */}
            <View style={{ backgroundColor: theme.colors.background }} className="flex-row items-center justify-between px-5 pt-14 pb-4">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-6">
                        <Ionicons name="arrow-back" size={26} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={{ color: theme.colors.text }} className="text-xl font-bold">Striscia</Text>
                </View>
                <TouchableOpacity onPress={() => setShowShareModal(true)}>
                    <MaterialCommunityIcons name="share-variant-outline" size={26} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Tabs */}
                {/* <View className="flex-row px-5 mt-4 border-b border-zinc-900"> */}
                <View style={{ borderBottomColor: theme.colors.border }} className="flex-row px-5 mt-4 border-b">
                    <TouchableOpacity
                        onPress={() => setSelectedTab('pessoal')}
                        style={{ borderBottomColor: selectedTab === 'pessoal' ? theme.colors.text : 'transparent' }}
                        className={`flex-1 items-center pb-3 ${selectedTab === 'pessoal' ? 'border-b-2' : ''}`}
                    >
                        <Text style={{ color: selectedTab === 'pessoal' ? theme.colors.text : theme.colors.textMuted }} className="font-bold">Pessoal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setSelectedTab('amigos')}
                        style={{ borderBottomColor: selectedTab === 'amigos' ? theme.colors.text : 'transparent' }}
                        className={`flex-1 items-center pb-3 ${selectedTab === 'amigos' ? 'border-b-2' : ''}`}
                    >
                        <Text style={{ color: selectedTab === 'amigos' ? theme.colors.text : theme.colors.textMuted }} className="font-bold">Amigos</Text>
                    </TouchableOpacity>
                </View>

                {/* Streak Counter */}
                <View className="flex-row items-center justify-between px-8 py-10">
                    <Text style={{ color: theme.colors.text }} className="text-[120px] font-bold leading-[120px]">{streakData.weeks}</Text>
                    <Ionicons name="flame" size={140} color={theme.mode === 'light' ? '#FF9500' : '#FF9500'} />
                </View>

                <View className="px-5 mb-8">
                    <Text style={{ color: theme.colors.text }} className="text-2xl font-bold">semana de sequência!</Text>
                </View>

                {/* Achievement Card */}
                <View className="px-5 mb-10">
                    <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="rounded-2xl p-5 flex-row items-center border">
                        <View className="bg-orange-500/10 p-3 rounded-full mr-4">
                            <Ionicons name="flame" size={24} color="#FF9500" />
                        </View>
                        <View className="flex-1">
                            <Text style={{ color: theme.colors.textSecondary }} className="text-base leading-6">
                                Você manteve uma sequência de treinos por {streakData.weeks} semanas consecutivas. Uau!
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Calendar Section */}
                <View className="px-5 mb-32">
                    <Text style={{ color: theme.colors.text }} className="text-2xl font-bold mb-6">Calendário de Sequência</Text>

                    <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="rounded-3xl p-6 border">
                        <View className="flex-row items-center justify-between mb-6">
                            <TouchableOpacity onPress={() => changeMonth(-1)}>
                                <Ionicons name="chevron-back" size={20} color={theme.colors.textMuted} />
                            </TouchableOpacity>
                            <Text style={{ color: theme.colors.text }} className="font-bold text-lg">{calendarData.displayTitle}</Text>
                            <TouchableOpacity onPress={() => changeMonth(1)}>
                                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        {/* Week Headers */}
                        <View className="flex-row justify-between mb-4">
                            {weekLabels.map((label, index) => (
                                <Text key={`${label}-${index}`} style={{ color: theme.colors.textMuted }} className="w-8 text-center text-xs font-bold">{label}</Text>
                            ))}
                        </View>

                        {/* Days Grid */}
                        <View className="flex-row flex-wrap justify-between">
                            {calendarData.days.map((item, index) => (
                                <View key={index} className="w-8 h-8 items-center justify-center mb-4">
                                    {item.day && (
                                        <View className={`w-10 h-10 items-center justify-center rounded-full ${item.hasWorkout ? 'bg-[#FF9500]' : ''}`}>
                                            <Text style={{ color: item.hasWorkout ? '#000000' : theme.colors.textMuted }} className="font-bold">
                                                {item.day}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Share Modal */}
            <Modal
                visible={showShareModal}
                transparent={true}
                animationType="slide"
            >
                <View style={{ backgroundColor: theme.colors.background }} className="flex-1">
                    <View className="pt-14 px-5 flex-row">
                        <TouchableOpacity onPress={() => setShowShareModal(false)} className="p-2">
                            <Ionicons name="close" size={32} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
                        {/* White Share Card - Keep it white as it's for sharing/branding usually, or make it theme aware too? 
                           Usually share cards are static for consistent branding, but let's leave it white for now as per design 
                           unless user requested otherwise. The modal background is now themed.
                        */}
                        <View
                            ref={viewShotRef}
                            collapsable={false}
                            className="bg-white rounded-[40px] w-[85%] aspect-[1/1.2] p-10 items-center justify-center relative overflow-hidden"
                        >
                            <View className="absolute top-8 right-8">
                                <Ionicons name="flame" size={40} color="#FF9500" />
                            </View>

                            <View className="absolute bottom-8">
                                <Text className="text-[#FF9500] text-xl font-black tracking-tighter">STRIVE</Text>
                            </View>

                            <Text className="text-[#FF9500] text-2xl font-bold mb-4">Estou em uma</Text>
                            <View>
                                <Text className="text-[#FF9500] text-[140px] font-black leading-[140px]">{streakData.weeks}</Text>
                                <View className="absolute -bottom-1 -right-2">
                                    <Text className="text-[#FF9500] text-[140px] font-black leading-[140px] opacity-20 absolute top-1 left-1">
                                        {streakData.weeks}
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-[#FF9500] text-2xl font-bold text-center mt-4">
                                sequência de treinos semanal!
                            </Text>
                        </View>

                        <View className="mt-20 w-full px-10">
                            <Text style={{ color: theme.colors.textMuted }} className="text-center font-bold text-xs tracking-widest mb-10">
                                COMPARTILHE E MARQUE STRIVE.APP
                            </Text>

                            <View className="flex-row justify-between mb-12">
                                <View className="items-center">
                                    <TouchableOpacity
                                        onPress={() => handleSocialShare('instagram')}
                                        style={{ borderColor: theme.colors.border }}
                                        className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 items-center justify-center border overflow-hidden">
                                        <LinearGradient colors={['#f9ce34', '#ee2a7b', '#6228d7']} className="absolute inset-0 w-16 h-16" />
                                        <Ionicons name="logo-instagram" size={32} color="white" />
                                    </TouchableOpacity>
                                    <Text style={{ color: theme.colors.textSecondary }} className="text-xs mt-3">Instagram</Text>
                                </View>

                                <View className="items-center">
                                    <TouchableOpacity
                                        onPress={() => handleSocialShare('facebook')}
                                        className="w-16 h-16 rounded-full bg-[#1877F2] items-center justify-center"
                                    >
                                        <Ionicons name="logo-facebook" size={32} color="white" />
                                    </TouchableOpacity>
                                    <Text style={{ color: theme.colors.textSecondary }} className="text-xs mt-3">Facebook</Text>
                                </View>

                                <View className="items-center">
                                    <TouchableOpacity
                                        onPress={() => handleSocialShare('x')}
                                        style={{ backgroundColor: '#000', borderColor: theme.colors.border }}
                                        className="w-16 h-16 rounded-full border items-center justify-center"
                                    >
                                        <Text className="text-white text-2xl font-bold">X</Text>
                                    </TouchableOpacity>
                                    <Text style={{ color: theme.colors.textSecondary }} className="text-xs mt-3">X</Text>
                                </View>

                                <View className="items-center">
                                    <TouchableOpacity
                                        onPress={() => handleSocialShare('whatsapp')}
                                        className="w-16 h-16 rounded-full bg-[#25D366] items-center justify-center"
                                    >
                                        <Ionicons name="logo-whatsapp" size={32} color="white" />
                                    </TouchableOpacity>
                                    <Text style={{ color: theme.colors.textSecondary }} className="text-xs mt-3">WhatsApp</Text>
                                </View>
                            </View>

                            {/* Action Row */}
                            <View className="flex-row justify-between px-8">
                                <View className="items-center">
                                    <TouchableOpacity
                                        onPress={handleSaveImage}
                                        style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
                                        className="w-16 h-16 rounded-full items-center justify-center border"
                                    >
                                        <Ionicons name="download-outline" size={28} color={theme.colors.text} />
                                    </TouchableOpacity>
                                    <Text style={{ color: theme.colors.textSecondary }} className="text-xs mt-3 text-center">Salvar{"\n"}Imagem</Text>
                                </View>

                                <View className="items-center">
                                    <TouchableOpacity
                                        onPress={handleNativeShare}
                                        style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
                                        className="w-16 h-16 rounded-full items-center justify-center border"
                                    >
                                        <Ionicons name="ellipsis-horizontal" size={28} color={theme.colors.text} />
                                    </TouchableOpacity>
                                    <Text style={{ color: theme.colors.textSecondary }} className="text-xs mt-3">Mais</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

// Simple LinearGradient polyfill if needed or standard use
import { LinearGradient } from 'expo-linear-gradient';
