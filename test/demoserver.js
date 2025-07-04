const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require("path")

const app = express();
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
})

// // Initialize Firebase Admin
const serviceAccount = require('../key.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// database
const fdb = admin.firestore()

// Store FCM tokens (in production, use a database)
const tokens = new Set();

// Register token endpoint
// app.post('/register-token', (req, res) => {
//     const { token } = req.body;
//     tokens.add(token);
//     res.json({ message: 'Token registered successfully' });
// });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Register token endpoint
app.post('/register-token', (req, res) => {
    const { token } = req.body;
    tokens.add(token);
    fdb.collection("client_token").add({token: token})
    res.json({ message: 'Token registered successfully' });
});

// Send notification endpoint
app.post('/send-notification', async (req, res) => {
    try {
        const { title, body } = req.body || {title:"djnfvkljfd",body:"djnfvkljfdrferfer"};

        console.log(title,body)

        // Send to all registered tokens
        const messages = Array.from(tokens).map(token => ({
            notification: {
                title,
                body
            },
            token
        }));

        console.log(messages)

        const responses = await Promise.all(
            messages.map(message => 
                admin.messaging().send(message)
            )
        );

        res.json({ 
            message: 'Notifications sent successfully',
            responses 
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

// app.post('/sendNotification', async (req, res) => {
//     try {
//         const { title, body } = req.body || {title:"title",body:"body"};

//         const snapshot = fdb.collection("client_token").get()
//         let tokens = new Set()

//         snapshot.forEach(doc => tokens.add(doc.data().token));

//         console.log(title,body)

//         // Send to all registered tokens
//         const messages = Array.from(tokens).map(token => ({
//             notification: {
//                 title,
//                 body
//             },
//             token
//         }));

//         console.log(messages)

//         const responses = await Promise.all(
//             messages.map(message => 
//                 admin.messaging().send(message)
//             )
//         );

//         res.json({ 
//             message: 'Notifications sent successfully',
//             responses 
//         });
//     } catch (error) {
//         console.error('Error sending notification:', error);
//         res.status(500).json({ error: 'Failed to send notification' });
//     }
// });

app.use(express.static('public'))

const PORT = process.env.PORT || 3092;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});