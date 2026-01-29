import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';

// Import exercise data
const exercisesData = require('../assets/exercises.json');

// Category definitions with Ionicons
const CATEGORIES = [
    { id: 'all', name: 'Todos', icon: 'grid-outline' },
    { id: 'favorites', name: 'Favoritos', icon: 'heart' },
    { id: 'cardio', name: 'Cardio', icon: 'fitness' },
    { id: 'chest', name: 'Peito', icon: 'body' },
    { id: 'back', name: 'Costas', icon: 'body-outline' },
    { id: 'biceps', name: 'Bíceps', icon: 'barbell' },
    { id: 'triceps', name: 'Tríceps', icon: 'barbell-outline' },
    { id: 'quadriceps', name: 'Quadríceps', icon: 'footsteps' },
    { id: 'hamstrings', name: 'Posteriores', icon: 'walk' },
    { id: 'shoulders', name: 'Ombros', icon: 'hand-left' },
    { id: 'hips', name: 'Quadris', icon: 'accessibility' },
    { id: 'waist', name: 'Cintura', icon: 'resize' },
    { id: 'upper_arms', name: 'Braços', icon: 'hand-right' },
    { id: 'calves', name: 'Panturrilhas', icon: 'footsteps-outline' },
    { id: 'forearms', name: 'Antebraços', icon: 'hand-left-outline' },
    { id: 'neck', name: 'Pescoço', icon: 'person' },
];

const BODY_PART_MAPPING: Record<string, string[]> = {
    all: [],
    favorites: [],
    cardio: ['cardio'],
    chest: ['chest'],
    back: ['upper back', 'lower back', 'back'],
    biceps: ['biceps'],
    triceps: ['triceps'],
    quadriceps: ['quadriceps'],
    hamstrings: ['hamstrings'],
    shoulders: ['shoulders'],
    hips: ['hips'],
    waist: ['waist'],
    upper_arms: ['upper arms'],
    calves: ['calves'],
    forearms: ['forearms'],
    neck: ['neck'],
};

const BODY_PART_TRANSLATION: Record<string, string> = {
    'chest': 'Peito',
    'back': 'Costas',
    'upper back': 'Costas Superiores',
    'lower back': 'Costas Inferiores',
    'biceps': 'Bíceps',
    'triceps': 'Tríceps',
    'quadriceps': 'Quadríceps',
    'hamstrings': 'Posteriores',
    'shoulders': 'Ombros',
    'hips': 'Quadris',
    'waist': 'Cintura',
    'upper arms': 'Braços',
    'calves': 'Panturrilhas',
    'forearms': 'Antebraços',
    'neck': 'Pescoço',
    'cardio': 'Cardio',
    'glutes': 'Glúteos',
    'abs': 'Abdômen',
    'abdominals': 'Abdominais',
    'lats': 'Dorsais',
};

export function LibraryView({
    onExerciseSelect,
    initialCategory = 'all',
    hideHeader = false,
    externalSearchQuery = '',
    onCategoryChange,
    allowMultiSelect = false,
    onBatchSelect
}: {
    onExerciseSelect?: (exercise: any) => void,
    initialCategory?: string,
    hideHeader?: boolean,
    externalSearchQuery?: string,
    onCategoryChange?: (categoryId: string) => void,
    allowMultiSelect?: boolean,
    onBatchSelect?: (exercises: any[]) => void
}) {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Sync prop changes (for deep linking)
    useEffect(() => {
        if (initialCategory) {
            setSelectedCategory(initialCategory);
        }
    }, [initialCategory]);

    const [searchQuery, setSearchQuery] = useState('');
    const { favorites, isFavorite, toggleFavorite } = useFavorites();
    const { theme } = useTheme();

    const filteredExercises = useMemo(() => {
        let filtered = exercisesData;

        if (selectedCategory === 'favorites') {
            filtered = filtered.filter((ex: any) =>
                favorites.includes(ex.id?.toString())
            );
        } else if (selectedCategory !== 'all') {
            const targetBodyParts = BODY_PART_MAPPING[selectedCategory] || [];
            filtered = filtered.filter((ex: any) =>
                ex.body_parts?.some((part: string) =>
                    targetBodyParts.some(target => part.toLowerCase().includes(target.toLowerCase()))
                )
            );
        }

        const effectiveSearch = externalSearchQuery || searchQuery;
        if (effectiveSearch.trim()) {
            const query = effectiveSearch.toLowerCase();
            filtered = filtered.filter((ex: any) =>
                ex.name?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [selectedCategory, searchQuery, externalSearchQuery, favorites]);

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleBatchAdd = () => {
        const selectedExercises = filteredExercises.filter((ex: any) => selectedIds.has(ex.id?.toString()));

        if (onBatchSelect) {
            onBatchSelect(selectedExercises);
            setSelectedIds(new Set());
        } else if (onExerciseSelect) {
            selectedExercises.forEach((ex: any) => {
                onExerciseSelect(ex);
            });
            setSelectedIds(new Set());
        }
    };

    const renderCategoryItem = ({ item }: { item: any }) => {
        const isSelected = selectedCategory === item.id;
        return (
            <TouchableOpacity
                onPress={() => {
                    setSelectedCategory(item.id);
                    if (onCategoryChange) onCategoryChange(item.id);
                }}
                activeOpacity={0.7}
                style={{
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.card, // Removed surfaceHighlight
                    borderColor: isSelected ? theme.colors.primary : theme.colors.cardBorder,
                    borderWidth: 1
                }}
                className={`mr-2 mb-2 flex-row items-center px-4 h-10 rounded-full transition-smooth`}
            >
                <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={isSelected ? '#FFFFFF' : theme.colors.textMuted}
                />
                <Text style={{ color: isSelected ? '#FFFFFF' : theme.colors.text }} className="ml-2 text-sm font-semibold">
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderGridItem = ({ item }: { item: any }) => {
        const isItemFavorite = isFavorite(item.id?.toString());
        const isSelected = selectedIds.has(item.id?.toString());

        return (
            <TouchableOpacity
                onPress={() => {
                    if (onExerciseSelect && allowMultiSelect) {
                        toggleSelection(item.id?.toString());
                    } else if (onExerciseSelect) {
                        onExerciseSelect(item);
                    } else {
                        router.push(`/exercise/${item.id}?source=library`);
                    }
                }}
                activeOpacity={0.8}
                className={`flex-1 mb-4 mx-1 rounded-xl transition-smooth ${isSelected ? 'border-2 border-primary' : ''}`}
                style={{ maxWidth: '48%' }}
            >
                <View
                    style={{
                        backgroundColor: isSelected ? (theme.mode === 'light' ? '#EBF5FF' : 'rgba(79, 143, 247, 0.2)') : theme.colors.card,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.cardBorder
                    }}
                    className="rounded-3xl overflow-hidden border h-64 shadow-sm"
                >
                    <View style={{ backgroundColor: theme.mode === 'light' ? 'transparent' : theme.colors.backgroundTertiary }} className="h-40 relative items-center justify-center">
                        {item.image_url ? (
                            <Image
                                source={{ uri: item.image_url }}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        ) : (
                            <View className="w-full h-full items-center justify-center">
                                <Ionicons name="barbell" size={32} color="#555" />
                            </View>
                        )}

                        {/* Favorite Button Overlay */}
                        <TouchableOpacity
                            onPress={() => {
                                toggleFavorite(item.id?.toString());
                            }}
                            className="absolute top-2 left-2 w-8 h-8 items-center justify-center"
                            activeOpacity={0.7}
                            onPressIn={(e) => e.stopPropagation()} // Prevent card select? No, separate touchable handles it usually.
                        >
                            <Ionicons name={isItemFavorite ? "bookmark" : "bookmark-outline"} size={22} color={isItemFavorite ? "#EF4444" : "#cbd5e1"} />
                        </TouchableOpacity>

                        {/* Info Button Overlay */}
                        <TouchableOpacity
                            onPress={() => router.push(`/exercise/${item.id}?source=library`)}
                            className="absolute top-2 right-2 w-8 h-8 items-center justify-center"
                            activeOpacity={0.7}
                        >
                            <Text className="text-zinc-400 font-bold text-lg">?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content Section */}
                    <View className="p-3 flex-1 justify-between">
                        <View>
                            <Text
                                style={{ color: isSelected ? theme.colors.primary : theme.colors.text }}
                                className="font-bold text-sm leading-4 mb-1"
                                numberOfLines={2}
                            >
                                {item.name}
                            </Text>
                            <Text style={{ color: theme.colors.textSecondary }} className="text-xs capitalize">
                                {item.body_parts && item.body_parts[0] ? (BODY_PART_TRANSLATION[item.body_parts[0].toLowerCase()] || item.body_parts[0]) : 'Geral'}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderExerciseCard = ({ item }: { item: any }) => {
        const isItemFavorite = isFavorite(item.id?.toString());
        const isSelected = selectedIds.has(item.id?.toString());

        return (
            <TouchableOpacity
                onPress={() => {
                    if (onExerciseSelect && allowMultiSelect) {
                        toggleSelection(item.id?.toString());
                    } else if (onExerciseSelect) {
                        onExerciseSelect(item);
                    } else {
                        router.push(`/exercise/${item.id}?source=library`);
                    }
                }}
                activeOpacity={0.8}
                style={{
                    backgroundColor: isSelected ? (theme.mode === 'light' ? '#EBF5FF' : 'rgba(79, 143, 247, 0.2)') : theme.colors.card,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.cardBorder
                }}
                className="rounded-xl mb-3 overflow-hidden border transition-smooth"
            >
                <View className="flex-row">
                    <View className="relative items-center justify-center bg-transparent" style={{ width: 96, height: 96 }}>
                        <Image
                            source={{ uri: item.image_url }}
                            className="w-full h-full"
                            resizeMode="contain"
                        />
                        {/* Info Button Overlay */}
                        <TouchableOpacity
                            onPress={() => router.push(`/exercise/${item.id}?source=library`)}
                            className="absolute top-1 right-1 bg-black/60 w-6 h-6 rounded-full items-center justify-center border border-white/20"
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text className="text-white font-bold text-xs">?</Text>
                        </TouchableOpacity>

                        {isItemFavorite && (
                            <View className="absolute bottom-1 right-1 bg-black/50 rounded-full p-1">
                                <Ionicons name="heart" size={12} color="#EF4444" />
                            </View>
                        )}
                    </View>

                    <View className="flex-1 p-3 justify-center">
                        <Text
                            style={{ color: isSelected ? theme.colors.primary : theme.colors.text }}
                            className="font-semibold text-base mb-1"
                            numberOfLines={2}
                        >
                            {item.name}
                        </Text>
                        <View className="flex-row flex-wrap mt-1">
                            {item.body_parts?.slice(0, 2).map((part: string, idx: number) => (
                                <View
                                    key={idx}
                                    style={{ backgroundColor: theme.colors.backgroundTertiary }}
                                    className="px-2 py-0.5 rounded-full mr-1 mb-1"
                                >
                                    <Text style={{ color: theme.colors.textSecondary }} className="text-xs capitalize">
                                        {BODY_PART_TRANSLATION[part.toLowerCase()] || part}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Right Side Action */}
                    <View className="justify-center pr-4">
                        {onExerciseSelect && allowMultiSelect ? (
                            <View className={`w-6 h-6 rounded-md items-center justify-center border ${isSelected ? 'bg-primary border-primary' : 'border-zinc-500'}`}>
                                {isSelected && <Ionicons name="checkmark" size={16} color="black" />}
                            </View>
                        ) : null}
                        {/* Removed chevron logic as clicking the card handles it anyway, keeping it clean for single select too */}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }} className="relative">
            {!hideHeader && (
                <View className="px-4 mb-2">
                    <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }} className="flex-row items-center rounded-xl px-3 h-11 mb-3 border">
                        <Ionicons name="search" size={18} color={theme.colors.textMuted} />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Buscar exercícios..."
                            placeholderTextColor={theme.colors.textMuted}
                            style={{ color: theme.colors.text }}
                            className="flex-1 ml-2 text-sm"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="flex-row items-center justify-between mb-2">
                        <FlatList
                            data={CATEGORIES}
                            renderItem={renderCategoryItem}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingRight: 16 }}
                            className="flex-1 mr-2"
                        />
                        {/* View Mode Toggle */}
                        <TouchableOpacity
                            onPress={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')}
                            style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }}
                            className="p-2 rounded-lg border"
                        >
                            <Ionicons name={viewMode === 'list' ? "grid-outline" : "list-outline"} size={20} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <FlatList
                key={viewMode} // Force re-render when switching modes
                data={filteredExercises}
                renderItem={viewMode === 'grid' ? renderGridItem : renderExerciseCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                    padding: 16,
                    paddingBottom: 150
                }}
                columnWrapperStyle={viewMode === 'grid' ? { justifyContent: 'space-between' } : undefined}
                numColumns={viewMode === 'grid' ? 2 : 1}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center justify-center py-20">
                        <Ionicons
                            name={selectedCategory === 'favorites' ? 'heart-outline' : 'clipboard-outline'}
                            size={48}
                            color="#64748B"
                        />
                        <Text className="text-text-muted mt-3 text-center">
                            {selectedCategory === 'favorites'
                                ? 'Nenhum exercício favoritado ainda.\nToque no ❤️ para adicionar favoritos!'
                                : 'Nenhum exercício encontrado'
                            }
                        </Text>
                    </View>
                }
            />

            {/* Batch Add Floating Button */}
            {selectedIds.size > 0 && onExerciseSelect && allowMultiSelect && (
                <View className="absolute bottom-10 left-6 right-6">
                    <TouchableOpacity
                        onPress={handleBatchAdd}
                        className="bg-primary py-4 rounded-xl flex-row justify-center items-center shadow-lg"
                        style={{ shadowColor: '#4F8FF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
                    >
                        <Text className="text-black font-bold text-lg mr-2">
                            Adicionar ({selectedIds.size})
                        </Text>
                        <Ionicons name="add-circle" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
