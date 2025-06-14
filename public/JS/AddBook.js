document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.db === 'undefined' || typeof window.auth === 'undefined') {
        console.error('Firebase services not available');
        showErrorAlert('خطأ في تحميل خدمات Firebase. يرجى تحديث الصفحة وإعادة المحاولة.');
        return;
    }

    const db = window.db;
    const auth = window.auth;
    const form = document.querySelector('form');
    const canvas = document.getElementById('book-cover-canvas');
    const ctx = canvas.getContext('2d');
    const bookImageInput = document.getElementById('book-image');
    const colorOptions = document.querySelectorAll('.color-option');
    const uploadedImage = new Image();

    const imgbbApiKey = '3b6c8e2fb5ae93c3c6e389550e68c183';

    const colors = [
        { light: '#afa1c7', dark: '#706999' },
        { light: '#bb5e59', dark: '#8a4540' },
        { light: '#d2736b', dark: '#a85a54' },
        { light: '#90b3d5', dark: '#658a60' },
        { light: '#87a56f', dark: '#5e8796' },
        { light: '#efde8c', dark: '#e2ce6a' }
    ];

    let currentLightColor = colors[0].light;
    let currentDarkColor = colors[0].dark;

    const bookCoverImage = new Image();
    bookCoverImage.src = '/images/BookCover.png';
    bookCoverImage.onload = () => drawBookCover();

    function drawBookCover() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bookCoverImage, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = currentDarkColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = currentLightColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';

        if (uploadedImage.src) {
            const ratio = Math.min(
                (canvas.width - 40) / uploadedImage.width,
                (canvas.height - 90) / uploadedImage.height
            );
            const newWidth = uploadedImage.width * ratio;
            const newHeight = uploadedImage.height * ratio;
            const x = (canvas.width - newWidth) / 2;
            const y = (canvas.height - newHeight) / 2;
            ctx.drawImage(uploadedImage, x, y, newWidth, newHeight);
        }
    }

    colorOptions.forEach((option, index) => {
        option.style.backgroundColor = colors[index].light;
        option.addEventListener('click', function () {
            currentLightColor = colors[index].light;
            currentDarkColor = colors[index].dark;
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            drawBookCover();
        });
    });

    bookImageInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file && ['image/jpeg', 'image/png'].includes(file.type)) {
            const reader = new FileReader();
            reader.onload = function (e) {
                uploadedImage.src = e.target.result;
                uploadedImage.onload = drawBookCover;
            };
            reader.readAsDataURL(file);
        } else {
            alert('الرجاء اختيار صورة بصيغة JPEG أو PNG');
        }
    });

    async function uploadImageToImgBB(file) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        return data.success ? data.data.url : null;
    }

    async function getNextBookId() {
        try {
            const q = db.collection("Books").orderBy("bookID", "desc").limit(1);
            const querySnapshot = await q.get();
            return querySnapshot.empty ? 1 : querySnapshot.docs[0].data().bookID + 1;
        } catch (error) {
            console.error("Error getting next book ID:", error);
            return Date.now();
        }
    }

    function getCanvasBlob(canvas) {
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        });
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitBtn = document.getElementById('save-book');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> جاري الحفظ...';

        try {
            if (!auth.currentUser) throw new Error('يجب تسجيل الدخول لإضافة كتاب');
            if (!form.reportValidity()) throw new Error('الرجاء ملء جميع الحقول المطلوبة بشكل صحيح');

            const title = document.getElementById('book-title').value.trim();
            const description = document.getElementById('book-discription').value.trim();
            const bookType = document.getElementById('book-category').value;
            const ageGroup = document.getElementById('age-group').value;
            const imageFile = bookImageInput.files[0];

            if (!imageFile) throw new Error('الرجاء اختيار صورة للكتاب');

            const bookID = await getNextBookId();
            const imageUrl = await uploadImageToImgBB(await getCanvasBlob(canvas));
            if (!imageUrl) throw new Error('فشل رفع صورة الكتاب');

            const bookData = {
                title,
                description,
                bookType,
                ageGroup,
                coverColor: currentLightColor,
                coverImageUrl: imageUrl,
                authorId: auth.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                bookID,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            };

            const bookRef = await db.collection("Books").add(bookData);

            const chapter = {
                chapterID: 1,
                title: 'الفصل الأول',
                content: '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection(`Books/${bookRef.id}/chapters`).doc('1').set(chapter);

            const authorRef = db.collection("Authors").doc(auth.currentUser.uid);
            const authorDoc = await authorRef.get();

            // Create a new book entry with bookId and title
            const bookEntry = {
                bookId: bookRef.id,
                title: title
            };

            if (authorDoc.exists) {
                // Get the current myBooks array
                const authorData = authorDoc.data();
                const myBooks = authorData.myBooks || [];

                // Add the new book to the myBooks array with numeric index
                // This will keep the structure as shown in the screenshot
                myBooks.push(bookEntry);

                await authorRef.update({
                    myBooks: myBooks,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Create new author document with the book in myBooks array
                await authorRef.set({
                    fullName: auth.currentUser.displayName || '',
                    email: auth.currentUser.email || '',
                    joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    myBooks: [bookEntry], // First book gets index 0 automatically
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            showSuccessAlert('تمت إضافة الكتاب بنجاح!', () => {
                window.location.href = "/HTML/WriterHomePage.html";
            });

        } catch (error) {
            console.error("Error adding book:", error);
            showErrorAlert(error.message || 'حدث خطأ أثناء حفظ الكتاب');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'أضف الكتاب';
        }
    });

    function showSuccessAlert(message, callback) {
        const alert = document.createElement('div');
        alert.className = 'custom-alert success';
        alert.innerHTML = `
            <div class="alert-content">
                <i class="fas fa-check-circle"></i>
                <p>${message}</p>
                <button class="close-btn">&times;</button>
            </div>
        `;
        document.body.appendChild(alert);
        alert.querySelector('.close-btn').addEventListener('click', () => {
            alert.remove();
            if (callback) callback();
        });
        setTimeout(() => {
            alert.remove();
            if (callback) callback();
        }, 3000);
    }

    function showErrorAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'custom-alert error';
        alert.innerHTML = `
            <div class="alert-content">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <button class="close-btn">&times;</button>
            </div>
        `;
        document.body.appendChild(alert);
        alert.querySelector('.close-btn').addEventListener('click', () => {
            alert.remove();
        });
        setTimeout(() => {
            alert.remove();
        }, 5000);
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
