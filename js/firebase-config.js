/* ========================================
   FIREBASE CONFIG – Realtime Database
   ======================================== */

// TODO: Replace with your Firebase project config from Firebase Console
var firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  databaseURL: 'https://YOUR_PROJECT-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'YOUR_PROJECT',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
};

firebase.initializeApp(firebaseConfig);
var db = firebase.database();
