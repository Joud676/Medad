
const firebaseConfig = { 
  apiKey: "${APIKEY}",  // GitHub Secret FIREBASE_APIKEY
  authDomain: "${AUTHDOMAIN}",  // GitHub Secret FIREBASE_AUTHDOMAIN
  projectId: "${PROJECTID}",  // GitHub Secret FIREBASE_PROJECTID
  storageBucket: "${STORAGEBUCKET}",  // GitHub Secret FIREBASE_STORAGEBUCKET
  messagingSenderId: "${MESSAGINGSENDERID}",  // GitHub Secret FIREBASE_MESSAGINGSENDERID
  appId: "${APPID}",  // GitHub Secret FIREBASE_APPID
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
