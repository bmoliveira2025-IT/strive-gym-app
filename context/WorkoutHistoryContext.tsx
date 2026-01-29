import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_STORAGE_KEY = '@workout_history_v2';

export interface HistorySet {
    kg: number;
    reps: number;
    type: 'N' | 'W' | 'D' | 'F';
}

export interface HistoryExercise {
    id: string;
    name: string;
    sets: HistorySet[];
}

export interface WorkoutHistoryRecord {
    id: string;
    workoutId?: string | null;
    workoutName: string;
    date: string; // ISO string
    duration: number; // in seconds
    totalVolume: number;
    totalSeries: number;
    exercises: HistoryExercise[];
}

type WorkoutHistoryContextType = {
    history: WorkoutHistoryRecord[];
    addHistoryRecord: (record: Omit<WorkoutHistoryRecord, 'id' | 'date'>) => void;
    clearHistory: () => void;
};

const WorkoutHistoryContext = createContext<WorkoutHistoryContextType | undefined>(undefined);

export function WorkoutHistoryProvider({ children }: { children: ReactNode }) {
    const [history, setHistory] = useState<WorkoutHistoryRecord[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    useEffect(() => {
        if (isLoaded) {
            saveHistory();
        }
    }, [history, isLoaded]);

    const loadHistory = async () => {
        try {
            const stored = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load history', e);
        } finally {
            setIsLoaded(true);
        }
    };

    const saveHistory = async () => {
        try {
            await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        } catch (e) {
            console.error('Failed to save history', e);
        }
    };

    const addHistoryRecord = (record: Omit<WorkoutHistoryRecord, 'id' | 'date'>) => {
        const newRecord: WorkoutHistoryRecord = {
            ...record,
            id: Date.now().toString(),
            date: new Date().toISOString(),
        };
        setHistory(prev => [newRecord, ...prev]);
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return (
        <WorkoutHistoryContext.Provider value={{ history, addHistoryRecord, clearHistory }}>
            {children}
        </WorkoutHistoryContext.Provider>
    );
}

export function useWorkoutHistory() {
    const context = useContext(WorkoutHistoryContext);
    if (context === undefined) {
        throw new Error('useWorkoutHistory must be used within a WorkoutHistoryProvider');
    }
    return context;
}
