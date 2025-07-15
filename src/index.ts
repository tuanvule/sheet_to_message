import { FirebaseAdminControler } from "./function/firebaseAdmin";
import { SheetController } from "./function/sheet";
import { FormSubmitHandler } from "./function/formSubmit";
import { SecurityCheck } from "./function/securityCheck";

import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { error } from "console";
import { AccountHandler, Status, StoredAccount } from "./function/account";
import { SessionController, SessionState } from "./function/sesionController";
import { stat } from "fs";
import { firebase } from "googleapis/build/src/apis/firebase";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const keyPath = path.resolve(__dirname, '../key.json');
const app = express();
const PORT = process.env.PORT || 3092;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors());
app.use(cors({
  origin: "https://sheet-to-message.vercel.app", // frontend origin
  credentials: true
}));
app.use(cookieParser());

const formSubmitHandler: FormSubmitHandler = new FormSubmitHandler();
const securityCheck = new SecurityCheck();
const accountHandler = new AccountHandler();
const sessionController = new SessionController();

const JWTAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  const JWT_SECRET = process.env.JWT_SECRET
  if(!JWT_SECRET) return res.json({mess: "err"})
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token or token exprired" });

    // ✅ Lưu user info vào req.user
    res.locals.userState = decoded
    next();
  });
}

app.get('/api/', (req, res) => {
    res.json({message: "twt"})
});

app.post('/api/register-token', async (req, res) => {
    const { token } = req.body;
    // fdb.collection("client_token").add({token: token})

    let firebase = FirebaseAdminControler.getInstance();
    // firebase.createDocument("client_token",{token})
    firebase.createDocumentIfNotExists("client_token",{token},"token");
    console.log("newTOKEN",token);
    res.json({ message: 'Token registered successfully' });
});


app.get('/api/get-list-token', async (req, res) => {
    let firebase = FirebaseAdminControler.getInstance()
    console.log(await firebase.getCollection("client_token"))
    res.send("ok")
});

app.post('/api/webhook/:userName', async (req, res) => {
  try {
    const userName: string = req.params.userName;
    let {type , info, formId} = req.body as any;
    if(securityCheck.containsHTML(JSON.stringify(req.body))) {
      res.sendStatus(403);
    }

    await formSubmitHandler.handleSubmit(info, userName, formId);

    console.log(info)
    // if(type == "SP") {
    //   formSubmitHandler.handleCSVCSubmit(info, userName);
    // }
    // else if(type == "NSP") {
    //   formSubmitHandler.handleStudentSubmit(info, userName);
    // }
    
    res.send("ok");
  } catch(err) {
    console.error("webhook request form unknow: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/get-form-request', JWTAuth, async (req, res) => {
  const firebase = FirebaseAdminControler.getInstance()

  // const sessionId: string = req.cookies.sessionId;
  // if(!sessionId) return res.status(401).json({ message: "Not logged in or session exprired" });

  // const userSessionState: SessionState | null = await sessionController.GetSessionState(sessionId);
  const userState = res.locals.userState;

  if(userState.userId) {
    const userAccount: StoredAccount | null = await firebase.getDocument("User", userState.userId);
    if(userAccount) {
      let return_Data:any = {
        formConfig: userAccount.forms,
      }

      for(const {formId, formName} of userAccount.forms) {
        const requestData = await firebase.queryDocuments("form_request", ref => ref.where("formId", "==", formId).where("is_handled", "==", false))
        if(requestData.length > 0) {
          return_Data[formName] = requestData;
        }
      }
      res.json(return_Data)
    }
  }

  let csvcRequestData = await firebase.queryDocuments("csvc_request", (ref) => ref.where("is_handled","==",false))
  let studentRequestData = await firebase.queryDocuments("student_request", (ref) => ref.where("is_handled","==",false))

  res.json({
    csvc: csvcRequestData,
    student: studentRequestData,
  })
});

app.get("/api/get_sessionId", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  const JWT_SECRET = process.env.JWT_SECRET
  if(!JWT_SECRET) return res.json({mess: "err"})
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });

    // ✅ Lưu user info vào req.user
    res.json({state: decoded})
  });
})

app.post('/api/login', async (req,res) => {
  try {
    const { email, password } = req.body;
    let status:Status;
    status = await accountHandler.LoginAsAdmin(email, password);

    if(status.isSuccess) {
      const JWT_SECRET = process.env.JWT_SECRET;
      const REFRESH_SECRET = process.env.REFRESH_SECRET;
      if(!(JWT_SECRET && REFRESH_SECRET)) throw new Error("JWT_SECRET is not defined in environment variables.");
      const accessToken = jwt.sign(status, JWT_SECRET, { expiresIn: "1d" });
      const refreshToken = jwt.sign(status, REFRESH_SECRET, { expiresIn: "7d" });
      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // HTTPS production
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      res.json({status, accessToken: accessToken})
    }
  }
  catch(err) {
    console.error("unvalid login request: ",err)
    res.status(500).json({ error: "Internal Server Error" });
  }
})

app.post('/api/logout', async (req,res) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId) {
    const firebase = FirebaseAdminControler.getInstance();
    await firebase.deleteDocument("sessions", sessionId);
  }

  res.clearCookie("sessionId", {
    httpOnly: true,
    secure: false,
    sameSite: "strict"
  });
  res.json({ message: "Logged out" });
})

app.post('/api/signup', async (req,res) => {
  try {
    const { userName, email, password } = req.body;
    let status:Status;
    status = await accountHandler.LoginAsAdmin(userName, password);

    await accountHandler.CreateAccount(userName, email, password)
  }
  catch(err) {
    console.error("unvalid login request: ",err)
    res.status(500).json({ error: "Internal Server Error" });
  }
})

// app.get('/api/handle-session-state', async (req,res) => {
//   try {
//     const sessionId = req.cookies.sessionId;
//     if(!sessionId) return res.status(401).json({ message: "Not logged in or session exprired" });

//     const sessionState = await sessionController.GetSessionState(sessionId)

//     if(sessionState) {
//       res.cookie("sessionState", sessionState, {
//         httpOnly: true,
//         secure: false, // true khi deploy HTTPS
//         sameSite: "strict",
//         maxAge: 30 * 24 * 60 * 60 * 1000 // 30 day
//       });
//     }
//     res.json({message: "GET session state successfully"})
//   }
//   catch(err) {
//     console.error("unvalid session state request: ",err)
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// })

app.get('/api/get_account', JWTAuth, async (req,res) => {
  try {
    // const sessionId = req.cookies.sessionId;
    // if(!sessionId) return res.status(401).json({ message: "Not logged in or session exprired" });
    
    // const sessionState = await sessionController.GetSessionState(sessionId)
    // if(!sessionState) return res.status(401).json({ message: "cannot find session state" });
    
    // const account = await accountHandler.GetAccount(sessionState.userId);
    
    
    const userId = res.locals.userState.userId;
    console.log(res.locals.userState)
    const account = await accountHandler.GetAccount(userId);

    if(!account) return res.status(401).json({ message: "cannot find account" });

    res.json(account)
  }
  catch(err) {
    console.error("unvalid session state request: ",err)
    res.status(500).json({ error: "Internal Server Error" });
  }
})

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

    // let sheetData = await sheetController.getRawData("test");
    // console.log(sheetData)
    // Initialize Firebase Admin Controller
    let firebase = FirebaseAdminControler.getInstance();
    console.log(keyPath)
    await firebase.initialize(keyPath);

    // let account = await firebase.getDocument("User", "Rr0qAwaUUYnX7oLjxf6K")
    // let data = {
    //   userName: 'NHH',
    //   email: 'ngovipmo1@gmail.com',
    //   // memberPassword: 'NHH2@',
    //   password: 'adminNHh2@',
    //   forms: [ { 
    //     formName: 'csvc', 
    //     config: {
    //       filterKeys: ["category"],
    //       convertedHeader: {
    //         fixedHeader: {
    //           name: "Họ tên người báo tin",
    //           category: "Hạng mục",
    //         },
    //         laybelHeader: {
    //           "Dấu thời gian": "time",
    //           "Địa điểm(tại lớp nào hoặc nơi nào)": "place",
    //           "mô tả tình trạng hư hỏng": "who",
    //         },
    //       },
    //       messageType: "normal_message",
    //       sheetHeader: [
    //         "Dấu thời gian",
    //         "Hạng mục",
    //         "Địa điểm(tại lớp nào hoặc nơi nào)",
    //         "mô tả tình trạng hư hỏng",
    //         "Họ tên người báo tin",
    //       ]
    //     }, 
    //     formId: 'NHH-csvc' 
    //   } ],
    // }

    // await firebase.setDocument("User", "Rr0qAwaUUYnX7oLjxf6K", data)

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