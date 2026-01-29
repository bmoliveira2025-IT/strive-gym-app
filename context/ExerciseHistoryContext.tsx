import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@exercise_history';

type ExerciseRecord = {
    lastKg: string;
    lastReps: string;
    bestKg: string;
    bestReps: string;
    lastDate: string;
};

type ExerciseHistoryData = {
    [exerciseId: string]: ExerciseRecord;
};

type ExerciseHistoryContextType = {
    history: ExerciseHistoryData;
    getHistory: (exerciseId: string) => ExerciseRecord | null;
    updateHistory: (exerciseId: string, kg: string, reps: string) => void;
    checkIsPR: (exerciseId: string, kg: string, reps: string) => boolean;
};

const ExerciseHistoryContext = createContext<ExerciseHistoryContextType | undefined>(undefined);

export function ExerciseHistoryProvider({ children }: { children: ReactNode }) {
    const [history, setHistory] = useState<ExerciseHistoryData>({});

    // Load history on mount
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load exercise history:', error);
        }
    };

    const saveHistory = async (newHistory: ExerciseHistoryData) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        } catch (error) {
            console.error('Failed to save exercise history:', error);
        }
    };

    const getHistory = (exerciseId: string): ExerciseRecord | null => {
        return history[exerciseId] || null;
    };

    const updateHistory = (exerciseId: string, kg: string, reps: string) => {
        const kgNum = parseFloat(kg) || 0;
        const repsNum = parseInt(reps) || 0;

        const current = history[exerciseId];
        const currentBestKg = current ? parseFloat(current.bestKg) || 0 : 0;
        const currentBestReps = current ? parseInt(current.bestReps) || 0 : 0;

        const newRecord: ExerciseRecord = {
            lastKg: kg,
            lastReps: reps,
            bestKg: kgNum > currentBestKg ? kg : (current?.bestKg || kg),
            bestReps: repsNum > currentBestReps ? reps : (current?.bestReps || reps),
            lastDate: new Date().toISOString(),
        };

        const newHistory = { ...history, [exerciseId]: newRecord };
        setHistory(newHistory);
        saveHistory(newHistory);
    };

    const checkIsPR = (exerciseId: string, kg: string, reps: string): boolean => {
        const current = history[exerciseId];
        if (!current) return false;

        const kgNum = parseFloat(kg) || 0;
        const repsNum = parseInt(reps) || 0;
        const bestKg = parseFloat(current.bestKg) || 0;
        const bestReps = parseInt(current.bestReps) || 0;

        return kgNum > bestKg || repsNum > bestReps;
    };

    return (
        <ExerciseHistoryContext.Provider value={{
            history,
            getHistory,
            updateHistory,
            checkIsPR,
        }}>
            {children}
        </ExerciseHistoryContext.Provider>
    );
}

export function useExerciseHistory() {
    const context = useContext(ExerciseHistoryContext);
    if (context === undefined) {
        throw new Error('useExerciseHistory must be used within an ExerciseHistoryProvider');
    }
    return context;
}
