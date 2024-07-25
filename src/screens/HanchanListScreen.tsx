import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { FAB } from 'react-native-paper'; // Floating Action Button

const HanchanListScreen = ({ route }) => {
  const { gameId } = route.params;
  const [members, setMembers] = useState([]);
  const [hanchans, setHanchans] = useState<any[]>([]);
  const [createdAt, setCreatedAt] = useState(null);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#000',
      headerTitle: '全半壮照会',
    });
  }, [navigation]);

  useEffect(() => {
    const fetchGameData = async () => {
      const gameRef = doc(db, 'games', gameId);
      const gameDoc = await getDoc(gameRef);
      if (gameDoc.exists) {
        const gameData = gameDoc.data();
        setCreatedAt(gameData.createdAt.toDate().toLocaleString());

        const membersList = await Promise.all(
          gameData.members.map(async (memberId) => {
            const memberDoc = await getDoc(doc(db, 'members', memberId));
            return memberDoc.exists() ? memberDoc.data().name : 'Unknown Member';
          })
        );
        setMembers(membersList);
      }

      const hanchansCollection = collection(db, 'games', gameId, 'hanchan');
      const hanchansSnapshot = await getDocs(hanchansCollection);
      const hanchansList = hanchansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), gameId }));

      setHanchans(hanchansList);
    };

    fetchGameData();
  }, [gameId, route]);

  const handleAddRound = async () => {
    try {
      const newHanchanRef = await addDoc(collection(db, 'games', gameId, 'hanchan'), {
        createdAt: new Date(),
      });
      navigation.navigate('ScoreInput', { gameId, hanchanId: newHanchanRef.id });
    } catch (error) {
      console.error('Error creating new hanchan:', error);
    }
  };

  const handleHanchanPress = (hanchan) => {
    navigation.navigate('GameDetails', { hanchan });
  };

  return (
    <ScrollView style={styles.container}>
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
            <TouchableOpacity
              key={hanchan.id}
              style={styles.hanchanContainer}
              onPress={() => handleHanchanPress(hanchan)}
            >
              <Text style={styles.hanchanText}>半荘 {index + 1}</Text>
              <Text style={styles.hanchanText}>日時: {new Date(hanchan.createdAt.seconds * 1000).toLocaleString()}</Text>
            </TouchableOpacity>
          ))
        )}
        <FAB style={styles.fab} small icon="plus" onPress={handleAddRound} />
      </View>
    </ScrollView>
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
  roundContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  roundText: {
    fontSize: 16,
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
});

export default HanchanListScreen;
