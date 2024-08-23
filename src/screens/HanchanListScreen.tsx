import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { FAB } from 'react-native-paper'; // Floating Action Button
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Icon from 'react-native-vector-icons/Feather';

const HanchanListScreen = ({ route }) => {
  const { gameId } = route.params;
  const [members, setMembers] = useState([]);
  const [createdAt, setCreatedAt] = useState(null);
  const [hanchans, setHanchans] = useState([]);
  const navigation = useNavigation();

  const imagePaths = [
    require('../image/pin_1.png'),
    require('../image/pin_2.png'),
    require('../image/pin_3.png'),
    require('../image/pin_4.png'),
    require('../image/pin_5.jpg'),
    require('../image/pin_6.png'),
    require('../image/pin_7.png'),
    require('../image/pin_8.png'),
    require('../image/pin_9.png'),
];

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#000',
      headerTitle: '全半壮照会',
      headerTitleAlign: 'center', 
    });
  }, [navigation]);

  useEffect(() => {
    const fetchGameData = async () => {
      const gameRef = doc(db, 'games', gameId);
      const gameDoc = await getDoc(gameRef);
      if (gameDoc.exists) {
        const gameData = gameDoc.data();
        // 日付をフォーマット
        setCreatedAt(gameData.createdAt.toDate().toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }));

        const membersList = await Promise.all(
          gameData.members.map(async (memberId) => {
            const memberDoc = await getDoc(doc(db, 'members', memberId));
            return memberDoc.exists() ? memberDoc.data().name : 'Unknown Member';
          })
        );
        setMembers(membersList);

        const hanchansCollection = collection(db, 'games', gameId, 'hanchan');
        const hanchansSnapshot = await getDocs(hanchansCollection);
        let hanchansList = hanchansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), gameId }));

        // Sort hanchans by createdAt in ascending order
        hanchansList = hanchansList.sort((a, b) => a.createdAt.toDate() - b.createdAt.toDate());

        setHanchans(hanchansList);
      }
    };

    fetchGameData();
  }, [gameId, route]);

  const handleAddRound = async () => {
    try {
      const newHanchanRef = await addDoc(collection(db, 'games', gameId, 'hanchan'), {
        createdAt: new Date(),
        members: [], // メンバーの初期値（必要に応じて設定）
      });
      navigation.navigate('ScoreInput', { gameId, hanchanId: newHanchanRef.id });
    } catch (error) {
      console.error('Error creating new hanchan:', error);
    }
  };

  const handleHanchanPress = (hanchan) => {
    navigation.navigate('GameDetails', { hanchan });
  };

  const onDelete = async (hanchanId) => {
    try {
      await deleteDoc(doc(db, 'games', gameId, 'hanchan', hanchanId));
      setHanchans((prevHanchans) => prevHanchans.filter((hanchan) => hanchan.id !== hanchanId));
    } catch (error) {
      console.error('Error deleting hanchan:', error);
    }
  };

  return (
    <View style={styles.container}>
    <ScrollView style={styles.container} scrollEventThrottle={400}>
      <View style={styles.gameBox}>
        <Text style={styles.dateText}>{createdAt}</Text>
        <View style={styles.membersContainer}>
          {members.length > 0 ? (
            members.map((member, index) => (
              <Text key={index} style={styles.memberText}>{member}</Text>
            ))
          ) : (
            <Text style={styles.noDataText}>メンバーが見つかりません</Text>
          )}
        </View>
        {hanchans.length === 0 ? (
          <Text style={styles.noDataText}>データがありません</Text>
        ) : (
          hanchans.map((hanchan, index) => (
            <Swipeable
                key={hanchan.id}
                renderRightActions={() => (
                  <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(hanchan.id)}>
                    <Icon name="trash-2" size={24} color="white" />
                  </TouchableOpacity>
                )}
              >
              <TouchableOpacity
                key={hanchan.id}
                style={styles.hanchanContainer}
                onPress={() => handleHanchanPress(hanchan)}
              >
                <Image
                    source={imagePaths[index % imagePaths.length]} // インデックスに基づいて画像を選択
                    style={styles.imageStyle}
                />
                <View style={styles.textContainer}>
                    <Text style={styles.hanchanText}>半荘 {index + 1}</Text>
                    {/* <Text style={styles.hanchanText}>日時: {hanchan.createdAt.toDate().toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}</Text> */}
                </View>
              </TouchableOpacity>
            </Swipeable>
          ))
        )}

      </View>
    </ScrollView>
    <FAB
      style={[styles.fab, { backgroundColor: '#f0f8ff' }]}
      small icon="plus"
      onPress={handleAddRound}
    />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  membersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  memberText: {
    fontSize: 14,
    marginRight: 10,
  },
  noDataText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  gameBox: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  hanchanContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  hanchanText: {
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  imageStyle: {
    width: 60,              // 画像の幅
    height: 70,             // 画像の高さ
    marginRight: 10,        // テキストとの間隔を設定
  },
  textContainer: {
      flex: 1, // 画像の右側に配置されるコンテンツに柔軟な幅を確保
      justifyContent: 'center', // テキストコンテンツの縦方向の中央揃え
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center', // 垂直方向の中央に配置
    alignItems: 'center',    // 水平方向の中央に配置
    width: 70,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'stretch', // 親要素に高さを合わせる
},
});

export default HanchanListScreen;
