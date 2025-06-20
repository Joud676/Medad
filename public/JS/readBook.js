
let rightPageContent;
let leftPageContent;
let prevBtn;
let nextBtn;
let chapterList;
let bookTitle;

let currentBookId = localStorage.getItem('selectedBookId') || localStorage.getItem('bookID');
let chaptersData = {};
let currentChapterId = null;
let currentPageIndex = 0;

const fontSizes = ['small', 'medium', 'large'];
let currentFontIndexLeft = 1;
let currentFontIndexRight = 1;

window.onload = async function () {
    rightPageContent = document.getElementById('rightPageContent');
    leftPageContent = document.getElementById('leftPageContent');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    chapterList = document.querySelector('.chapter-list');
    bookTitle = document.getElementById('title');

    if (!currentBookId) {
        alert('❗ لا يوجد كتاب محدد!');
        return;
    }

    await loadBookTitle();
    await loadChapters();
    attachChapterClickEvents();
    updatePageContent();

    document.getElementById('increaseLeft').addEventListener('click', () => adjustFontSize('left', 'increase'));
    document.getElementById('decreaseLeft').addEventListener('click', () => adjustFontSize('left', 'decrease'));
    document.getElementById('increaseRight').addEventListener('click', () => adjustFontSize('right', 'increase'));
    document.getElementById('decreaseRight').addEventListener('click', () => adjustFontSize('right', 'decrease'));

    if (nextBtn) {
        nextBtn.onclick = function () {
            const chapter = chaptersData[currentChapterId];
            if ((currentPageIndex + 1) * 2 < chapter.pages.length) {
                currentPageIndex++;
                updatePageContent();
            }
        };
    }

    if (prevBtn) {
        prevBtn.onclick = function () {
            if (currentPageIndex > 0) {
                currentPageIndex--;
                updatePageContent();
            }
        };
    }
    const addToLibraryBtn = document.getElementById('addToLibraryBtn');
    if (addToLibraryBtn) {
        addToLibraryBtn.addEventListener('click', async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    alert('⚠️ يجب تسجيل الدخول لإضافة الكتاب.');
                    return;
                }

                const readerRef = db.collection("Readers").doc(user.uid);

                await readerRef.set({
                    favoriteBooks: firebase.firestore.FieldValue.arrayUnion(currentBookId)
                }, { merge: true });

                alert('✅ تم إضافة الكتاب إلى المفضلة!');
            } catch (error) {
                console.error("❌ خطأ أثناء الإضافة:", error);
                alert(`حدث خطأ: ${error.message}`);
            }
        });
    }

};

async function loadBookTitle() {
    try {
        const bookDoc = await db.collection("Books").doc(currentBookId).get();
        if (bookDoc.exists) {
            const bookData = bookDoc.data();
            bookTitle.textContent = bookData.title || "";
        } else {
            bookTitle.textContent = "❗ لم يتم العثور على الكتاب";
        }
    } catch (error) {
        console.error("❌ خطأ في تحميل عنوان الكتاب:", error);
        bookTitle.textContent = "⚠️ خطأ في العنوان";
    }
}

async function loadChapters() {
    try {
        const snapshot = await db.collection('Books')
            .doc(currentBookId)
            .collection('chapters')
            .orderBy('chapterID')
            .get();

        chaptersData = {};
        chapterList.innerHTML = '';

        snapshot.forEach((doc) => {
            const data = doc.data();
            chaptersData[doc.id] = data;
            createChapterItem(doc.id);
        });

        const firstChapterId = Object.keys(chaptersData)[0];
        if (firstChapterId) {
            selectChapter(firstChapterId);
        }
    } catch (error) {
        console.error('❌ خطأ أثناء تحميل الفصول:', error);
    }
}

function createChapterItem(chapterId) {
    const li = document.createElement('li');
    li.classList.add('chapter-item');
    li.dataset.chapterId = chapterId;

    const span = document.createElement('span');
    span.textContent = `الفصل ${chaptersData[chapterId].chapterID}`;
    li.appendChild(span);

    chapterList.appendChild(li);
}

function attachChapterClickEvents() {
    chapterList.addEventListener('click', (e) => {
        const item = e.target.closest('.chapter-item');
        if (!item) return;
        const chapterId = item.dataset.chapterId;
        selectChapter(chapterId);
    });
}

function selectChapter(chapterId) {
    currentChapterId = chapterId;
    currentPageIndex = 0;

    document.querySelectorAll('.chapter-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeItem = document.querySelector(`.chapter-item[data-chapter-id='${chapterId}']`);
    if (activeItem) activeItem.classList.add('active');

    updatePageContent();
}

function updatePageContent() {
    if (!rightPageContent || !leftPageContent) return;

    const chapter = chaptersData[currentChapterId];
    const pages = chapter.pages || [];

    rightPageContent.innerText = pages[currentPageIndex * 2] || '';
    leftPageContent.innerText = pages[currentPageIndex * 2 + 1] || '';

    if (prevBtn && nextBtn) {
        prevBtn.disabled = currentPageIndex === 0;
        nextBtn.disabled = (currentPageIndex + 1) * 2 >= pages.length;
    }
}

function adjustFontSize(side, action) {
    let editor;
    let index;

    if (side === 'left') {
        editor = leftPageContent;
        index = currentFontIndexLeft;
    } else if (side === 'right') {
        editor = rightPageContent;
        index = currentFontIndexRight;
    } else {
        return;
    }

    if (action === 'increase' && index < fontSizes.length - 1) {
        index++;
    } else if (action === 'decrease' && index > 0) {
        index--;
    }

    editor.classList.remove(...fontSizes);
    editor.classList.add(fontSizes[index]);

    if (side === 'left') {
        currentFontIndexLeft = index;
    } else {
        currentFontIndexRight = index;
    }
}

function HomePageRedirect() {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = '/index.html';
            return;
        }

        const db = firebase.firestore();
        const uid = user.uid;

        try {
            const [authorDoc, readerDoc] = await Promise.all([
                db.collection('Authors').doc(uid).get(),
                db.collection('Readers').doc(uid).get()
            ]);

            if (authorDoc.exists && !readerDoc.exists) {
                window.location.href = '/HTML/WriterHomePage.html';
            } else if (!authorDoc.exists && readerDoc.exists) {
                window.location.href = '/HTML/ReaderHomePage.html';
            } else if (authorDoc.exists && readerDoc.exists) {
                alert("⚠ يوجد خلل في الحساب: المستخدم موجود ككاتب وقارئ. الرجاء مراجعة الدعم.");
            } else {
                alert("⚠ لم يتم العثور على حسابك ضمن الكتّاب أو القراء.");
            }

        } catch (error) {
            console.error('Error getting user role:', error);
        }
    });
}

function getLangFromText(text) {
    const arabicRegex = /[\u0600-\u06FF]/;
    if (arabicRegex.test(text)) {
        return 'ar-SA';
    }
    return 'en-US';
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getLangFromText(text);

        const voices = window.speechSynthesis.getVoices();
        const matchedVoice = voices.find(voice => voice.lang === utterance.lang);
        if (matchedVoice) {
            utterance.voice = matchedVoice;
        }

        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    } else {
        alert('❌ المتصفح لا يدعم ميزة قراءة النصوص');
    }
}
