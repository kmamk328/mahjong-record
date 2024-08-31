import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

const SettingScreen: React.FC = () => {

    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#000',
            headerTitle: '設定',
            headerTitleAlign: 'center',
        });
    }, [navigation]);

    const handleMemberManagementPress = () => {
        navigation.navigate('MemberManagement');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleMemberManagementPress} style={styles.listItem}>
                <Text style={styles.listItemText}>メンバー管理</Text>
                <Icon name="chevron-right" size={24} color="#000" />
            </TouchableOpacity>
        </View>
        );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 20,
        // fontWeight: 'bold',
    },
    NoticeContainer: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    listItem: {
        paddingVertical: 16,
        paddingHorizontal: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    listItemText: {
        fontSize: 16,
    },
});

export default SettingScreen;
