import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_STORAGE_KEY = '@user_profile';

export type TrainingObjective = 'hipertrofia' | 'força' | 'cutting';

export interface WeightEntry {
    date: string;
    value: number;
}

export interface BodyMeasurements {
    fatPercentage?: number;
    chest?: number;
    waist?: number;
    arms?: number;
    legs?: number;
    updatedAt: string;
}

export interface UserProfile {
    id: string;
    weight?: number; // Current weight kg
    weightHistory?: WeightEntry[]; // Track weight over time
    measurements?: BodyMeasurements;
    height?: number; // cm
    objective?: TrainingObjective;
    createdAt: string;
    updatedAt: string;
}

type UserProfileContextType = {
    profile: UserProfile | null;
    updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
    clearProfile: () => Promise<void>;
    isLoading: boolean;
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
            if (stored) {
                setProfile(JSON.parse(stored));
            } else {
                // Create initial profile
                const newProfile: UserProfile = {
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                setProfile(newProfile);
                await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
            }
        } catch (e) {
            console.error('Failed to load profile', e);
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>) => {
        try {
            if (!profile) return;

            const updatedProfile: UserProfile = {
                ...profile,
                ...updates,
                updatedAt: new Date().toISOString(),
            };

            // If weight is updated, also add to history
            if (updates.weight !== undefined) {
                const newEntry: WeightEntry = {
                    date: new Date().toISOString(),
                    value: updates.weight
                };
                updatedProfile.weightHistory = [
                    ...(profile.weightHistory || []),
                    newEntry
                ];
            }

            setProfile(updatedProfile);
            await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
        } catch (e) {
            console.error('Failed to update profile', e);
        }
    };

    const clearProfile = async () => {
        try {
            await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
            const newProfile: UserProfile = {
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setProfile(newProfile);
        } catch (e) {
            console.error('Failed to clear profile', e);
        }
    };

    return (
        <UserProfileContext.Provider value={{ profile, updateProfile, clearProfile, isLoading }}>
            {children}
        </UserProfileContext.Provider>
    );
}

export function useUserProfile() {
    const context = useContext(UserProfileContext);
    if (context === undefined) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
}
