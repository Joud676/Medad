document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.querySelector('.contact-form form');

    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();
        clearErrorMessages();
        let isValid = true;

        const firstName = document.querySelector('input[name="firstName"]');
        if (!validateName(firstName.value)) {
            displayError(firstName, 'الرجاء إدخال اسم أول صحيح (حروف فقط)');
            isValid = false;
        }

        const lastName = document.querySelector('input[name="lastName"]');
        if (!validateName(lastName.value)) {
            displayError(lastName, 'الرجاء إدخال اسم أخير صحيح (حروف فقط)');
            isValid = false;
        }

        const genderMale = document.getElementById('male');
        const genderFemale = document.getElementById('female');
        if (!genderMale.checked && !genderFemale.checked) {
            const genderGroup = document.querySelector('.radio-group');
            displayError(genderGroup, 'الرجاء تحديد الجنس');
            isValid = false;
        }

        const mobile = document.querySelector('input[name="mobile"]');
        if (!validateMobile(mobile.value)) {
            displayError(mobile, 'الرجاء إدخال رقم جوال صحيح (10 أرقام تبدأ بـ 05)');
            isValid = false;
        }

        const dob = document.querySelector('input[name="dob"]');
        if (!validateDate(dob.value)) {
            displayError(dob, 'الرجاء إدخال تاريخ ميلاد صحيح');
            isValid = false;
        }

        const email = document.querySelector('input[name="email"]');
        if (!validateEmail(email.value)) {
            displayError(email, 'الرجاء إدخال بريد إلكتروني صحيح');
            isValid = false;
        }

        const language = document.querySelector('select[name="language"]');
        if (language.value === "" || language.selectedIndex === 0) {
            displayError(language, 'الرجاء اختيار لغة التواصل');
            isValid = false;
        }

        const message = document.querySelector('textarea[name="message"]');
        if (!validateMessage(message.value)) {
            displayError(message, 'الرجاء إدخال رسالة (10 أحرف على الأقل)');
            isValid = false;
        }

        if (isValid) {
            const formData = {
                firstName: firstName.value,
                lastName: lastName.value,
                gender: genderMale.checked ? 'male' : 'female',
                mobile: mobile.value,
                dob: dob.value,
                email: email.value,
                language: language.value,
                message: message.value
            };

            fetch('/api/submitForm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

                .then(response => response.json())
                .then(data => {
                    console.log('Server Response:', data);
                    showSuccessMessage();
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('حدث خطأ أثناء إرسال البيانات، حاول مرة أخرى.');
                });
        }
    });

    function validateName(name) {
        const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]{2,}$/;
        return nameRegex.test(name.trim());
    }

    function validateMobile(mobile) {
        const mobileRegex = /^05\d{8}$/;
        return mobileRegex.test(mobile.trim());
    }

    function validateDate(date) {
        const selectedDate = new Date(date);
        const currentDate = new Date();
        return selectedDate instanceof Date && !isNaN(selectedDate) && selectedDate <= currentDate;
    }

    function validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email.trim());
    }

    function validateMessage(message) {
        return message.trim().length >= 10;
    }

    function displayError(element, message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        element.parentNode.insertBefore(errorElement, element.nextSibling);
        element.style.borderColor = '#e74c3c';
    }

    function clearErrorMessages() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());
        const formInputs = document.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => input.style.borderColor = '#ccc');
    }

    function showSuccessMessage() {
        contactForm.style.display = 'none';
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <h2 style="color: #27ae60;">تم إرسال رسالتك بنجاح!</h2>
            <button id="reset-form">إرسال رسالة أخرى</button>
        `;
        contactForm.parentNode.insertBefore(successDiv, contactForm);

        document.getElementById('reset-form').addEventListener('click', function () {
            successDiv.remove();
            contactForm.style.display = 'block';
            contactForm.reset();
        });
    }
});

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
