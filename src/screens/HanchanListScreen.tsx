import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { FAB } from 'react-native-paper'; // Floating Action Button

const HanchanListScreen = ({ route }) => {
  const { gameId, members } = route.params;
  const [rounds, setRounds] = useState([]);
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
      }

      const roundsCollection = collection(db, 'games', gameId, 'rounds');
      const roundsSnapshot = await getDocs(roundsCollection);
      const roundsList = roundsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRounds(roundsList);
    };

    fetchGameData();
  }, [gameId]);

  const getTopPlayer = (rounds) => {
    const playerCounts = {};

    rounds.forEach(round => {
      const winner = round.winner;
      if (winner) {
        if (!playerCounts[winner]) {
          playerCounts[winner] = 0;
        }
        playerCounts[winner]++;
      }
    });

    const topPlayer = Object.keys(playerCounts).reduce((a, b) => playerCounts[a] > playerCounts[b] ? a : b, '');
    return topPlayer;
  };

  const handleAddRound = () => {
    navigation.navigate('ScoreInput', { gameId });
  };

  const handleRoundPress = (round) => {
    navigation.navigate('EditRound', { gameId, round });
  };

  return (
    <ScrollView
    style={styles.container}
    scrollEventThrottle={400}
    >
    <View style={styles.gameBox}>
      <Text style={styles.dateText}>{createdAt}</Text>
      <View style={styles.membersContainer}>
        {members.map((member, index) => (
          <Text key={index} style={styles.memberText}>{member}</Text>
        ))}
      </View>
      {rounds.length === 0 ? (
        <Text style={styles.noDataText}>データがありません</Text>
      ) : (
        <ScrollView>
          {rounds.map((round, index) => (
            <TouchableOpacity
              key={round.id}
              style={styles.roundContainer}
              // onPress={() => handleRoundPress(round)}
              onPress={() => handleAddRound()}
            >
              <Text style={styles.roundText}>第 {index + 1} 半荘</Text>
              <Text style={styles.roundText}>トッププレイヤー: {getTopPlayer([round])}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <FAB
        style={styles.fab}
        small
        icon="plus"
        onPress={handleAddRound}
      />
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
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
    },
  });
  
  export default HanchanListScreen;
  