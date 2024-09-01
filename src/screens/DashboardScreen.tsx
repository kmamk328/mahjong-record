import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
    const [loading, setLoading] = useState(false); // デフォルトはfalse、ロード中のみtrueにする

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

    const fetchMembers = async () => {
        try {
            const currentUser = auth.currentUser;
            console.log('DashBoardScreen currentUser: ', currentUser);
            if (!currentUser) return;

            const membersCollection = collection(db, 'members');
            const membersQuery = query(
                membersCollection,
                // 端末ごとの制御になっているので
                // 現在のユーザーが作成したメンバーのみを取得
                where('createdUser', '==', currentUser.uid)
            );
            const membersSnapshot = await getDocs(membersQuery);
            const membersList = membersSnapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name,
            }));
            console.log('DashBoardScreen membersList: ', membersList);
            setMembers(membersList);
        } catch (error) {
            console.error('Error fetching members: ', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchMembers();
        }, [])
    );

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedMember) {
                setYourStats([]);
                return;
            }

            try {
                setLoading(true); // メンバー選択後のロード中はtrueに設定

                const currentUser = auth.currentUser;
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
                        maxWinPointsDisplay: '',
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
                            if (round.winner === selectedMemberName) {
                                gameStats.winCount += 1;
                                if (round.reach) gameStats.reachWinCount += 1;
                                if (round.naki) gameStats.nakiWinCount += 1;

                                const numericWinnerPoints = convertWinnerPoints(round);
                                if (numericWinnerPoints > gameStats.maxWinPoints) {
                                    gameStats.maxWinPoints = round.winnerPoints;
                                }

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
    }, [selectedMember, selectedMemberName]);

    const handlePickerSelect = async (value) => {
        try {
            const selectedMemberDoc = await getDoc(doc(db, 'members', value));
            const memberName = selectedMemberDoc.exists() ? selectedMemberDoc.data().name : '';
            setSelectedMember(value);
            setSelectedMemberName(memberName);

            console.log('Selected Member ID:', value);
            console.log('Selected Member Name:', memberName);

            setModalVisible(false);
        } catch (error) {
            console.error('Error fetching selected member name: ', error);
        }
    };

    function convertWinnerPoints(round) {
        if (!round.winnerPoints) {
            return 0;
        }
        let winnerPoints = round.winnerPoints;
        if (winnerPoints.includes('オール')) {
            const points = parseInt(winnerPoints.replace('オール', ''), 10);
            return points * 3;
        } else if (winnerPoints.includes('子(') && winnerPoints.includes('親(')) {
            const childPoints = parseInt(winnerPoints.match(/子\((\d+)\)/)[1], 10);
            const parentPoints = parseInt(winnerPoints.match(/親\((\d+)\)/)[1], 10);
            return childPoints * 2 + parentPoints;
        } else {
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
                    {loading ? (
                        <>
                            {[1, 2, 3].map((_, index) => (
                                <ContentLoader 
                                    key={index}
                                    speed={2}
                                    width={400}
                                    height={70}
                                    viewBox="0 0 400 70"
                                    backgroundColor="#f3f3f3"
                                    foregroundColor="#ecebeb"
                                >
                                    <Rect x="0" y="0" rx="4" ry="4" width="70" height="70" />
                                    <Rect x="80" y="17" rx="4" ry="4" width="300" height="10" />
                                    <Rect x="80" y="37" rx="4" ry="4" width="250" height="10" />
                                </ContentLoader>
                            ))}
                        </>
                    ) : (
                        yourStats.length > 0 ? (
                            yourStats.map((stats, index) => (
                                <View key={index} style={styles.summaryBox}>
                                    <View style={styles.dateContainer}>
                                        <Text style={styles.getDateText}>
                                            {stats.gameDate}
                                        </Text>
                                    </View>
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
                                <Text style={styles.summaryText}>あがり回数: 0</Text>
                                <Text style={styles.discardText}>放銃回数: 0</Text>
                                <Text style={styles.otherText}>リーチあがり回数: 0</Text>
                                <Text style={styles.otherText}>鳴きあがり回数: 0</Text>
                                <Text style={styles.otherText}>最高打点: 0</Text>
                            </View>
                        )
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
        marginRight: 10,
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
        marginVertical: 5,
        color: 'blue',
    },
    discardText: {
        fontSize: 16,
        marginVertical: 5,
        color: 'red',
    },
    otherText: {
        fontSize: 16,
        marginVertical: 5,
        color: 'black',
    },
    summaryValue: {
        fontSize: 18,
        marginVertical: 5,
        color: 'blue',
    },
    dateContainer: {
        backgroundColor: '#32CD32',
        padding: 5,
        borderRadius: 5,
        marginBottom: 10,
        alignItems: 'center',
    },
    getDateText: {
        fontSize: 20,
        lineHeight: 24,
        marginLeft: 0,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default DashboardScreen;
