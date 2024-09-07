import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRoute, RouteProp, useNavigation, NavigationProp } from '@react-navigation/native';
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';


import { RootStackParamList } from '../navigationTypes';
import { FAB } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


type GameDetailsScreenRouteProp = RouteProp<RootStackParamList, 'GameDetails'>;

const GameDetailsScreen: React.FC = () => {
  // const navigation = useNavigation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<GameDetailsScreenRouteProp>();
  const { hanchan } = route.params;
  const [hanchanDetails, setHanchanDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [gameDetails, setGameDetails] = useState<any>(null);
  const [hanchanList, setHanchanList] = useState<any[]>([]);

  const imagePaths = [
    require('../image/man_1.png'),
    require('../image/man_2.png'),
    require('../image/man_3.png'),
    require('../image/man_4.png'),
    require('../image/man_5.png'),
    require('../image/man_6.png'),
    require('../image/man_7.jpg'),
    require('../image/man_8.png'),
    require('../image/man_9.png'),
];

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '半壮詳細',
      headerTitleAlign: 'center',
      // headerRight: () => (
      //   <TouchableOpacity onPress={fetchGameDetails}>
      //       <MaterialCommunityIcons name="reload" size={24} color="#000" />
      //   </TouchableOpacity>
      // ),
    });
  }, [navigation]);

  //デバッグ用
  useEffect(() => {
    console.log("GameDetails screen received hanchan:", hanchan);
}, [hanchan]);
//デバッグ用
useEffect(() => {
    if (hanchan.members && hanchan.members.length > 0) {
        console.log("Members array in hanchan:", hanchan.members);
        console.log("First member:", hanchan.members[0]);
    } else {
        console.log("Members array is undefined or empty.");
    }
}, [hanchan]);

  useEffect(() => {
    // const fetchHanchanDetails = async () => {
    //   try {
    //     const db = getFirestore();
    //     const roundsCollection = collection(db, 'games', hanchan.gameId, 'hanchan', hanchan.id, 'rounds');
    //     const roundsSnapshot = await getDocs(roundsCollection);

    //     if (roundsSnapshot.empty) {
    //       setHanchanDetails([{ ...hanchan, rounds: [] }]);
    //       return;
    //     }

    //     const rounds = roundsSnapshot.docs.map((roundDoc) => {
    //       const round = roundDoc.data();
    //       const winnerName = round.winner || '流局';  // `winner` が存在すればそのまま使用、なければ "流局" と表示
    //       const discarderName = round.discarder || 'ツモ';  // `discarder` が存在すればそのまま使用、なければ "ツモ" と表示
    //       const winnerPoints = round.winnerPoints ? `打点: ${round.winnerPoints}` : '';  // `winnerPoints` が存在すれば表示
    //       console.log("あがった人:", winnerName);
    //       console.log("打点:", winnerPoints);
    //       return { id: roundDoc.id, ...round, winnerName, discarderName, winnerPoints };
    //     });

    //     // Sort rounds
    //     const sortedRounds = rounds.sort((a, b) => {
    //       const placeOrder = { '東': 1, '南': 2, '西': 3, '北': 4 };
    //       if (placeOrder[a.roundNumber.place] !== placeOrder[b.roundNumber.place]) {
    //         return placeOrder[a.roundNumber.place] - placeOrder[b.roundNumber.place];
    //       }
    //       if (a.roundNumber.round !== b.roundNumber.round) {
    //         return a.roundNumber.round - b.roundNumber.round;
    //       }
    //       return a.roundNumber.honba - b.roundNumber.honba;
    //     });

    //     setHanchanDetails([{ ...hanchan, rounds: sortedRounds }]);
    //   } catch (error) {
    //     console.error('Error fetching hanchan details:', error);
    //   }
    // };

    fetchHanchanDetails();
  }, [hanchan]);

  const fetchHanchanDetails = async () => {
    try {
      const roundsCollection = collection(db, 'games', hanchan.gameId, 'hanchan', hanchan.id, 'rounds');
      const roundsSnapshot = await getDocs(roundsCollection);

      if (roundsSnapshot.empty) {
        setHanchanDetails([{ ...hanchan, rounds: [] }]);
        return;
      }

      const rounds = roundsSnapshot.docs.map((roundDoc) => {
        const round = roundDoc.data();
        const winnerNames = round.winners ? round.winners.map((winner) => winner.winner).join(', ') : '流局';
        console.log("round:", round);
        console.log("round.winneraaa:", round.winner);
        console.log("round.winners:", round.winners);
        console.log("winnerNames:", winnerNames);

        const winnerPoints = round.winners
          ? round.winners.map((winner) => `打点: ${winner.winnerPoints}`).join(', ')
          : '';
        //TODO:isTsumoがtrueの時にツモ、round.discarderが空白だったら空白に。
        // const discarderName = round.discarder || 'ツモ';
        const discarderName = round.isTsumo ? 'ツモ' : (round.discarder ? round.discarder : '');
        return { id: roundDoc.id, ...round, winnerNames, discarderName, winnerPoints };
      });

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

  useEffect(() => {
    fetchHanchanDetails();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchHanchanDetails(); // フォーカスされたときにデータを再取得
    });

    return unsubscribe;
  }, [navigation, hanchan]);

  const fetchGameDetails = async () => {
    try {
        setLoading(true);

        const gameDoc = await getDoc(doc(db, 'games', hanchan.gameId));
        if (!gameDoc.exists()) {
            console.error("No such game!");
            return;
        }

        const gameData = gameDoc.data();
        setGameDetails(gameData);

        const hanchanCollection = collection(db, 'games', hanchan.gameId, 'hanchan');
        const hanchanSnapshot = await getDocs(query(hanchanCollection, orderBy('createdAt', 'desc')));

        const hanchanList = hanchanSnapshot.docs.map(hanchanDoc => ({
            id: hanchanDoc.id,
            ...hanchanDoc.data(),
        }));
        setHanchanList(hanchanList);

        console.log("Game Details:", gameData);
        console.log("Hanchan List:", hanchanList);

    } catch (error) {
        console.error('Error fetching game details:', error);
    } finally {
        setLoading(false);
    }
};

  const handleAddRound = async () => {
    try {
        const db = getFirestore();
        const hanchanRef = doc(db, 'games', hanchan.gameId, 'hanchan', hanchan.id);
        const roundsCollection = collection(hanchanRef, 'rounds');
        
        // 新しいラウンド情報の作成（初期値）
        const newRound = {
            roundNumber: { place: '東', round: '1', honba: '0' },
            winner: '',
            discarder: '',
            winnerPoints: '',
            isRyuukyoku: false,
            createdAt: new Date(),
        };

        // Firestore に新しいラウンドを追加
        const newRoundRef = await addDoc(roundsCollection, newRound);
        
        // 追加された新しいラウンドの ID を取得
        const newRoundId = newRoundRef.id;

        // 新しいラウンドの編集画面へ遷移
        // navigation.navigate('ScoreInput', {
        //     gameId: hanchan.gameId,
        //     hanchanId: hanchan.id,  // hanchanIdを渡す
        //     round: { id: newRoundId, ...newRound }, // 作成された新しいラウンド情報を渡す
        // });
        navigation.navigate('ScoreInput', {
          gameId: hanchan.gameId,
          hanchanId: hanchan.id,
          roundId: newRoundRef.id, // 新しく作成したラウンドIDを渡す
          roundData: {
              createdAt: new Date().toISOString(),
              // その他必要な初期データ
          },
      });
        console.log("gameId: ", hanchan.gameId);
        console.log("hanchanId: ", hanchan.id);
        console.log("New Hanchan created with ID(handleAddRound):", newRoundRef.id, "at", new Date().toLocaleString());

    } catch (error) {
        console.error("Error adding new round: ", error);
    }
};


  const handleRoundPress = (roundId, roundData) => {
    navigation.navigate('ScoreInput', {
      gameId: hanchan.gameId,
      hanchanId: hanchan.id,  // hanchanのIDを渡す
      roundId: roundId,       // roundsのドキュメントIDを渡す
      roundData: roundData    // roundデータを渡す
    });
    console.log("GameDetail roundId: ", roundId);
    console.log("GameDetail roundData: ", roundData);
  };

  const onDelete = async (roundId) => {
    try {
      await deleteDoc(doc(db, 'games', hanchan.gameId, 'hanchan', hanchan.id, 'rounds', roundId));
      setHanchanDetails((prevDetails) =>
        prevDetails.map((hanchanDetail) => ({
          ...hanchanDetail,
          rounds: hanchanDetail.rounds.filter((round) => round.id !== roundId),
        }))
      );
    } catch (error) {
      console.error('Error deleting round:', error);
    }
  };


  if (!hanchanDetails.length) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // メンバーが存在しない場合の処理
  // if (!hanchan.members || hanchan.members.length === 0) {
  //   return (
  //       <View style={styles.container}>
  //           <Text style={styles.title}>Game Details</Text>
  //           <Text>Hanchan ID: {hanchan.id}</Text>
  //           <Text>Created At: {new Date(hanchan.createdAt.seconds * 1000).toLocaleString()}</Text>
  //           <Text>メンバーが存在しません。</Text>
  //       </View>
  //   );
  // }

  return (
    <View style={styles.container}>
    <ScrollView style={styles.container}>
      <View style={styles.gameBox}>
        <Text style={styles.dateText}>{new Date(hanchan.createdAt.seconds * 1000).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })}
        </Text>
        <View style={styles.membersContainer}>
          {hanchan.members && hanchan.members.map((member, index) => (
            <Text key={index} style={styles.memberText}>{member}</Text>
          ))}
        </View>
        {hanchanDetails.map((hanchanDetail, index) => (
          <View key={`${hanchanDetail.id}-${index}`} style={styles.hanchanBox}>
            {hanchanDetail.rounds && hanchanDetail.rounds.map((round, idx) => (
              <Swipeable
              key={`${round.roundSeq}-${idx}`}
              renderRightActions={() => (
                <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(round.id)}>
                  <Icon name="trash-2" size={24} color="white" />
                </TouchableOpacity>
              )}
            >
              <TouchableOpacity
                key={`${round.roundSeq}-${idx}`}
                style={styles.roundContainer}
                onPress={() => handleRoundPress(round.id, round)}
              >
                <View style={styles.roundBox}>
                  <Image
                    source={imagePaths[idx % imagePaths.length]} // インデックスに基づいて画像を選択
                    style={styles.imageStyle}
                  />
                  <View style={styles.textContainer}>
                    <Text style={styles.roundText}>
                      {round.roundNumber.place}場 {round.roundNumber.round}局 {round.roundNumber.honba}本場
                    </Text>

                    {round.isRyuukyoku ? (
                      <View>
                        <Text style={styles.roundText}>流局</Text>
                        {round.tenpaiPlayers && round.tenpaiPlayers.map((player, idx) => (
                          <Text key={idx} style={styles.tenpaiPlayerText}>
                            聴牌した人: {player}
                          </Text>
                        ))}
                      </View>
                    ) : (
                      <>
                        {round.winners && round.winners.map((winner, idx) => (
                          <View key={idx} style={styles.winnerContainer}>
                            <Text style={styles.winnerNameText}>あがった人: {winner.winner}</Text>
                            <Text style={styles.winnerPoints}>打点: {winner.winnerPoints}点</Text>
                          </View>
                        ))}

                        <Text style={styles.discarderNameText}>放銃した人: {round.discarderName}</Text>
                      </>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Swipeable>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
      <FAB
      style={[styles.fab, { backgroundColor: '#f0f8ff' }]}
      small
      icon="plus"
      onPress={handleAddRound}
    />
  </View>
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
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  roundBox: {
    flexDirection: 'row',
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
  tenpaiPlayerText: {
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  winnerContainer: {
    marginBottom: 5,  // 各winnerごとの間隔を設定
  }
});

export default GameDetailsScreen;
