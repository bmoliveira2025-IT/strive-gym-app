import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Settings {
    sound: string;
    volume: string;
    vibration: string;
    rpeMode: 'Off' | 'RPE' | 'RIR';
    prevValueMode: string;
    keepActive: boolean;
    defaultRestTime: string;
}

interface WorkoutSettingsProps {
    onClose: () => void;
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export default function WorkoutSettingsView({ onClose, settings, setSettings }: WorkoutSettingsProps) {
    const { theme } = useTheme();
    const [selectionModal, setSelectionModal] = useState<{
        visible: boolean;
        title: string;
        options: string[];
        key: keyof Settings;
        type: 'checkmark' | 'radio';
    }>({
        visible: false,
        title: '',
        options: [],
        key: 'sound',
        type: 'checkmark',
    });

    const openSelection = (title: string, options: string[], key: keyof Settings, type: 'checkmark' | 'radio' = 'checkmark') => {
        setSelectionModal({ visible: true, title, options, key, type });
    };

    const handleSelect = (value: string) => {
        setSettings(prev => ({ ...prev, [selectionModal.key]: value }));
        setSelectionModal(prev => ({ ...prev, visible: false }));
    };

    const restTimeOptions = [
        'Desligada', '5s', '10s', '15s', '20s', '25s', '30s', '35s', '40s', '45s', '50s', '55s', '1m', '1m 15s', '1m 30s', '2m'
    ];

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {/* Header */}
            <View className="pt-12 pb-4 px-4">
                <TouchableOpacity onPress={onClose} className="p-1 mb-6">
                    <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                {/* Section: Timer Settings */}
                <View className="px-4 mb-8">
                    <Text style={{ color: theme.colors.text }} className="text-xl font-bold mb-6">
                        Configurações do Temporizador de Descanso
                    </Text>

                    <TouchableOpacity
                        onPress={() => openSelection('Escolha o Som', ['Padrão', 'Sino', 'Bip', 'Desativada'], 'sound')}
                        style={{ borderBottomColor: theme.colors.border }}
                        className="py-4 border-b"
                    >
                        <Text style={{ color: theme.colors.text }} className="text-base">Som</Text>
                        <Text style={{ color: theme.colors.textMuted }} className="text-sm mt-1">{settings.sound}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => openSelection('Volume', ['Baixo', 'Médio', 'Alto'], 'volume')}
                        style={{ borderBottomColor: theme.colors.border }}
                        className="py-4 border-b"
                    >
                        <Text style={{ color: theme.colors.text }} className="text-base">Volume</Text>
                        <Text style={{ color: theme.colors.textMuted }} className="text-sm mt-1">{settings.volume}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => openSelection('Vibração', ['Desativada', 'Curta', 'Média', 'Longa'], 'vibration')}
                        style={{ borderBottomColor: theme.colors.border }}
                        className="py-4 border-b"
                    >
                        <Text style={{ color: theme.colors.text }} className="text-base">Vibração</Text>
                        <Text style={{ color: theme.colors.textMuted }} className="text-sm mt-1">{settings.vibration}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => openSelection('Selecionar Tempo de Descanso Padrão', restTimeOptions, 'defaultRestTime', 'radio')}
                        style={{ borderBottomColor: theme.colors.border }}
                        className="py-4 border-b flex-row items-center justify-between"
                    >
                        <View>
                            <Text style={{ color: theme.colors.text }} className="text-base">Tempo de Descanso Padrão</Text>
                            <Text style={{ color: theme.colors.textMuted }} className="text-sm mt-1">{settings.defaultRestTime}</Text>
                        </View>
                        <Ionicons name="help-circle-outline" size={22} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Section: Preferences */}
                <View className="px-4 mb-12">
                    <Text style={{ color: theme.colors.text }} className="text-xl font-bold mb-6">Preferências</Text>

                    <TouchableOpacity
                        onPress={() => openSelection('Rastreamento', ['Off', 'RPE', 'RIR'], 'rpeMode')}
                        style={{ borderBottomColor: theme.colors.border }}
                        className="py-4 border-b flex-row items-center justify-between"
                    >
                        <View>
                            <Text style={{ color: theme.colors.text }} className="text-base">Rastreamento de RPE ou RIR</Text>
                            <Text style={{ color: theme.colors.textMuted }} className="text-sm mt-1">{settings.rpeMode}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => openSelection('Valores Anteriores', ['Qualquer treino', 'Mesmo dia', 'Recorde Pessoal'], 'prevValueMode')}
                        style={{ borderBottomColor: theme.colors.border }}
                        className="py-4 border-b flex-row items-center justify-between"
                    >
                        <View>
                            <Text style={{ color: theme.colors.text }} className="text-base">Valores do treino anterior</Text>
                            <Text style={{ color: theme.colors.textMuted }} className="text-sm mt-1">{settings.prevValueMode}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>

                    <View style={{ borderBottomColor: theme.colors.border }} className="py-4 border-b flex-row items-center justify-between">
                        <View className="flex-1 pr-4">
                            <Text style={{ color: theme.colors.text }} className="text-base">Manter Ativo</Text>
                            <Text style={{ color: theme.colors.textMuted }} className="text-sm mt-1">
                                Impede que a tela entre em modo de repouso durante os treinos
                            </Text>
                        </View>
                        <Switch
                            value={settings.keepActive}
                            onValueChange={(val) => setSettings(prev => ({ ...prev, keepActive: val }))}
                            trackColor={{ false: theme.mode === 'light' ? '#E5E7EB' : '#333', true: theme.colors.primary }}
                        />
                    </View>

                    <TouchableOpacity style={{ borderBottomColor: theme.colors.border }} className="py-4 border-b">
                        <Text style={{ color: theme.colors.text }} className="text-base">Visualização Detalhada do Treino</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Selection Modal */}
            <Modal
                visible={selectionModal.visible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectionModal(prev => ({ ...prev, visible: false }))}
            >
                <TouchableOpacity
                    className={`flex-1 ${theme.mode === 'light' ? 'bg-black/20' : 'bg-black/60'} justify-center items-center px-6`}
                    activeOpacity={1}
                    onPress={() => setSelectionModal(prev => ({ ...prev, visible: false }))}
                >
                    <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="w-full rounded-[24px] overflow-hidden border max-h-[70%] shadow-xl">
                        <View style={{ borderBottomColor: theme.colors.border }} className="p-6 border-b">
                            <Text style={{ color: theme.colors.text }} className="text-lg font-bold text-center">{selectionModal.title}</Text>
                        </View>

                        <ScrollView>
                            {selectionModal.options.map((option, index) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => handleSelect(option)}
                                    style={{ borderBottomColor: index !== selectionModal.options.length - 1 ? theme.colors.border : 'transparent' }}
                                    className="p-5 flex-row items-center justify-between border-b"
                                >
                                    <View className="flex-row items-center flex-1">
                                        {selectionModal.type === 'radio' && (
                                            <View className={`w-5 h-5 rounded-full border-2 mr-4 items-center justify-center ${settings[selectionModal.key] === option ? 'border-primary' : (theme.mode === 'light' ? 'border-zinc-300' : 'border-zinc-600')}`}>
                                                {settings[selectionModal.key] === option && (
                                                    <View style={{ backgroundColor: theme.colors.primary }} className="w-2.5 h-2.5 rounded-full" />
                                                )}
                                            </View>
                                        )}
                                        <Text style={{ color: settings[selectionModal.key] === option ? theme.colors.primary : theme.colors.text }} className="text-base">
                                            {option}
                                        </Text>
                                    </View>
                                    {selectionModal.type === 'checkmark' && settings[selectionModal.key] === option && (
                                        <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {selectionModal.type === 'radio' && (
                            <TouchableOpacity
                                onPress={() => setSelectionModal(prev => ({ ...prev, visible: false }))}
                                style={{ borderTopColor: theme.colors.border }}
                                className="p-4 border-t items-end"
                            >
                                <Text style={{ color: theme.colors.primary }} className="text-base font-bold px-4">Cancelar</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
