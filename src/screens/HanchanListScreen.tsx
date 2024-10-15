import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert  } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, doc, getDoc, query, orderBy, startAfter, limit, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { FAB } from 'react-native-paper'; // Floating Action Button
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ContentLoader, { Rect } from 'react-content-loader/native'; // スケルトンUIを作成するためのライブラリ
import AdBanner from '../components/AdBanner';


const HanchanListScreen = ({ route }) => {
  const { gameId } = route.params;
  const [members, setMembers] = useState([]);
  const [createdAt, setCreatedAt] = useState(null);
  const [hanchans, setHanchans] = useState([]);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true); // 読み込み中を示すステート

  const imagePaths = [
    require('../image/sou_1.png'),
    require('../image/sou_2.png'),
    require('../image/sou_3.png'),
    require('../image/sou_4.png'),
    require('../image/sou_5.png'),
    require('../image/sou_6.png'),
    require('../image/sou_7.png'),
    require('../image/sou_8.png'),
    require('../image/sou_9.png'),
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

  useFocusEffect(
    React.useCallback(() => {
      fetchGameData();
    }, [])
  );

  useEffect(() => {
    fetchGameData();
  }, [gameId, route]);

  const fetchGameData = async () => {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    if (gameDoc.exists) {
      const gameData = gameDoc.data();
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

      hanchansList = hanchansList.sort((a, b) => a.createdAt.toDate() - b.createdAt.toDate());

      setHanchans(hanchansList);
    }
    setLoading(false); // データ取得後にloadingをfalseに設定
  };

  const handleAddRound = async () => {
    try {
      const newHanchanRef = await addDoc(collection(db, 'games', gameId, 'hanchan'), {
        createdAt: new Date(),
        members: [],
      });
      navigation.navigate('ScoreInput', { gameId, hanchanId: newHanchanRef.id });
    } catch (error) {
      console.error('Error creating new hanchan:', error);
    }
  };

  const handleHanchanPress = (hanchan) => {
    try {
        console.log("hanchanListScreen hanchan:", hanchan);
        if (!hanchan || !hanchan.createdAt) {
            throw new Error("Invalid hanchan data");
        }
        if (!Array.isArray(hanchan.members)) {
          throw new Error("Invalid members data");
      }
      const safeHanchan = {
        ...hanchan,
        members: hanchan.members || [],
    };
      console.log("safeHanchan object to be passed:", safeHanchan);

      navigation.navigate('GameDetails', { hanchan: safeHanchan });
    } catch (error) {
        console.error('Error fetching hanchan details:', error);
        Alert.alert("エラー", "半荘データの取得に失敗しました。");
    }
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
          {loading ? (
            <ContentLoader
              speed={2}
              width={300}
              height={50}
              viewBox="0 0 300 50"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb"
            >
              <Rect x="0" y="0" rx="4" ry="4" width="300" height="100" />
              <Rect x="0" y="20" rx="4" ry="4" width="300" height="100" />
            </ContentLoader>
          ) : (
            members.length > 0 ? (
              members.map((member, index) => (
                <Text key={index} style={styles.memberText}>{member}</Text>
              ))
            ) : (
              <Text style={styles.noDataText}>メンバーが見つかりません</Text>
            )
          )}
        </View>
        {loading ? (
          <>
            {[1].map((_, index) => (
              <ContentLoader
                key={index}
                speed={2}
                width={400}
                height={70}
                viewBox="0 0 400 70"
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb"
              >
                <Rect x="0" y="0" rx="4" ry="4" width="300" height="100" />
              </ContentLoader>
            ))}
          </>
        ) : (
          hanchans.length === 0 ? (
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
                      source={imagePaths[index % imagePaths.length]}
                      style={styles.imageStyle}
                  />
                  <View style={styles.textContainer}>
                      <Text style={styles.hanchanText}>{index + 1} 半荘目</Text>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            ))
          )
        )}
      </View>
    </ScrollView>
    <FAB
      style={[styles.fab, { backgroundColor: '#f0f8ff' }]}
      small icon="plus"
      onPress={handleAddRound}
    />
    <AdBanner />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 6,
  },
  dateContainer: {
    marginTop: 16,
    marginBottom: 0,
    padding: 10,
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
    bottom: 80,
  },
  imageStyle: {
    width: 60,
    height: 70,
    marginRight: 10,
  },
  textContainer: {
      flex: 1,
      justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
});

export default HanchanListScreen;
