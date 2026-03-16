// app/index.tsx

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import ThemedView from '@/components/ThemedView';
import ThemedText from '@/components/ThemedText';
import PrimaryButton from '@/components/PrimaryButton';

const appIcon = require('@/assets/images/icon.png');

export default function LoginScreen() {
  function handleLogin() {
    router.replace('/library');
  }

  return (
    <ThemedView showAmman={true}>

      <View style={styles.center}>
        <Image source={appIcon} style={styles.icon} />
      </View>

      <View style={styles.center}>
        <ThemedText variant="appTitle" center>
          <ThemedText variant="appTitle" color="primary">42</ThemedText>
          {' Amman library'}
        </ThemedText>
      </View>

      <ThemedText variant="subtitle" center opacity={0.6}>
        Borrow and discover books from the campus library
      </ThemedText>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          label="Sign in with 42 Intra →"
          onPress={handleLogin}
          radius={20} disabeld={false}        />
      </View>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    marginTop: 16,
  },
  icon: {
    width: 200,
    height: 200,
    borderRadius: 4,
    marginTop: 72,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
});