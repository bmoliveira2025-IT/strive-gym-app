import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = '@gym_app_favorites';

type FavoritesContextType = {
    favorites: string[]; // Array of exercise IDs
    isFavorite: (id: string) => boolean;
    toggleFavorite: (id: string) => void;
    addFavorite: (id: string) => void;
    removeFavorite: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load favorites from storage on mount
    useEffect(() => {
        loadFavorites();
    }, []);

    // Save favorites to storage whenever they change
    useEffect(() => {
        if (isLoaded) {
            saveFavorites();
        }
    }, [favorites, isLoaded]);

    const loadFavorites = async () => {
        try {
            const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
            if (stored) {
                setFavorites(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setIsLoaded(true);
        }
    };

    const saveFavorites = async () => {
        try {
            await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    };

    const isFavorite = (id: string): boolean => {
        return favorites.includes(id);
    };

    const toggleFavorite = (id: string) => {
        if (isFavorite(id)) {
            removeFavorite(id);
        } else {
            addFavorite(id);
        }
    };

    const addFavorite = (id: string) => {
        if (!favorites.includes(id)) {
            setFavorites([...favorites, id]);
        }
    };

    const removeFavorite = (id: string) => {
        setFavorites(favorites.filter(fav => fav !== id));
    };

    return (
        <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, addFavorite, removeFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
