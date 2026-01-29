import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { TrainingObjective } from '../../context/UserProfileContext';
import { useTheme } from '../../context/ThemeContext';

interface EditProfileModalProps {
    visible: boolean;
    currentWeight?: number;
    currentHeight?: number;
    currentObjective?: TrainingObjective;
    onSave: (weight?: number, height?: number, objective?: TrainingObjective) => void;
    onClose: () => void;
}

const objectives: { value: TrainingObjective; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
    { value: 'hipertrofia', label: 'Hipertrofia', icon: 'fitness', color: '#4F8FF7' },
    { value: 'força', label: 'Força', icon: 'barbell', color: '#EF4444' },
    { value: 'cutting', label: 'Definição', icon: 'flame', color: '#22C55E' },
];

export function EditProfileModal({
    visible,
    currentWeight,
    currentHeight,
    currentObjective,
    onSave,
    onClose
}: EditProfileModalProps) {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [objective, setObjective] = useState<TrainingObjective | undefined>(currentObjective);
    const { theme } = useTheme();

    useEffect(() => {
        setWeight(currentWeight ? currentWeight.toString() : '');
        setHeight(currentHeight ? currentHeight.toString() : '');
        setObjective(currentObjective);
    }, [currentWeight, currentHeight, currentObjective, visible]);

    const handleSave = () => {
        const weightNum = weight ? parseFloat(weight) : undefined;
        const heightNum = height ? parseFloat(height) : undefined;
        onSave(weightNum, heightNum, objective);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end" style={{ backgroundColor: theme.colors.overlay }}>
                <View style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, maxHeight: '85%' }} className="rounded-t-3xl p-6 border-t">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6">
                        <Text style={{ color: theme.colors.text }} className="text-xl font-bold">Editar Perfil</Text>
                        <TouchableOpacity onPress={onClose} className="p-2">
                            <Ionicons name="close" size={24} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Weight Input */}
                        <View className="mb-6">
                            <Text style={{ color: theme.colors.textSecondary }} className="text-sm font-medium mb-2">Peso</Text>
                            <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="rounded-xl p-4 flex-row items-center border">
                                <Ionicons name="scale-outline" size={20} color={theme.colors.primary} />
                                <TextInput
                                    value={weight}
                                    onChangeText={setWeight}
                                    placeholder="Ex: 75"
                                    placeholderTextColor={theme.colors.textMuted}
                                    keyboardType="decimal-pad"
                                    style={{ color: theme.colors.text }}
                                    className="flex-1 text-base ml-3"
                                />
                                <Text style={{ color: theme.colors.textMuted }}>kg</Text>
                            </View>
                        </View>

                        {/* Height Input */}
                        <View className="mb-6">
                            <Text style={{ color: theme.colors.textSecondary }} className="text-sm font-medium mb-2">Altura</Text>
                            <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="rounded-xl p-4 flex-row items-center border">
                                <Ionicons name="resize-outline" size={20} color={theme.colors.primary} />
                                <TextInput
                                    value={height}
                                    onChangeText={setHeight}
                                    placeholder="Ex: 175"
                                    placeholderTextColor={theme.colors.textMuted}
                                    keyboardType="decimal-pad"
                                    style={{ color: theme.colors.text }}
                                    className="flex-1 text-base ml-3"
                                />
                                <Text style={{ color: theme.colors.textMuted }}>cm</Text>
                            </View>
                        </View>

                        {/* Objective Selector */}
                        <View className="mb-6">
                            <Text style={{ color: theme.colors.textSecondary }} className="text-sm font-medium mb-3">Objetivo</Text>
                            {objectives.map((obj) => (
                                <TouchableOpacity
                                    key={obj.value}
                                    onPress={() => setObjective(obj.value)}
                                    style={{
                                        backgroundColor: theme.colors.card,
                                        borderColor: objective === obj.value ? theme.colors.primary : theme.colors.border
                                    }}
                                    className={`rounded-xl p-4 mb-3 flex-row items-center border`}
                                    activeOpacity={0.7}
                                >
                                    <View
                                        className="p-2 rounded-full mr-3"
                                        style={{ backgroundColor: objective === obj.value ? `${obj.color}20` : theme.colors.backgroundTertiary }}
                                    >
                                        <Ionicons
                                            name={obj.icon}
                                            size={22}
                                            color={objective === obj.value ? obj.color : theme.colors.textMuted}
                                        />
                                    </View>
                                    <Text style={{ color: objective === obj.value ? theme.colors.text : theme.colors.textSecondary }} className={`text-base font-medium flex-1`}>
                                        {obj.label}
                                    </Text>
                                    {objective === obj.value && (
                                        <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View className="flex-row gap-3 mt-4">
                        <TouchableOpacity
                            onPress={onClose}
                            style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
                            className="flex-1 py-4 rounded-xl border"
                        >
                            <Text style={{ color: theme.colors.text }} className="text-center font-bold">Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSave}
                            style={{ backgroundColor: theme.colors.primary }}
                            className="flex-1 py-4 rounded-xl"
                        >
                            <Text className="text-white text-center font-bold">Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
