import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import CommunityScreen from '../screens/CommunityScreen';
import AboutScreen from '../screens/AboutScreen';
import { COLORS } from '../utils/constants';

export type RootTabParamList = {
  Home: undefined;
  Community: undefined;
  About: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

/**
 * Bottom-tab navigator for UpsideDown.
 * Three tabs: Home (map), Community (other users' pins), About.
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: COLORS.background,
            borderBottomColor: COLORS.border,
            borderBottomWidth: 1,
          },
          headerTintColor: COLORS.textPrimary,
          headerTitleStyle: {
            fontWeight: '700',
          },
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'globe';

            if (route.name === 'Home') {
              iconName = focused ? 'earth' : 'earth-outline';
            } else if (route.name === 'Community') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'About') {
              iconName = focused
                ? 'information-circle'
                : 'information-circle-outline';
            }

            return (
              <View style={focused ? styles.activeTab : undefined}>
                <Ionicons name={iconName} size={size} color={color} />
              </View>
            );
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '🌍 UpsideDown' }}
        />
        <Tab.Screen
          name="Community"
          component={CommunityScreen}
          options={{ title: '👥 Community Pins' }}
        />
        <Tab.Screen
          name="About"
          component={AboutScreen}
          options={{ title: 'ℹ️ About' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}22`,
  },
});
