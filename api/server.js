const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Firebase Admin Initialization using environment variables
const serviceAccount = {
    projectId: process.env.PROJECTID,
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.CLIENT_EMAIL
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

app.post('/submitForm', async (req, res) => {
    try {
        const formData = req.body;
        const docRef = await db.collection('contactForms').add(formData);
        res.status(200).json({
            message: 'Form submitted successfully!',
            docId: docRef.id
        });
    } catch (error) {
        console.error('Error adding document:', error);
        res.status(500).json({
            message: 'Error submitting the form',
            error: error.message
        });
    }
});

// Export as a Vercel serverless function
module.exports = app;
