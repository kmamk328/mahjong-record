import 'react-native-gesture-handler';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
// require('dotenv').config();
import React, { useState, useRef } from 'react';
import { Platform } from 'react-native';
import { db, auth } from './firebaseConfig';

import 'regenerator-runtime/runtime';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getAuth, signInAnonymously } from 'firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import * as Analytics from 'expo-firebase-analytics';

import MemberInputScreen from './src/screens/MemberInputScreen';
import ScoreInputScreen from './src/screens/ScoreInputScreen';
import ResultScreen from './src/screens/ResultScreen';
import InquireScreen from './src/screens/InquireScreen';
import GameDetailsScreen from './src/screens/GameDetailsScreen';
import HanchanListScreen from './src/screens/HanchanListScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MenuScreen from './src/screens/MenuScreen';
import FAQScreen from './src/screens/FAQScreen';
import InquiryScreen from './src/screens/InquiryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AppInfoScreen from './src/screens/AppInfoScreen';
import NoticeScreen from './src/screens/NoticeScreen';
import TermsOfUseScreen from './src/screens/TermsOfUseScreen';
import MemberManagementScreen from './src/screens/MemberManagementScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TestScreen from './src/screens/TestScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();






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

function MenuStackNavigator() {
  return (
      <Stack.Navigator initialRouteName="Menu">
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="FAQ" component={FAQScreen} />
        <Stack.Screen name="Notice" component={NoticeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="AppInfo" component={AppInfoScreen} />
        <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
        <Stack.Screen name="MemberManagement" component={MemberManagementScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />

      </Stack.Navigator>
  );
}


export default function App() {

  React.useEffect(() => {
    // Firebase認証
    const auth = getAuth();
    signInAnonymously(auth)
      .then(() => {
        console.log('匿名サインインに成功');
        console.log(auth.currentUser?.uid);
      })
      .catch((error) => {
        console.error('匿名サインインエラー: ', error);
      });

    // アプリ起動イベントのログ
    // Analytics.logEvent('app_open', {
    //   screen: 'Main',
    //   purpose: 'ユーザーがアプリを開いた',
    // });
  }, []); // 初回のみ実行
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          name="メニュー"
          // component={LoginScreen}
          component={MenuStackNavigator}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="account-circle-outline" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
    </GestureHandlerRootView>
  );
}
