function HomePageRedirect() {
    const user = firebase.auth().currentUser;

    if (user) {
        firebase.firestore().collection('Users').doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    const userRole = doc.data().role;

                    if (userRole === 'Reader') {
                        window.location.href = '/HTML/ReaderHomePage.html';
                    } else if (userRole === 'Writer') {
                        window.location.href = '/HTML/WriterHomePage.html';
                    } else {
                        console.log('Unknown user role');
                    }
                }
            })
            .catch(error => {
                console.error('Error getting user role:', error);
            });
    }
}