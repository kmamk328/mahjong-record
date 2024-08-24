import React from 'react';
import 'regenerator-runtime/runtime';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getAuth, signInAnonymously } from 'firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import MemberInputScreen from './src/screens/MemberInputScreen';
import ScoreInputScreen from './src/screens/ScoreInputScreen';
import ResultScreen from './src/screens/ResultScreen';
import InquireScreen from './src/screens/InquireScreen';
import GameDetailsScreen from './src/screens/GameDetailsScreen';
import HanchanListScreen from './src/screens/HanchanListScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TestScreen from './src/screens/TestScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


const auth = getAuth();
signInAnonymously(auth)
  .then(() => {
    console.log('Signed in anonymously');
    console.log(auth.currentUser?.uid);
  })
  .catch((error) => {
    console.error('Error signing in anonymously: ', error);
  });

function MainStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MemberInput"
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      <Stack.Screen name="MemberInput" component={MemberInputScreen} />
      <Stack.Screen name="HanchanList" component={HanchanListScreen} />
      <Stack.Screen name="ScoreInput" component={ScoreInputScreen} />
    </Stack.Navigator>
  );
}

function InquireStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Inquire">
      <Stack.Screen name="Inquire" component={InquireScreen} />
      <Stack.Screen name="MemberInput" component={MemberInputScreen} />
      <Stack.Screen name="HanchanList" component={HanchanListScreen} />
      <Stack.Screen name="GameDetails" component={GameDetailsScreen} />
      <Stack.Screen name="ScoreInput" component={ScoreInputScreen} />
    </Stack.Navigator>
  );
}

function DashboardStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Dashboard">
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
}


export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
      <Tab.Screen
          name="記録/入力"
          component={InquireStackNavigator}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="clipboard-list-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="成績"
          component={DashboardStackNavigator}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="chart-line" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="その他"
          // component={LoginScreen}
          component={TestScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="account-circle-outline" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
