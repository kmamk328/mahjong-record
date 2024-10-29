import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Swipeable from 'react-native-gesture-handler/Swipeable';
import Icon from 'react-native-vector-icons/Feather';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

import AdBanner from '../components/AdBanner';


const MemberManagementScreen = () => {
    const navigation = useNavigation();
    const [members, setMembers] = useState([]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#000',
            headerTitle: 'メンバー管理',
            headerTitleAlign: 'center',
        });
    }, [navigation]);

    useEffect(() => {
        const fetchMembers = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const membersCollection = collection(db, 'members');
            const q = query(membersCollection, where('createdUser', '==', currentUser.uid));
            const membersSnapshot = await getDocs(q);
            const membersList = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMembers(membersList);
        };

        fetchMembers();
    }, []);

    const onDelete = async (memberId: string) => {
        try {
            await deleteDoc(doc(db, 'members', memberId));
            setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
            Alert.alert('削除完了', 'メンバーが削除されました。');
        } catch (error) {
            console.error('Error deleting member:', error);
            Alert.alert('エラー', 'メンバーの削除に失敗しました。');
        }
    };

    const renderRightActions = (memberId: string) => (
        <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(memberId)}
        >
            <Icon name="trash-2" size={24} color="white" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView>
                {members.map((member) => (
                <Swipeable
                    key={member.id}
                    renderRightActions={() => renderRightActions(member.id)}
                >
                    <View style={styles.memberContainer}>
                    <Text style={styles.memberText}>{member.name}</Text>
                    </View>
                </Swipeable>
                ))}
            </ScrollView>
            <AdBanner />

            </View>
        );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    memberContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    memberText: {
        fontSize: 16,
    },
    deleteButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: 60, // 名前要素の高さに合わせる
        borderRadius: 8,
        marginBottom: 16,
        alignSelf: 'stretch',
    },
});

export default MemberManagementScreen;
