import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Button, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, doc, setDoc, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig'; // Firebase authentication instance
import MemberInput from '../components/MemberInput';

const MemberInputScreen = ({ route }) => {
  const { gameId } = route.params || {};
  const [members, setMembers] = useState(['', '', '', '']);
  const [existingMembers, setExistingMembers] = useState([]);
  const [reset, setReset] = useState(false);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#000',
      headerTitle: 'メンバー入力',
      headerTitleAlign: 'center',
    });
  }, [navigation]);

  useEffect(() => {
    const fetchMembers = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const membersCollection = collection(db, 'members');
      const q = query(membersCollection, where('createdUser', '==', currentUser.uid));
      const membersSnapshot = await getDocs(q);
      const membersList = membersSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setExistingMembers(membersList);
      console.log("保存されているメンバー:", membersList);
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
      // if (existingMember) {
      //   Alert.alert(
      //     '確認',
      //     `${member}は以前も入力したことがありますか？\n違う人だったら違う名前で登録してください`,
      //     [
      //       {
      //         text: '入力しなおす',
      //         onPress: () => {},
      //         style: 'cancel',
      //       },
      //       {
      //         text: 'この名前を使用します',
      //         onPress: async () => {
      //           await proceedWithNext(existingMember.id);
      //         },
      //       },
      //     ]
      //   );
      //   return;
      // }
    }

    await proceedWithNext();
  };

  const proceedWithNext = async (existingMemberId) => {
    const membersCollection = collection(db, 'members');
    const memberIds = [];
    const currentUser = auth.currentUser;

    for (const member of members) {
      if (member === '') continue;

      const existingMember = existingMembers.find(existingMember => existingMember.name === member);
      console.log("existingMember:", existingMember);
      if (existingMember) {
        memberIds.push(existingMember.id);
      } else {
        const newMemberRef = doc(membersCollection);
        await setDoc(newMemberRef, {
          name: member,
          createdUser: currentUser?.uid,  // currentUserのUIDをcreatedUserとして保存
        });
        memberIds.push(newMemberRef.id);
      }
    }

    const newGameRef = await addDoc(collection(db, 'games'), {
      createdAt: new Date(),
      members: memberIds,
      createdUser: currentUser?.uid, // ゲーム作成者としてcurrentUserのUIDを保存
    });

    navigation.navigate('HanchanList', { gameId: newGameRef.id });
  };

  const handleClear = () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setMembers(['', '', '', '']);
    }
    setReset(true);
    setTimeout(() => setReset(false), 0);
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
            // placeholder={`メンバー ${index + 1}`}
            placeholder={`選択 or 入力してください`}
            reset={reset} // Pass the reset state
            label={` ${index + 1}人目`} // Add label prop
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
    padding: 1,
  },
  memberInputBox: {
    flex: 1,
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#ffffff',
    borderColor: '#DCDCDC',
    borderWidth: 1,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'space-between',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%', // 幅を100%にしてピッカーを広げる
    // flex: 1,
    paddingLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 4,
    flexDirection: 'row', // Add this line to align the picker and icon horizontally
    alignItems: 'center', // Add this line to vertically center the picker and icon
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
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
