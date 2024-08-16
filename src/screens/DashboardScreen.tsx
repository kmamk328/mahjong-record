import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'; // 必要な関数をインポート
import { db } from '../../firebaseConfig';

const DashboardScreen = () => {
    const navigation = useNavigation();
    const [yourStats, setYourStats] = useState([]);
    const [selectedMember, setSelectedMember] = useState(''); // 選択されたメンバーのIDを保存
    const [selectedMemberName, setSelectedMemberName] = useState(''); // 選択されたメンバーの名前を保存
    const [members, setMembers] = useState([]); // 全メンバーを保存
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
                console.log('Members fetched:', membersList);
                setMembers(membersList);
            } catch (error) {
                console.error('Error fetching members: ', error);
            }
        };

        fetchMembers();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedMember) {
                console.log('No member selected');
                return;
            }
    
            try {
                console.log('Fetching games for member:', selectedMember);

                // メンバー名でクエリを実行するか、メンバーIDで実行するか、適切な方法を選択する
                const gamesQuery = query(
                    collection(db, 'games'),
                    where('members', 'array-contains', selectedMember),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                );
    
                const gamesSnapshot = await getDocs(gamesQuery);
    
                if (gamesSnapshot.empty) {
                    console.log('No games found');
                    return;
                }
    
                let allStats = [];
    
                for (const gameDoc of gamesSnapshot.docs) {
                    console.log('Processing game:', gameDoc.id);
                    const hanchanCollection = collection(db, 'games', gameDoc.id, 'hanchan');
                    const hanchanSnapshot = await getDocs(hanchanCollection);
    
                    const createdAt = gameDoc.data().createdAt?.toDate();
    
                    for (const hanchanDoc of hanchanSnapshot.docs) {
                        console.log('Processing hanchan:', hanchanDoc.id);
                        const roundsCollection = collection(db, 'games', gameDoc.id, 'hanchan', hanchanDoc.id, 'rounds');
                        const roundsSnapshot = await getDocs(roundsCollection);
    
                        if (roundsSnapshot.empty) {
                            console.log(`No rounds data in hanchan: ${hanchanDoc.id}`);
                            continue;
                        }
    
                        let winCount = 0;
                        let discardCount = 0;
                        let reachWinCount = 0;
                        let nakiWinCount = 0;
                        let maxWinPoints = 0;
                        let roles = {};
    
                        roundsSnapshot.forEach((roundDoc) => {
                            const round = roundDoc.data();
                            console.log(`Processing round ${round.roundNumber?.place} ${round.roundNumber?.round}局`);
                            
                            if (round.winner === selectedMemberName) { // 名前で一致を確認
                                winCount += 1;
                                if (round.reach) reachWinCount += 1;
                                if (round.naki) nakiWinCount += 1;
                                if (round.winnerPoints > maxWinPoints) maxWinPoints = round.winnerPoints;
    
                                round.selectedRoles?.forEach((role: string) => {
                                    if (roles[role]) {
                                        roles[role] += 1;
                                    } else {
                                        roles[role] = 1;
                                    }
                                });
                            }
                            if (round.discarder === selectedMemberName) { // 名前で一致を確認
                                discardCount += 1;
                            }
                        });
    
                        allStats.push({
                            gameId: gameDoc.id,
                            hanchanId: hanchanDoc.id,
                            createdAt, // createdAt を追加
                            winCount,
                            discardCount,
                            reachWinCount,
                            nakiWinCount,
                            maxWinPoints,
                            roles,
                        });
                    }
                }
    
                console.log('Selected Member Stats:', allStats);
                setYourStats(allStats);
            } catch (error) {
                console.error('Error fetching games:', error);
            }
        };
    
        fetchData();
    }, [selectedMemberName]); // selectedMemberName でトリガー

    const handlePickerSelect = (value) => {
        setSelectedMember(value); // メンバーのIDをセット
        const selectedName = members.find(member => member.id === value)?.name;
        setSelectedMemberName(selectedName || ''); // メンバーの名前をセット
        setModalVisible(false); // モーダルを閉じる
        console.log('Selected Member:', selectedName); // 選択されたメンバーの名前をログに表示
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.container}>
                <View style={styles.pickerContainer}>
                    <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.pickerButtonText}>
                            {selectedMemberName || 'メンバーを選択'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.summaryContainer}>
                    {yourStats.map((stats, index) => (
                        <View key={index} style={styles.summaryBox}>
                            <Text style={styles.summaryText}>
                                Game ID: {stats.gameId}
                            </Text>
                            <Text style={styles.summaryText}>
                                作成日: {stats.createdAt?.toLocaleDateString()}
                            </Text>
                            <Text style={styles.summaryText}>
                                あがり回数: {stats.winCount}
                            </Text>
                            <Text style={styles.summaryText}>
                                放銃回数: {stats.discardCount}
                            </Text>
                            <Text style={styles.summaryText}>
                                リーチあがり回数: {stats.reachWinCount}
                            </Text>
                            <Text style={styles.summaryText}>
                                鳴きあがり回数: {stats.nakiWinCount}
                            </Text>
                            <Text style={styles.summaryText}>
                                最高打点: {stats.maxWinPoints}
                            </Text>
                            <Text style={styles.summaryText}>
                                役の集計:
                            </Text>
                            {Object.entries(stats.roles).map(([role, count]) => (
                                <Text key={role} style={styles.summaryValue}>{role}: {count} 回</Text>
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
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
                                <Picker.Item key={member.id} label={member.name} value={member.id} />
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
    },
    pickerButtonText: {
        fontSize: 18,
        color: 'black',
        textAlign: 'center',
    },
    summaryContainer: {
        paddingHorizontal: 20,
    },
    summaryBox: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
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
        color: 'blue',
    },
    summaryValue: {
        fontSize: 18,
        marginVertical: 5,
        color: 'blue',
    },
});

export default DashboardScreen;
