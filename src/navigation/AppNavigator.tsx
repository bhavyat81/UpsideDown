import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import CommunityScreen from '../screens/CommunityScreen';
import AboutScreen from '../screens/AboutScreen';
import BuddiesScreen from '../screens/BuddiesScreen';
import ChatScreen from '../screens/ChatScreen';
import CreatePostcardScreen from '../screens/CreatePostcardScreen';
import { COLORS } from '../utils/constants';
import { Match, Coordinates } from '../types';

export type RootTabParamList = {
  Home: undefined;
  Community: undefined;
  BuddiesTab: undefined;
  About: undefined;
};

export type BuddiesStackParamList = {
  BuddiesList: undefined;
  Chat: { match: Match; currentUserId: string };
};

export type HomeStackParamList = {
  HomeMain: undefined;
  CreatePostcard: {
    senderLocation: Coordinates;
    antipodalLocation: Coordinates;
    senderPlaceName: string;
    antipodalPlaceName: string;
    senderId: string;
    senderName: string;
    buddyId?: string;
  };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const BuddiesStack = createNativeStackNavigator<BuddiesStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function BuddiesNavigator() {
  return (
    <BuddiesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <BuddiesStack.Screen
        name="BuddiesList"
        component={BuddiesScreen}
        options={{ title: '🌍 Earth Twins' }}
      />
      <BuddiesStack.Screen name="Chat" component={ChatScreen} />
    </BuddiesStack.Navigator>
  );
}

function HomeNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: '🌍 UpsideDown' }}
      />
      <HomeStack.Screen
        name="CreatePostcard"
        component={CreatePostcardScreen}
        options={{ title: '✉️ Create Postcard' }}
      />
    </HomeStack.Navigator>
  );
}

/**
 * Bottom-tab navigator for UpsideDown.
 * Four tabs: Home (map), Community, Earth Twins / Buddies, About.
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
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
            } else if (route.name === 'BuddiesTab') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'About') {
              iconName = focused ? 'information-circle' : 'information-circle-outline';
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
          component={HomeNavigator}
          options={{ title: 'Home' }}
        />
        <Tab.Screen
          name="Community"
          component={CommunityScreen}
          options={{
            title: 'Community',
            headerShown: true,
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.textPrimary,
            headerTitleStyle: { fontWeight: '700' },
            headerTitle: '👥 Community Pins',
          }}
        />
        <Tab.Screen
          name="BuddiesTab"
          component={BuddiesNavigator}
          options={{ title: 'Earth Twins' }}
        />
        <Tab.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: 'About',
            headerShown: true,
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.textPrimary,
            headerTitleStyle: { fontWeight: '700' },
            headerTitle: 'ℹ️ About',
          }}
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
