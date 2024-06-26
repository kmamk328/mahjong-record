import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy, startAfter, limit } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const InquireScreen = () => {
    const navigation = useNavigation();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
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
                gamesList.push({
                    id: gameDoc.id,
                    createdAt: gameData.createdAt.toDate().toLocaleString(),
                    members: membersNames,
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            onScroll={({ nativeEvent }) => {
                if (isCloseToBottom(nativeEvent)) {
                    handleLoadMore();
                }
            }}
            scrollEventThrottle={400}
        >
            <View style={styles.innerContainer}>
                {games.map((game) => (
                    <View style={styles.inquirebox} key={game.id}>
                        <Text style={styles.getDateText}>{game.createdAt}</Text>
                        <View style={styles.membersContainer}>
                            {game.members.map((member, index) => (
                                <View key={index} style={styles.member}>
                                    <Icon name="user" size={20} color="black" />
                                    <Text style={styles.getStartedText}>{member}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
                {isFetchingMore && (
                    <View style={styles.loadingMoreContainer}>
                        <ActivityIndicator size="large" />
                        <Text>Loading more...</Text>
                    </View>
                )}
            </View>
        </ScrollView>
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
});

export default InquireScreen;
