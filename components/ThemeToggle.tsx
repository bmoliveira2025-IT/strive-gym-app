import { TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(rotateAnim, {
            toValue: theme.mode === 'dark' ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [theme.mode]);

    const handleToggle = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toggleTheme();
    };

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <TouchableOpacity
            onPress={handleToggle}
            className="p-2 rounded-full"
            style={{ backgroundColor: theme.colors.backgroundTertiary }}
            activeOpacity={0.7}
        >
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <Ionicons
                    name={theme.mode === 'light' ? 'sunny' : 'moon'}
                    size={22}
                    color={theme.colors.primary}
                />
            </Animated.View>
        </TouchableOpacity>
    );
}
