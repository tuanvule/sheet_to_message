import { FirebaseAdminControler } from "./function/firebaseAdmin";
import { SheetController } from "./function/sheet";
import { FormSubmitHandler } from "./function/formSubmit";

import path from 'path';
import express from 'express';
import cors from 'cors';
import { error } from "console";

const keyPath = path.resolve(__dirname, '../key.json');
const app = express();
const PORT = process.env.PORT || 3092;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const formSubmitHandler: FormSubmitHandler = new FormSubmitHandler();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.post('/register-token', async (req, res) => {
    const { token } = req.body;
    // fdb.collection("client_token").add({token: token})

    let firebase = FirebaseAdminControler.getInstance();
    // firebase.createDocument("client_token",{token})
    firebase.createDocumentIfNotExists("client_token",{token},"token")
    console.log("newTOKEN",token)
    res.json({ message: 'Token registered successfully' });

});


app.get('/get-list-token', async (req, res) => {
    let firebase = FirebaseAdminControler.getInstance()
    console.log(await firebase.getCollection("client_token"))
    res.send("ok")
});

app.post('/webhook', async (req, res) => {
  try {
    let {type , info} = req.body as any;
    console.log(info)
    if(type == "SP") {
      formSubmitHandler.handleCSVCSubmit(info);
    }
    else if(type == "NSP") {
      formSubmitHandler.handleStudentSubmit(info);
    }
    
    res.send("ok");
  } catch(err) {
    console.error("request form unknow: ", error);
    throw error;
  }
});

app.get('/get-form-request', async (req, res) => {
  let firebase = FirebaseAdminControler.getInstance()
  let csvcRequestData = await firebase.getCollection("csvc_request")
  let studentRequestData = await firebase.getCollection("student_request")

  res.json({
    csvc: csvcRequestData,
    student: studentRequestData,
  })
});


// app.get


app.use(express.static(path.join(__dirname, '../public')));
// Initialize services and start server
(async () => {
  try {
    // Initialize Sheet Controller
    let sheetController = SheetController.getInstance();
    await sheetController.initialize({
      keyFile: "key.json",
      sheetID: "18TVGscW2Syp7fkB_uYE8Tx_GirQVGmaaj6hZ7-MCMH4"
    });
    console.log("Sheet controller initialized");

    // Initialize Firebase Admin Controller
    let firebase = FirebaseAdminControler.getInstance();
    await firebase.initialize(keyPath);
    console.log("Firebase controller initialized");

//     const emailService = EmailServices.getInstance();
//     emailService.initialize({
//       service: 'Hotmail',
//       user: '',
//       password: '' // Use app password for Gmail
//     });

//     // Send an email
//     async function sendWelcomeEmail(userEmail: string, userName: string) {
//       try {
//         await emailService.sendEmail({
//           to: userEmail,
//           subject: 'Welcome to Our Service',
//           text: `Hello ${userName}, welcome to our service!`,
//           html: `<h1>Welcome ${userName}!</h1><p>We're glad to have you with us.</p>`
//         });
//         console.log('Welcome email sent successfully');
//       } catch (error) {
//         console.error('Failed to send welcome email:', error);
//       }
//     }

// // Usage example
// sendWelcomeEmail('A@A.A', 'A');


    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
})();