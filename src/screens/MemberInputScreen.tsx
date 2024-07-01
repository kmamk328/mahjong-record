import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, ScrollView, TextInput, Text, StyleSheet, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MemberInput from '../components/MemberInput';

import { db } from '../../firebaseConfig';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';

const MemberInputScreen = () => {
  const [members, setMembers] = useState(['', '', '', '']);
  const [existingMembers, setExistingMembers] = useState([]);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(null);
  const [reset, setReset] = useState(false);
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

  useEffect(() => {
    const fetchMembers = async () => {
      const membersCollection = collection(db, 'members');
      const membersSnapshot = await getDocs(membersCollection);
      const membersList = membersSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setExistingMembers(membersList);
    };

    fetchMembers();
  }, []);

  const handleChange = (text, index) => {
    const newMembers = [...members];
    newMembers[index] = text;
    setMembers(newMembers);
  };

  const handleNext = async () => {
    for (const member of members) {
      if (member === '') continue;

      const existingMember = existingMembers.find(existingMember => existingMember.name === member);
      if (existingMember) {
        Alert.alert(
          '確認',
          `${member}は以前も入力したことがありますか？\n違う人だったら違う名前で登録してください`,
          [
            {
              text: '入力しなおす',
              onPress: () => {},
              style: 'cancel',
            },
            {
              text: 'この名前を使用します',
              onPress: async () => {
                await proceedWithNext();
              },
            },
          ]
        );
        return;
      }
    }

    await proceedWithNext();
  };

  const handleClear = () => {
    setMembers(['', '', '', '']);
    setReset(true);
    setTimeout(() => setReset(false), 0); // Reset the `reset` state to false
  };


  const proceedWithNext = async () => {
    const membersCollection = collection(db, 'members');
    const memberIds = [];

    for (const member of members) {
      if (member === '') continue;

      const existingMember = existingMembers.find(existingMember => existingMember.name === member);

      if (existingMember) {
        memberIds.push(existingMember.id);
      } else {
        const newMemberRef = doc(membersCollection);
        await setDoc(newMemberRef, { name: member });
        memberIds.push(newMemberRef.id);
      }
    }

    const gameRef = doc(collection(db, 'games'));
    await setDoc(gameRef, { createdAt: new Date(), members: memberIds });

    navigation.navigate('ScoreInput', { gameId: gameRef.id, members: memberIds });
  };

  
  return (
    <ScrollView style={styles.container}>
    <View style={styles.memberInputBox}>
      <Text style={styles.getTitleText}>メンバーを入力してください</Text>
      <View style={styles.divider} />
      {members.map((member, index) => (
        <MemberInput
          key={index}
          existingMembers={existingMembers.map(member => member.name)}
          value={member}
          onChange={(text) => handleChange(text, index)}
          placeholder={`メンバー ${index + 1}`}
          reset={reset} // Pass the reset state
        />
      ))}
      <View style={styles.buttonContainer}>
        <Button title="クリア" onPress={handleClear} />
        <Button title="次へ" onPress={handleNext} />
      </View>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default MemberInputScreen;
