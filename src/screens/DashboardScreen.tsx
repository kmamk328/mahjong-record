import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const DashboardScreen = () => {
    const navigation = useNavigation();
    const [yourStats, setYourStats] = useState([]);
    const [selectedMember, setSelectedMember] = useState(''); // 選択されたメンバーの名前を保存
    const [selectedMemberName, setSelectedMemberName] = useState('');
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
                setYourStats([]);
                return;
            }
    
            try {
                // 選択されたメンバーの名前を取得する
                const selectedMemberDoc = await getDoc(doc(db, 'members', selectedMember));
                const memberName = selectedMemberDoc.exists() ? selectedMemberDoc.data().name : '';
                setSelectedMemberName(memberName);


                const gamesQuery = query(
                    collection(db, 'games'),
                    where('members', 'array-contains', selectedMember),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                );
    
                const gamesSnapshot = await getDocs(gamesQuery);
    
                if (gamesSnapshot.empty) {
                    setYourStats([]);
                    return;
                }
    
                let aggregatedStats = [];
    
                for (const gameDoc of gamesSnapshot.docs) {
                    const gameId = gameDoc.id;
                    let gameStats = {
                        gameId,
                        winCount: 0,
                        discardCount: 0,
                        reachWinCount: 0,
                        nakiWinCount: 0,
                        maxWinPoints: 0,
                        roles: {}
                    };
    
                    const hanchanCollection = collection(db, 'games', gameId, 'hanchan');
                    const hanchanSnapshot = await getDocs(hanchanCollection);
    
                    for (const hanchanDoc of hanchanSnapshot.docs) {
                        const roundsCollection = collection(db, 'games', gameId, 'hanchan', hanchanDoc.id, 'rounds');
                        const roundsSnapshot = await getDocs(roundsCollection);
    
                        if (roundsSnapshot.empty) continue;
    
                        roundsSnapshot.forEach((roundDoc) => {
                            const round = roundDoc.data();
                            console.log("round.winner: ", round.winner);
                            console.log("selectedMemberName: ", selectedMemberName);
                            if (round.winner === selectedMemberName) {
                                gameStats.winCount += 1;
                                if (round.reach) gameStats.reachWinCount += 1;
                                if (round.naki) gameStats.nakiWinCount += 1;
                                if (round.winnerPoints > gameStats.maxWinPoints) gameStats.maxWinPoints = round.winnerPoints;
    
                                round.selectedRoles?.forEach((role) => {
                                    if (gameStats.roles[role]) {
                                        gameStats.roles[role] += 1;
                                    } else {
                                        gameStats.roles[role] = 1;
                                    }
                                });
                            }
                            if (round.discarder === selectedMember) {
                                gameStats.discardCount += 1;
                            }
                        });
                    }
    
                    aggregatedStats.push(gameStats);
                }
    
                setYourStats(aggregatedStats);
            } catch (error) {
                console.error('Error fetching games:', error);
            }
        };
    
        fetchData();
    }, [selectedMember]);
            
    const handlePickerSelect = (value) => {
        setSelectedMember(value);
        setModalVisible(false); // モーダルを閉じる
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
                            {selectedMember ? members.find(member => member.id === selectedMember)?.name : 'メンバーを選択してください'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.summaryContainer}>
                    {yourStats.length > 0 ? (
                        yourStats.map((stats, index) => (
                            <View key={index} style={styles.summaryBox}>
                                <Text style={styles.summaryText}>
                                    Game ID: {stats.gameId}
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
                        ))
                    ) : (
                        <View style={styles.summaryBox}>
                            <Text style={styles.summaryText}>あがり回数: 0</Text>
                            <Text style={styles.summaryText}>放銃回数: 0</Text>
                            <Text style={styles.summaryText}>リーチあがり回数: 0</Text>
                            <Text style={styles.summaryText}>鳴きあがり回数: 0</Text>
                            <Text style={styles.summaryText}>最高打点: 0</Text>
                            <Text style={styles.summaryText}>役の集計: なし</Text>
                        </View>
                    )}
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
        fontSize: 16,
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
