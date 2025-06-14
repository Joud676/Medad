function HomePageRedirect() {
    firebase.auth().onAuthStateChanged(async function (user) {
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
