import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { collection, getDocs, doc, getDoc, query, orderBy, startAfter, limit, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { FAB } from 'react-native-paper'; // Floating Action Button

const InquireScreen = () => {
    const navigation = useNavigation();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const fetchData = async (loadMore = false) => {
        try {
            const gamesCollection = collection(db, 'games');
            const gamesQuery = query(gamesCollection, orderBy('createdAt', 'desc'), limit(10), ...(lastVisible ? [startAfter(lastVisible)] : []));
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
                const hanchanList = hanchanSnapshot.docs.map(hanchanDoc => hanchanDoc.data());

                gamesList.push({
                    id: gameDoc.id,
                    createdAt: gameData.createdAt.toDate().toLocaleString(),
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

    const handleAddGame = async () => {
        try {
            const newGameRef = await addDoc(collection(db, 'games'), {
                createdAt: Timestamp.now(),
                members: [], // 初期状態ではメンバーなし
            });
            navigation.navigate('MemberInput', { gameId: newGameRef.id });
        } catch (error) {
            console.error('Error adding new game:', error);
        }
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
                    {games.map((game) => (
                        <TouchableOpacity key={game.id} style={styles.gameBox} onPress={() => handlePress(game)}>
                            <Text style={styles.getDateText}>{game.createdAt}</Text>
                            <View style={styles.membersContainer}>
                                {game.members.map((member, index) => (
                                    <View key={index} style={styles.member}>
                                        <Icon name="user" size={20} color="black" />
                                        <Text style={styles.getStartedText}>{member}</Text>
                                    </View>
                                ))}
                            </View>
                        </TouchableOpacity>
                    ))}
                    {isFetchingMore && (
                        <View style={styles.loadingMoreContainer}>
                            <ActivityIndicator size="large" />
                            <Text>Loading more...</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
            <FAB style={styles.fab} small icon="plus" onPress={handleAddGame} />
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
        textAlign: 'center',
    },
    getStartedText: {
        fontSize: 17,
        lineHeight: 24,
        textAlign: 'left',
    },
    membersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
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
});

export default InquireScreen;
