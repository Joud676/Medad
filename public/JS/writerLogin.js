import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";


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

document.getElementById('writerLoginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    showStatus('جاري تسجيل الدخول...');

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            showStatus('تم تسجيل الدخول بنجاح! جاري التوجيه...');

            setTimeout(() => {
                window.location.href = "WriterHomePage.html";
            }, 2000);
        })
        .catch((error) => {
            const errorCode = error.code;

            if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
                showStatus("البريد الإلكتروني أو كلمة المرور غير صحيحة", true);
            } else if (errorCode === 'auth/invalid-credential') {
                showStatus("بيانات الاعتماد غير صالحة. تأكد من البريد الإلكتروني وكلمة المرور", true);
            } else if (errorCode === 'auth/too-many-requests') {
                showStatus("تم تعطيل الحساب مؤقتًا بسبب محاولات تسجيل دخول متكررة. حاول مرة أخرى لاحقًا", true);
            } else if (errorCode === 'auth/network-request-failed') {
                showStatus("فشل الاتصال بالشبكة. تأكد من اتصالك بالإنترنت", true);
            } else {
                showStatus("حدث خطأ: " + error.message, true);
            }
            console.error(error);
        });
});
