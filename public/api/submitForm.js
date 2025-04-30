import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
    projectId: process.env.PROJECTID,
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.CLIENT_EMAIL,
};

// Prevent re-initialization
if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

const db = getFirestore();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    try {
        const formData = req.body;
        const docRef = await db.collection('contactForms').add(formData);
        res.status(200).json({
            message: 'Form submitted successfully!',
            docId: docRef.id,
        });
    } catch (error) {
        console.error(' Server error in submitForm API:', error);
        res.status(500).json({
            message: 'Error submitting the form',
            error: error.message,
        });
    }
}
