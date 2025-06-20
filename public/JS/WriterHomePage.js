firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    const userId = user.uid;
    loadAuthorBooks(userId);
  }
});
const authorLibraryContainer = document.querySelector(".library-grid");

function loadAuthorBooks(userId) {

  db.collection("Authors")
    .doc(userId)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        showNoBooks(authorLibraryContainer);
        return;
      }

      const authorData = doc.data();
      const myBooks = authorData.myBooks || [];

      if (myBooks.length === 0) {
        showNoBooks(authorLibraryContainer);
        return;
      }

      authorLibraryContainer.innerHTML = "";

      const bookPromises = myBooks.map((bookObj) => {
        return db.collection("Books").doc(bookObj.bookId).get();
      });

      Promise.all(bookPromises)
        .then((bookDocs) => {
          let foundAny = false;
          bookDocs.forEach((bookDoc) => {
            if (bookDoc.exists) {
              const bookData = bookDoc.data();
              const bookId = bookDoc.id;
              const bookTitle = bookData.title;
              const bookCard = createAuthorBookCard(bookData, bookId, bookTitle);
              authorLibraryContainer.appendChild(bookCard);
              foundAny = true;
            }
          });
          if (!foundAny) {
            showNoBooks(authorLibraryContainer);
          }
        })
        .catch((error) => {
          console.error("Error loading books:", error);
          showStatus("حدث خطأ أثناء تحميل كتبك", true, ".library-grid");
        });
    })
    .catch((error) => {
      console.error("Error fetching author document:", error);
      showStatus("حدث خطأ أثناء تحميل كتبك", true, ".library-grid");
    });
}

function createAuthorBookCard(book, bookId, bookTitle) {
  const card = document.createElement("div");
  card.classList.add("book-card");

  const img = document.createElement("img");
  img.src = book.coverImageUrl || "/images/BookCover.png";
  img.alt = book.title || "كتاب بدون عنوان";

  const title = document.createElement("h3");
  title.textContent = book.title || "عنوان غير معروف";

  const publishDate = document.createElement("p");
  if (book.createdAt && book.createdAt.toDate) {
    const date = book.createdAt.toDate();
    const formattedDate = date.toLocaleDateString('ar-EG');
    publishDate.textContent = `تم النشر: ${formattedDate}`;
  } else {
    publishDate.textContent = "تاريخ النشر غير معروف";
  }

  const editButton = document.createElement("button");
  editButton.textContent = "تحرير";

  editButton.onclick = () => {
    localStorage.setItem('bookID', bookId);
    window.location.href = "/HTML/WriteABook.html";
  };



  const deleteButton = document.createElement("button");
  deleteButton.textContent = "حذف";
  deleteButton.onclick = async () => {
    if (confirm("هل أنت متأكد أنك تريد حذف هذا الكتاب؟")) {
      try {
        const user = firebase.auth().currentUser;
        if (!user) {
          alert("يجب تسجيل الدخول أولاً");
          return;
        }

        const bookDoc = await db.collection("Books").doc(bookId).get();
        if (!bookDoc.exists) {
          alert("الكتاب غير موجود");
          return;
        }

        if (bookDoc.data().authorId !== user.uid) {
          alert("ليس لديك صلاحية حذف هذا الكتاب");
          return;
        }

        const chaptersRef = db.collection(`Books/${bookId}/chapters`);
        const chaptersSnapshot = await chaptersRef.get();

        const batch = db.batch();
        chaptersSnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();

        await db.collection("Books").doc(bookId).delete();

        await db.collection("Authors").doc(user.uid).update({
          myBooks: firebase.firestore.FieldValue.arrayRemove({
            bookId: bookId,
            title: bookTitle
          })
        });

        try {
          const readersSnapshot = await db.collection("Readers").get();
          const updateBatch = db.batch();

          readersSnapshot.forEach(doc => {
            const readerRef = doc.ref;
            const favorites = doc.data().favoriteBooks || [];
            if (favorites.includes(bookId)) {
              updateBatch.update(readerRef, {
                favoriteBooks: firebase.firestore.FieldValue.arrayRemove(bookId)
              });
            }
          });

          await updateBatch.commit();
        } catch (e) {
          console.log("لم يتم تحديث قوائم القراء", e);
        }

        card.remove();
        alert("✅ تم حذف الكتاب بنجاح");

        const remainingBooks = document.querySelectorAll(".book-card");
        if (remainingBooks.length === 0) {
          showNoBooks(authorLibraryContainer);
        }

      } catch (error) {
        console.error("❌ فشل الحذف:", error);
        alert(`❌ حدث خطأ أثناء الحذف: ${error.message}`);
      }
    }
  };


  card.appendChild(img);
  card.appendChild(title);
  card.appendChild(publishDate);
  card.appendChild(editButton);
  card.appendChild(deleteButton);

  return card;
}

function showNoBooks(container) {
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.minHeight = "310px";
  container.innerHTML = `
      <p style="font-size:1.5rem; color:#7f8c8d; margin-bottom:1rem;">لا يوجد لديك كتب حتى الآن.</p>
      <a href="/HTML/AddBook.html" class="start-journey-btn">انشر كتابك الأول</a>
    `;
}
