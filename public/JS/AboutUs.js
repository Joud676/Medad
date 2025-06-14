function HomePageRedirect() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (!user) {
            window.location.href = '/index.html';
            return;
        }

        const db = firebase.firestore();
        const uid = user.uid;

        db.collection('Authors').doc(uid).get().then((doc) => {
            if (doc.exists) {
                window.location.href = '/HTML/WriterHomePage.html';
            } else {
                db.collection('Readers').doc(uid).get().then((readerDoc) => {
                    if (readerDoc.exists) {
                        window.location.href = '/HTML/ReaderHomePage.html';
                    } else {
                        console.warn("المستخدم ليس كاتبًا ولا قارئًا.");
                    }
                });
            }
        }).catch((error) => {
            console.error('Error getting user role:', error);
        });
    });
}