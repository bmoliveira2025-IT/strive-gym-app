import React, { createContext, useContext, useState, ReactNode } from 'react';

// Simplified Exercise Type
type Exercise = {
    id: string;
    name: string;
    body_parts: string[];
    equipment: string[];
    image_url: string;
    video_url?: string;
};

type WorkoutContextType = {
    currentWorkout: Exercise[];
    addToWorkout: (exercise: Exercise) => void;
    loadWorkout: (name: string, exercises: any[]) => void;
    removeFromWorkout: (id: string) => void;
    clearWorkout: () => void;
    isWorkoutActive: boolean;
    workoutStartTime: number | null;
    startWorkout: () => void;
    finishWorkout: () => void;
    setIsWorkoutActive: (active: boolean) => void;
    returnPath: string | null;
    setReturnPath: (path: string | null) => void;
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
    const [currentWorkout, setCurrentWorkout] = useState<Exercise[]>([]);
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);
    const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
    const [returnPath, setReturnPathState] = useState<string | null>(null);

    const setReturnPath = (path: string | null) => {
        console.log('[WorkoutContext] setReturnPath:', path);
        setReturnPathState(path);
    };

    const addToWorkout = (exercise: Exercise) => {
        // Avoid duplicates for v1
        setCurrentWorkout(prev => {
            if (prev.find(e => e.id === exercise.id)) {
                return prev;
            }
            return [...prev, exercise];
        });
    };

    const loadWorkout = (name: string, exercises: any[]) => {
        setCurrentWorkout(exercises);
        setIsWorkoutActive(true);
        setWorkoutStartTime(Date.now());
    };

    const removeFromWorkout = (id: string) => {
        setCurrentWorkout(prev => prev.filter(e => e.id !== id));
    };

    const clearWorkout = () => {
        console.log('[WorkoutContext] clearWorkout called');
        console.log('[WorkoutContext] Before clear - currentWorkout:', currentWorkout.length);
        console.log('[WorkoutContext] Before clear - isWorkoutActive:', isWorkoutActive);
        setCurrentWorkout([]);
        setIsWorkoutActive(false);
        setIsWorkoutActive(false);
        setWorkoutStartTime(null);
        setReturnPath(null);
        console.log('[WorkoutContext] After clear - state setters called');
    };

    const startWorkout = () => {
        setIsWorkoutActive(true);
        setWorkoutStartTime(Date.now());
    };

    const finishWorkout = () => {
        setIsWorkoutActive(false);
        setWorkoutStartTime(null);
    };

    return (
        <WorkoutContext.Provider value={{
            currentWorkout,
            addToWorkout,
            loadWorkout,
            removeFromWorkout,
            clearWorkout,
            isWorkoutActive,
            workoutStartTime,
            startWorkout,
            finishWorkout,
            setIsWorkoutActive, // Expose setter if needed for intermediate states or restoring
            returnPath,
            setReturnPath
        }}>
            {children}
        </WorkoutContext.Provider>
    );
}

export function useWorkout() {
    const context = useContext(WorkoutContext);
    if (context === undefined) {
        throw new Error('useWorkout must be used within a WorkoutProvider');
    }
    return context;
}
