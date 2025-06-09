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

document.getElementById('writerLoginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    showStatus('جاري التحقق من البيانات...');

    try {
        const res = await fetch('http://localhost:3000/login/writer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            const readableMessage = mapFirebaseError(data.error?.message);
            showStatus("❌ " + readableMessage, true);
            return;
        }

        showStatus('جاري تسجيل الدخول عبر Firebase...');

        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                showStatus('✅ تم تسجيل الدخول بنجاح! جاري التوجيه...');
                setTimeout(() => {
                    window.location.href = "/HTML/WriterHomePage.html";
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

    } catch (error) {
        console.error(error);
        showStatus('⚠️ حدث خطأ أثناء الاتصال بالسيرفر.', true);
    }
});

function mapFirebaseError(message) {
    switch (message) {
        case 'INVALID_LOGIN_CREDENTIALS':
        case 'EMAIL_NOT_FOUND':
        case 'INVALID_PASSWORD':
            return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
        default:
            return message || "حدث خطأ غير معروف أثناء التحقق";
    }
}
