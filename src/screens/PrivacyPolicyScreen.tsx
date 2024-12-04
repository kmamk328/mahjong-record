import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const PrivacyPolicyScreen = () => {

  const navigation = useNavigation();

  useLayoutEffect(() => {
      navigation.setOptions({
          headerStyle: {
              backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#000',
          headerTitle: 'プライバシーポリシー',
          headerTitleAlign: 'center',
      });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>プライバシーポリシー</Text>
        <Text style={styles.section}>
          本プライバシーポリシーは、アプリ「麻雀レコード」（以下、「本アプリ」）において、ユーザーの個人情報の取り扱いについて定めたものです。本アプリを利用する際に、ユーザーの情報がどのように収集・利用されるかを明示し、ユーザーのプライバシーを尊重し保護するために必要な措置を講じます。
        </Text>
        <Text style={styles.subtitle}>1. 収集する情報</Text>
        <Text style={styles.section}>
          本アプリでは、以下の情報を収集する場合があります。
        </Text>
        <Text style={styles.subsection}>1.1 個人情報</Text>
        <Text style={styles.section}>
          ユーザーが提供する情報：本アプリを利用する際、ユーザーが自発的に提供する個人情報（例：名前、メールアドレスなど）。
        </Text>
        <Text style={styles.section}>
          Firebase Authenticationを使用した匿名ログイン：ユーザーがFirebaseによる匿名認証を利用する場合、個人を特定しない匿名IDが生成されます。
        </Text>
        <Text style={styles.subsection}>1.2 アプリ使用情報</Text>
        <Text style={styles.section}>
          アプリ内での行動や操作に関する情報を収集します。これには、アプリの利用頻度、ページ遷移、クリック履歴などが含まれます。この情報は、アプリの改善や機能の最適化に利用されます。
          Firebase Analyticsを使用し、アプリの利用状況に関する統計データを収集しますが、これには個人を特定できる情報は含まれません。
        </Text>
        <Text style={styles.subsection}>1.3 デバイス情報</Text>
        <Text style={styles.section}>
          アプリをインストールしたデバイスに関する情報（デバイスID、OSバージョン、IPアドレスなど）を収集する場合があります。この情報は、アプリの動作改善、デバッグ、およびセキュリティ対策に使用されます。
        </Text>
        <Text style={styles.subsection}>1.4 位置情報</Text>
        <Text style={styles.section}>
          本アプリでは、ユーザーの明示的な同意がない限り、位置情報を収集することはありません。
        </Text>
        <Text style={styles.subtitle}>2. 情報の利用目的</Text>
        <Text style={styles.section}>
          収集した情報は、以下の目的で利用されます。
        </Text>
        <Text style={styles.listItem}>- アプリの提供および運営のため</Text>
        <Text style={styles.listItem}>- ユーザーサポートのため</Text>
        <Text style={styles.listItem}>- アプリの改善や新機能の開発のため</Text>
        <Text style={styles.listItem}>- 広告の最適化およびカスタマイズのため（Google AdMobを利用した広告表示に使用）</Text>
        <Text style={styles.listItem}>- 法的義務の遵守および利用規約の施行のため</Text>
        <Text style={styles.subtitle}>3. 第三者への提供</Text>
        <Text style={styles.section}>
          本アプリは、以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません。
        </Text>
        <Text style={styles.listItem}>- 法律に基づく場合</Text>
        <Text style={styles.listItem}>- ユーザーの同意がある場合</Text>
        <Text style={styles.listItem}>- 広告配信のために必要な場合（Google AdMobなど）</Text>
        <Text style={styles.listItem}>- アプリの運営に必要な技術的なサポートが必要な場合</Text>
        {/* 他のセクションも同様に追加 */}
        <Text style={styles.section}>
          本プライバシーポリシーに関するご質問や、個人情報の取り扱いに関するお問い合わせは、以下の連絡先までお願いいたします。
        </Text>
        <Text style={styles.contact}>メールアドレス: mahjongrecord228@gmail.com</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  subsection: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  section: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 10,
    marginBottom: 5,
  },
  contact: {
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default PrivacyPolicyScreen;
