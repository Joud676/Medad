document.addEventListener("DOMContentLoaded", function () {
  const search_btn = document.getElementById("search-btn");
  const searchPar = document.getElementById("searchtext");
  const year = document.getElementById("year");
  const category = document.getElementById("category");

  search_btn.addEventListener("click", function () {
    const searchText = searchPar.value.trim();
    const yearValue = year.value;
    const categoryValue = category.value;

    const searchResult = document.getElementById("search_result");
    const statusDiv = document.getElementById("search_status");

    if (statusDiv) {
      statusDiv.textContent = "";
      statusDiv.style.display = "none";
    }

    searchResult.classList.add("book-list");
    searchResult.innerHTML = "";

    if (!searchText && !yearValue && !categoryValue) {
      showStatus("الرجاء إدخال كلمة بحث أو اختيار فلتر قبل البحث.", true, "#search_status");
      return;
    }

    let query = db.collection("Books");

    if (searchText) {
      query = query.where("title", "==", searchText);
    }

    if (categoryValue) {
      query = query.where("bookType", "==", categoryValue);
    }

    query.get()
      .then((snapshot) => {
        const filteredBooks = [];

        snapshot.forEach((doc) => {
          const book = doc.data();
          const createdAt = book.createdAt?.toDate?.();
          const bookYear = createdAt ? createdAt.getFullYear().toString() : null;

          if (!yearValue || bookYear === yearValue) {
            filteredBooks.push({ id: doc.id, ...book });
          }
        });

        if (filteredBooks.length === 0) {
          showStatus("!لا توجد نتائج مطابقة", true, "#search_status");
          return;
        }

        filteredBooks.forEach((book) => {
          const card = createBookCard(book, book.id);
          searchResult.appendChild(card);
        });
      })
      .catch((error) => {
        console.error("خطأ أثناء فلترة الكتب:", error);
        showStatus("حدث خطأ أثناء تحميل نتائج البحث. حاول مرة أخرى", true, "#search_status");
      });
  });

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userId = user.uid;
      console.log("Logged in user ID:", userId);
      loadUserLibrary(userId);
      loadGeneralLibrary();
    }
  });
});


function createBookCard(book, bookId, showDeleteButton = false) {
  const card = document.createElement("div");
  card.classList.add("book-card");

  const imageUrl = book.coverImageUrl || "/images/BookCover.png";
  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = book.title || "كتاب بدون عنوان";

  img.onerror = function () {
    this.onerror = null;
    this.src = "/images/BookCover.png";
  };

  const p = document.createElement("p");
  p.innerHTML = `${book.title || "عنوان غير معروف"}`;
  card.appendChild(img);
  card.appendChild(p);

  if (showDeleteButton) {
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-favorite-btn");
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.title = "إزالة من مكتبتي";

    deleteBtn.onclick = async (e) => {
      e.stopPropagation(); // prevent opening book
      try {
        const user = firebase.auth().currentUser;
        if (user) {
          const readerSnapshot = await db.collection("Readers").where("uid", "==", user.uid).get();
          if (!readerSnapshot.empty) {
            const readerRef = readerSnapshot.docs[0].ref;

            const confirmed = confirm(`هل أنت متأكد أنك تريد إزالة "${book.title}" من مكتبتك؟`);
            if (!confirmed) return;

            await readerRef.update({
              favoriteBooks: firebase.firestore.FieldValue.arrayRemove(bookId)
            });
            card.remove(); // remove from UI

            const userLibraryContainer = document.querySelector("#user-library .book-list");
            if (userLibraryContainer && userLibraryContainer.children.length === 0) {
              showStatus("مكتبتك فارغة، أضف بعض الكتب!", true, "#user-library .book-list");
            }
          }
        }
      } catch (error) {
        console.error("❌ Error removing book:", error);
        alert("حدث خطأ أثناء إزالة الكتاب من المفضلة.");
      }
    };

    card.prepend(deleteBtn);
  }

  card.addEventListener("click", function () {
    localStorage.setItem("selectedBookId", bookId);
    window.location.href = "/ReadABook.html";
  });

  return card;
}



function loadUserLibrary(userId) {
  const userLibraryContainer = document.querySelector("#user-library .book-list");

  db.collection("Readers")
    .where("uid", "==", userId)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        showStatus("لم يتم العثور على بيانات المستخدم", true, "#user-library .book-list");
        return;
      }

      const readerDoc = snapshot.docs[0];
      const favoriteBooks = readerDoc.data().favoriteBooks || [];

      if (favoriteBooks.length === 0) {
        showStatus("مكتبتك فارغة، أضف بعض الكتب!", true, "#user-library .book-list");
        return;
      }

      db.collection("Books")
        .where(firebase.firestore.FieldPath.documentId(), "in", favoriteBooks)
        .get()
        .then((querySnapshot) => {
          userLibraryContainer.innerHTML = "";
          querySnapshot.forEach((bookDoc) => {
            const bookData = bookDoc.data();
            const bookId = bookDoc.id;
            const bookCard = createBookCard(bookData, bookId, true);
            userLibraryContainer.appendChild(bookCard);
          });
        })
        .catch((error) => {
          showStatus("حدث خطأ أثناء تحميل الكتب", true, "#user-library .book-list");
          console.error("Error loading user books:", error);
        });
    })
    .catch((error) => {
      console.error("Error fetching reader document:", error);
      showStatus("حدث خطأ أثناء تحميل بيانات المستخدم", true, "#user-library .book-list");
    });
}


function loadGeneralLibrary() {
  const generalLibraryContainer = document.querySelector("#general-library .book-list");

  db.collection("Books")
    .orderBy("createdAt", "desc")
    .limit(10)
    .get()
    .then((querySnapshot) => {
      generalLibraryContainer.innerHTML = "";
      querySnapshot.forEach((doc) => {
        const bookData = doc.data();
        const bookId = doc.id;
        const bookCard = createBookCard(bookData, bookId);
        generalLibraryContainer.appendChild(bookCard);
      });
    })
    .catch((error) => {
      showStatus("حدث خطأ أثناء تحميل الكتب", true, "#general-library .book-list");
      console.error("Error loading general books:", error);
    });
}


function showStatus(message, isError = false, containerSelector = "#status") {
  const statusDiv = document.querySelector(containerSelector);
  if (!statusDiv) return;

  statusDiv.textContent = "";
  statusDiv.style.display = "none";

  statusDiv.textContent = message;
  statusDiv.className = "inline-status";
  statusDiv.style.display = 'block';

  if (isError) {
    statusDiv.classList.add('error');
  } else {
    statusDiv.classList.add('success');
  }
}
