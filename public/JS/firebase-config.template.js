const firebaseConfig = {
  apiKey: "${APIKEY}",
  authDomain: "${AUTHDOMAIN}",
  projectId: "${PROJECTID}",
  storageBucket: "${STORAGEBUCKET}",
  messagingSenderId: "${MESSAGINGSENDERID}",
  appId: "${APPID}"
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
