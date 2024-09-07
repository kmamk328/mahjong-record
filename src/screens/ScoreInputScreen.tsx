import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import {
  View,
  Text,
  Button,
  Switch,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { FAB } from 'react-native-paper'; // Floating Action Button
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type RootStackParamList = {
  ScoreInput: { gameId: string };
};

type ScoreInputScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ScoreInput'
>;

type ScoreInputScreenRouteProp = RouteProp<RootStackParamList, 'ScoreInput'>;

const ScoreInputScreen = () => {
  const [currentRound, setCurrentRound] = useState({
    discarder: '',
    discarderPoints: '',
    isNaki: false,
    isReach: false,
    isRyuukyoku: false,
    roundNumber: { round: '1', place: '東', honba: '0' },
    winner: '',
    winnerPoints: '',
    isTsumo: false,
    isOya: false,
    roles: [],
    dora: 0,
    uraDora: 0,
    roundSeq: 0,
  });
  const [members, setMembers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerType, setPickerType] = useState('');
  const [availablePoints, setAvailablePoints] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [filteredPoints, setFilteredPoints] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const navigation = useNavigation();
  const route = useRoute();
  // const { gameId } = route.params;
  // const { gameId, roundId, roundData } = route.params; // roundIdを受け取る
  const { gameId, hanchanId, roundId, roundData } = route.params;
  const [rolesOptions, setRolesOptions] = useState([
    { role: 'リーチ', points: 1 },
    { role: '一発(イッパツ)', points: 1 },
    { role: 'ツモ', points: 1 },
    { role: '平和(ピンフ)', points: 1 },
    { role: '断么九(タンヤオ)', points: 1 },
    { role: '飜牌(ファンパイ)/役牌(やくはい)', points: 1 },
    { role: '一盃口(イーペーコー)', points: 1 },
    { role: '嶺上開花(リンシャンカイホー)', points: 1 },
    { role: '槍槓(チャンカン)', points: 1 },
    { role: '海底(ハイテイ)/河底(ホーテイ)', points: 1 },
    { role: 'ダブルリーチ', points: 1 },
    { role: '三色同順(サンショクドウジュン)', points: 1 },
    { role: '三色同刻(サンショクドウコー)', points: 1 },
    { role: '一気通貫(イッキツウカン)', points: 1 },
    { role: '対々和(トイトイホー)', points: 1 },
    { role: '三暗刻(サンアンコー)', points: 1 },
    { role: '三槓子(サンカンツ)', points: 1 },
    { role: '全帯么(チャンタ)', points: 1 },
    { role: '混老頭(ホンロートー)', points: 1 },
    { role: '小三元(ショウサンゲン)', points: 1 },
    { role: '七対子(チートイツ)', points: 1 },
    { role: '二盃口(リャンペーコー)', points: 1 },
    { role: '混一色(ホンイツ)', points: 1 },
    { role: '純全帯么(ジュンチャンタ)', points: 1 },
    { role: '清一色（チンイツ）', points: 1 },
  ]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [roundSeq, setRoundSeq] = useState(0);
  const [isTsumo, setIsTsumo] = useState(false);
  const [isNaki, setIsNaki] = useState(false);
  const [isReach, setIsReach] = useState(false);
  const [discarder, setDiscarder] = useState('');
  const [discarderPoints, setDiscarderPoints] = useState('');
  const firestore = getFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previousRoundInfo, setPreviousRoundInfo] = useState('開局');
  const [previousRound, setPreviousRound] = useState(null);
  const [nextRound, setNextRound] = useState(null);
  // const [hanchanId, setHanchanId] = useState<string | null>(null);
  const [winners, setWinners] = useState([{ winner: '', isOya: false, isTsumo: false, isNaki: false, isReach: false, winnerPoints: '' }]);
  const [tenpaiPlayers, setTenpaiPlayers] = useState(['']);
  const [selectedTenpaiIndex, setSelectedTenpaiIndex] = useState(null);
  const [selectedWinnerIndex, setSelectedWinnerIndex] = useState(null);


  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#000',
      headerTitle: 'スコア入力',
      headerTitleAlign: 'center',
      headerRight: () => (
        <Button
          onPress={handleFinish}
          title="終了"
          color="#000"
        />
      ),
    });
  }, [navigation]);



  useEffect(() => {
    const fetchMembers = async () => {
      const gameDoc = await getDoc(doc(db, 'games', gameId));
      const memberIds = gameDoc.data().members;
      const memberNames = [];
      for (const memberId of memberIds) {
        const memberDoc = await getDoc(doc(db, 'members', memberId));
        memberNames.push({ id: memberId, name: memberDoc.data().name });
      }
      setMembers(memberNames);
    };

    const fetchHanchan = async () => {
      if (hanchanId) return; // すでにhanchanIdが存在する場合は、再実行しない
      const hanchanCollection = collection(db, 'games', gameId, 'hanchan');
      const hanchanSnapshot = await getDocs(query(hanchanCollection, orderBy('createdAt', 'desc')));
      if (!hanchanSnapshot.empty) {
        const latestHanchan = hanchanSnapshot.docs[0];
        // setHanchanId(latestHanchan.id);
        const roundsCollection = collection(db, 'games', gameId, 'hanchan', latestHanchan.id, 'rounds');
        const roundsSnapshot = await getDocs(query(roundsCollection, orderBy('roundSeq', 'desc')));
        if (!roundsSnapshot.empty) {
          const lastRound = roundsSnapshot.docs[0].data();
          setRoundSeq(lastRound.roundSeq + 1);
        } else {
          setRoundSeq(1);
        }
      } else {
        const newHanchanRef = await addDoc(hanchanCollection, { createdAt: new Date() });
        console.log("New Hanchan created with ID(fetchHanchan):", newHanchanRef.id, "at", new Date().toLocaleString());
        // setHanchanId(newHanchanRef.id);
        setRoundSeq(1);
      }
    };

    fetchMembers();
    fetchHanchan();
  }, [gameId]);


  useEffect(() => {
    // もしround情報がルートから渡されている場合は、currentRoundにセット
    if (roundId) {
      setCurrentRound(roundId);
    }
  }, [roundId]);

  const handlePickerChange = (value, index) => {
    setModalVisible(false);
    if (pickerType === 'winner' && selectedWinnerIndex !== null) {
      const updatedWinners = [...winners];
      updatedWinners[selectedWinnerIndex].winner = value; // 選択された名前を更新
      setWinners(updatedWinners);
    } else if (pickerType === 'winnerPoints' && selectedWinnerIndex !== null) {
      const updatedWinners = [...winners];
      updatedWinners[selectedWinnerIndex].winnerPoints = value; // あがり点を更新
      setWinners(updatedWinners);
    } else if (pickerType === 'tenpai' && selectedTenpaiIndex !== null) {
      const updatedTenpaiPlayers = [...tenpaiPlayers];
      updatedTenpaiPlayers[selectedTenpaiIndex] = value;
      setTenpaiPlayers(updatedTenpaiPlayers);
    } else {
      switch (pickerType) {
        case 'place':
          setCurrentRound({
            ...currentRound,
            roundNumber: { ...currentRound.roundNumber, place: value },
          });
          break;
        case 'round':
          setCurrentRound({
            ...currentRound,
            roundNumber: { ...currentRound.roundNumber, round: value },
          });
          break;
        case 'honba':
          setCurrentRound({
            ...currentRound,
            roundNumber: { ...currentRound.roundNumber, honba: value },
          });
          break;
        case 'winner':
          setCurrentRound({ ...currentRound, winner: value });
          break;
        case 'discarder':
          setCurrentRound({ ...currentRound, discarder: value });
          break;
        case 'winnerPoints':
          setCurrentRound({ ...currentRound, winnerPoints: value });
          break;
        case 'dora':
          setCurrentRound({ ...currentRound, dora: value });
          break;
        case 'uraDora':
          setCurrentRound({ ...currentRound, uraDora: value });
          break;
        default:
          break;
      }
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#000',
      headerTitle: 'スコア入力',
      headerTitleAlign: 'center',
    });
  }, [navigation]);


  useEffect(() => {
    updateAvailablePoints();
  }, [currentRound.isTsumo, currentRound.isOya]);


  const toggleRoleSelection = (role) => {
    const updatedRoles = selectedRoles.includes(role)
      ? selectedRoles.filter(r => r !== role)
      : [...selectedRoles, role];
    setSelectedRoles(updatedRoles);
    updateFilteredPoints(updatedRoles);
  };

  const updateFilteredPoints = (updatedRoles) => {
    const totalPoints = updatedRoles.reduce((sum, role) => {
      const roleObj = rolesOptions.find(r => r.role === role);
      return sum + (roleObj ? roleObj.points : 0);
    }, 0);

    let newFilteredPoints = availablePoints;
    if (totalPoints >= 2) {
      newFilteredPoints = newFilteredPoints.filter(point => point >= 2000);
    }
    if (totalPoints >= 4) {
      newFilteredPoints = newFilteredPoints.filter(point => point >= 8000);
    }

    setFilteredPoints(newFilteredPoints);
  };

  const updateAvailablePoints = () => {
    let points = [];
    if (currentRound.isOya && currentRound.isTsumo) {
      points = [
        500, 700, 800, 1000, 1200, 1300, 1500, 1600, 2000, 2300, 2600,
        2900, 3200, 3600, 4000, 6000, 8000, 12000, 16000, 32000
      ].map(p => `${p}オール`);
    } else if (currentRound.isOya && !currentRound.isTsumo) {
      points = [
        1500, 2000, 2400, 2900, 3400, 3900, 4400, 4800, 5300, 5800, 6800,
        7700, 8700, 9600, 10600, 12000, 18000, 24000, 36000, 48000, 96000
      ];
    } else if (!currentRound.isOya && currentRound.isTsumo) {
      points = [
        '子(300) 親(500)', '子(400) 親(700)', '子(400) 親(800)', '子(500) 親(1000)',
        '子(600) 親(1200)', '子(700) 親(1300)', '子(800) 親(1500)', '子(800) 親(1600)',
        '子(1000) 親(1600)', '子(1000) 親(2000)', '子(1200) 親(2300)', '子(1300) 親(2600)',
        '子(1500) 親(2900)', '子(1600) 親(3200)', '子(1800) 親(3600)', '子(2000) 親(3900)',
        '子(2000) 親(4000)', '子(3000) 親(6000)', '子(4000) 親(8000)', '子(8000) 親(16000)',
        '子(16000) 親(32000)'
      ];
    } else {
      points = [
        1000, 1300, 1600, 2000, 2300, 2600, 2900, 3200, 3600, 3900, 4500, 5200,
        5800, 6400, 7100, 7700, 8000, 12000, 16000, 24000, 32000, 64000
      ];
    }
    setAvailablePoints(points);
  };

  useEffect(() => {
    if (roundData) {
        setCurrentRound({
            discarder: roundData.discarder || '',
            discarderPoints: roundData.discarderPoints || '',
            isNaki: roundData.isNaki || false,
            isReach: roundData.isReach || false,
            isRyuukyoku: roundData.isRyuukyoku || false,
            roundNumber: roundData.roundNumber || { round: '1', place: '東', honba: '0' },
            winner: roundData.winner || '',
            winnerPoints: roundData.winnerPoints || '',
            isTsumo: roundData.isTsumo || false,
            isOya: roundData.isOya || false,
            roles: roundData.roles || [],
            dora: roundData.dora || 0,
            uraDora: roundData.uraDora || 0,
            roundSeq: roundData.roundSeq || 0,
        });
    }
}, [roundData]);

const handleNext = async () => {
  try {
    const currentUser = auth.currentUser?.uid;

    console.log('gameId:', gameId);
    console.log('hanchanId:', hanchanId);
    console.log('roundId:', roundId);
    console.log('currentRound:', currentRound);
    console.log('selectedRoles:', selectedRoles);
    console.log('roundSeq:', roundSeq);

    if (roundId) {
      // 既存のラウンド情報を更新
      const roundRef = doc(db, 'games', gameId, 'hanchan', hanchanId, 'rounds', roundId);
      console.log('Updating round with ID:', roundId);
      await updateDoc(roundRef, {
        ...currentRound,
        roles: selectedRoles,
        roundSeq,
        tenpaiPlayers,
        // createdUser: currentUser,
      });
      console.log('Round updated successfully');
    } else {
      // 新規ラウンドを追加
      const roundsRef = collection(db, 'games', gameId, 'hanchan', hanchanId, 'rounds');
      console.log('Creating new round in game:', gameId, 'and hanchan:', hanchanId);
      const newRoundRef = await addDoc(roundsRef, {
        ...currentRound,
        isTsumo: currentRound.isTsumo,
        isNaki: currentRound.isNaki,
        isReach: currentRound.isReach,
        isRyuukyoku: currentRound.isRyuukyoku,
        discarder: currentRound.discarder,
        discarderPoints: currentRound.discarderPoints,
        roles: selectedRoles,
        dora: currentRound.dora,
        uraDora: currentRound.uraDora,
        isOya: currentRound.isOya,
        roundSeq,
        tenpaiPlayers,
        // createdUser: currentUser,
      });
      console.log("New Round created with ID:", newRoundRef.id, "at", new Date().toLocaleString());
    }

    // 勝者のポイント更新
    if (currentRound.winner) {
      const winnerRef = doc(db, 'members', currentRound.winner);
      const winnerDoc = await getDoc(winnerRef);
      if (winnerDoc.exists()) {
        console.log('Updating points for winner:', currentRound.winner);
        await updateDoc(winnerRef, {
          totalPoints: winnerDoc.data().totalPoints + parseInt(currentRound.winnerPoints, 10),
        });
        console.log('Winner points updated');
      }
    }

    // 放銃者のポイント更新
    if (currentRound.discarder) {
      const discarderRef = doc(db, 'members', currentRound.discarder);
      const discarderDoc = await getDoc(discarderRef);
      if (discarderDoc.exists()) {
        console.log('Updating points for discarder:', currentRound.discarder);
        await updateDoc(discarderRef, {
          totalPoints: discarderDoc.data().totalPoints - parseInt(currentRound.discarderPoints, 10),
        });
        console.log('Discarder points updated');
      }
    }

    setIsDialogOpen(true);
    handleDialogClose();
  } catch (error) {
    console.error("Error saving round data: ", error);
  }
};



  const handleFinish = async () => {
    Alert.alert(
      "確認",
      "半壮の入力を保存しますか？",
      [
        {
          text: "キャンセル",
          onPress: () => console.log("キャンセル"),
          style: "cancel"
        },
        {
          text: "保存",
          onPress: async () => {
            // await handleNext();  // 最新のデータを保存
            navigation.navigate('HanchanList', { gameId });  // 全半壮照会画面に遷移
          }
        }
      ],
      { cancelable: false }
    );
  };

  const confirmRolesSelection = () => {
    setCurrentRound({ ...currentRound, roles: selectedRoles });
    setModalVisible(false);
  };

  const clearAllRolesSelection = () => {
    setSelectedRoles([]);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    navigation.navigate('ScoreInput', {
      gameId,
      hanchanId,
      members,
      roundSeq: currentRound.roundSeq + 1,
      animation: 'slide_from_right'
    });
    setCurrentRound({
      discarder: '',
      discarderPoints: '',
      isNaki: false,
      isReach: false,
      isRyuukyoku: false,
      roundNumber: { round: '1', place: '東', honba: '0' },
      winner: '',
      winnerPoints: '',
      isTsumo: false,
      isOya: false,
      roles: [],
      dora: 0,
      uraDora: 0,
      roundSeq: currentRound.roundSeq + 1,
    });
    setIsTsumo(false);
    setIsNaki(false);
    setIsReach(false);
    setDiscarder('');
    setDiscarderPoints('');
    setSelectedRoles([]);
    setPreviousRoundInfo(fetchPreviousRoundInfo());
  };

  const handleOyaChange = (value) => {
    setCurrentRound({ ...currentRound, isOya: value });
    updateFilteredPoints(selectedRoles, isTsumo, value);
  };

  const handleSwitchChange = (field, value, index) => {
    const updatedWinners = [...winners];
    updatedWinners[index][field] = value;
    setWinners(updatedWinners);
  };

  const fetchPreviousRoundInfo = () => {
    const previousRound = rounds[currentRoundIndex];
    if (previousRound) {
        const { place, round, honba } = previousRound.roundNumber;
        return `＜${place}場${round}局${honba}本場`;
    }
    return "開局";
  };

  const resetForm = () => {
    setCurrentRound({
      discarder: '',
      discarderPoints: '',
      isNaki: false,
      isReach: false,
      isRyuukyoku: false,
      roundNumber: { round: '1', place: '東', honba: '0' },
      winner: '',
      winnerPoints: '',
      dora: 0,
      uraDora: 0,
      isTsumo: false,
      isOya: false,
      roles: [],
      roundSeq: 0
    });
    setSelectedRoles([]);
  };

  const confirmSave = () => {
    Alert.alert(
      "保存の確認",
      "データを保存しますか？",
      [
        {
          text: "キャンセル",
          style: "cancel"
        },
        {
          text: "保存",
          onPress: async () => {
            await handleNext();
            Alert.alert("保存完了", "データが保存されました");
          }
        }
      ]
    );
  };

  const openPicker = (type) => {
    setPickerType(type);
    setModalVisible(true);
  };

  const openWinPickers = (type, index) => {
    setPickerType(type);
    setSelectedWinnerIndex(index); // indexを保存して、後でどの項目を編集しているかを記憶
    setModalVisible(true);
  };
  const addWinnerPicker = () => {
    if (winners.length < 3) {
      setWinners([...winners, { winner: '', isOya: false, isTsumo: false, isNaki: false, isReach: false, winnerPoints: '' }]);
    } else {
      Alert.alert('エラー', 'あがった人は最大3人まで設定できます。');
    }
  };

  const removeWinner = (index) => {
    const updatedWinners = [...winners];
    updatedWinners.splice(index, 1);
    setWinners(updatedWinners);
  };

  const handleWinnerPickerChange = (value, index, field) => {
    const updatedWinners = [...winners];
    updatedWinners[index][field] = value;
    setWinners(updatedWinners);
  };

  const addTenpaiPicker = () => {
    if (tenpaiPlayers.length < 4) {
      setTenpaiPlayers([...tenpaiPlayers, '']);
    } else {
      Alert.alert('エラー', '聴牌者は最大4人まで設定できます。');
    }
  };

  const openTenpaiPicker = (index) => {
    setPickerType('tenpai');
    setSelectedTenpaiIndex(index);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
    <ScrollView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.roundContainer}>
          <TouchableOpacity onPress={() => openPicker('place')}>
            <View style={styles.inputRound}>
              <Text>{currentRound.roundNumber.place}</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.roundTextInline}> 場 </Text>

          <TouchableOpacity onPress={() => openPicker('round')}>
            <View style={styles.inputRound}>
              <Text>{currentRound.roundNumber.round}</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.roundTextInline}> 局 </Text>

          <TouchableOpacity onPress={() => openPicker('honba')}>
            <View style={styles.inputRound}>
              <Text>{currentRound.roundNumber.honba}</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.roundTextInline}> 本場 </Text>
        </View>

        {/* 流局のSwitchと聴牌者の選択 */}
        <View style={styles.switchContainer}>
          <Text style={styles.discarderLabel}>流局:</Text>
          <Switch
            value={currentRound.isRyuukyoku}
            onValueChange={() =>
              setCurrentRound({ ...currentRound, isRyuukyoku: !currentRound.isRyuukyoku })
            }
          />
        </View>
        <View style={styles.divider} />

        {currentRound.isRyuukyoku ? (
          <View>
            <View style={styles.tenpaiHeader}>
              <Text style={styles.discarderLabel}>聴牌者を選択してください</Text>
                <TouchableOpacity onPress={addTenpaiPicker}>
                  <MaterialCommunityIcons name="plus-circle" size={24} color="green" />
                </TouchableOpacity>
            </View>
            {tenpaiPlayers.map((player, index) => (
                <TouchableOpacity key={index} onPress={() => openTenpaiPicker(index)}>
                  <View style={styles.input}>
                    <Text>{player ? player : `聴牌者 ${index + 1} を選択`}</Text>
                  </View>
                </TouchableOpacity>

              ))}
          </View>
        ) : (
          <>
            <View>
            <View style={styles.tenpaiHeader}>
              <Text style={styles.discarderLabel}>あがった人を選択してください</Text>
              <TouchableOpacity onPress={addWinnerPicker}>
                <MaterialCommunityIcons name="plus-circle" size={24} color="green" />
              </TouchableOpacity>
            </View>
            {winners.map((winner, index) => (
              <View key={index} style={styles.winnerContainer}>
                <View style={styles.divider} />
                <View style={styles.winnerRow}>
                  <TouchableOpacity onPress={() => openWinPickers('winner', index)} style={styles.nameContainer}>
                    <View style={styles.inputRow}>
                      <Text>{winner.winner ? winner.winner : `あがった人 ${index + 1} を選択`}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => removeWinner(index)} style={styles.removeButton}>
                    <MaterialCommunityIcons name="minus-circle" size={24} color="red" />
                  </TouchableOpacity>
                </View>

                {/* 親・リーチ・ツモ・鳴きのスイッチ */}
                <View style={styles.switchContainer}>
                  <Text style={styles.discarderLabel}>親：</Text>
                  <Switch
                    value={winner.isOya}
                    onValueChange={() => handleWinnerPickerChange(!winner.isOya, index, 'isOya')}
                  />
                  <Text style={styles.discarderLabel}>リーチ：</Text>
                  <Switch
                    value={winner.isReach}
                    onValueChange={() => handleWinnerPickerChange(!winner.isReach, index, 'isReach')}
                  />
                </View>

                <View style={styles.switchContainer}>
                  <Text style={styles.discarderLabel}>ツモ：</Text>
                  <Switch
                    value={winner.isTsumo}
                    onValueChange={() => handleWinnerPickerChange(!winner.isTsumo, index, 'isTsumo')}
                  />
                  <Text style={styles.discarderLabel}>鳴き：</Text>
                  <Switch
                    value={winner.isNaki}
                    onValueChange={() => handleWinnerPickerChange(!winner.isNaki, index, 'isNaki')}
                  />
                </View>

                {/* あがり点のPicker */}
                <View>
                  <Text style={styles.discarderLabel}>あがり点</Text>
                  <TouchableOpacity onPress={() => openWinPickers('winnerPoints', index)}>
                    <View style={styles.input}>
                      <Text>{winner.winnerPoints ? winner.winnerPoints : 'あがり点を選択'}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

          </View>

            <View style={styles.divider} />

            {!currentRound.isTsumo && (
              <View>
                <Text style={styles.discarderLabel}>放銃したひと:</Text>
                <TouchableOpacity onPress={() => openPicker('discarder')}>
                  <View style={styles.input}>
                    <Text>
                      {currentRound.discarder ? currentRound.discarder : '放銃した人を選択'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>


      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={
                pickerType === 'place'
                  ? currentRound.roundNumber.place
                  : pickerType === 'round'
                  ? currentRound.roundNumber.round
                  : pickerType === 'honba'
                  ? currentRound.roundNumber.honba
                  : pickerType === 'winner'
                  ? winners[selectedWinnerIndex]?.winner // 選択されたwinnerをインデックスに基づいて表示
                  : pickerType === 'discarder'
                  ? currentRound.discarder
                  : pickerType === 'winnerPoints'
                  ? winners[selectedWinnerIndex]?.winnerPoints // 選択されたwinnerのpointsを表示
                  : pickerType === 'dora'
                  ? currentRound.dora
                  : pickerType === 'uraDora'
                  ? currentRound.uraDora
                  : pickerType === 'tenpai'
                  ? tenpaiPlayers[selectedTenpaiIndex] // 聴牌者の選択肢を表示
                  : ''
              }
              onValueChange={handlePickerChange}
            >
              {pickerType === 'place' &&
                ['東', '南', '西', '北'].map((place) => (
                  <Picker.Item key={place} label={place} value={place} />
                ))}
              {pickerType === 'round' &&
                [1, 2, 3, 4].map((round) => (
                  <Picker.Item key={round} label={round.toString()} value={round.toString()} />
                ))}
              {pickerType === 'honba' &&
                Array.from({ length: 21 }, (_, i) => i).map((honba) => (
                  <Picker.Item key={honba} label={honba.toString()} value={honba.toString()} />
                ))}
              {pickerType === 'winner' &&
                members.map((member) => (
                  <Picker.Item key={member.id} label={member.name} value={member.name} />
                ))}
              {pickerType === 'discarder' &&
                members.map((member) => (
                  <Picker.Item key={member.id} label={member.name} value={member.name} />
                ))}
              {pickerType === 'winnerPoints' &&
                availablePoints.map((point, index) => (
                  <Picker.Item key={index} label={point.toString()} value={point.toString()} />
                ))}
              {pickerType === 'tenpai' &&
                  members.map((member) => (
                    <Picker.Item key={member.id} label={member.name} value={member.name} />
                  ))}
              {pickerType === 'dora' &&
                Array.from({ length: 21 }, (_, i) => i.toString()).map((num) => (
                  <Picker.Item key={num} label={num} value={num} />
                ))}
              {pickerType === 'uraDora' &&
                Array.from({ length: 21 }, (_, i) => i.toString()).map((num) => (
                  <Picker.Item key={num} label={num} value={num} />
                ))}
            </Picker>
            <Button title="閉じる" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
    <FAB
      style={[styles.fab, { backgroundColor: '#f0f8ff' }]}
      small
      // icon="chevron-right"
      icon={() => <MaterialCommunityIcons name="content-save" size={24} color="#000" />}
      onPress={confirmSave}
    />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    padding: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rolesContainer: {
    marginVertical: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    paddingLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 4,
    justifyContent: 'center',
  },
  inputRound: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '200%',
    paddingLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 4,
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 4,
    justifyContent: 'center',
  },
  nameContainer: {
    flex: 1, // 名前部分により多くのスペースを割り当てる
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '50%',
  },
  roundTextInline: {
    fontSize: 16,
    marginLeft: 8,
  },
  discarderLabel: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  roundContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    alignItems: 'center',
    marginHorizontal: 0,
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginBottom: 5,
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  tenpaiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  winnerContainer: {
    // borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    position: 'relative',
  },
  removeButton: {
    marginLeft: 10,
  },
  winnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    justifyContent: 'flex-start', // 余白を詰める
  },
});

export default ScoreInputScreen;