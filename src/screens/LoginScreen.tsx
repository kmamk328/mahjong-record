import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

const LoginScreen: React.FC = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
        await auth().signInWithEmailAndPassword(email, password);
        Alert.alert('ログイン成功', 'ログインしました。');
        // ログイン成功後、メイン画面に遷移する
        navigation.navigate('Main');
        } catch (error) {
        Alert.alert('ログイン失敗', error.message);
        }
    };

    const handleSignUp = async () => {
        try {
        await auth().createUserWithEmailAndPassword(email, password);
        Alert.alert('アカウント作成成功', 'アカウントが作成されました。');
        // アカウント作成成功後、ログイン処理を行う
        handleLogin();
        } catch (error) {
        Alert.alert('アカウント作成失敗', error.message);
        }
    };

    return (
        <View style={styles.container}>
        <Text style={styles.title}>ログイン</Text>
        <TextInput
            style={styles.input}
            placeholder="メールアドレス"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
        />
        <TextInput
            style={styles.input}
            placeholder="パスワード"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
        />
        <Button title="ログイン" onPress={handleLogin} />
        <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signupText}>アカウントを作成する</Text>
        </TouchableOpacity>
        </View>
    );
};

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 10,
    },
    signupText: {
        marginTop: 20,
        color: 'blue',
        textAlign: 'center',
    },
    });

export default LoginScreen;
