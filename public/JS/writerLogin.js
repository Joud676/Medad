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

  document.getElementById('writerLoginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      showStatus('جاري تسجيل الدخول...');
      
      auth.signInWithEmailAndPassword(email, password)
          .then((userCredential) => {
              showStatus('تم تسجيل الدخول بنجاح! جاري التوجيه...');
              
              setTimeout(() => {
                  window.location.href = "/HTML/WriterHomePage.html"; 
              }, 2000);
          })
          .catch((error) => {
              const errorCode = error.code;
              
              if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
                  showStatus("البريد الإلكتروني أو كلمة المرور غير صحيحة", true);
              } else if (errorCode === 'auth/invalid-credential') {
                  showStatus("بيانات الاعتماد غير صالحة. تأكد من البريد الإلكتروني وكلمة المرور", true);
              } else if (errorCode === 'auth/too-many-requests') {
                  showStatus("تم تعطيل الحساب مؤقتًا بسبب محاولات تسجيل دخول متكررة. حاول مرة أخرى لاحقًا", true);
              } else if (errorCode === 'auth/network-request-failed') {
                  showStatus("فشل الاتصال بالشبكة. تأكد من اتصالك بالإنترنت", true);
              } else {
                  showStatus("حدث خطأ: " + error.message, true);
              }
              console.error(error);
          });
  });
