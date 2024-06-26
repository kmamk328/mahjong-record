import React, { useState, useEffect, useLayoutEffect} from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';



const ScoreInputScreen = () => {
  const [currentRound, setCurrentRound] = useState({
    discarder: '',
    discarderPoints: '',
    isNaki: false,
    isReach: false,
    roundNumber: { round: '1', place: '東', honba: '0' },
    winner: '',
    winnerPoints: '',
    isTsumo: false,
    isOya: false,
    roles: []
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
  // const cancelRef = useRef(null);

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

    const fetchRounds = async () => {
      const roundsRef = collection(db, 'games', gameId, 'rounds');
      const roundsQuery = query(roundsRef, orderBy('roundNumber'));
      const roundsSnapshot = await getDocs(roundsQuery);
      const roundsData = roundsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRounds(roundsData);
      if (roundsData.length > 0) {
        setCurrentRound(roundsData[0]);
        setCurrentRoundIndex(0);
      }
    };

    fetchMembers();
    fetchRounds();
  }, [gameId]);

  useEffect(() => {
    updateAvailablePoints();
  }, [isTsumo, currentRound.isOya]);

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
    if (currentRound.isOya && isTsumo) {
      points = [
        500, 700, 800, 1000, 1200, 1300, 1500, 1600, 2000, 2300, 2600,
        2900, 3200, 3600, 4000, 6000, 8000, 12000, 16000, 32000
      ].map(p => `${p}オール`);
    } else if (currentRound.isOya && !isTsumo) {
      points = [
        1500, 2000, 2400, 2900, 3400, 3900, 4400, 4800, 5300, 5800, 6800,
        7700, 8700, 9600, 10600, 12000, 18000, 24000, 36000, 48000, 96000
      ];
    } else if (!currentRound.isOya && isTsumo) {
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
      const roundsRef = collection(db, 'games', gameId, 'rounds');
      await addDoc(roundsRef, {
        ...currentRound,
        isTsumo: isTsumo,
        isNaki: isNaki,
        isReach: isReach,
        discarder: discarder,
        discarderPoints: discarderPoints,
        roles: selectedRoles,
        isOya: currentRound.isOya
      });

      if (currentRound.winner) {
        const winnerRef = doc(db, 'members', currentRound.winner);
        await updateDoc(winnerRef, {
          totalPoints: (await getDoc(winnerRef)).data().totalPoints + parseInt(currentRound.winnerPoints, 10)
        });
      }

      if (discarder) {
        const discarderRef = doc(db, 'members', discarder);
        await updateDoc(discarderRef, {
          totalPoints: (await getDoc(discarderRef)).data().totalPoints - parseInt(discarderPoints, 10)
        });
      }

      setIsDialogOpen(true);
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
    navigation.navigate('Result', { gameId });
  };

  const confirmRolesSelection = () => {
    setCurrentRound({ ...currentRound, roles: selectedRoles });
    setModalVisible(false);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    navigation.navigate('ScoreInput', { gameId }, { animation: 'slide_from_right' });
    setCurrentRound({
      discarder: '',
      discarderPoints: '',
      isNaki: false,
      isReach: false,
      roundNumber: { round: '1', place: '東', honba: '0' },
      winner: '',
      winnerPoints: '',
      isTsumo: false,
      isOya: false,
      roles: []
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



  return (
    <ScrollView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.label}>現在の局: {currentRound.roundNumber.place}{currentRound.roundNumber.round}局 {currentRound.roundNumber.honba}本場</Text>
        <Picker
          selectedValue={currentRound.winner}
          onValueChange={(itemValue) => setCurrentRound({ ...currentRound, winner: itemValue })}
        >
          {members.map((member) => (
            <Picker.Item key={member.id} label={member.name} value={member.id} />
          ))}
        </Picker>
        <View style={styles.switchContainer}>
          <Text>ツモ:</Text>
          <Switch value={currentRound.isTsumo} onValueChange={() => setCurrentRound({ ...currentRound, isTsumo: !currentRound.isTsumo })} />
          <Text>鳴き:</Text>
          <Switch value={currentRound.isNaki} onValueChange={() => setCurrentRound({ ...currentRound, isNaki: !currentRound.isNaki })} />
          <Text>リーチ:</Text>
          <Switch value={currentRound.isReach} onValueChange={() => setCurrentRound({ ...currentRound, isReach: !currentRound.isReach })} />
        </View>
        <Picker
          selectedValue={currentRound.winnerPoints}
          onValueChange={(itemValue) => setCurrentRound({ ...currentRound, winnerPoints: itemValue })}
        >
          {availablePoints.map((point, index) => (
            <Picker.Item key={index} label={point.toString()} value={point.toString()} />
          ))}
        </Picker>
        <Text>あがった役:</Text>
        <ScrollView horizontal={true} style={styles.rolesContainer}>
          {selectedRoles.map((role, index) => (
            <TouchableOpacity key={index} style={styles.roleButton}>
              <Text>{role}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Button title="あがった役を選択" onPress={() => setModalVisible(true)} />
        {!currentRound.isTsumo && (
          <Picker
            selectedValue={currentRound.discarder}
            onValueChange={(itemValue) => setCurrentRound({ ...currentRound, discarder: itemValue })}
          >
            {members.map((member) => (
              <Picker.Item key={member.id} label={member.name} value={member.id} />
            ))}
          </Picker>
        )}
        <View style={styles.buttonContainer}>
          <Button title="前へ" onPress={() => console.log('前へ')} />
          <Button title="終了" onPress={() => console.log('終了')} />
          <Button title="次へ" onPress={() => console.log('次へ')} />
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
          <Button title="OK" onPress={confirmRolesSelection} />
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
    marginHorizontal: 4,
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
});

export default ScoreInputScreen;