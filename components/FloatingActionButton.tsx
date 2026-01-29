import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FloatingActionButtonProps {
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    label?: string;
}

export function FloatingActionButton({ onPress, icon = 'add', label }: FloatingActionButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className="absolute bottom-6 right-6 bg-primary rounded-full shadow-lg items-center justify-center"
            style={{
                width: label ? undefined : 56,
                height: 56,
                paddingHorizontal: label ? 20 : 0,
                elevation: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            }}
        >
            <View className="flex-row items-center">
                <Ionicons name={icon} size={24} color="#FFFFFF" />
                {label && (
                    <Text className="text-white font-bold text-sm ml-2">{label}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}
