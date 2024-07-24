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
      headerTitle: 'ゲーム詳細',
    });
  }, [navigation]);

  useEffect(() => {
    const fetchHanchanDetails = async () => {
      try {
        const db = getFirestore();
        const roundsCollection = collection(db, 'games', hanchan.gameId, 'hanchan', hanchan.id, 'rounds');
        const roundsSnapshot = await getDocs(roundsCollection);

        console.log('roundsSnapshot:', roundsSnapshot.docs.length); // 確認ポイント

        if (roundsSnapshot.docs.length === 0) {
          console.log('No rounds available in hanchan:', hanchan);
          setHanchanDetails([{ ...hanchan, rounds: [] }]);
          return;
        }

        const rounds = await Promise.all(
          roundsSnapshot.docs.map(async (roundDoc) => {
            const round = roundDoc.data();
            const winnerName = round.winner ? (await getDoc(doc(db, `members/${round.winner}`))).data()?.name : '流局';
            const discarderName = round.discarder ? (await getDoc(doc(db, `members/${round.discarder}`))).data()?.name : 'つも';
            const roundDetails = { ...round, winnerName, discarderName };
            console.log('Round details:', roundDetails); // 確認ポイント
            return roundDetails;
          })
        );

        setHanchanDetails([{ ...hanchan, rounds }]);
      } catch (error) {
        console.error('Error fetching hanchan details:', error);
      }
    };

    fetchHanchanDetails();
  }, [hanchan]);

  if (!hanchanDetails.length) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handlePress = (hanchan: any) => { // 型を追加
    navigation.navigate('HanchanList' as never, { hanchan } as never); // 型アサーションを追加
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.gameBox}>
        <Text style={styles.dateText}>日時: {new Date(hanchan.createdAt.seconds * 1000).toLocaleString()}</Text>
        <View style={styles.membersContainer}>
        {hanchan?.members?.map((member, index) => (
            <Text key={index} style={styles.memberText}>{member}</Text>
          ))}
        </View>
        {hanchanDetails.map((hanchanDetail, index) => (
          <TouchableOpacity key={`${hanchanDetail.id}-${index}`} style={styles.hanchanBox} onPress={() => handlePress(hanchanDetail)}>
            <Text style={styles.hanchanText}>Hanchan: {hanchanDetail.id}</Text>
            {hanchanDetail.rounds.map((round, idx) => (
              <View key={`${round.roundSeq}-${idx}`} style={styles.roundBox}>
                <Text style={styles.roundText}>
                  {round.roundNumber.place}場
                  {round.roundNumber.round}局
                  {round.roundNumber.honba}本場
                </Text>
                <Text style={styles.roundText}>あがった人: {round.winnerName}</Text>
                <Text style={styles.roundText}>放銃したひと: {round.discarderName}</Text>
              </View>
            ))}
          </TouchableOpacity>
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
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  roundBox: {
    marginBottom: 8,
  },
  hanchanText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roundText: {
    fontSize: 14,
  },
});

export default GameDetailsScreen;
