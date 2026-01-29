import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfile } from '../context/UserProfileContext';
import { useWorkoutHistory } from '../context/WorkoutHistoryContext';
import { useTheme } from '../context/ThemeContext';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { MetricsCard } from '../components/profile/MetricsCard';
import { ObjectiveCard } from '../components/profile/ObjectiveCard';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { TrainingHistoryList } from '../components/profile/TrainingHistoryList';

export default function ProfileScreen() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { profile, updateProfile } = useUserProfile();
    const { history } = useWorkoutHistory();
    const [showEditModal, setShowEditModal] = useState(false);

    // Calculate BMI
    const bmi = useMemo(() => {
        if (!profile?.weight || !profile?.height) return undefined;
        const heightInMeters = profile.height / 100;
        return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }, [profile?.weight, profile?.height]);

    // Calculate statistics
    const stats = useMemo(() => {
        const totalWorkouts = history.length;
        const totalTime = history.reduce((acc, curr) => acc + curr.duration, 0);
        const totalVolume = history.reduce((acc, curr) => acc + curr.totalVolume, 0);

        const formatTime = (seconds: number) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            if (h > 0) return `${h}h ${m}m`;
            return `${m}min`;
        };

        const formatVolume = (v: number) => {
            if (v >= 1000) {
                return (v / 1000).toFixed(1) + 't';
            }
            return v.toFixed(0) + 'kg';
        };

        return {
            totalWorkouts,
            totalTime: formatTime(totalTime),
            totalVolume: formatVolume(totalVolume),
        };
    }, [history]);

    const handleSaveProfile = async (
        weight?: number,
        height?: number,
        objective?: 'hipertrofia' | 'força' | 'cutting'
    ) => {
        await updateProfile({ weight, height, objective });
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />

            {/* Header */}
            <ProfileHeader onEditPress={() => setShowEditModal(true)} />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Personal Metrics Section */}
                <View className="px-5 mb-6">
                    <Text style={{ color: theme.colors.textMuted }} className="text-xs uppercase tracking-widest font-bold mb-4"
                    >
                        Métricas Pessoais
                    </Text>
                    <View className="flex-row gap-3 mb-3">
                        <MetricsCard
                            icon="scale-outline"
                            label="Peso"
                            value={profile?.weight?.toString()}
                            unit="kg"
                            onPress={() => setShowEditModal(true)}
                        />
                        <MetricsCard
                            icon="resize-outline"
                            label="Altura"
                            value={profile?.height?.toString()}
                            unit="cm"
                            onPress={() => setShowEditModal(true)}
                        />
                    </View>
                    {bmi && (
                        <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }} className="rounded-2xl p-4 border">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View style={{ backgroundColor: theme.colors.backgroundTertiary }} className="p-2 rounded-full mr-3">
                                        <Ionicons name="fitness-outline" size={18} color={theme.colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={{ color: theme.colors.textSecondary }} className="text-xs font-medium">IMC</Text>
                                        <Text style={{ color: theme.colors.text }} className="text-xl font-bold mt-1">{bmi}</Text>
                                    </View>
                                </View>
                                <View style={{ backgroundColor: theme.colors.backgroundTertiary }} className="px-3 py-1.5 rounded-full">
                                    <Text style={{ color: theme.colors.textSecondary }} className="text-xs">
                                        {parseFloat(bmi) < 18.5 ? 'Abaixo' :
                                            parseFloat(bmi) < 25 ? 'Normal' :
                                                parseFloat(bmi) < 30 ? 'Sobrepeso' : 'Obeso'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Objective Section */}
                <View className="px-5 mb-6">
                    <Text style={{ color: theme.colors.textMuted }} className="text-xs uppercase tracking-widest font-bold mb-4">
                        Foco do Treino
                    </Text>
                    <ObjectiveCard
                        currentObjective={profile?.objective}
                        onPress={() => setShowEditModal(true)}
                    />
                </View>

                {/* Statistics Overview */}
                <View className="px-5 mb-6">
                    <Text style={{ color: theme.colors.textMuted }} className="text-xs uppercase tracking-widest font-bold mb-4">
                        Estatísticas Gerais
                    </Text>
                    <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }} className="rounded-2xl p-5 border">
                        <View className="flex-row justify-between mb-4">
                            <View className="flex-1 items-center">
                                <Text style={{ color: theme.colors.text }} className="text-3xl font-bold">{stats.totalWorkouts}</Text>
                                <Text style={{ color: theme.colors.textMuted }} className="text-xs mt-1">Treinos</Text>
                            </View>
                            <View style={{ backgroundColor: theme.colors.border }} className="w-px" />
                            <View className="flex-1 items-center">
                                <Text style={{ color: theme.colors.text }} className="text-3xl font-bold">{stats.totalTime}</Text>
                                <Text style={{ color: theme.colors.textMuted }} className="text-xs mt-1">Tempo Total</Text>
                            </View>
                            <View style={{ backgroundColor: theme.colors.border }} className="w-px" />
                            <View className="flex-1 items-center">
                                <Text style={{ color: theme.colors.text }} className="text-3xl font-bold">{stats.totalVolume}</Text>
                                <Text style={{ color: theme.colors.textMuted }} className="text-xs mt-1">Volume Total</Text>
                            </View>
                        </View>

                        {/* Streak Button */}
                        <TouchableOpacity
                            onPress={() => router.push('/streak')}
                            style={{ backgroundColor: theme.colors.backgroundTertiary, borderColor: theme.colors.border }}
                            className="rounded-xl p-3 flex-row items-center justify-between border"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="flame" size={20} color="#FF9500" />
                                <Text style={{ color: theme.colors.text }} className="text-sm font-medium ml-2">Ver Sequência</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Settings Section */}
                <View className="px-5 mb-6">
                    <Text style={{ color: theme.colors.textMuted }} className="text-xs uppercase tracking-widest font-bold mb-4">
                        Configurações
                    </Text>
                    <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }} className="rounded-2xl border p-4">
                        <TouchableOpacity
                            onPress={() => setTheme(theme.mode === 'light' ? 'dark' : 'light')}
                            className="flex-row items-center justify-between"
                            activeOpacity={0.7}
                        >
                            <View className="flex-row items-center flex-1">
                                <View style={{ backgroundColor: theme.colors.backgroundTertiary }} className="p-2 rounded-full mr-3">
                                    <Ionicons
                                        name={theme.mode === 'light' ? 'sunny' : 'moon'}
                                        size={20}
                                        color={theme.colors.primary}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text style={{ color: theme.colors.text }} className="text-base font-medium">Tema</Text>
                                    <Text style={{ color: theme.colors.textSecondary }} className="text-sm mt-0.5">
                                        {theme.mode === 'light' ? 'Claro' : 'Escuro'}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Training History */}
                <View className="px-5 mb-6">
                    <TrainingHistoryList
                        history={history}
                        maxItems={5}
                        onViewAll={() => router.push('/progress')}
                    />
                </View>
            </ScrollView>

            {/* Edit Profile Modal */}
            <EditProfileModal
                visible={showEditModal}
                currentWeight={profile?.weight}
                currentHeight={profile?.height}
                currentObjective={profile?.objective}
                onSave={handleSaveProfile}
                onClose={() => setShowEditModal(false)}
            />
        </View>
    );
}
