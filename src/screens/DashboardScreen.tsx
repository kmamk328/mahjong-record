import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { db, auth } from '../../firebaseConfig';

const DashboardScreen = () => {
    const navigation = useNavigation();
    const [yourStats, setYourStats] = useState([]);
    const [selectedMember, setSelectedMember] = useState(''); // 選択されたメンバーの名前を保存
    const [selectedMemberName, setSelectedMemberName] = useState('');
    const [members, setMembers] = useState([]); // 全メンバーを保存
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true); // スケルトンUI表示のためのローディング状態

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#000',
            headerTitle: '成績ダッシュボード',
            headerTitleAlign: 'center',
        });
    }, [navigation]);

    // Firebaseからメンバーを取得する
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const currentUser = auth.currentUser;
                if (!currentUser) return;

                const membersCollection = collection(db, 'members');
                const membersQuery = query(
                    membersCollection,
                    where('createdUser', '==', currentUser.uid) // 現在のユーザーが作成したメンバーのみを取得
                );
                const membersSnapshot = await getDocs(membersQuery);
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
                setLoading(true); // データ取得中はローディング状態に

                const currentUser = auth.currentUser;
                // 選択されたメンバーの名前を取得する
                const selectedMemberDoc = await getDoc(doc(db, 'members', selectedMember));
                const memberName = selectedMemberDoc.exists() ? selectedMemberDoc.data().name : '';
                setSelectedMemberName(memberName);


                const gamesQuery = query(
                    collection(db, 'games'),
                    where('members', 'array-contains', selectedMember),
                    where('createdUser', '==', currentUser.uid),
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
                    const gameData = gameDoc.data();

                    // ゲームの日時をフォーマットして取得
                    const gameDate = gameData.createdAt.toDate().toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });

                    let gameStats = {
                        gameId,
                        gameDate,
                        winCount: 0,
                        discardCount: 0,
                        reachWinCount: 0,
                        nakiWinCount: 0,
                        maxWinPoints: 0,
                        maxWinPointsDisplay: '', // 表示用の元の値を保持する
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

                                const numericWinnerPoints = convertWinnerPoints(round);
                                console.log("gameStats.maxWinPoints: ", gameStats.maxWinPoints);
                                console.log("numericWinnerPoints: ", numericWinnerPoints);

                                if (numericWinnerPoints > gameStats.maxWinPoints) {
                                    gameStats.maxWinPoints = round.winnerPoints;
                                    console.log("11111gameStats.maxWinPoints: ", gameStats.maxWinPoints);
                                    console.log("11111ound.winnerPoints: ", round.winnerPoints);
                                }

                                //役一覧用
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
            } finally {
                setLoading(false); // データ取得後にローディング終了
            }
        };

        fetchData();
    }, [selectedMember,selectedMemberName]);

    // const handlePickerSelect = (value) => {
    //     setSelectedMember(value);
    //     setModalVisible(false); // モーダルを閉じる
    // };
    const handlePickerSelect = async (value) => {
        try {
            // 選択されたメンバーの名前を取得する
            const selectedMemberDoc = await getDoc(doc(db, 'members', value));
            const memberName = selectedMemberDoc.exists() ? selectedMemberDoc.data().name : '';
            setSelectedMember(value);  // メンバーのIDを保存
            setSelectedMemberName(memberName);  // メンバーの名前を保存

            console.log('Selected Member ID:', value);
            console.log('Selected Member Name:', memberName);

            setModalVisible(false); // モーダルを閉じる
        } catch (error) {
            console.error('Error fetching selected member name: ', error);
        }
    };

    function convertWinnerPoints(round) {
        console.log("function round.winnerPoints: ", round.winnerPoints);
        if (!round.winnerPoints) {
            return 0; // または適切なデフォルト値を返す
        }
        let winnerPoints = round.winnerPoints;
        console.log("function winnerPoints: ", winnerPoints);
        if (winnerPoints.includes('オール')) {
            // "500オール" 形式の場合
            const points = parseInt(winnerPoints.replace('オール', ''), 10);
            return points * 3;
        } else if (winnerPoints.includes('子(') && winnerPoints.includes('親(')) {
            // "子(300) 親(500)" 形式の場合
            const childPoints = parseInt(winnerPoints.match(/子\((\d+)\)/)[1], 10);
            const parentPoints = parseInt(winnerPoints.match(/親\((\d+)\)/)[1], 10);
            return childPoints * 2 + parentPoints;
        } else {
            // その他の形式の場合（数値だけを抽出）
            return parseInt(winnerPoints, 10);
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.container}>
                <View style={styles.pickerContainer}>
                    <View style={styles.labelAndPicker}>
                        <Text style={styles.label}>メンバー名 : </Text>
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setModalVisible(true)}
                        >
                            <Text style={styles.pickerButtonText}>
                                {selectedMember ? members.find(member => member.id === selectedMember)?.name : '選択'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.summaryContainer}>
                    {yourStats.length > 0 ? (
                        yourStats.map((stats, index) => (
                            <View key={index} style={styles.summaryBox}>
                                <View style={styles.dateContainer}>
                                    <Text style={styles.getDateText}>
                                        {stats.gameDate}
                                    </Text>
                                </View>
                                {/* <Text style={styles.summaryText}>
                                    Game ID: {stats.gameId}
                                </Text> */}
                                {/* <Text style={styles.getDateText}>
                                    {stats.gameDate}
                                </Text> */}
                                <Text style={styles.summaryText}>
                                    あがり回数　: {stats.winCount}
                                </Text>
                                <Text style={styles.discardText}>
                                    放銃回数　　: {stats.discardCount}
                                </Text>
                                <Text style={styles.otherText}>
                                    リーチあがり回数　: {stats.reachWinCount}
                                </Text>
                                <Text style={styles.otherText}>
                                    鳴きあがり回数　　: {stats.nakiWinCount}
                                </Text>
                                <Text style={styles.otherText}>
                                    最高打点: {stats.maxWinPoints}
                                </Text>
                                {/* <Text style={styles.summaryText}>
                                    役の集計:
                                </Text> */}
                                {Object.entries(stats.roles).map(([role, count]) => (
                                    <Text key={role} style={styles.summaryValue}>{role}: {count} 回</Text>
                                ))}
                            </View>
                        ))
                    ) : (
                        <View style={styles.summaryBox}>
                            <View style={styles.dateContainer}>
                                    <Text style={styles.getDateText}>
                                    日ごとの成績を表示します
                                    </Text>
                                </View>
                            {/* <Text style={styles.getDateText}>日ごとの成績を表示します</Text> */}
                            <Text style={styles.summaryText}>あがり回数: 0</Text>
                            <Text style={styles.discardText}>放銃回数: 0</Text>
                            <Text style={styles.otherText}>リーチあがり回数: 0</Text>
                            <Text style={styles.otherText}>鳴きあがり回数: 0</Text>
                            <Text style={styles.otherText}>最高打点: 0</Text>
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
    labelAndPicker: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10, // テキストとピッカーの間の余白
        marginLeft: 20,
    },
    pickerButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 1,
        marginBottom: 1,
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
        // fontWeight: 'bold',
        marginVertical: 5,
        color: 'blue',
    },
    discardText: {
        fontSize: 16,
        // fontWeight: 'bold',
        marginVertical: 5,
        color: 'red',
    },
    otherText: {
        fontSize: 16,
        // fontWeight: 'bold',
        marginVertical: 5,
        color: 'black',
    },
    summaryValue: {
        fontSize: 18,
        marginVertical: 5,
        color: 'blue',
    },
    dateContainer: {
        backgroundColor: '#32CD32',  // 背景色を緑に設定
        padding: 5,               // 内側の余白
        borderRadius: 5,           // 角を丸める
        marginBottom: 10,          // 下部の余白
        alignItems: 'center',      // 中央揃え
    },
    getDateText: {
        fontSize: 20,
        lineHeight: 24,
        marginLeft: 0,     // 必要に応じて余白を調整
        fontWeight: 'bold',
        color: 'white',
    },
});

export default DashboardScreen;
