import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AdBanner from '../components/AdBanner';


const TermsOfUseScreen: React.FC = () => {

    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#000',
            headerTitle: '利用規約',
            headerTitleAlign: 'center',
        });
    }, [navigation]);

    return (
        <ScrollView style={styles.container}>
          <Text style={styles.heading}>利用規約</Text>
          <Text style={styles.paragraph}>
            この利用規約（以下、「本規約」といいます。）は、[麻雀レコード]（以下、「本アプリ」といいます。）を利用するすべてのお客様（以下、「ユーザー」といいます。）に適用されます。本アプリを利用する前に、本規約をよくお読みください。
          </Text>

          <Text style={styles.subheading}>第1条（適用）</Text>
          <Text style={styles.paragraph}>
            本規約は、ユーザーが本アプリを利用する際の条件を定めるものです。ユーザーは、本規約に同意した上で本アプリを利用してください。本アプリに特別な規約がある場合、その規約も本規約に加えて適用されます。
          </Text>

          <Text style={styles.subheading}>第2条（利用条件）</Text>
          <Text style={styles.paragraph}>
            ユーザーは、本アプリを通じて提供されるコンテンツや機能を適切に利用するものとします。本アプリの利用は無料ですが、通信費用やデータ通信量はユーザーの負担となります。
          </Text>

          <Text style={styles.subheading}>第3条（禁止事項）</Text>
          <Text style={styles.paragraph}>
            ユーザーは、本アプリの利用に際し、以下の行為を行ってはならないものとします。法令または公序良俗に違反する行為。他のユーザーや第三者の権利を侵害する行為。本アプリの運営を妨害する行為。不正アクセスや不正利用を試みる行為。
          </Text>

          <Text style={styles.subheading}>第4条（広告の表示）</Text>
          <Text style={styles.paragraph}>
            本アプリには、Google AdMobを利用した広告が表示されます。広告の表示に関連して、ユーザーのデータが収集されることがあります。詳細はプライバシーポリシーをご参照ください。
          </Text>

          <Text style={styles.subheading}>第5条（免責事項）</Text>
          <Text style={styles.paragraph}>
            本アプリの内容や機能は、予告なく変更または終了することがあります。これにより生じたユーザーの損害について、当社は一切責任を負いません。本アプリの利用に関連して発生した損害について、当社は一切責任を負わないものとします。
          </Text>

          <Text style={styles.subheading}>第6条（プライバシー）</Text>
          <Text style={styles.paragraph}>
            本アプリは、Google AdMobを通じて広告を配信する際に、ユーザーの端末情報や広告IDなどのデータを収集します。ユーザーのプライバシーに関する詳細は、プライバシーポリシーに基づいて管理されます。
          </Text>

          <Text style={styles.subheading}>第7条（規約の変更）</Text>
          <Text style={styles.paragraph}>
            本規約は、必要に応じて変更されることがあります。変更後の規約は、本アプリ内に掲載された時点で効力を発生します。規約変更後に本アプリを利用した場合、ユーザーは変更後の規約に同意したものとみなされます。
          </Text>

          <Text style={styles.subheading}>[麻雀レコード] 運営者情報</Text>
          <Text style={styles.paragraph}>
            連絡先：mahjongrecord228@gmail.com
          </Text>
        </ScrollView>
      );
    };

    const styles = StyleSheet.create({
      container: {
        padding: 20,
        backgroundColor: '#fff',
      },
      heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
      },
      subheading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
      },
      paragraph: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 10,
      },
    });


export default TermsOfUseScreen;
