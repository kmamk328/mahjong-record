import React, { useState, useEffect, useLayoutEffect} from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
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

type RootStackParamList = {
  ScoreInput: { gameId: string };
  // 他のスクリーンもここに追加
};

type ScoreInputScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ScoreInput'
>;

type ScoreInputScreenRouteProp = RouteProp<RootStackParamList, 'ScoreInput'>;

type Props = {
  navigation: ScoreInputScreenNavigationProp;
  route: ScoreInputScreenRouteProp;
};

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
    roundSeq: 0
  });
  const [members, setMembers] = useState([]);
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
  const [availablePoints, setAvailablePoints] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [filteredPoints, setFilteredPoints] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [roundSeq, setRoundSeq] = useState(0);
  const navigation = useNavigation();
  const route = useRoute();
  const { gameId } = route.params;
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
  const [hanchanId, setHanchanId] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#000',
      headerTitle: 'スコア入力',
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
      const hanchanCollection = collection(db, 'games', gameId, 'hanchan');
      const hanchanSnapshot = await getDocs(query(hanchanCollection, orderBy('createdAt', 'desc')));
      if (!hanchanSnapshot.empty) {
        const latestHanchan = hanchanSnapshot.docs[0];
        setHanchanId(latestHanchan.id);
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
        setHanchanId(newHanchanRef.id);
        setRoundSeq(1);
      }
    };

    fetchMembers();
    fetchHanchan();
  }, [gameId]);

  useEffect(() => {
    updateAvailablePoints();
  }, [currentRound.isTsumo, currentRound.isOya]);

  const handleChange = (key, value) => {
    setCurrentRound({ ...currentRound, [key]: value });
  };

  const handleRoundNumberChange = (key, value) => {
    setCurrentRound({
      ...currentRound,
      roundNumber: {
        ...currentRound.roundNumber,
        [key]: value
      }
    });
  };

  const toggleRoleSelection = (role) => {
    const updatedRoles = selectedRoles.includes(role)
      ? selectedRoles.filter(r => r !== role)
      : [...selectedRoles, role];
    setSelectedRoles(updatedRoles);
    updateFilteredPoints(updatedRoles);
  };

  const handleRoleSelect = (role) => {
    setSelectedRoles(prevRoles => [...prevRoles, role]);
    setModalVisible(false);
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
        1300, 1600, 2000, 2300, 2600, 2900, 3200, 3600, 3900, 4500, 5200,
        5800, 6400, 7100, 7700, 8000, 12000, 16000, 24000, 32000, 64000
      ];
    }
    setAvailablePoints(points);
  };

  const handleNext = async () => {
    try {
      const roundsRef = collection(db, 'games', gameId, 'hanchan', hanchanId, 'rounds');
      await addDoc(roundsRef, {
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
      });

      // Update roundSeq for the next round
      setRoundSeq(roundSeq + 1);

      if (currentRound.winner) {
        const winnerRef = doc(db, 'members', currentRound.winner);
        const winnerDoc = await getDoc(winnerRef);
        if (winnerDoc.exists()) {
          await updateDoc(winnerRef, {
            totalPoints: winnerDoc.data().totalPoints + parseInt(currentRound.winnerPoints, 10)
          });
        }
      }

      if (currentRound.discarder) {
        const discarderRef = doc(db, 'members', currentRound.discarder);
        const discarderDoc = await getDoc(discarderRef);
        if (discarderDoc.exists()) {
          await updateDoc(discarderRef, {
            totalPoints: discarderDoc.data().totalPoints - parseInt(currentRound.discarderPoints, 10)
          });
        }
      }

      setIsDialogOpen(true);
      handleDialogClose();

    } catch (error) {
      console.error("Error saving round data: ", error);
    }
  };

  const handlePrevious = () => {
    if (currentRoundIndex > 0) {
      const newIndex = currentRoundIndex - 1;
      setCurrentRound(rounds[newIndex]);
      setPreviousRoundInfo(
        `<${rounds[newIndex].roundNumber.place}場${rounds[newIndex].roundNumber.round}局${rounds[newIndex].roundNumber.honba}本場>`
      );
      setCurrentRoundIndex(newIndex);
    } else {
      setPreviousRoundInfo('開局');
    }
  };

  const handleFinish = () => {
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
            navigation.navigate('HanchanList', { gameId });
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.roundContainer}>
          <View style={styles.roundRow}>
            <View style={styles.roundPickerContainer}>
              <Picker
                selectedValue={currentRound.roundNumber.place}
                style={styles.roundPicker}
                onValueChange={(itemValue) => handleRoundNumberChange('place', itemValue)}
                itemStyle={styles.pickerRoundItem}
              >
                {['東', '南', '西', '北'].map((place) => (
                  <Picker.Item key={place} label={place} value={place} />
                ))}
              </Picker>
            </View>
            <Text style={styles.roundTextInline}> 場 </Text>
          </View>

          <View style={styles.roundRow}>
            <View style={styles.roundPickerContainer}>
              <Picker
                selectedValue={currentRound.roundNumber.round}
                style={styles.roundPicker}
                onValueChange={(itemValue) => handleRoundNumberChange('round', itemValue)}
                itemStyle={styles.pickerRoundItem}
              >
                {[1, 2, 3, 4].map((round) => (
                  <Picker.Item key={round} label={round.toString()} value={round.toString()} />
                ))}
              </Picker>
            </View>
            <Text style={styles.roundTextInline}> 局 </Text>
          </View>

          <View style={styles.roundRow}>
            <View style={styles.roundPickerContainer}>
              <Picker
                selectedValue={currentRound.roundNumber.honba}
                style={styles.roundPicker}
                onValueChange={(itemValue) => handleRoundNumberChange('honba', itemValue)}
                itemStyle={styles.pickerRoundItem}
              >
                {Array.from({ length: 21 }, (_, i) => i).map((honba) => (
                  <Picker.Item key={honba} label={honba.toString()} value={honba.toString()} />
                ))}
              </Picker>
            </View>
            <Text style={styles.roundTextInline}> 本場 </Text>
          </View>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.discarderLabel}>流局:</Text>
            <Switch value={currentRound.isRyuukyoku} onValueChange={() => setCurrentRound({ ...currentRound, isRyuukyoku: !currentRound.isRyuukyoku })} />
        </View>

        {currentRound.isRyuukyoku ? (
        <View>
          <Text style={styles.discarderLabel}>聴牌者を選択してください</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={currentRound.winner}
              onValueChange={(itemValue) => setCurrentRound({ ...currentRound, winner: itemValue })}
            >
              {members.map((member) => (
                <Picker.Item key={member.id} label={member.name} value={member.id} />
              ))}
            </Picker>
          </View>
        </View>
        ) : (
          <>
        <View>
          <Text style={styles.discarderLabel}>あがったひと</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={currentRound.winner}
              onValueChange={(itemValue) => setCurrentRound({ ...currentRound, winner: itemValue })}
            >
              {members.map((member) => (
                <Picker.Item key={member.id} label={member.name} value={member.id} />
              ))}
            </Picker>
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.discarderLabel}>親：</Text>
            <Switch
              value={currentRound.isOya}
              onValueChange={() => setCurrentRound({ ...currentRound, isOya: !currentRound.isOya })}
            />
          </View>
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.discarderLabel}>ツモ:</Text>
          <Switch value={currentRound.isTsumo} onValueChange={() => setCurrentRound({ ...currentRound, isTsumo: !currentRound.isTsumo })} />
          <Text style={styles.discarderLabel}>鳴き:</Text>
          <Switch value={currentRound.isNaki} onValueChange={() => setCurrentRound({ ...currentRound, isNaki: !currentRound.isNaki })} />
          <Text style={styles.discarderLabel}> リーチ:</Text>
          <Switch value={currentRound.isReach} onValueChange={() => setCurrentRound({ ...currentRound, isReach: !currentRound.isReach })} />
        </View>
        <View>
          <Text style={styles.discarderLabel}>あがり点</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={currentRound.winnerPoints}
              onValueChange={(itemValue) => setCurrentRound({ ...currentRound, winnerPoints: itemValue })}
            >
              {availablePoints.map((point, index) => (
                <Picker.Item key={index} label={point.toString()} value={point.toString()} />
              ))}
            </Picker>
          </View>
        </View>
            <Text style={styles.discarderLabel}>あがった役:</Text>
            <View style={styles.rolesContainer}>
              {selectedRoles.map((role, index) => (
                <View key={index} style={styles.roleButton}>
                  <Text>{role}</Text>
                </View>
              ))}
            </View>
            <Button title="あがった役を選択" onPress={() => setModalVisible(true)} />
            <Text style={styles.discarderLabel}>ドラの数:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={currentRound.dora}
                onValueChange={(itemValue) => setCurrentRound({ ...currentRound, dora: itemValue })}
              >
                {Array.from({ length: 21 }, (_, i) => i.toString()).map((num) => (
                  <Picker.Item key={num} label={num} value={num} />
                ))}
              </Picker>
            </View>
            <Text style={styles.discarderLabel}>裏ドラの数:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={currentRound.uraDora}
                onValueChange={(itemValue) => setCurrentRound({ ...currentRound, uraDora: itemValue })}
              >
                {Array.from({ length: 21 }, (_, i) => i.toString()).map((num) => (
                  <Picker.Item key={num} label={num} value={num} />
                ))}
              </Picker>
            </View>

            {!currentRound.isTsumo && (
              <View>
                <Text style={styles.discarderLabel}>放銃したひと:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={currentRound.discarder}
                    onValueChange={(itemValue) => setCurrentRound({ ...currentRound, discarder: itemValue })}
                  >
                    {members.map((member) => (
                      <Picker.Item key={member.id} label={member.name} value={member.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          </>
        )}
        <View style={styles.buttonContainer}>
          <Button title="前へ" onPress={() => console.log('前へ')} />
          <Button title="終了" onPress={handleFinish} />
          <Button title="次へ" onPress={confirmSave} />
        </View>
      </View>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>あがった役を選択</Text>
          <ScrollView>
            {rolesOptions.map((roleObj, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.roleButton,
                  selectedRoles.includes(roleObj.role) ? styles.selectedRoleButton : styles.unselectedRoleButton
                ]}
                onPress={() => toggleRoleSelection(roleObj.role)}
              >
                <Text>{roleObj.role}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.modalButtonContainer}>
            <Button title="全解除" onPress={clearAllRolesSelection} />
            <Button title="OK" onPress={confirmRolesSelection} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    padding: 16,
  },
  breadcrumbSection: {
    marginTop: 16,
    marginBottom: 1,
  },
  breadcrumbIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  indicatorCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  indicatorCurrent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  indicatorLine: {
    width: 50,
    height: 2,
    backgroundColor: '#ccc',
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#333',
  },
  breadcrumbCurrent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rolesContainer: {
    marginVertical: 8,
  },
  roleButton: {
    marginVertical: 4,
    padding: 8,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 4,
  },
  selectedRoleButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  unselectedRoleButton: {
    backgroundColor: '#fff',
    borderColor: '#000',
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
    padding: 16,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  discarderLabel: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  pickerContainer: {
    borderWidth: 0.5,
    borderColor: '#000',
    borderRadius: 4,
  },
  picker: {
    height: 50,
    width: 150,
  },
  roundPicker: {
    width: '120%',
  },
  roundContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    alignItems: 'center',
    marginHorizontal: 0,
  },
  roundRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roundTextInline: {
    fontSize: 16,
    marginLeft: 0,
  },
  roundPickerContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 0.5,
    borderColor: '#000',
    borderRadius: 4,
    width: 90,
    overflow: 'hidden',
  },
  pickerRoundItem: {
    fontSize: 10,
    height: 50,
  },
});

export default ScoreInputScreen;
