import {
    signOut,
    sendPasswordResetEmail,
    updateEmail,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// DOM elements
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const bookCount = document.getElementById('bookCount');

// Listen for auth state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            userEmail.textContent = user.email;

            // Try to find the user in Readers
            const readerDoc = await getDoc(doc(db, "Readers", user.uid));
            if (readerDoc.exists()) {
                userName.textContent = readerDoc.data().fullName;
                bookCount.textContent = "0"; // Readers don't publish books
            } else {
                // Check if user is a Writer
                const writerDoc = await getDoc(doc(db, "Authors", user.uid));
                if (writerDoc.exists()) {
                    userName.textContent = writerDoc.data().fullName;

                    // Count number of books
                    const booksRef = collection(db, "Books");
                    const q = query(booksRef, where("authorId", "==", user.uid));
                    const booksSnap = await getDocs(q);
                    bookCount.textContent = booksSnap.size;
                } else {
                    userName.textContent = "مستخدم غير معروف";
                    bookCount.textContent = "-";
                }
            }
        } catch (error) {
            console.error("⚠️ Error fetching profile:", error);
            userName.textContent = "خطأ في التحميل";
        }
    } else {
        window.location.href = "index.html"; // redirect if not logged in
    }
});

// ========== Button Handlers ==========

window.resetEmail = function () {
    const newEmail = prompt("أدخل البريد الإلكتروني الجديد:");
    if (newEmail) {
        updateEmail(auth.currentUser, newEmail)
            .then(() => {
                alert("تم تحديث البريد الإلكتروني بنجاح.");
                userEmail.textContent = newEmail;
            })
            .catch((error) => {
                alert("فشل تحديث البريد الإلكتروني: " + error.message);
            });
    }
};

window.resetPassword = function () {
    sendPasswordResetEmail(auth, auth.currentUser.email)
        .then(() => {
            alert("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.");
        })
        .catch((error) => {
            alert("حدث خطأ: " + error.message);
        });
};

window.logout = function () {
    signOut(auth)
        .then(() => {
            window.location.href = "index.html";
        })
        .catch((error) => {
            alert("فشل تسجيل الخروج: " + error.message);
        });
};

window.toggleKidMode = function () {
    document.body.classList.toggle("kid-theme");
};
