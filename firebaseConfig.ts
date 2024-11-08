// Import the functions you need from the SDKs you need
// import { initializeAuth } from 'firebase/auth';
// import { getReactNativePersistence } from 'firebase/auth/react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { initializeApp } from "firebase/app";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getAuth,initializeAuth, getReactNativePersistence,setPersistence,signInAnonymously, onAuthStateChanged } from 'firebase/auth';
// import { getAuth, setPersistence, browserLocalPersistence, signInAnonymously } from 'firebase/auth';
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// import * as SecureStore from "expo-secure-store";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzzCOyVO5j1-YfY2mTRYhu-4aQbCLzIDA",
  authDomain: "majangrecords.firebaseapp.com",
  projectId: "majangrecords",
  storageBucket: "majangrecords.appspot.com",
  messagingSenderId: "476948101334",
  appId: "1:476948101334:web:50f008f55281199111b177",
  measurementId: "G-M1CZSRTVLK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase app initialized:", app);
// const analytics = getAnalytics(app);
const db = getFirestore(app);
// const auth = getAuth(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
// // 永続性の設定
// setPersistence(auth, browserLocalPersistence)
//   .then(() => {
//     // 永続性設定が完了したら匿名サインインなどの操作を実行可能
//     return signInAnonymously(auth);
//   })
//   .then((userCredential) => {
//     console.log('Signed in anonymously:', userCredential.user);
//   })
//   .catch((error) => {
//     console.error('Error setting persistence:', error);
//   });

// // 永続性設定後、匿名サインインを実行
// signInAnonymously(auth)
//   .then((userCredential) => {
//     console.log('匿名サインインに成功:', userCredential.user);
//   })
//   .catch((error) => {
//     console.error('永続性の設定エラーまたはサインインエラー:', error);
//   });

// ユーザー情報を保存するキー
// const USER_UID_KEY = "userUID";

// async function authenticateUser() {
//   try {
//     // すでに保存されているUIDを確認
//     const savedUID = await SecureStore.getItemAsync(USER_UID_KEY);

//     if (savedUID) {
//       // UIDがある場合、認証状態を維持
//       console.log("UID found in SecureStore, retaining session:", savedUID);
//     } else {
//       // UIDがない場合、匿名認証を実行し、UIDを保存
//       const userCredential = await signInAnonymously(auth);
//       const user = userCredential.user;
//       console.log("Signed in anonymously:", user.uid);

//       // SecureStoreにUIDを保存
//       await SecureStore.setItemAsync(USER_UID_KEY, user.uid);
//     }
//   } catch (error) {
//     console.error("Error during authentication:", error);
//   }
// }

// 認証状態の変更を監視し、再認証が必要な場合にはauthenticateUserを呼び出す
// onAuthStateChanged(auth, (user) => {
//   if (!user) {
//     authenticateUser();
//   }
// });

// // 実行
// authenticateUser();

export { db, auth };
// analyticsはexpoマネージメントではサポートされない
// export { db, auth, analytics };
