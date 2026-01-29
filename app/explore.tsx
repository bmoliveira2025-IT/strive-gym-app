import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { WorkoutPreviewModal } from '../components/WorkoutPreviewModal';
import { useWorkout } from '../context/WorkoutContext';
import { MuscleCategoryGrid } from '../components/MuscleCategoryGrid';
import { LibraryView } from '../components/LibraryView';
import { PROGRAMS } from '../constants/programs';
import { useTheme } from '../context/ThemeContext';

const exercisesData = require('../assets/exercises.json');



export default function ExploreScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ tab?: string, categoryId?: string, categoryName?: string, previewProgramId?: string }>();
    const { loadWorkout, setReturnPath } = useWorkout();
    const [searchQuery, setSearchQuery] = useState('');
    const { theme } = useTheme();

    // Derived state from URL params
    const activeTab = params.tab || 'Programas';
    const selectedMuscleCategory = useMemo(() => {
        if (params.categoryId && params.categoryName) {
            return { id: params.categoryId, name: params.categoryName };
        }
        return null;
    }, [params.categoryId, params.categoryName]);

    const [userRatings, setUserRatings] = useState<Record<string, number>>({});

    const setActiveTab = (tab: string) => {
        router.setParams({ tab });
    };

    const setSelectedMuscleCategory = (category: { id: string, name: string } | null) => {
        if (category) {
            router.setParams({ categoryId: category.id, categoryName: category.name });
        } else {
            router.setParams({ categoryId: undefined, categoryName: undefined });
        }
    };

    const handleOpenPreview = (program: any) => {
        router.push({
            pathname: '/preview',
            params: { id: program.id, type: 'program' }
        });
    };

    // Auto-open preview from params replacement
    // If we have a previewProgramId, we should just redirect to the preview screen info
    useEffect(() => {
        if (params.previewProgramId) {
            router.push({
                pathname: '/preview',
                params: { id: params.previewProgramId, type: 'program' }
            });
        }
    }, [params.previewProgramId]);

    const handleRate = (id: string, rate: number) => {
        setUserRatings(prev => ({ ...prev, [id]: rate }));
    };

    const renderProgramCard = ({ item }: { item: any }) => {
        const currentRating = userRatings[item.id] || 0;

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleOpenPreview(item)}
                className="mr-4 w-[190px]"
            >
                <View className="relative w-full aspect-[4/5] rounded-[32px] overflow-hidden bg-zinc-900 border border-zinc-800">
                    <Image source={item.image} className="w-full h-full" />

                    {/* Dark Gradient Overlay for text readability */}
                    <View className="absolute inset-0 bg-black/20" />

                    {/* Top Pins / Badges */}
                    <View className="absolute top-4 left-4 right-4 flex-row justify-between items-start">
                        {item.badge ? (
                            <View className="bg-white px-2 py-1 rounded-full">
                                <Text className="text-[10px] font-black uppercase text-black">
                                    {item.badge}
                                </Text>
                            </View>
                        ) : <View />}

                        <TouchableOpacity className="bg-black/40 p-2 rounded-xl">
                            <Ionicons name={item.isBookmarked ? "bookmark" : "bookmark-outline"} size={16} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Centered Overlay Title */}
                    <View className="absolute inset-0 items-center justify-center p-4">
                        {item.overlayTitle !== '' && (
                            <Text className="text-white font-black text-2xl italic uppercase text-center tracking-tighter" style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 }}>
                                {item.overlayTitle}
                            </Text>
                        )}
                        {item.tag && (
                            <View className="bg-red-600 px-3 py-1 rounded-md mt-2">
                                <Text className="text-white text-[10px] font-bold uppercase">{item.tag}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View className="mt-4 px-1">
                    <Text style={{ color: theme.colors.text }} className="font-bold text-[15px] mb-0.5" numberOfLines={1}>{item.title}</Text>
                    <Text style={{ color: theme.colors.textMuted }} className="text-xs font-medium">{item.downloads} Downloads</Text>

                    {/* Rating Section */}
                    <View className="flex-row items-center mt-2">
                        <View className="flex-row">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => handleRate(item.id, star)}
                                    hitSlop={5}
                                >
                                    <Ionicons
                                        name={star <= (currentRating || parseFloat(item.rating)) ? "star" : "star-outline"}
                                        size={14}
                                        color={star <= currentRating ? "#4F8FF7" : "#666"}
                                        style={{ marginRight: 2 }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={{ color: theme.colors.textMuted }} className="text-xs font-bold ml-1">
                            {currentRating > 0 ? currentRating.toFixed(1) : item.rating}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const filteredPrograms = useMemo(() => {
        if (!searchQuery.trim()) return PROGRAMS;
        const query = searchQuery.toLowerCase();
        return PROGRAMS.filter(p =>
            p.title.toLowerCase().includes(query) ||
            (p.tag && p.tag.toLowerCase().includes(query))
        );
    }, [searchQuery]);

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />

            {/* Header / Search */}
            <View className="pt-14 px-5 pb-6">
                <View style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }} className="flex-row items-center rounded-full px-4 h-12 border">
                    <Ionicons name="search" size={18} color={theme.colors.textMuted} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder={activeTab === 'Exercícios' ? "Pesquisar exercícios..." : "Pesquisar programas..."}
                        placeholderTextColor={theme.colors.textMuted}
                        style={{ color: theme.colors.text }}
                        className="flex-1 ml-3 text-base"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Breadcrumb for Exercises */}
                {activeTab === 'Exercícios' && selectedMuscleCategory && (
                    <View className="flex-row items-center mt-4">
                        <TouchableOpacity
                            onPress={() => setSelectedMuscleCategory(null)}
                            className="flex-row items-center"
                        >
                            <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
                            <Text style={{ color: theme.colors.primary }} className="font-bold ml-1">Categorias</Text>
                        </TouchableOpacity>
                        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} style={{ marginHorizontal: 8 }} />
                        <Text style={{ color: theme.colors.text }} className="font-bold">{selectedMuscleCategory.name}</Text>
                    </View>
                )}
            </View>

            {/* Tabs */}
            <View style={{ borderBottomColor: theme.colors.border }} className="flex-row justify-around border-b pb-0">
                {[
                    { id: 'Programas', icon: 'calendar-outline' },
                    { id: 'Treinadores', icon: 'person-outline' },
                    { id: 'Exercícios', icon: 'barbell-outline' },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => {
                            setActiveTab(tab.id);
                            if (tab.id !== 'Exerc\u00edcios') setSelectedMuscleCategory(null);
                        }}
                        className="items-center pb-3 px-6 relative"
                    >
                        <Ionicons
                            name={tab.icon as any}
                            size={24}
                            color={activeTab === tab.id ? theme.colors.text : theme.colors.textMuted}
                        />
                        <Text style={{ color: activeTab === tab.id ? theme.colors.text : theme.colors.textMuted }} className="text-[11px] mt-1 font-bold">
                            {tab.id}
                        </Text>
                        {activeTab === tab.id && (
                            <View style={{ backgroundColor: theme.colors.primary }} className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {activeTab === 'Programas' ? (
                <ScrollView className="flex-1 pt-6" showsVerticalScrollIndicator={false}>
                    {searchQuery.trim() ? (
                        <View className="px-5">
                            <Text className="text-zinc-500 text-sm font-bold uppercase mb-4">Resultados da busca</Text>
                            {filteredPrograms.length > 0 ? (
                                <View className="flex-row flex-wrap justify-between">
                                    {filteredPrograms.map(program => (
                                        <View key={program.id} className="w-[48%] mb-6">
                                            {renderProgramCard({ item: program })}
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View className="items-center justify-center py-20">
                                    <Ionicons name="search-outline" size={48} color="#333" />
                                    <Text className="text-zinc-500 text-center mt-4">Nenhum programa encontrado para "{searchQuery}"</Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <>
                            {/* Popular Programs */}
                            <View className="mb-10">
                                <Text style={{ color: theme.colors.text }} className="text-xl font-bold px-5 mb-5">Programas Populares</Text>
                                <FlatList
                                    horizontal
                                    data={PROGRAMS.slice(0, 3)}
                                    renderItem={renderProgramCard}
                                    keyExtractor={item => item.id}
                                    contentContainerStyle={{ paddingLeft: 20 }}
                                    showsHorizontalScrollIndicator={false}
                                />
                            </View>

                            {/* Recommended For You */}
                            <View className="mb-20">
                                <Text style={{ color: theme.colors.text }} className="text-xl font-bold px-5 mb-5">Recomendados para Você</Text>
                                <FlatList
                                    horizontal
                                    data={PROGRAMS.slice(3)}
                                    renderItem={renderProgramCard}
                                    keyExtractor={item => item.id}
                                    contentContainerStyle={{ paddingLeft: 20 }}
                                    showsHorizontalScrollIndicator={false}
                                />
                            </View>
                        </>
                    )}
                </ScrollView>
            ) : activeTab === 'Exercícios' ? (
                <View className="flex-1">
                    {selectedMuscleCategory || searchQuery.length > 0 ? (
                        <LibraryView
                            initialCategory={selectedMuscleCategory?.id || 'all'}
                            hideHeader={true}
                            externalSearchQuery={searchQuery}
                            onCategoryChange={(catId) => {
                                // Find category name from ID if possible, but catId is enough for initialCategory
                                router.setParams({ categoryId: catId, categoryName: catId });
                            }}
                        />
                    ) : (
                        <MuscleCategoryGrid
                            onSelect={(id, name) => setSelectedMuscleCategory({ id, name })}
                        />
                    )}
                </View>
            ) : (
                <View className="flex-1 items-center justify-center p-10">
                    <Ionicons name="people-outline" size={64} color="#333" />
                    <Text className="text-zinc-500 text-center mt-4">
                        A aba de treinadores estará disponível em breve!
                    </Text>
                </View>
            )}
        </View>
    );
}
