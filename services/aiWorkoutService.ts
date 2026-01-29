import { SavedWorkout, SavedExercise } from '../context/SavedWorkoutsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GEMINI_API_KEY = 'AIzaSyDtZ4JGlfo7zYV7kEIAdSkjSYPoznkN-Hw';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const CACHE_KEY = '@ai_workout_plans_cache';
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

// Import exercise data to reference in AI plans
const exercisesData = require('../assets/exercises.json');

interface AIWorkoutPlan {
    id: string;
    name: string;
    description: string;
    exercises: SavedExercise[];
    difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
    duration: string;
    isAIGenerated: boolean;
}

// Mock data as fallback
const MOCK_AI_PLANS: AIWorkoutPlan[] = [
    {
        id: 'ai-plan-1',
        name: 'Treino Full Body Iniciante',
        description: 'Treino completo para iniciantes focado em todos os grupos musculares',
        difficulty: 'Iniciante',
        duration: '45 min',
        isAIGenerated: true,
        exercises: []
    },
    {
        id: 'ai-plan-2',
        name: 'Hipertrofia Peito e Costas',
        description: 'Treino focado em desenvolvimento de peito e costas com volume moderado',
        difficulty: 'Intermediário',
        duration: '60 min',
        isAIGenerated: true,
        exercises: []
    },
    {
        id: 'ai-plan-3',
        name: 'Treino de Pernas Intenso',
        description: 'Treino completo de membros inferiores para ganho de força e massa',
        difficulty: 'Avançado',
        duration: '70 min',
        isAIGenerated: true,
        exercises: []
    },
    {
        id: 'ai-plan-4',
        name: 'Upper Body Push/Pull',
        description: 'Divisão de treino para parte superior focando em empurrar e puxar',
        difficulty: 'Intermediário',
        duration: '55 min',
        isAIGenerated: true,
        exercises: []
    }
];

// Populate mock plans with actual exercises from the database
const getRandomExercisesByBodyPart = (bodyParts: string[], count: number): SavedExercise[] => {
    const filtered = exercisesData.filter((ex: any) =>
        ex.body_parts?.some((part: string) =>
            bodyParts.some(target => part.toLowerCase().includes(target.toLowerCase()))
        )
    );

    const shuffled = filtered.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map((ex: any) => ({
        id: ex.id.toString(),
        name: ex.name,
        image_url: ex.image_url,
        video_url: ex.video_url,
        body_parts: ex.body_parts || [],
        equipment: ex.equipment || []
    }));
};

// Populate mock plans with exercises
MOCK_AI_PLANS[0].exercises = [
    ...getRandomExercisesByBodyPart(['chest'], 2),
    ...getRandomExercisesByBodyPart(['back'], 2),
    ...getRandomExercisesByBodyPart(['quadriceps'], 1),
    ...getRandomExercisesByBodyPart(['shoulders'], 1)
];

MOCK_AI_PLANS[1].exercises = [
    ...getRandomExercisesByBodyPart(['chest'], 3),
    ...getRandomExercisesByBodyPart(['back', 'upper back'], 3)
];

MOCK_AI_PLANS[2].exercises = [
    ...getRandomExercisesByBodyPart(['quadriceps'], 3),
    ...getRandomExercisesByBodyPart(['hamstrings'], 2),
    ...getRandomExercisesByBodyPart(['calves'], 1)
];

MOCK_AI_PLANS[3].exercises = [
    ...getRandomExercisesByBodyPart(['chest', 'triceps'], 3),
    ...getRandomExercisesByBodyPart(['back', 'biceps'], 3)
];

let cachedPlans: AIWorkoutPlan[] | null = null;
let lastFetchTime: number = 0;
let fetchPromise: Promise<AIWorkoutPlan[]> | null = null;

interface CacheData {
    plans: AIWorkoutPlan[];
    timestamp: number;
}

export async function generateWorkoutPlans(): Promise<AIWorkoutPlan[]> {
    // 1. Return memory cache if available
    if (cachedPlans) {
        return cachedPlans;
    }

    // 2. If a fetch is already in progress, wait for it
    if (fetchPromise) {
        return fetchPromise;
    }

    // Define the actual fetch logic
    const fetchAction = async (): Promise<AIWorkoutPlan[]> => {
        // 3. Try to load from AsyncStorage
        try {
            const storedCache = await AsyncStorage.getItem(CACHE_KEY);
            if (storedCache) {
                const parsedCache: CacheData = JSON.parse(storedCache);
                const now = Date.now();

                // Use cache if it's not expired
                if (now - parsedCache.timestamp < CACHE_EXPIRATION) {
                    cachedPlans = parsedCache.plans;
                    lastFetchTime = parsedCache.timestamp;
                    // console.log('Loaded AI plans from persistent cache');
                    return cachedPlans;
                }
            }
        } catch (e) {
            console.warn('Failed to load AI plans from AsyncStorage:', e);
        }

        // 4. Fetch from API if cache is missing or expired
        try {
            // Get sample exercises to help AI understand the structure
            const sampleExercises = exercisesData.slice(0, 10).map((ex: any) => ({
                id: ex.id,
                name: ex.name,
                body_parts: ex.body_parts
            }));

            const prompt = `Você é um personal trainer especializado. Gere 4 planos de treino diferentes e balanceados para diferentes níveis e objetivos.

Para cada plano, forneça:
1. Nome do treino (criativo e motivador)
2. Descrição breve (1 linha)
3. Nível de dificuldade (Iniciante, Intermediário, ou Avançado)
4. Duração estimada (ex: "45 min", "60 min")
5. Lista de 5-6 IDs de exercícios da lista abaixo que formam um treino coeso

Exercícios disponíveis (use apenas os IDs destes exercícios):
${JSON.stringify(sampleExercises, null, 2)}

IMPORTANTE: Selecione exercícios que trabalham grupos musculares complementares.
Os 4 planos devem ser variados: um para iniciantes full body, um para peito/costas, um para pernas, e um para parte superior.

Responda APENAS com um JSON válido no seguinte formato:
{
  "plans": [
    {
      "name": "Nome do Treino",
      "description": "Descrição",
      "difficulty": "Iniciante|Intermediário|Avançado",
      "duration": "XX min",
      "exerciseIds": [1, 2, 3, 4, 5]
    }
  ]
}`;

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 8192,
                        responseMimeType: 'application/json',
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = await response.json();
            let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!generatedText) {
                throw new Error('No response from Gemini API');
            }

            // Cleanup potential markdown formatting
            generatedText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();

            let parsedResponse;
            try {
                parsedResponse = JSON.parse(generatedText);
            } catch (e) {
                console.error("Failed to parse AI JSON response:", generatedText);
                // Try one more fallback: find the first { and last }
                const firstOpen = generatedText.indexOf('{');
                const lastClose = generatedText.lastIndexOf('}');
                if (firstOpen !== -1 && lastClose !== -1) {
                    const jsonSubstring = generatedText.substring(firstOpen, lastClose + 1);
                    parsedResponse = JSON.parse(jsonSubstring);
                } else {
                    throw new Error('Invalid JSON response from AI');
                }
            }

            const aiPlans: AIWorkoutPlan[] = parsedResponse.plans.map((plan: any, index: number) => {
                const exercises: SavedExercise[] = plan.exerciseIds
                    .map((id: number) => {
                        const ex = exercisesData.find((e: any) => e.id === id);
                        if (!ex) return null;
                        return {
                            id: ex.id.toString(),
                            name: ex.name,
                            image_url: ex.image_url,
                            video_url: ex.video_url,
                            body_parts: ex.body_parts || [],
                            equipment: ex.equipment || []
                        };
                    })
                    .filter((ex: any) => ex !== null);

                return {
                    id: `ai-plan-${index + 1}`,
                    name: plan.name,
                    description: plan.description,
                    difficulty: plan.difficulty,
                    duration: plan.duration,
                    isAIGenerated: true,
                    exercises
                };
            });

            // Update memory cache and AsyncStorage
            const timestamp = Date.now();
            cachedPlans = aiPlans;
            lastFetchTime = timestamp;

            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
                plans: aiPlans,
                timestamp
            }));

            return aiPlans;

        } catch (error: any) {
            if (error.message && error.message.includes('429')) {
                console.warn('Gemini API rate limited (429). Using mock data fallback.');
            } else {
                console.error('Error generating AI workout plans:', error);
            }
            // Return mock data as fallback (but don't cache locally so we try again next time)
            cachedPlans = MOCK_AI_PLANS;
            return MOCK_AI_PLANS;
        } finally {
            // Success or failure, reset the promise so we can try again later if needed
            fetchPromise = null;
        }
    };

    // Assign to module-level promise and execute
    fetchPromise = fetchAction();
    return fetchPromise;
}

// Clear cache (useful for refreshing plans)
export async function clearAIPlansCache(): Promise<void> {
    cachedPlans = null;
    try {
        await AsyncStorage.removeItem(CACHE_KEY);
    } catch (e) {
        console.warn('Failed to clear AI plans cache from AsyncStorage:', e);
    }
}

// Convert AI plan to SavedWorkout format
export function convertAIPlanToWorkout(aiPlan: AIWorkoutPlan): Omit<SavedWorkout, 'id' | 'createdAt' | 'lastDone'> {
    return {
        name: aiPlan.name,
        exercises: aiPlan.exercises,
        frequency: 'Semanal',
        isAIGenerated: true
    };
}
