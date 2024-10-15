import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AdBanner from '../components/AdBanner';


const TermsOfUseScreen: React.FC = () => {

    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#000',
            headerTitle: '利用規約',
            headerTitleAlign: 'center',
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.container}>
            <View style={styles.NoticeContainer}>
                <Text style={styles.text}>今後追加していきます</Text>
            </View>
            </ScrollView>
            <AdBanner />

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
});

export default TermsOfUseScreen;
