import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * UpsideDown App Entry Point
 *
 * A fun cross-platform mobile app that calculates your antipodal point —
 * the exact opposite location on Earth (as if you dug a hole straight through!).
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
