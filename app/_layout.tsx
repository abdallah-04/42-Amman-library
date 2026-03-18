// app/_layout.tsx

import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  InriaSans_400Regular,
  InriaSans_700Bold,
} from '@expo-google-fonts/inria-sans';
import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_700Bold,
} from '@expo-google-fonts/lexend';
import {
  IndieFlower_400Regular,
} from '@expo-google-fonts/indie-flower';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    InriaSans_400Regular,
    InriaSans_700Bold,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_700Bold,
    IndieFlower_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(dashboard)" />
        <Stack.Screen name="RateReview" />
        <Stack.Screen name="BookDetailScreen" />
      </Stack>
    </SafeAreaProvider>
  );
}