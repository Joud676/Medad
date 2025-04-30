  const statusDiv = document.getElementById('status');

  function showStatus(message, isError = false) {
      statusDiv.textContent = message;
      statusDiv.style.display = 'block';
      if (isError) {
          statusDiv.style.backgroundColor = '#f8d7da';
          statusDiv.style.color = '#721c24';
      } else {
          statusDiv.style.backgroundColor = '#d4edda';
          statusDiv.style.color = '#155724';
      }
  }

  document.getElementById('readerSignupForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const fullName = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      if (password.length < 6) {
          showStatus('كلمة المرور يجب أن تكون على الأقل 6 أحرف', true);
          return;
      }
      
      showStatus('جاري إنشاء الحساب...');
      
      auth.createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
              const user = userCredential.user;

              return db.collection("Readers").add({
                  uid: user.uid,
                  fullName: fullName,
                  email: email,
                  joinedAt: new Date(),
                  favoriteBooks: []
              });
          })
          .then(() => {
              showStatus("تم إنشاء الحساب بنجاح! جاري التوجيه...");
              setTimeout(() => {
                  window.location.href = "/ReaderHomePage.html"; 
              }, 2000);
          })
          .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;

              if (errorCode === 'auth/email-already-in-use') {
                  showStatus("البريد الإلكتروني مستخدم بالفعل", true);
              } else if (errorCode === 'auth/weak-password') {
                  showStatus("كلمة المرور ضعيفة جدًا", true);
              } else if (errorCode === 'auth/invalid-email') {
                  showStatus("البريد الإلكتروني غير صالح", true);
              } else if (errorCode === 'auth/network-request-failed') {
                  showStatus("فشل الاتصال بالشبكة. تأكد من اتصالك بالإنترنت", true);
              } else {
                  showStatus("حدث خطأ: " + errorMessage, true);
              }
              console.error(error);
          });
  });
