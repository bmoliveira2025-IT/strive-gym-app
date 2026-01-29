import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LibraryView } from './LibraryView';

export default function ReplaceExerciseView({
    onClose,
    onSelect
}: {
    onClose: () => void,
    onSelect: (exercise: any) => void
}) {
    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="pt-12 pb-2 px-4 bg-black border-b border-zinc-900">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={onClose} className="p-1 mr-4">
                        <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Substituir Exercício</Text>
                </View>
            </View>

            {/* Standard Library View */}
            <LibraryView
                onExerciseSelect={(exercise) => {
                    onSelect(exercise);
                    onClose();
                }}
                allowMultiSelect={false}
                hideHeader={false}
                initialCategory="all"
            />
        </View>
    );
}
