import '../global.css';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutProvider, useWorkout } from '../context/WorkoutContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { SavedWorkoutsProvider } from '../context/SavedWorkoutsContext';
import { ExerciseHistoryProvider } from '../context/ExerciseHistoryContext';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WebInstallBanner from '../components/WebInstallBanner';

function TabsContent() {
  const { isWorkoutActive, workoutStartTime, clearWorkout } = useWorkout();
  const { theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // Simple duration display logic if needed here, or just static text.
  // Since we want it simple for v1:
  const showNotification = isWorkoutActive && pathname !== '/workout' && !pathname.startsWith('/preview') && !pathname.startsWith('/exercise');

  // Debug log
  console.log('[_layout] Render - isWorkoutActive:', isWorkoutActive, 'pathname:', pathname, 'showNotification:', showNotification);

  return (
    <>
      <WebInstallBanner />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.tabBarActive,
          tabBarInactiveTintColor: theme.colors.tabBarInactive,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: theme.colors.tabBarBackground,
            borderTopColor: theme.colors.tabBarBorder,
            borderTopWidth: 1,
            paddingTop: 10,
            paddingBottom: 34,
            height: 95,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progresso',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="workout"
          options={{
            title: 'Treino',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="barbell" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="exercise/[id]"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="streak"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="preview"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Active Workout Notification */}
      {/* Active Workout Notification Footer */}
      {showNotification && (
        <View className="absolute bottom-[100px] left-4 right-4 z-50">
          <View
            className="bg-black border border-zinc-800 p-4 rounded-xl shadow-lg"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            <Text className="text-white text-center font-medium mb-3">Treino em Andamento</Text>

            <View className="flex-row justify-between items-center px-4">
              <TouchableOpacity
                onPress={() => router.push('/workout')}
                className="flex-row items-center"
              >
                <Ionicons name="play" size={18} color="#4F8FF7" />
                <Text className="text-primary font-bold ml-2">Retomar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  console.log('Discard button clicked');
                  console.log('Platform:', Platform.OS);
                  console.log('isWorkoutActive:', isWorkoutActive);

                  const { Alert } = require('react-native');
                  Alert.alert(
                    "Descartar Treino",
                    "Tem certeza que deseja descartar o treino atual?",
                    [
                      {
                        text: "Cancelar",
                        style: "cancel",
                        onPress: () => console.log('Cancelled discard')
                      },
                      {
                        text: "Descartar",
                        style: "destructive",
                        onPress: () => {
                          console.log('User confirmed discard');
                          console.log('Calling clearWorkout...');
                          clearWorkout();
                          console.log('clearWorkout called');
                          console.log('Navigating to home...');
                          router.replace('/');
                          console.log('Navigation triggered');
                        }
                      }
                    ]
                  );
                }}
                className="flex-row items-center"
              >
                <Ionicons name="close" size={18} color="#EF4444" />
                <Text className="text-red-500 font-bold ml-2">Descartar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
}

import { WorkoutHistoryProvider } from '../context/WorkoutHistoryContext';
import { UserProfileProvider } from '../context/UserProfileContext';

export default function TabLayout() {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#FFF' }}>Carregando Strive...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: Platform.OS === 'web' ? '#000' : 'transparent' }}>
        <View
          style={{
            flex: 1,
            width: '100%',
            maxWidth: Platform.OS === 'web' ? 500 : undefined,
            alignSelf: 'center',
            backgroundColor: theme.colors.background,
            // Add a subtle border/shadow only on web to define the app "frame"
            ...(Platform.OS === 'web' ? {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 20,
              elevation: 10,
            } : {})
          }}
        >
          <UserProfileProvider>
            <SavedWorkoutsProvider>
              <FavoritesProvider>
                <ExerciseHistoryProvider>
                  <WorkoutHistoryProvider>
                    <WorkoutProvider>
                      <TabsContent />
                    </WorkoutProvider>
                  </WorkoutHistoryProvider>
                </ExerciseHistoryProvider>
              </FavoritesProvider>
            </SavedWorkoutsProvider>
          </UserProfileProvider>
        </View>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
