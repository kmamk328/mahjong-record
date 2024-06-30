import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import { RootStackParamList } from '../navigationTypes';

type GameDetailsScreenRouteProp = RouteProp<RootStackParamList, 'GameDetails'>;

const GameDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<GameDetailsScreenRouteProp>();
  const { game } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
        headerStyle: {
            backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#000',
        headerTitle: '全局照会',
    });
  }, [navigation]);

  if (!game) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Game data not available</Text>
      </View>
    );
  }

  const sortedRounds = [...game.rounds].sort((a, b) => {
    return Number(a.roundNumber.round) - Number(b.roundNumber.round);
  });

  const handlePress = (game) => {
    navigation.navigate('GameDetails', { game });
  };

  return (
    <ScrollView style={styles.innerContainer}>
      <TouchableOpacity key={game.id} style={styles.gameBox} onPress={() => handlePress(game)}>

        <Text style={styles.dateText}>Date: {game.createdAt}</Text>
        <View style={styles.membersContainer}>
          {game.members.map((member, index) => (
            <View key={index} style={styles.member}>
              <Text style={styles.memberText}>{member}</Text>
            </View>
          ))}
        </View>
        {sortedRounds.map((round, index) => (
          <View key={index} style={styles.roundBox}>
            <Text style={styles.roundText}>Round: {round.roundNumber.round}</Text>
            <Text style={styles.roundText}>Winner: {round.winner}</Text>
          </View>
        ))}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  innerContainer: {
    padding: 16,
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
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  membersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  member: {
    marginRight: 8,
  },
  memberText: {
    fontSize: 14,
  },
  roundBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  roundText: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default GameDetailsScreen;
