import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { RootStackParamList } from '../navigationTypes';

type GameDetailsScreenRouteProp = RouteProp<RootStackParamList, 'GameDetails'>;

const GameDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<GameDetailsScreenRouteProp>();
  const { hanchan } = route.params;
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);  // ローディング状態を追加

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'ゲーム詳細',
    });
  }, [navigation]);

  useEffect(() => {
    const fetchRoundDetails = async () => {
      try {
        console.log('Fetching round details for hanchan:', hanchan);  // デバッグログ
        const hanchanRounds = hanchan.rounds || [];  // roundsが存在しない場合は空の配列を使用

        if (hanchanRounds.length === 0) {
          console.log('No rounds available in hanchan:', hanchan);
          setLoading(false);
          return;
        }
        
        console.log('Rounds in hanchan:', hanchanRounds);  // デバッグログ
        const db = getFirestore();
        const updatedRounds = await Promise.all(
          hanchanRounds.map(async (round) => {
            console.log('Fetching details for round:', round);  // デバッグログ
            const winnerDoc = round.winner ? await getDoc(doc(db, `members/${round.winner}`)) : null;
            const discarderDoc = round.discarder ? await getDoc(doc(db, `members/${round.discarder}`)) : null;
            const winnerName = round.winner ? winnerDoc.data()?.name : '流局';
            const discarderName = round.discarder ? discarderDoc.data()?.name : 'つも';
            console.log('Round details:', { ...round, winnerName, discarderName });  // デバッグログ
            return { ...round, winnerName, discarderName };
          })
        );
        setRounds(updatedRounds);
        setLoading(false);  // ローディング状態を更新
        console.log('Updated Rounds:', updatedRounds);  // デバッグログ
      } catch (error) {
        console.error('Error fetching round details:', error);
      }
    };

    fetchRoundDetails();
  }, [hanchan]);

  if (loading) {
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
          {hanchan.members.map((member, index) => (
            <Text key={index} style={styles.memberText}>{member}</Text>
          ))}
        </View>
        {rounds.map((round, index) => (
          <View key={`${round.roundSeq}-${index}`} style={styles.roundBox}>
            <Text style={styles.roundText}>
              {round.roundNumber.place}場
              {round.roundNumber.round}局
              {round.roundNumber.honba}本場
            </Text>
            <Text style={styles.roundText}>あがった人: {round.winnerName}</Text>
            <Text style={styles.roundText}>放銃したひと: {round.discarderName}</Text>
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
  roundBox: {
    marginBottom: 8,
  },
  roundText: {
    fontSize: 14,
  },
});

export default GameDetailsScreen;
