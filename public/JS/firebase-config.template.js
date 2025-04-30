
const firebaseConfig = {
  apiKey: process.env.APIKEY,  // GitHub Secret FIREBASE_APIKEY
  authDomain: process.env.AUTHDOMAIN,  // GitHub Secret FIREBASE_AUTHDOMAIN
  projectId: process.env.PROJECTID,  // GitHub Secret FIREBASE_PROJECTID
  storageBucket: process.env.STORAGEBUCKET,  // GitHub Secret FIREBASE_STORAGEBUCKET
  messagingSenderId: process.env.MESSAGINGSENDERID,  // GitHub Secret FIREBASE_MESSAGINGSENDERID
  appId: process.env.APPID,  // GitHub Secret FIREBASE_APPID
};

if (typeof firebase === 'undefined') {
  console.error('Firebase SDK not loaded');
} else {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  window.db = firebase.firestore();
  try {
    window.auth = firebase.auth ? firebase.auth() : null;
  } catch (e) {
    console.error('Authentication service not available.');
  }
  console.log('Firebase initialized successfully');
}
