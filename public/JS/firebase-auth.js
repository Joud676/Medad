
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "${APIKEY}",  // GitHub Secret FIREBASE_APIKEY
  authDomain: "${AUTHDOMAIN}",  // GitHub Secret FIREBASE_AUTHDOMAIN
  projectId: "${PROJECTID}",  // GitHub Secret FIREBASE_PROJECTID
  storageBucket: "${STORAGEBUCKET}",  // GitHub Secret FIREBASE_STORAGEBUCKET
  messagingSenderId: "${MESSAGINGSENDERID}",  // GitHub Secret FIREBASE_MESSAGINGSENDERID
  appId: "${APPID}",  // GitHub Secret FIREBASE_APPID
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
      window.location.href = "/HTML/ReaderHomePage.html";
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
      window.location.href = "/HTML/WriterHomePage.html";
    })
    .catch((error) => {
      alert("حدث خطأ في التسجيل: " + error.message);
      console.error("خطأ في التسجيل:", error);
    });
}

function loginReader(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      window.location.href = "/HTML/ReaderHomePage.html";
    })
    .catch((error) => {
      alert("حدث خطأ في تسجيل الدخول: " + error.message);
      console.error("خطأ في تسجيل الدخول:", error);
    });
}

function loginWriter(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      window.location.href = "/HTML/WriterHomePage.html";
    })
    .catch((error) => {
      alert("حدث خطأ في تسجيل الدخول: " + error.message);
      console.error("خطأ في تسجيل الدخول:", error);
    });
}

export { registerReader, registerWriter, loginReader, loginWriter };
