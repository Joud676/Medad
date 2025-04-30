import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";



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

const statusDiv = document.getElementById('status');


function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    if (isError) {
        statusDiv.style.backgroundColor = '#f8d7da';
        statusDiv.style.color = '#721c24';
    } else {
        statusDiv.style.backgroundColor = '#d4edda';
        statusDiv.style.color = '#155724';
    }
}

document.getElementById('writerSignupForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fullName = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (password.length < 6) {
        showStatus('كلمة المرور يجب أن تكون على الأقل 6 أحرف', true);
        return;
    }

    showStatus('جاري إنشاء الحساب...');

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            return addDoc(collection(db, "Authors"), {
                uid: user.uid,
                fullName: fullName,
                email: email,
                joinedAt: new Date(),
                myBooks: 0
            });
        })
        .then(() => {
            showStatus("تم إنشاء الحساب بنجاح! جاري التوجيه...");
            setTimeout(() => {
                window.location.href = "/WriterHomePage.html";
            }, 2000);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            if (errorCode === 'auth/email-already-in-use') {
                showStatus("البريد الإلكتروني مستخدم بالفعل", true);
            } else if (errorCode === 'auth/weak-password') {
                showStatus("كلمة المرور ضعيفة جدًا", true);
            } else if (errorCode === 'auth/invalid-email') {
                showStatus("البريد الإلكتروني غير صالح", true);
            } else if (errorCode === 'auth/network-request-failed') {
                showStatus("فشل الاتصال بالشبكة. تأكد من اتصالك بالإنترنت", true);
            } else {
                showStatus("حدث خطأ: " + errorMessage, true);
            }
            console.error(error);
        });
});
