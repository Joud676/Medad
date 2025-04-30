
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDF5K3Kyv8EfNQnG5vesQAo6gTuXfUwGng",
  authDomain: "medad-c9a51.firebaseapp.com",
  projectId: "medad-c9a51",
  storageBucket: "medad-c9a51.firebasestorage.app",
  messagingSenderId: "307233635022",
  appId: "1:307233635022:web:e08899b7f8beb58b6cee9f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function registerReader(email, password, fullName) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      
      return addDoc(collection(db, "readers"), {
        uid: user.uid,
        fullName: fullName,
        email: email,
        role: "reader",
        createdAt: new Date()
      });
    })
    .then(() => {
      window.location.href = "ReaderHomePage.html";
    })
    .catch((error) => {
      alert("حدث خطأ في التسجيل: " + error.message);
      console.error("خطأ في التسجيل:", error);
    });
}

function registerWriter(email, password, fullName) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      
      return addDoc(collection(db, "writers"), {
        uid: user.uid,
        fullName: fullName,
        email: email,
        role: "writer",
        createdAt: new Date()
      });
    })
    .then(() => {
      window.location.href = "WriterHomePage.html";
    })
    .catch((error) => {
      alert("حدث خطأ في التسجيل: " + error.message);
      console.error("خطأ في التسجيل:", error);
    });
}

function loginReader(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      window.location.href = "ReaderHomePage.html";
    })
    .catch((error) => {
      alert("حدث خطأ في تسجيل الدخول: " + error.message);
      console.error("خطأ في تسجيل الدخول:", error);
    });
}

function loginWriter(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      window.location.href = "WriterHomePage.html";
    })
    .catch((error) => {
      alert("حدث خطأ في تسجيل الدخول: " + error.message);
      console.error("خطأ في تسجيل الدخول:", error);
    });
}

export { registerReader, registerWriter, loginReader, loginWriter };
