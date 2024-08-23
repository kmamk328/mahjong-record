import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { collection, getDocs, doc, getDoc, query, orderBy, startAfter, limit, Timestamp, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { FAB } from 'react-native-paper'; // Floating Action Button
import { Image } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const InquireScreen = () => {
    const navigation = useNavigation();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const imagePaths = [
        require('../image/pin_1.png'),
        require('../image/pin_2.png'),
        require('../image/pin_3.png'),
        require('../image/pin_4.png'),
        require('../image/pin_5.jpg'),
        require('../image/pin_6.png'),
        require('../image/pin_7.png'),
        require('../image/pin_8.png'),
        require('../image/pin_9.png'),
    ];

    const fetchData = async (loadMore = false) => {
        try {
            const gamesCollection = collection(db, 'games');
            const gamesQuery = query(gamesCollection, orderBy('createdAt', 'desc'), limit(10), ...(lastVisible && loadMore ? [startAfter(lastVisible)] : []));
            const gamesSnapshot = await getDocs(gamesQuery);

            const gamesList = [];
            for (const gameDoc of gamesSnapshot.docs) {
                const gameData = gameDoc.data();
                const membersNames = await Promise.all(
                    gameData.members.map(async (memberId) => {
                        const memberDoc = await getDoc(doc(db, 'members', memberId));
                        return memberDoc.exists() ? memberDoc.data().name : 'Unknown Member';
                    })
                );

                const hanchanQuery = collection(db, 'games', gameDoc.id, 'hanchan');
                const hanchanSnapshot = await getDocs(hanchanQuery);
                const hanchanList = hanchanSnapshot.docs.map(hanchanDoc => ({ id: hanchanDoc.id, ...hanchanDoc.data(), gameId: gameDoc.id }));

                // 日付をフォーマット
                const createdAtDate = gameData.createdAt.toDate();
                const formattedDate = `${createdAtDate.getFullYear()}/${String(createdAtDate.getMonth() + 1).padStart(2, '0')}/${String(createdAtDate.getDate()).padStart(2, '0')}`;

                gamesList.push({
                    id: gameDoc.id,
                    createdAt: formattedDate,
                    members: membersNames,
                    hanchan: hanchanList,
                });
            }

            if (loadMore) {
                setGames((prevGames) => [...prevGames, ...gamesList]);
            } else {
                setGames(gamesList);
            }

            setLastVisible(gamesSnapshot.docs[gamesSnapshot.docs.length - 1]);
        } catch (error) {
            console.error('Error fetching games:', error);
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#000',
            headerTitle: '戦績照会',
            headerTitleAlign: 'center', 
        });
    }, [navigation]);

    const handleLoadMore = () => {
        if (!isFetchingMore) {
            setIsFetchingMore(true);
            fetchData(true);
        }
    };

    const handlePress = (game) => {
        navigation.navigate('HanchanList', { gameId: game.id });
    };

    const onRefresh = () => {
        setRefreshing(true);
        setLastVisible(null);
        fetchData(false);
    };

    const handleAddGame = () => {
        // メンバー入力画面にナビゲートする
        navigation.navigate('MemberInput');
    };

    const onDelete = async (gameId) => {
        Alert.alert(
            '確認',
            '本当にこのゲームを削除しますか？',
            [
                {
                    text: 'キャンセル',
                    style: 'cancel',
                },
                {
                    text: '削除',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'games', gameId));
                            setGames((prevGames) => prevGames.filter((game) => game.id !== gameId));
                        } catch (error) {
                            console.error('Error deleting game:', error);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                style={styles.scrollView}
                onScroll={({ nativeEvent }) => {
                    if (isCloseToBottom(nativeEvent)) {
                        handleLoadMore();
                    }
                }}
                scrollEventThrottle={400}
            >
                <View style={styles.innerContainer}>
                    {games.map((game, index) => (
                        <Swipeable
                            key={game.id}
                            renderRightActions={() => (
                                <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(game.id)}>
                                    <Icon name="trash-2" size={24} color="white" />
                                </TouchableOpacity>
                            )}
                        >
                        <TouchableOpacity key={game.id} style={styles.gameBox} onPress={() => handlePress(game)}>
                            <Image
                                source={imagePaths[index % imagePaths.length]} // インデックスに基づいて画像を選択
                                style={styles.imageStyle}
                            />
                            <View style={styles.textContainer}>
                                <Text style={styles.getDateText}>{game.createdAt}</Text>
                                <View style={styles.membersContainer}>
                                    {game.members.map((member, index) => (
                                        <View key={index} style={styles.member}>
                                            <Icon name="user" size={20} color="gray" />
                                            <Text style={styles.getStartedText}>{member}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </TouchableOpacity>
                        </Swipeable>
                    ))}
                    {isFetchingMore && (
                        <View style={styles.loadingMoreContainer}>
                            <ActivityIndicator size="large" />
                            <Text>Loading more...</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
            <FAB
                style={[styles.fab, { backgroundColor: '#f0f8ff' }]}
                small icon="plus"
                onPress={handleAddGame}
            />
        </View>
    );
};

const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    innerContainer: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inquirebox: {
        marginBottom: 16,
        marginHorizontal: 10,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 16,
        borderRadius: 8,
    },
    gameBox: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    getDateText: {
        fontSize: 17,
        lineHeight: 24,
        textAlign: 'left', // 配置する位置
        marginLeft: 0,     // 必要に応じて余白を調整
        fontWeight: 'bold',
    },
    getStartedText: {
        fontSize: 17,
        lineHeight: 24,
        textAlign: 'left',
    },
    membersContainer: {
        flexDirection: 'row',
        // justifyContent: 'space-around',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    member: {
        alignItems: 'center',
    },
    loadingMoreContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
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
});

export default InquireScreen;
