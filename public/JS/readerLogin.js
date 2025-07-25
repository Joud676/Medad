
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

document.getElementById('readerLoginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  showStatus('جاري تسجيل الدخول...');

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;
      const db = firebase.firestore();

      db.collection('Readers').doc(uid).get()
        .then((doc) => {
          if (doc.exists) {
            showStatus('✅ تم تسجيل الدخول كقارئ! جاري التوجيه...');
            setTimeout(() => {
              window.location.href = "/HTML/ReaderHomePage.html";
            }, 1500);
          } else {
            showStatus("⚠ هذا الحساب غير مسجل كقارئ", true);
            auth.signOut();
          }
        })
        .catch((err) => {
          console.error("Firestore error:", err);
          showStatus("حدث خطأ أثناء التحقق من الحساب", true);
        });

    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        showStatus("البريد الإلكتروني أو كلمة المرور غير صحيحة", true);
      } else if (errorCode === 'auth/invalid-credential') {
        showStatus("بيانات الاعتماد غير صالحة. تأكد من البريد الإلكتروني وكلمة المرور", true);
      } else if (errorCode === 'auth/too-many-requests') {
        showStatus("تم تعطيل الحساب مؤقتًا بسبب محاولات تسجيل دخول متكررة. حاول مرة أخرى لاحقًا", true);
      } else if (errorCode === 'auth/network-request-failed') {
        showStatus("فشل الاتصال بالشبكة. تأكد من اتصالك بالإنترنت", true);
      } else if (errorMessage && errorMessage.includes("INVALID_LOGIN_CREDENTIALS")) {
        showStatus("البريد الإلكتروني أو كلمة المرور غير صحيحة", true);
      } else {
        showStatus("حدث خطأ غير متوقع: " + errorMessage, true);
      }

      console.error(error);
    });
});
