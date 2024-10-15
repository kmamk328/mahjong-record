import React, { useState, useEffect, useLayoutEffect } from 'react';

import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView} from 'react-native';
import AdBanner from '../components/AdBanner';


const MenuScreen = ({ navigation }) => {

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#000',
      headerTitle: 'メニュー',
      headerTitleAlign: 'center',
    });
  }, [navigation]);
  return (
    <View style={styles.container}>
    <ScrollView style={styles.container}>
      <View style={styles.gridContainer}>
        {/* <TouchableOpacity style={[styles.menuItem, styles.premium]} onPress={() => navigation.navigate('Premium')}>
          <Text style={styles.menuTitle}>プレミアム</Text>
          <Image source={require('../image/sou_1.png')} style={styles.icon} />
        </TouchableOpacity> */}

        {/* <TouchableOpacity style={[styles.menuItem, styles.support]} onPress={() => navigation.navigate('Support')}>
          <Text style={styles.menuTitle}>応援する</Text>
          <Image source={require('../image/sou_1.png')} style={styles.icon} />
        </TouchableOpacity> */}

        <TouchableOpacity style={[styles.menuItem, styles.Notice]} onPress={() => navigation.navigate('Notice')}>
          <Text style={styles.menuTitle}>お知らせ</Text>
          <Image source={require('../image/sou_1.png')} style={styles.icon} />
        </TouchableOpacity>

        {/* <TouchableOpacity style={[styles.menuItem, styles.inquiry]} onPress={() => navigation.navigate('Inquiry')}>
          <Text style={styles.menuTitle}>お問い合わせ</Text>
          <Image source={require('../image/sou_1.png')} style={styles.icon} />
        </TouchableOpacity> */}
        <TouchableOpacity style={[styles.menuItem, styles.faq]} onPress={() => navigation.navigate('FAQ')}>
          <Text style={styles.menuTitle}>よくある質問</Text>
          <Image source={require('../image/sou_1.png')} style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.settings]} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.menuTitle}>設定</Text>
          <Image source={require('../image/sou_1.png')} style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.appInfo]} onPress={() => navigation.navigate('AppInfo')}>
          <Text style={styles.menuTitle}>アプリ情報</Text>
          <Image source={require('../image/sou_1.png')} style={styles.icon} />
        </TouchableOpacity>

        {/* <TouchableOpacity style={[styles.menuItem, styles.terms]} onPress={() => navigation.navigate('TermsOfUse')}>
          <Text style={styles.menuTitle}>利用規約</Text>
          <Image source={require('../image/sou_1.png')} style={styles.icon} />
        </TouchableOpacity> */}

        {/* <TouchableOpacity style={[styles.menuItem, styles.privacyPolicy]} onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Text style={styles.menuTitle}>プライバシーポリシー</Text>
          <Image source={require('../image/sou_1.png')} style={styles.icon} />
        </TouchableOpacity> */}
      </View>


    </ScrollView>
    <AdBanner />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  menuItem: {
    width: '45%',
    height: 100,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
  },
  premium: {
    backgroundColor: '#FFA500',
  },
  support: {
    backgroundColor: '#FF6347',
  },
  faq: {
    backgroundColor: '#32CD32',
  },
  inquiry: {
    backgroundColor: '#1E90FF',
  },
  settings: {
    backgroundColor: '#A9A9A9',
  },
  appInfo: {
    backgroundColor: '#1E90FF',
  },
  Notice: {
    backgroundColor: '#FF6347',
  },
  terms: {
    backgroundColor: '#1E90FF',
  },
  privacyPolicy: {
    backgroundColor: '#87CEFA',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  icon: {
    width: 30,
    height: 30,
    marginTop: 10,
  },
});

export default MenuScreen;
