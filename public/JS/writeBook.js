let currentBookId;
let currentChapterId = null;
let currentPageIndex = 0;
let chaptersData = {};

const rightPage = document.getElementById('rightPageContent');
const leftPage = document.getElementById('leftPageContent');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const saveBtn = document.getElementById('saveBtn');
const saveAllBtn = document.getElementById('saveAllChaptersBtn');
const addChapterBtn = document.getElementById('addChapterBtn');
const confirmDeletePageBtn = document.getElementById('confirmDeletePage');
const deletePageChoice = document.getElementById('deletePageChoice');
const pageIndicator = document.getElementById('pageIndicator');
const chapterList = document.querySelector('.chapter-list');
const bookTitle = document.getElementById('title');

const fontSizes = ['small', 'medium', 'large'];
let currentFontIndex = 1;

window.onload = async function () {
  currentBookId = localStorage.getItem('bookID');
  if (!currentBookId) {
    alert('لا يوجد كتاب محدد.');
    return;
  }
  clearOtherBooksDrafts(currentBookId);


  await loadChapters();
  attachButtonEvents();
};

function clearOtherBooksDrafts(currentId) {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('medad-write-draft-') && !key.endsWith(currentId)) {
      localStorage.removeItem(key);
    }
  });
}

async function loadChapters() {
  try {
    const bookDoc = await db.collection('Books').doc(currentBookId).get();
    if (bookDoc.exists) {
      const bookData = bookDoc.data();
      bookTitle.textContent = bookData.title || '';
    }

    const snapshot = await db.collection('Books')
      .doc(currentBookId)
      .collection('chapters')
      .orderBy('chapterID')
      .get();

    chaptersData = JSON.parse(localStorage.getItem(`medad-write-draft-${currentBookId}`)) || {};
    chapterList.innerHTML = '';

    if (snapshot.empty && Object.keys(chaptersData).length === 0) {
      createNewChapter(1);
    } else {
      snapshot.forEach(doc => {
        if (!chaptersData[doc.id]) {
          chaptersData[doc.id] = doc.data();
        }
        createChapterItem(doc.id);
      });
      const firstChapterId = Object.keys(chaptersData)[0];
      selectChapter(firstChapterId);
    }
  } catch (error) {
    console.error('خطأ أثناء تحميل الفصول:', error);
  }
}


function attachButtonEvents() {
  nextBtn.onclick = nextPage;
  prevBtn.onclick = prevPage;
  confirmDeletePageBtn.onclick = deleteCurrentPage;
  addChapterBtn.onclick = () => {
    if (currentChapterId) saveDraftLocally();
    const nextChapterNumber = getNextChapterNumber();
    createNewChapter(nextChapterNumber);
  };
  saveBtn.onclick = saveCurrentChapter;
  saveAllBtn.onclick = saveAllChapters;

  rightPage.addEventListener('input', saveDraftLocally);
  leftPage.addEventListener('input', saveDraftLocally);

  document.querySelectorAll('.font-btn').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'increase' && currentFontIndex < fontSizes.length - 1) {
        currentFontIndex++;
      } else if (action === 'decrease' && currentFontIndex > 0) {
        currentFontIndex--;
      }

      const selectedSize = fontSizes[currentFontIndex];

      rightPage.classList.remove(...fontSizes);
      leftPage.classList.remove(...fontSizes);

      rightPage.classList.add(selectedSize);
      leftPage.classList.add(selectedSize);

      if (chaptersData[currentChapterId]) {
        chaptersData[currentChapterId].fontSize = selectedSize;
        saveDraftLocally();
      }
    });
  });

  window.addEventListener('beforeunload', function (e) {
    if (Object.keys(chaptersData).length > 0) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

function getNextChapterNumber() {
  const ids = Object.keys(chaptersData).map(id => parseInt(id));
  const maxId = ids.length > 0 ? Math.max(...ids) : 0;
  return maxId + 1;
}

function createChapterItem(chapterId) {
  const li = document.createElement('li');
  li.classList.add('chapter-item');
  li.setAttribute('data-chapter-id', chapterId);

  const deleteIcon = document.createElement('i');
  deleteIcon.classList.add('fas', 'fa-trash', 'delete-icon');
  deleteIcon.title = "حذف الفصل";

  deleteIcon.onclick = (e) => {
    e.stopPropagation();
    deleteChapter(chapterId);
  };

  const span = document.createElement('span');
  span.textContent = '';

  li.appendChild(span);
  li.appendChild(deleteIcon);

  li.onclick = () => selectChapter(chapterId);
  chapterList.appendChild(li);

  setTimeout(() => {
    li.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);

  updateChapterNumbersInUI();
}

function updateChapterNumbersInUI() {
  const items = document.querySelectorAll('.chapter-item');
  items.forEach((item, index) => {
    const span = item.querySelector('span');
    if (span) {
      span.textContent = `الفصل ${index + 1}`;
    }
  });
}

function createNewChapter(chapterId) {
  if (chaptersData[chapterId]) return;
  chaptersData[chapterId] = {
    pages: [],
    chapterID: parseInt(chapterId),
    bookId: currentBookId,
    fontSize: fontSizes[currentFontIndex]
  };
  createChapterItem(chapterId);
  selectChapter(chapterId);
  saveDraftLocally();
}


function selectChapter(chapterId) {
  if (currentChapterId) saveDraftLocally();
  currentChapterId = chapterId;
  currentPageIndex = 0;
  document.querySelectorAll('.chapter-item').forEach(item => item.classList.remove('active'));
  const activeItem = document.querySelector(`.chapter-item[data-chapter-id='${chapterId}']`);
  if (activeItem) activeItem.classList.add('active');
  loadPageContent();
}

function loadPageContent() {
  const pages = chaptersData[currentChapterId]?.pages || [];
  rightPage.value = pages[currentPageIndex * 2] || '';
  leftPage.value = pages[currentPageIndex * 2 + 1] || '';
  pageIndicator.textContent = `صفحة ${(currentPageIndex * 2) + 1} & ${((currentPageIndex * 2) + 2)}`;

  const fontSize = chaptersData[currentChapterId]?.fontSize || 'medium';
  currentFontIndex = fontSizes.indexOf(fontSize);

  rightPage.classList.remove(...fontSizes);
  leftPage.classList.remove(...fontSizes);

  rightPage.classList.add(fontSize);
  leftPage.classList.add(fontSize);
}

function nextPage() {
  saveDraftLocally();
  const pages = chaptersData[currentChapterId].pages || [];
  currentPageIndex++;
  if (currentPageIndex * 2 >= pages.length) pages.push('', '');
  loadPageContent();
}

function prevPage() {
  if (currentPageIndex > 0) {
    saveDraftLocally();
    currentPageIndex--;
    loadPageContent();
  } else {
    alert('❗ انت في أول صفحة بالفعل.');
  }
}

function deleteCurrentPage() {
  const choice = deletePageChoice.value;
  if (!choice) {
    alert("❗ يرجى اختيار نوع الحذف أولاً.");
    return;
  }

  if (!confirm('هل أنت متأكد أنك تريد تنفيذ عملية الحذف؟')) return;

  const pages = chaptersData[currentChapterId].pages || [];
  const baseIndex = currentPageIndex * 2;

  if (choice === 'right') {
    pages[baseIndex] = '';
    rightPage.value = '';
  } else if (choice === 'left') {
    pages[baseIndex + 1] = '';
    leftPage.value = '';
  } else if (choice === 'both') {
    pages.splice(baseIndex, 2);
    if (currentPageIndex > 0) currentPageIndex--;
    rightPage.value = '';
    leftPage.value = '';
  }

  chaptersData[currentChapterId].pages = pages;
  saveDraftLocally();
  saveChapterToFirestore(currentChapterId);
  loadPageContent();
}

function saveDraftLocally() {
  if (!currentChapterId || !chaptersData[currentChapterId]) return;

  const rightContent = rightPage.value.trim();
  const leftContent = leftPage.value.trim();
  const pages = chaptersData[currentChapterId].pages || [];

  pages[currentPageIndex * 2] = rightContent;
  pages[currentPageIndex * 2 + 1] = leftContent;

  chaptersData[currentChapterId].pages = pages;
  chaptersData[currentChapterId].fontSize = fontSizes[currentFontIndex];

  localStorage.setItem(`medad-write-draft-${currentBookId}`, JSON.stringify(chaptersData));
}

async function saveChapterToFirestore(chapterId) {
  try {
    const chapterRef = db.collection('Books').doc(currentBookId).collection('chapters').doc(String(chapterId));
    const chapterData = chaptersData[chapterId];
    await chapterRef.set({
      chapterID: chapterData.chapterID,
      pages: chapterData.pages,
      pageCount: chapterData.pages.length,
      fontSize: chapterData.fontSize || 'medium',
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error(`❌ خطأ أثناء تحديث الفصل ${chapterId}:`, error);
  }
}

async function saveCurrentChapter() {
  try {
    saveDraftLocally();
    await saveChapterToFirestore(currentChapterId);
    alert('✅ تم حفظ الفصل الحالي بنجاح!');
  } catch (error) {
    console.error('❌ خطأ أثناء حفظ الفصل الحالي:', error);
    alert('حدث خطأ أثناء حفظ الفصل الحالي.');
  }
}

async function saveAllChapters() {
  try {
    saveDraftLocally();
    const bookRef = db.collection('Books').doc(currentBookId);
    const batch = db.batch();

    for (const chapterId in chaptersData) {
      const chapterData = chaptersData[chapterId];
      const chapterRef = bookRef.collection('chapters').doc(String(chapterId));

      batch.set(chapterRef, {
        chapterID: chapterData.chapterID,
        pages: chapterData.pages,
        pageCount: chapterData.pages.length,
        fontSize: chapterData.fontSize || 'medium',
        updatedAt: new Date()
      });
    }

    await batch.commit();
    alert('✅ تم حفظ جميع الفصول بنجاح!');
  } catch (error) {
    console.error('❌ خطأ أثناء حفظ جميع الفصول:', error);
    alert('حدث خطأ أثناء حفظ جميع الفصول.');
  }
}

async function deleteChapter(chapterId) {
  if (!confirm('هل أنت متأكد أنك تريد حذف هذا الفصل؟')) return;

  delete chaptersData[chapterId];
  localStorage.setItem(`medad-write-draft-${currentBookId}`, JSON.stringify(chaptersData));

  const item = document.querySelector(`.chapter-item[data-chapter-id='${chapterId}']`);
  if (item) item.remove();

  try {
    await db.collection('Books').doc(currentBookId).collection('chapters').doc(String(chapterId)).delete();

    const remainingChapters = Object.keys(chaptersData);
    if (remainingChapters.length > 0) {
      selectChapter(remainingChapters[0]);
    } else {
      rightPage.value = '';
      leftPage.value = '';
      pageIndicator.textContent = '';
      currentChapterId = null;
    }

    updateChapterNumbersInUI();
    alert('✅ تم حذف الفصل بنجاح.');
  } catch (error) {
    console.error('❌ خطأ أثناء حذف الفصل:', error);
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
