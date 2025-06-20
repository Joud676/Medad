document.addEventListener('DOMContentLoaded', function () {
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const logoutBtn = document.getElementById('logout-btn');
    const showPasswordFormBtn = document.getElementById('show-password-form');
    const cancelPasswordBtn = document.getElementById('cancel-password');
    const changePasswordForm = document.getElementById('change-password-form');
    const statusMessage = document.getElementById('status-message');

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            profileName.textContent = 'جاري التحميل...';
            profileEmail.textContent = user.email;

            const uid = user.uid;

            firebase.firestore().collection('Authors').doc(uid).get()
                .then(doc => {
                    if (doc.exists) {
                        const name = doc.data().fullName || 'بدون اسم';
                        profileName.textContent = name;
                    } else {
                        return firebase.firestore().collection('Readers').doc(uid).get();
                    }
                })
                .then(doc => {
                    if (doc?.exists) {
                        const name = doc.data().fullName || 'بدون اسم';
                        profileName.textContent = name;
                    } else if (doc !== undefined) {
                        profileName.textContent = 'لا يوجد اسم';
                    }
                })
                .catch(error => {
                    console.error('Error fetching profile name:', error);
                    profileName.textContent = 'لا يوجد اسم';
                });
        } else {
            window.location.href = '/index.html';
        }
    });


    showPasswordFormBtn.addEventListener('click', function () {
        changePasswordForm.classList.remove('hidden');
        showPasswordFormBtn.classList.add('hidden');
        statusMessage.classList.add('hidden');
    });

    cancelPasswordBtn.addEventListener('click', function () {
        changePasswordForm.classList.add('hidden');
        showPasswordFormBtn.classList.remove('hidden');
        changePasswordForm.reset();
        statusMessage.classList.add('hidden');
    });

    changePasswordForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        statusMessage.classList.add('hidden');

        if (!currentPassword || !newPassword || !confirmPassword) {
            showStatus('الرجاء تعبئة جميع الحقول', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showStatus('كلمة المرور الجديدة غير متطابقة', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showStatus('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
            return;
        }

        const user = firebase.auth().currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);

        user.reauthenticateWithCredential(credential)
            .then(() => user.updatePassword(newPassword))
            .then(() => {
                showStatus('تم تغيير كلمة المرور بنجاح', 'success');
                changePasswordForm.reset();
                changePasswordForm.classList.add('hidden');
                showPasswordFormBtn.classList.remove('hidden');
            })
            .catch(error => {
                const errorCode = error.code || '';
                let errorMessage = 'حدث خطأ أثناء تغيير كلمة المرور';

                if (errorCode.includes('wrong-password')) {
                    errorMessage = 'كلمة المرور الحالية غير صحيحة';
                } else if (errorCode.includes('weak-password')) {
                    errorMessage = 'كلمة المرور الجديدة ضعيفة جداً';
                } else if (errorCode.includes('requires-recent-login')) {
                    errorMessage = 'يجب تسجيل الدخول حديثاً';
                }

                showStatus(errorMessage, 'error');
                document.getElementById('current-password').value = '';
                document.getElementById('current-password').focus();
            });
    });

    logoutBtn.addEventListener('click', function () {
        firebase.auth().signOut()
            .then(() => window.location.href = '/index.html');
    });

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message ' + type;
        statusMessage.classList.remove('hidden');
        setTimeout(() => statusMessage.classList.add('hidden'), 5000);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const homeLink = document.getElementById("homeLink");
    if (homeLink) {
        homeLink.addEventListener("click", (e) => {
            e.preventDefault();
            HomePageRedirect();
        });
    }
});

function HomePageRedirect() {
    const loadingMessage = document.createElement("div");
    loadingMessage.textContent = "🔄 جاري التوجيه...";
    loadingMessage.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #fefefe;
    color: #333;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    z-index: 9999;
  `;
    document.body.appendChild(loadingMessage);

    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = '/index.html';
            return;
        }

        const uid = user.uid;
        const db = firebase.firestore();

        try {
            const [authorDoc, readerDoc] = await Promise.all([
                db.collection("Authors").doc(uid).get(),
                db.collection("Readers").doc(uid).get()
            ]);

            if (authorDoc.exists && !readerDoc.exists) {
                window.location.href = '/HTML/WriterHomePage.html';
            } else if (!authorDoc.exists && readerDoc.exists) {
                window.location.href = '/HTML/ReaderHomePage.html';
            } else if (authorDoc.exists && readerDoc.exists) {
                alert("⚠ الحساب مسجل كقارئ وككاتب! يرجى التواصل مع الدعم.");
            } else {
                alert("⚠ لم يتم العثور على بيانات المستخدم.");
            }
        } catch (error) {
            console.error("🚨 خطأ في التحقق:", error);
            alert("حدث خطأ أثناء التوجيه، يرجى المحاولة لاحقًا.");
        } finally {
            loadingMessage.remove();
        }
    });
}
