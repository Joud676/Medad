const firebaseConfig = {
  apiKey: "AIzaSyDF5K3Kyv8EfNQnG5vesQAo6gTuXfUwGng",
  authDomain: "medad-c9a51.firebaseapp.com",
  projectId: "medad-c9a51",
  storageBucket: "medad-c9a51.firebasestorage.app",
  messagingSenderId: "307233635022",
  appId: "1:307233635022:web:e08899b7f8beb58b6cee9f"
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
