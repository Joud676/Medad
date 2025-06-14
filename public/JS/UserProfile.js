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

            if (user.uid) {
                firebase.firestore().collection('Authors').doc(user.uid).get()
                    .then(doc => {
                        if (doc.exists && doc.data().fullName) {
                            profileName.textContent = doc.data().fullName;
                        } else {
                            return firebase.firestore().collection('Readers').doc(user.uid).get();
                        }
                    })
                    .then(doc => {
                        if (doc?.exists && doc.data().fullName) {
                            profileName.textContent = doc.data().fullName;
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching profile name:', error);
                        profileName.textContent = 'مستخدم';
                    });
            }
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
    const user = firebase.auth().currentUser;
    if (!user) return;

    const db = firebase.firestore();
    const uid = user.uid;

    db.collection('Authors').doc(uid).get().then((doc) => {
        if (doc.exists) {
            window.location.href = '/HTML/WriterHomePage.html';
        } else {
            return db.collection('Readers').doc(uid).get();
        }
    }).then((doc) => {
        if (doc?.exists) {
            window.location.href = '/HTML/ReaderHomePage.html';
        }
    }).catch((error) => {
        console.error('Error getting user role:', error);
    });
}
