import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { db } from '../../firebaseConfig';


const DashboardScreen = () => {
    const navigation = useNavigation();
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    const data = [50, 10, 40, 95, -4, -24, 85, 91, 35, 53];
    const [yourStats, setYourStats] = useState({
        winCount: 0,
        discardCount: 0,
        reachWinCount: 0,
        nakiWinCount: 0,
        maxWinPoints: 0,
        roles: {}
    });
    const [selectedMember, setSelectedMember] = useState(''); // 選択されたメンバーのIDを保存
    const [members, setMembers] = useState([]); // 全メンバーを保存
    const [stats, setStats] = useState(null); // 成績データを保存
    const [modalVisible, setModalVisible] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#000',
            headerTitle: '成績',
            headerTitleAlign: 'center',
        });
    }, [navigation]);

      // Firebaseからメンバーを取得する
    useEffect(() => {
        const fetchMembers = async () => {
        try {
            const membersCollection = collection(db, 'members');
            const membersSnapshot = await getDocs(membersCollection);
            const membersList = membersSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            }));
            setMembers(membersList);
        } catch (error) {
            console.error('Error fetching members: ', error);
        }
        };

        fetchMembers();
    }, []);

    useEffect(() => {
    const fetchData = async () => {
    //   const userId = 'あなたの匿名ID'; // 実際にはFirebase Authで取得したユーザーIDを使用する

        const hanchanQuery = collection(db, 'games');
        const hanchanSnapshot = await getDocs(hanchanQuery);

        let winCount = 0;
        let discardCount = 0;
        let reachWinCount = 0;
        let nakiWinCount = 0;
        let maxWinPoints = 0;
        let roles = {};

        hanchanSnapshot.forEach((doc) => {
        const data = doc.data();
        data.rounds.forEach((round: any) => {
            if (round.winner === userId) {
            winCount += 1;
            if (round.reach) reachWinCount += 1;
            if (round.naki) nakiWinCount += 1;
            if (round.winnerPoints > maxWinPoints) maxWinPoints = round.winnerPoints;

            round.selectedRoles.forEach((role: string) => {
                if (roles[role]) {
                roles[role] += 1;
                } else {
                roles[role] = 1;
                }
            });
            }
            if (round.discarder === userId) {
            discardCount += 1;
            }
        });
        });

        setYourStats({
            winCount,
            discardCount,
            reachWinCount,
            nakiWinCount,
            maxWinPoints,
            roles
        });
        };

        fetchData();
    }, []);

    const handlePickerSelect = (value) => {
        setSelectedMember(value);
        setModalVisible(false); // モーダルを閉じる
    };


    return (
        <View style={styles.container}>
        <ScrollView style={styles.container}>
            <View style={styles.pickerContainer}>
            {/* Pickerを開くボタン */}
            <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.pickerButtonText}>
                {selectedMember ? members.find(member => member.name === selectedMember)?.name : 'メンバーを選択'}
                </Text>
            </TouchableOpacity>
            </View>
            <View style={styles.summaryContainer}>
                <View style={styles.summaryBox}>
                <Text style={styles.summaryText}>
                    あがり回数
                </Text>
                <Text style={styles.summaryValue}>
                    {yourStats.winCount}
                </Text>
                <Text style={styles.summaryText}>
                    放銃回数
                </Text>
                <Text style={styles.summaryValue}>
                    {yourStats.discardCount}
                </Text>
                </View>
                <View style={styles.summaryBox}>
                <Text style={styles.updateText}>
                    最終更新：2024年7月13日
                </Text>
                <Text style={styles.summaryText}>
                    リーチあがり回数
                </Text>
                <Text style={styles.summaryValue}>
                    {yourStats.reachWinCount}
                </Text>
                <Text style={styles.summaryText}>
                    鳴きあがり回数
                </Text>
                <Text style={styles.summaryValue}>
                    {yourStats.nakiWinCount}
                </Text>
                <Text style={styles.summaryText}>
                    最高打点
                </Text>
                <Text style={styles.summaryValue}>
                    {yourStats.maxWinPoints}
                </Text>
                <Text style={styles.summaryText}>
                    役の集計:
                </Text>
                {Object.entries(yourStats.roles).map(([role, count]) => (
                <Text key={role} style={styles.summaryValue}>{role}: {count} 回</Text>
                ))}
                </View>
            </View>
            <View style={styles.tabContainer}>
                <Text style={styles.tabText}>4人麻雀</Text>
                <Text style={styles.tabText}>3人麻雀</Text>
                <Text style={styles.tabText}>フリー麻雀</Text>
            </View>
            <View style={styles.statisticsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statTitle}>1着</Text>
                    <Text style={styles.statValue}>1 回</Text>
                    <Text style={styles.statPercentage}>11.1%</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statTitle}>2着</Text>
                    <Text style={styles.statValue}>2 回</Text>
                    <Text style={styles.statPercentage}>22.2%</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statTitle}>3着</Text>
                    <Text style={styles.statValue}>3 回</Text>
                    <Text style={styles.statPercentage}>33.3%</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statTitle}>4着</Text>
                    <Text style={styles.statValue}>3 回</Text>
                    <Text style={styles.statPercentage}>33.4%</Text>
                </View>
            </View>
            <View style={styles.additionalStatsContainer}>
                <Text style={styles.additionalStat}>連対率 33.3%</Text>
                <Text style={styles.additionalStat}>平均着順 2.89</Text>
                <Text style={styles.additionalStat}>総チップ -17 枚</Text>
                <Text style={styles.additionalStat}>総得点 -170</Text>
            </View>

            {/* <View style={styles.bottomNavContainer}>
                <Text style={styles.navText}>成績</Text>
                <Text style={styles.navText}>履歴</Text>
                <Text style={styles.navText}>入力</Text>
                <Text style={styles.navText}>アカウント</Text>
                <Text style={styles.navText}>メニュー</Text>
            </View> */}
            </ScrollView>
            {/* Pickerをモーダルで表示 */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                <View style={styles.pickerContainer}>
                    <Picker
                    selectedValue={selectedMember}
                    onValueChange={handlePickerSelect}
                    >
                    {members.map((member) => (
                        <Picker.Item key={member.id} label={member.name} value={member.name} />
                    ))}
                    </Picker>
                    <Button title="閉じる" onPress={() => setModalVisible(false)} />
                </View>
                </View>
            </Modal>
            </View>
    );
    };

const styles = StyleSheet.create({
container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#fff',
},
title: {
    fontSize: 24,
    marginBottom: 1,
    textAlign: 'center',
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
picker: {
    height: 50,
    width: '100%',
},
statsContainer: {
    marginTop: 24,

},
pickerButton: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
    marginBottom: 20,
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    // alignSelf: 'center',
},
pickerButtonText: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
},
summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
},
summaryBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
},
summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    color: 'blue'
},
summaryValue: {
    fontSize: 18,
    marginVertical: 5,
    color: 'blue'
},
updateText: {
    fontSize: 12,
    color: '#888',
},
tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
},
tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
},
statisticsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
},
statBox: {
    alignItems: 'center',
},
statTitle: {
    fontSize: 16,
    fontWeight: 'bold',
},
statValue: {
    fontSize: 18,
    fontWeight: 'bold',
},
statPercentage: {
    fontSize: 14,
    color: 'red',
},
additionalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
},
additionalStat: {
    fontSize: 16,
    color: 'red',
},
chartContainer: {
    height: 200,
    backgroundColor: '#fff',
    margin: 20,
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
},
bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
},
navText: {
    fontSize: 14,
    color: '#888',
},
});

export default DashboardScreen;
