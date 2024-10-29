import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl, Alert, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { collection, getDocs, doc, getDoc, query, orderBy, startAfter, limit, deleteDoc, where } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { FAB } from 'react-native-paper';
import { Image } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ContentLoader, { Rect } from 'react-content-loader/native'; // スケルトンUI用のライブラリ
import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';


import AdBanner from '../components/AdBanner';


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
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const gamesCollection = collection(db, 'games');
            const gamesQuery = query(
                gamesCollection,
                where('createdUser', '==', currentUser.uid),
                orderBy('createdAt', 'desc'),
                ...(lastVisible && loadMore ? [startAfter(lastVisible)] : []),
                limit(10)
            );
            const gamesSnapshot = await getDocs(gamesQuery);

            const newGamesList = [];
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

                const createdAtDate = gameData.createdAt.toDate();
                const formattedDate = `${createdAtDate.getFullYear()}/${String(createdAtDate.getMonth() + 1).padStart(2, '0')}/${String(createdAtDate.getDate()).padStart(2, '0')}`;

                newGamesList.push({
                    id: gameDoc.id,
                    createdAt: formattedDate,
                    members: membersNames,
                    hanchan: hanchanList,
                });
            }

            if (loadMore) {
                setGames((prevGames) => [
                    ...prevGames,
                    ...newGamesList.filter(newGame => !prevGames.some(game => game.id === newGame.id))
                ]);
            } else {
                setGames(newGamesList);
            }

            if (!gamesSnapshot.empty) {
                setLastVisible(gamesSnapshot.docs[gamesSnapshot.docs.length - 1]);
            }
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

    useFocusEffect(
        React.useCallback(() => {
            setLoading(true);
            fetchData();
        }, [])
    );

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#000',
            headerTitle: '戦績照会',
            headerTitleAlign: 'center',
            headerRight: () => (
                <TouchableOpacity onPress={onRefresh}>
                    <MaterialCommunityIcons name="reload" size={24} color="#000" />
                </TouchableOpacity>
            ),
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
                                    <Rect x="90" y="20" rx="4" ry="4" width="250" height="10" />
                                </ContentLoader>
                            ))}
                        </>
                    ) : games.length === 0 ? (
                        <View style={styles.noDataContainer}>
                            <Text style={styles.noDataText}>データがありません</Text>
                        </View>
                    ) : (
                        games.map((game, index) => (
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
                                        source={imagePaths[index % imagePaths.length]}
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
                        ))
                    )}
                    {isFetchingMore && (
                        <View style={styles.loadingMoreContainer}>
                            <ContentLoader
                                speed={2}
                                width={400}
                                height={70}
                                viewBox="0 0 400 70"
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
                                <Rect x="0" y="0" rx="4" ry="4" width="70" height="70" />
                                <Rect x="90" y="20" rx="4" ry="4" width="250" height="10" />
                            </ContentLoader>
                        </View>
                    )}
                </View>
            </ScrollView>
            <FAB
                style={[styles.fab, { backgroundColor: '#f0f8ff' }]}
                small icon="plus"
                onPress={handleAddGame}
            />
            <AdBanner />
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
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    noDataText: {
        fontSize: 18,
        color: 'gray',
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
        textAlign: 'left',
        marginLeft: 0,
        fontWeight: 'bold',
    },
    getStartedText: {
        fontSize: 17,
        lineHeight: 24,
        textAlign: 'left',
    },
    membersContainer: {
        flexDirection: 'row',
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
        bottom: 80,
    },
    imageStyle: {
        width: 60,
        height: 70,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    deleteButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        borderRadius: 8,
        marginBottom: 16,
        alignSelf: 'stretch',
    },
});

export default InquireScreen;
