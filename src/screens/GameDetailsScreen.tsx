import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { RootStackParamList } from '../navigationTypes';

type GameDetailsScreenRouteProp = RouteProp<RootStackParamList, 'GameDetails'>;

const GameDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<GameDetailsScreenRouteProp>();
  const { hanchan } = route.params;
  const [hanchanDetails, setHanchanDetails] = useState<any[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '半壮詳細',
      headerTitleAlign: 'center', 
    });
  }, [navigation]);

  useEffect(() => {
    const fetchHanchanDetails = async () => {
      try {
        const db = getFirestore();
        const roundsCollection = collection(db, 'games', hanchan.gameId, 'hanchan', hanchan.id, 'rounds');
        const roundsSnapshot = await getDocs(roundsCollection);

        if (roundsSnapshot.empty) {
          setHanchanDetails([{ ...hanchan, rounds: [] }]);
          return;
        }

        const rounds = roundsSnapshot.docs.map((roundDoc) => {
          const round = roundDoc.data();
          const winnerName = round.winner || '流局';  // `winner` が存在すればそのまま使用、なければ "流局" と表示
          const discarderName = round.discarder || 'ツモ';  // `discarder` が存在すればそのまま使用、なければ "ツモ" と表示
          const winnerPoints = round.winnerPoints ? `打点: ${round.winnerPoints}` : '';  // `winnerPoints` が存在すれば表示
          console.log("あがった人:", winnerName);
          console.log("打点:", winnerPoints);
          return { ...round, winnerName, discarderName, winnerPoints };
        });

        // Sort rounds
        const sortedRounds = rounds.sort((a, b) => {
          const placeOrder = { '東': 1, '南': 2, '西': 3, '北': 4 };
          if (placeOrder[a.roundNumber.place] !== placeOrder[b.roundNumber.place]) {
            return placeOrder[a.roundNumber.place] - placeOrder[b.roundNumber.place];
          }
          if (a.roundNumber.round !== b.roundNumber.round) {
            return a.roundNumber.round - b.roundNumber.round;
          }
          return a.roundNumber.honba - b.roundNumber.honba;
        });

        setHanchanDetails([{ ...hanchan, rounds: sortedRounds }]);
      } catch (error) {
        console.error('Error fetching hanchan details:', error);
      }
    };

    fetchHanchanDetails();
  }, [hanchan]);

  const handleRoundPress = (round) => {
    navigation.navigate('ScoreInput', {
      gameId: hanchan.gameId,
      round: round
    });
  };

  if (!hanchanDetails.length) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.gameBox}>
        <Text style={styles.dateText}>日時: {new Date(hanchan.createdAt.seconds * 1000).toLocaleString()}</Text>
        <View style={styles.membersContainer}>
          {hanchan.members && hanchan.members.map((member, index) => (
            <Text key={index} style={styles.memberText}>{member}</Text>
          ))}
        </View>
        {hanchanDetails.map((hanchanDetail, index) => (
          <View key={`${hanchanDetail.id}-${index}`} style={styles.hanchanBox}>
            {hanchanDetail.rounds && hanchanDetail.rounds.map((round, idx) => (
              <TouchableOpacity key={`${round.roundSeq}-${idx}`} style={styles.roundContainer} onPress={() => handleRoundPress(round)}>
                <View style={styles.roundBox}>
                  <Text style={styles.roundText}>
                    {round.roundNumber.place}場
                    {round.roundNumber.round}局
                    {round.roundNumber.honba}本場
                  </Text>
                  {round.isRyuukyoku ? (
                    <Text style={styles.roundText}>流局</Text>
                  ) : (
                    <>
                      <Text style={styles.winnerNameText}>あがった人: {round.winnerName}</Text>
                      <Text style={styles.discarderNameText}>放銃したひと: {round.discarderName}</Text>
                      <Text style={styles.winnerPoints}>{round.winnerPoints}</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameBox: {
    flex: 1,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  membersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  memberText: {
    fontSize: 20,
    marginRight: 10,
  },
  hanchanBox: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  roundContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
  roundBox: {
    marginBottom: 8,
  },
  roundText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  winnerNameText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 5,
    color: 'blue'
  },
  winnerPoints: {
    fontSize: 14,
    marginVertical: 5,
  },
  discarderNameText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 5,
    color: 'red'
  },
});

export default GameDetailsScreen;
