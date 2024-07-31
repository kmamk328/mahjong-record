import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { ResponseType } from 'expo-auth-session';
import { auth } from '../../firebaseConfig';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: "546966390190-t4belgq5uu6kr3iq3q6psd1jhai7ce7g.apps.googleusercontent.com",  // ここにGoogle Cloud Consoleから取得したWeb client IDを設定
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = auth.GoogleAuthProvider.credential(id_token);
      auth().signInWithCredential(credential);
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Button
        disabled={!request}
        title="Googleでログイン"
        onPress={() => {
          promptAsync();
        }}
      />
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
