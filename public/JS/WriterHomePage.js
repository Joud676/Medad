firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    const userId = user.uid;
    console.log("Logged in user ID:", userId);
    loadAuthorBooks(userId);
  }
});

function loadAuthorBooks(userId) {
  const authorLibraryContainer = document.querySelector(".library-grid");

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
  deleteButton.onclick = () => {
    if (confirm("هل أنت متأكد أنك تريد حذف هذا الكتاب؟")) {
      const userId = firebase.auth().currentUser.uid;
      const bookRef = db.collection("Books").doc(bookId);
      const chaptersRef = bookRef.collection("chapters");


      chaptersRef.get()
        .then((snapshot) => {
          const batch = db.batch();
          snapshot.forEach((doc) => {
            batch.delete(doc.ref);
          });
          return batch.commit();
        })
        .then(() => {
          return bookRef.delete();
        })
        .then(() => {
          const authorRef = db.collection("Authors").doc(userId);
          return authorRef.update({
            myBooks: firebase.firestore.FieldValue.arrayRemove({ bookId: bookId, title: bookTitle })
          });
        })
        .then(async () => {
          const readerSnapshot = await db.collection("Readers").get();
          const batch = db.batch();

          readerSnapshot.forEach((doc) => {
            const readerRef = doc.ref;
            const data = doc.data();
            const favorites = data.favoriteBooks || [];

            if (favorites.includes(bookId)) {
              batch.update(readerRef, {
                favoriteBooks: firebase.firestore.FieldValue.arrayRemove(bookId)
              });
            }
          });

          return batch.commit();
        })
        .then(() => {
          alert("تم حذف الكتاب وجميع فصوله بنجاح.");
          card.remove();

          const authorLibraryContainer = document.querySelector(".library-grid");
          if (!authorLibraryContainer.querySelector(".book-card")) {
            showNoBooks(authorLibraryContainer);
          }
        })

        .catch((error) => {
          console.error("❌ خطأ أثناء الحذف الكامل:", error);
          alert("حدث خطأ أثناء حذف الكتاب أو الفصول. حاول لاحقاً.");
        });
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
