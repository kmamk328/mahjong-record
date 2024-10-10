import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InquiryScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>お問い合わせ</Text>
            {/* 問い合わせフォームや内容をここに追加 */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default InquiryScreen;
