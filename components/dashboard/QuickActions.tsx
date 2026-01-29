import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export function QuickActions() {
    const router = useRouter();
    const { theme } = useTheme();

    return (
        <View className="px-6 mb-10 mt-2">
            <Text style={{ color: theme.colors.textMuted }} className="text-xs uppercase tracking-widest font-bold mb-4">Ações Rápidas</Text>

            <View className="flex-row gap-4">
                {/* Treino Livre */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push({ pathname: '/workout', params: { action: 'start_empty' } })}
                    style={{
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.cardBorder,
                        borderWidth: 1
                    }}
                    className="flex-1 rounded-3xl p-5 h-32 justify-between"
                >
                    <View className="bg-zinc-100 dark:bg-zinc-800 w-10 h-10 rounded-full items-center justify-center">
                        <Ionicons name="play" size={20} color={theme.colors.primary} />
                    </View>
                    <View>
                        <Text style={{ color: theme.colors.text }} className="font-bold text-lg leading-tight">Livre</Text>
                        <Text style={{ color: theme.colors.textMuted }} className="text-xs whitespace-nowrap">Treino vazio</Text>
                    </View>
                </TouchableOpacity>

                {/* Manual (Biblioteca) */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push({ pathname: '/workout', params: { tab: 'library' } })}
                    style={{
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.cardBorder,
                        borderWidth: 1
                    }}
                    className="flex-1 rounded-3xl p-5 h-32 justify-between"
                >
                    <View className="bg-zinc-100 dark:bg-zinc-800 w-10 h-10 rounded-full items-center justify-center">
                        <Ionicons name="library-outline" size={20} color={theme.colors.text} />
                    </View>
                    <View>
                        <Text style={{ color: theme.colors.text }} className="font-bold text-lg leading-tight">Manual</Text>
                        <Text style={{ color: theme.colors.textMuted }} className="text-xs whitespace-nowrap">Sua biblioteca</Text>
                    </View>
                </TouchableOpacity>
                {/* IA Assist */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push({ pathname: '/workout', params: { tab: 'exercises', openAI: 'true' } })}
                    style={{
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                        borderWidth: 1
                    }}
                    className="flex-1 rounded-3xl p-5 h-32 justify-between shadow-lg"
                >
                    <View className="bg-white/20 w-10 h-10 rounded-full items-center justify-center">
                        <Ionicons name="sparkles" size={20} color="#FFF" />
                    </View>
                    <View>
                        <Text style={{ color: '#FFF' }} className="font-bold text-lg leading-tight">IA Assist</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.7)' }} className="text-xs whitespace-nowrap">Sugestão</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}
