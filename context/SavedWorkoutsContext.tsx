import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_WORKOUTS_KEY = '@gym_app_saved_workouts';

export interface SavedExercise {
    id: string;
    name: string;
    image_url: string;
    video_url?: string;
    body_parts?: string[];
    equipment?: string[];
    sets?: any[]; // using any[] to avoid circular dependency with SetData for now
    notes?: string;
    restTime?: number;
}

export interface SavedWorkout {
    id: string;
    name: string;
    exercises: SavedExercise[];
    frequency: string;
    lastDone: string;
    createdAt: string;
    isFavorite?: boolean;
    category?: string;
    isAIGenerated?: boolean;
}

type SavedWorkoutsContextType = {
    savedWorkouts: SavedWorkout[];
    saveWorkout: (name: string, exercises: SavedExercise[], category?: string, isAIGenerated?: boolean) => void;
    deleteWorkout: (id: string) => void;
    updateWorkout: (id: string, exercises: SavedExercise[]) => void;
    updateLastDone: (id: string) => void;
    getWorkoutById: (id: string) => SavedWorkout | undefined;
    toggleWorkoutFavorite: (id: string) => void;
    // Temp plan building
    tempPlanExercises: SavedExercise[];
    addToPlan: (exercise: SavedExercise) => void;
    removeFromPlan: (id: string) => void;
    clearPlan: () => void;
    isCreatingPlan: boolean;
    setIsCreatingPlan: (value: boolean) => void;
    planName: string;
    setPlanName: (name: string) => void;
};

const SavedWorkoutsContext = createContext<SavedWorkoutsContextType | undefined>(undefined);

export function SavedWorkoutsProvider({ children }: { children: ReactNode }) {
    const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Temp plan building state
    const [tempPlanExercises, setTempPlanExercises] = useState<SavedExercise[]>([]);
    const [isCreatingPlan, setIsCreatingPlan] = useState(false);
    const [planName, setPlanName] = useState('');

    // Load saved workouts from storage on mount
    useEffect(() => {
        loadSavedWorkouts();
    }, []);

    // Save to storage whenever workouts change
    useEffect(() => {
        if (isLoaded) {
            persistWorkouts();
        }
    }, [savedWorkouts, isLoaded]);

    const loadSavedWorkouts = async () => {
        try {
            const stored = await AsyncStorage.getItem(SAVED_WORKOUTS_KEY);
            if (stored) {
                setSavedWorkouts(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading saved workouts:', error);
        } finally {
            setIsLoaded(true);
        }
    };

    const persistWorkouts = async () => {
        try {
            await AsyncStorage.setItem(SAVED_WORKOUTS_KEY, JSON.stringify(savedWorkouts));
        } catch (error) {
            console.error('Error saving workouts:', error);
        }
    };

    const saveWorkout = (name: string, exercises: SavedExercise[], category?: string, isAIGenerated?: boolean) => {
        const newWorkout: SavedWorkout = {
            id: Date.now().toString(),
            name,
            exercises,
            frequency: 'Semanal',
            lastDone: 'Agora',
            createdAt: new Date().toISOString(),
            isFavorite: false,
            category,
            isAIGenerated: isAIGenerated || false,
        };
        setSavedWorkouts(prev => [newWorkout, ...prev]);
    };

    const deleteWorkout = (id: string) => {
        setSavedWorkouts(prev => prev.filter(w => w.id !== id));
    };

    const updateWorkout = (id: string, exercises: SavedExercise[]) => {
        setSavedWorkouts(prev => prev.map(w =>
            w.id === id ? { ...w, exercises } : w
        ));
    };

    const updateLastDone = (id: string) => {
        setSavedWorkouts(prev => prev.map(w =>
            w.id === id ? { ...w, lastDone: 'Agora' } : w
        ));
    };

    const toggleWorkoutFavorite = (id: string) => {
        setSavedWorkouts(prev => prev.map(w =>
            w.id === id ? { ...w, isFavorite: !w.isFavorite } : w
        ));
    };

    const getWorkoutById = (id: string) => {
        return savedWorkouts.find(w => w.id === id);
    };

    // Temp plan functions
    const addToPlan = (exercise: SavedExercise) => {
        setTempPlanExercises(prev => {
            if (prev.find(e => e.id === exercise.id)) return prev;
            return [...prev, exercise];
        });
    };

    const removeFromPlan = (id: string) => {
        setTempPlanExercises(prev => prev.filter(e => e.id !== id));
    };

    const clearPlan = () => {
        setTempPlanExercises([]);
        setPlanName('');
        setIsCreatingPlan(false);
    };

    return (
        <SavedWorkoutsContext.Provider value={{
            savedWorkouts,
            saveWorkout,
            deleteWorkout,
            updateWorkout,
            updateLastDone,
            getWorkoutById,
            toggleWorkoutFavorite,
            tempPlanExercises,
            addToPlan,
            removeFromPlan,
            clearPlan,
            isCreatingPlan,
            setIsCreatingPlan,
            planName,
            setPlanName
        }}>
            {children}
        </SavedWorkoutsContext.Provider>
    );
}

export function useSavedWorkouts() {
    const context = useContext(SavedWorkoutsContext);
    if (context === undefined) {
        throw new Error('useSavedWorkouts must be used within a SavedWorkoutsProvider');
    }
    return context;
}
