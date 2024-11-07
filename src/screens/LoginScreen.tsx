import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { auth } from '../../firebaseConfig';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "546966390190-t4belgq5uu6kr3iq3q6psd1jhai7ce7g.apps.googleusercontent.com",  // ここにGoogle Cloud Consoleから取得したWeb client IDを設定
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = auth.GoogleAuthProvider.credential(id_token);
      auth().signInWithCredential(credential);
    }
  }, [response]);

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGuestLogin = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('ゲストログインエラー:', error);
    }
  };


  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="メールでログイン" onPress={handleEmailLogin} />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Button
        disabled={!request}
        title="Googleでログイン"
        onPress={() => {
          promptAsync();
        }}
      />
      <Button title="ゲストとしてログイン" onPress={handleGuestLogin} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 10,
  },
  googleButton: {
    marginTop: 10,
  },
  guestButton: {
    marginTop: 10,
    backgroundColor: '#ccc',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default LoginScreen;
