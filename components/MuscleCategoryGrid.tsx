import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

import { MUSCLE_GROUPS_LIST } from '../constants/muscleImages';

const MUSCLE_GROUPS = MUSCLE_GROUPS_LIST;

interface MuscleCategoryGridProps {
    onSelect: (id: string, name: string) => void;
}

export function MuscleCategoryGrid({ onSelect }: MuscleCategoryGridProps) {
    const { theme } = useTheme();
    return (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap justify-between">
                {MUSCLE_GROUPS.map((group) => (
                    <TouchableOpacity
                        key={group.id}
                        onPress={() => onSelect(group.id, group.name)}
                        activeOpacity={0.7}
                        className="w-[31%] mb-8 items-center"
                    >
                        <View className="w-full aspect-square bg-transparent items-center justify-center overflow-hidden">
                            <Image
                                source={group.image}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={{ color: theme.colors.text }} className="text-xs font-bold mt-2 text-center">
                            {group.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View className="h-32" />
        </ScrollView>
    );
}
