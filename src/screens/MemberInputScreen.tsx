import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, ScrollView, TextInput, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { db } from '../../firebaseConfig';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';

const MemberInputScreen = () => {
  const [members, setMembers] = useState(['', '', '', '']);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
        headerStyle: {
            backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#000',
        headerTitle: 'メンバー入力',
    });
  }, [navigation]);

  const handleChange = (text, index) => {
    const newMembers = [...members];
    newMembers[index] = text;
    setMembers(newMembers);
  };

  const handleNext = async () => {
    const membersCollection = collection(db, 'members');
    const memberIds = [];

    for (const member of members) {
      // メンバーが既に存在するか確認
      const q = query(membersCollection, where("name", "==", member));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // メンバーが存在しない場合、新規作成
        const newMemberRef = doc(membersCollection);
        await setDoc(newMemberRef, { name: member });
        memberIds.push(newMemberRef.id);
      } else {
        // メンバーが存在する場合、そのIDを使用
        querySnapshot.forEach((doc) => {
          memberIds.push(doc.id);
        });
      }
    }

    // 新しいゲームドキュメントを作成
    const gameRef = doc(collection(db, 'games'));
    await setDoc(gameRef, { createdAt: new Date(), members: memberIds });

    // スコア入力画面にゲームIDを渡して移動
    navigation.navigate('ScoreInput', { gameId: gameRef.id, members: memberIds });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.memberInputBox}>
        <Text style={styles.getTitleText}>メンバーを入力してください</Text>
        <View style={styles.divider} />
        {members.map((member, index) => (
          <TextInput
            key={index}
            style={styles.input}
            value={member}
            onChangeText={(text) => handleChange(text, index)}
            placeholder={`メンバー ${index + 1}`}
          />
        ))}
        <Button title="次へ" onPress={handleNext} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  memberInputBox: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#ffffff',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    shadowColor: '#000', // 影の色
    shadowOffset: { width: 0, height: 2 }, // 影のオフセット
    shadowOpacity: 0.25, // 影の不透明度
    shadowRadius: 3.84, // 影のぼかし範囲
    elevation: 5, // Androidのための影の高さ
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  getTitleText: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginBottom: 10,
  },
});

export default MemberInputScreen;
