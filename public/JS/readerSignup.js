const statusDiv = document.getElementById('status');

function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    statusDiv.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    statusDiv.style.color = isError ? '#721c24' : '#155724';
}

document.getElementById('readerSignupForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fullName = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (password.length < 6) {
        showStatus('كلمة المرور يجب أن تكون على الأقل 6 أحرف', true);
        return;
    }

    showStatus('جاري إنشاء الحساب...');

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return db.collection("Readers").add({
                uid: userCredential.user.uid,
                fullName: fullName,
                email: email,
                joinedAt: new Date()
            });
        })
        .then(() => {
            showStatus("تم إنشاء الحساب بنجاح! جاري التوجيه...");
            setTimeout(() => {
                window.location.href = "/HTML/ReaderHomePage.html";
            }, 2000);
        })
        .catch((error) => {
            const messages = {
                'auth/email-already-in-use': "البريد الإلكتروني مستخدم بالفعل",
                'auth/weak-password': "كلمة المرور ضعيفة جدًا",
                'auth/invalid-email': "البريد الإلكتروني غير صالح",
                'auth/network-request-failed': "تأكد من اتصالك بالإنترنت"
            };
            showStatus(messages[error.code] || "حدث خطأ: " + error.message, true);
        });
});
