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
            loadUserProfile(user);
        } else {
            window.location.href = '/index.html';
        }
    });

    function loadUserProfile(user) {
        profileName.textContent = user.displayName || 'مستخدم بدون اسم';
        profileEmail.textContent = user.email;

        if (user.uid) {
            const db = firebase.firestore();
            db.collection('Authors').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists && doc.data().fullName) {
                        profileName.textContent = doc.data().fullName;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }

    showPasswordFormBtn.addEventListener('click', function () {
        changePasswordForm.classList.remove('hidden');
        showPasswordFormBtn.classList.add('hidden');
    });

    cancelPasswordBtn.addEventListener('click', function () {
        changePasswordForm.classList.add('hidden');
        showPasswordFormBtn.classList.remove('hidden');
        document.getElementById('change-password-form').reset();
    });

    document.getElementById('change-password-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

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
                changePasswordForm.classList.add('hidden');
                showPasswordFormBtn.classList.remove('hidden');
                document.getElementById('change-password-form').reset();
            })
            .catch(error => {
                let errorMessage = 'حدث خطأ أثناء تغيير كلمة المرور';
                if (error.code === 'auth/wrong-password') errorMessage = 'كلمة المرور الحالية غير صحيحة';
                else if (error.code === 'auth/weak-password') errorMessage = 'كلمة المرور ضعيفة جدًا';
                showStatus(errorMessage, 'error');
            });
    });

    logoutBtn.addEventListener('click', function () {
        firebase.auth().signOut()
            .then(() => window.location.href = '/index.html')
            .catch(error => showStatus('حدث خطأ أثناء تسجيل الخروج', 'error'));
    });

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message ' + type;
        statusMessage.classList.remove('hidden');
        setTimeout(() => statusMessage.classList.add('hidden'), 5000);
    }
});