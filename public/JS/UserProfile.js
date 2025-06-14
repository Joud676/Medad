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

function HomePageRedirect() {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = '/index.html';
            return;
        }

        const db = firebase.firestore();
        const uid = user.uid;
        console.log("✅ UID:", uid);

        try {
            const [authorDoc, readerDoc] = await Promise.all([
                db.collection('Authors').doc(uid).get(),
                db.collection('Readers').doc(uid).get()
            ]);

            console.log("🟣 authorDoc.exists:", authorDoc.exists);
            console.log("🔵 readerDoc.exists:", readerDoc.exists);

            if (authorDoc.exists && !readerDoc.exists) {
                console.log("🔁 Redirecting to Writer");
                debugger;
                window.location.href = '/HTML/WriterHomePage.html';
            } else if (!authorDoc.exists && readerDoc.exists) {
                console.log("🔁 Redirecting to Reader");
                debugger;
                window.location.href = '/HTML/ReaderHomePage.html';
            } else if (authorDoc.exists && readerDoc.exists) {
                console.log("⚠ User exists in both Authors and Readers");
                alert("⚠ المستخدم موجود ككاتب وقارئ. يرجى التواصل مع الدعم.");
            } else {
                console.log("⚠ User exists in neither collection.");
                alert("⚠ لم يتم العثور على المستخدم.");
            }

        } catch (error) {
            console.error('🔥 Error checking user role:', error);
        }
    });
}
