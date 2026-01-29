import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../context/ThemeContext';
import { BlurView } from 'expo-blur';

interface WeeklySummaryProps {
    stats: {
        current: {
            count: number;
            durationFormatted: string;
            volumeFormatted: string;
        };
        diff: {
            count: number;
            durationFormatted: string;
            volumeFormatted: string;
            isCountDown: boolean;
            isDurationDown: boolean;
            isVolumeDown: boolean;
        };
    };
    history: any[]; // Passing full history for sparklines
}

export function WeeklySummary({ stats, history }: WeeklySummaryProps) {
    const { theme } = useTheme();
    const router = useRouter();
    const screenWidth = Dimensions.get('window').width;

    // Helper to generate sparkline data (last 7 days)
    const getSparklineData = (type: 'count' | 'duration' | 'volume') => {
        const data = [0, 0, 0, 0, 0, 0, 0];
        const now = new Date();
        const start = new Date();
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);

        history.forEach(h => {
            const hDate = new Date(h.date);
            if (hDate >= start) {
                const dayIndex = 6 - Math.floor((now.getTime() - hDate.getTime()) / (1000 * 60 * 60 * 24));
                if (dayIndex >= 0 && dayIndex < 7) {
                    if (type === 'count') data[dayIndex] += 1;
                    if (type === 'duration') data[dayIndex] += h.duration;
                    if (type === 'volume') data[dayIndex] += h.totalVolume;
                }
            }
        });
        // Ensure at least some variance for line render
        if (data.every(v => v === 0)) return [0, 1, 0, 0, 0, 0];
        return data;
    };

    const chartWidth = Math.max(1, (screenWidth > 0 ? screenWidth : 375) - 48 - 16) / 3;

    const MetricCard = ({ title, value, subValue, isDown, data, suffix }: any) => (
        <View
            style={{
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
                width: chartWidth
            }}
            className="rounded-2xl p-3 border overflow-hidden relative shadow-sm"
        >
            <Text style={{ color: theme.colors.textMuted }} className="text-[10px] font-bold uppercase tracking-wider mb-1">{title}</Text>
            <Text style={{ color: theme.colors.text }} className="text-xl font-black mb-1" numberOfLines={1} adjustsFontSizeToFit>{value}</Text>

            {/* Trend Pill */}
            <View className={`self-start px-1.5 py-0.5 rounded-full flex-row items-center mb-2 ${isDown ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                <Ionicons name={isDown ? "caret-down" : "caret-up"} size={8} color={isDown ? "#EF4444" : "#22C55E"} />
                <Text style={{ color: isDown ? "#EF4444" : "#22C55E" }} className="text-[10px] font-bold ml-1">{subValue}</Text>
            </View>

            {/* Micro Chart */}
            <View className="absolute bottom-0 left-0 right-0 h-8 opacity-30">
                <LineChart
                    data={{
                        labels: [],
                        datasets: [{ data: data }]
                    }}
                    width={chartWidth}
                    height={40}
                    withDots={false}
                    withInnerLines={false}
                    withOuterLines={false}
                    withVerticalLines={false}
                    withHorizontalLines={false}
                    withVerticalLabels={false}
                    withHorizontalLabels={false}
                    chartConfig={{
                        backgroundGradientFrom: theme.colors.card,
                        backgroundGradientTo: theme.colors.card,
                        paddingTop: 0,
                        paddingRight: 0,
                        color: (opacity = 1) => isDown ? `rgba(239, 68, 68, ${opacity})` : `rgba(34, 197, 94, ${opacity})`,
                        strokeWidth: 2,
                    }}
                    bezier
                    style={{ paddingRight: 0, paddingLeft: 0 }}
                />
            </View>
        </View>
    );

    return (
        <View className="px-6 mb-8">
            <View className="flex-row items-center justify-between mb-4">
                <Text style={{ color: theme.colors.text }} className="text-lg font-bold">Resumo Semanal</Text>
                <TouchableOpacity onPress={() => router.push('/progress')}>
                    <Text style={{ color: theme.colors.primary }} className="text-sm font-semibold">Ver detalhes</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-between gap-2">
                <MetricCard
                    title="Treinos"
                    value={stats.current.count}
                    subValue={Math.abs(stats.diff.count)}
                    isDown={stats.diff.isCountDown}
                    data={getSparklineData('count')}
                />
                <MetricCard
                    title="Duração"
                    value={stats.current.durationFormatted}
                    subValue={stats.diff.durationFormatted}
                    isDown={stats.diff.isDurationDown}
                    data={getSparklineData('duration')}
                />
                <MetricCard
                    title="Volume"
                    value={stats.current.volumeFormatted}
                    subValue={stats.diff.volumeFormatted}
                    isDown={stats.diff.isVolumeDown}
                    data={getSparklineData('volume')}
                />
            </View>
        </View>
    );
}
