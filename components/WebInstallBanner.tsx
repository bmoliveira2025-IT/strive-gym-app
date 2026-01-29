import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function WebInstallBanner() {
    const { theme } = useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const slideAnim = React.useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (Platform.OS !== 'web') return;

        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        const handler = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            if (!isStandalone) {
                setIsVisible(true);
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // For iOS or browsers that don't support beforeinstallprompt
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (isIOS && !isStandalone && !isVisible) {
            setIsVisible(true);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsVisible(false);
            }
            setDeferredPrompt(null);
        } else {
            // Fallback for iOS: Show instructions or link
            alert('Para instalar: Toque no ícone de compartilhar e selecione "Adicionar à Tela de Início"');
        }
    };

    const handleDismiss = () => {
        Animated.timing(slideAnim, {
            toValue: -120,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setIsVisible(false));
    };

    if (!isVisible || Platform.OS !== 'web') return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.primary,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View className="flex-row items-center flex-1 px-4 py-3">
                <View className="bg-white/20 w-10 h-10 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="phone-portrait-outline" size={24} color="#FFF" />
                </View>
                <View className="flex-1">
                    <Text className="text-white font-bold text-sm">Instalar Strive</Text>
                    <Text className="text-white/80 text-[10px]">Tenha a melhor experiência no app</Text>
                </View>
                <TouchableOpacity
                    onPress={handleInstall}
                    className="bg-white px-4 py-2 rounded-full mr-2"
                >
                    <Text style={{ color: theme.colors.primary }} className="font-bold text-xs">Instalar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDismiss}>
                    <Ionicons name="close" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
});
