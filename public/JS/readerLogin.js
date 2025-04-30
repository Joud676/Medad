const statusDiv = document.getElementById('status');

function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    statusDiv.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    statusDiv.style.color = isError ? '#721c24' : '#155724';
}

document.getElementById('readerLoginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    showStatus('جاري تسجيل الدخول...');

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            showStatus('تم تسجيل الدخول بنجاح! جاري التوجيه...');
            setTimeout(() => {
                window.location.href = "/HTML/ReaderHomePage.html";
            }, 2000);
        })
        .catch((error) => {
            const msg = {
                'auth/user-not-found': "البريد الإلكتروني أو كلمة المرور غير صحيحة",
                'auth/wrong-password': "البريد الإلكتروني أو كلمة المرور غير صحيحة",
                'auth/invalid-credential': "بيانات الاعتماد غير صالحة",
                'auth/too-many-requests': "تم تعطيل الحساب مؤقتًا",
                'auth/network-request-failed': "تأكد من اتصالك بالإنترنت"
            };
            showStatus(msg[error.code] || "حدث خطأ: " + error.message, true);
        });
});
