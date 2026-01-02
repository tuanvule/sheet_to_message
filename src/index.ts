import { FirebaseAdminControler } from "./function/firebaseAdmin";
import { SheetController } from "./function/sheet";
import { FormRequestHandler } from "./function/formRequestHandler";
import { SecurityCheck } from "./function/securityCheck";

import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { error } from "console";
import { AccountHandler, Status, StoredAccount } from "./function/account";
import { SessionController, SessionState } from "./function/sesionController";
import { stat } from "fs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import * as admin from 'firebase-admin';
const { Filter } = admin.firestore;

dotenv.config();

const keyPath = path.resolve(__dirname, '../key.json');
const app = express();
const PORT = process.env.PORT || 3092;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ["https://sheet-to-message.vercel.app","http://127.0.0.1:5500", "https://csvcnhh.namanhishere.me/", "http://127.0.0.1:8081"], // frontend origin
  credentials: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

const formRequestHandler: FormRequestHandler = new FormRequestHandler();
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'admin.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

app.get('/api/', (req, res) => {
    res.json({message: "twt"})
});

app.post('/api/register-token', JWTAuth, async (req, res) => {
    const { token } = req.body;
    // fdb.collection("client_token").add({token: token})

    const userState = res.locals.userState
    if(userState) {
      let firebase = FirebaseAdminControler.getInstance();
      // firebase.createDocument("client_token",{token})
      await firebase.createDocumentIfNotExists("client_token",{
        token,
        userName: userState.userName
      },"token");
      res.json({ message: 'Token registered successfully' });
    } else {
      res.status(403).json({message: "you need login a join with another user"})
    }
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

    await formRequestHandler.handleSubmit(info, userName, formId);
    
    res.send("ok");
  } catch(err) {
    console.error("webhook request form unknow: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/get-form-request', JWTAuth, async (req, res) => {
  try {
    const firebase = FirebaseAdminControler.getInstance();
    const userState = res.locals.userState;

    if (!userState?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userAccount: StoredAccount | null = await firebase.getDocument("User", userState.userId);
    
    if (!userAccount) {
      return res.status(404).json({ message: "User not found" });
    }

    let return_Data: any = {
      formConfig: userAccount.forms,
      forms_request: {}
    };

    // Sử dụng Promise.all để truy vấn tất cả các form cùng một lúc
    await Promise.all(userAccount.forms.map(async ({ formId, formName }) => {
      // Lấy các request CHƯA xử lý VÀ CHƯA bị đánh dấu xóa
      const requestData = await firebase.queryDocuments("form_request", ref => 
        ref.where("formId", "==", formId)
           .where("is_handled", "==", false)
      );

      if (requestData && requestData.length > 0) {
        return_Data.forms_request[formName] = requestData;
      }
    }));

    res.json(return_Data);

  } catch (err) {
    console.error("Error at get-form-request:", err);
    res.status(500).json({ message: "Internal server error, cannot get form request" });
  }
});

app.get('/api/get-handled-request', JWTAuth, async (req, res) => {
  try {
    const firebase = FirebaseAdminControler.getInstance();
    const userState = res.locals.userState;

    if (!userState?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userAccount: StoredAccount | null = await firebase.getDocument("User", userState.userId);
    
    if (!userAccount) {
      return res.status(404).json({ message: "User not found" });
    }

    let return_Data: any = {
      formConfig: userAccount.forms,
      forms_request: {}
    };

    // Sử dụng Promise.all để các vòng lặp query chạy song song, nhanh hơn nhiều so với await từng cái
    await Promise.all(userAccount.forms.map(async ({ formId, formName }) => {
      const requestData = await firebase.queryDocuments("form_request", ref => 
        ref.where("formId", "==", formId)
           .where("is_handled", "==", true)
      );

      if (requestData && requestData.length > 0) {
        return_Data.forms_request[formName] = requestData;
      }
    }));

    res.json(return_Data);

  } catch (err) {
    console.error("Error at get-handled-request:", err);
    res.status(500).json({ message: "Internal server error, cannot get form request" });
  }
});

app.post("/api/processing_notify", JWTAuth, async (req,res) => {
  try {
    const userState = res.locals.userState
    if(userState) {
      const { id_list,action_type,note } = req.body
      // await 

      if(action_type === "handled") {
        await formRequestHandler.Processing(id_list, userState.role === "member" ? userState.memberName : userState.userName, note)
      } else if(action_type === "delete") {
        await formRequestHandler.Delete(id_list)
      }
      
      res.status(200).json()
    } else {
      res.status(403).json({message: "bạn chưa có tài khoản"})
    }
  } catch(err) {
    console.error(err)
    res.status(500).json({message: "internationcal error"})
  }
})


// Lưu ý: Route này KHÔNG được bọc bởi Middleware xác thực (JWTAuth) 
// vì nó được gọi khi Access Token đã hết hạn.
app.post('/refresh_token', async (req, res) => {
  try {
    // 1. Lấy refreshToken từ body (Mobile gửi lên thủ công)
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Không tìm thấy Refresh Token" });
    }
    const JWT_SECRET = process.env.JWT_SECRET;
    const REFRESH_SECRET = process.env.REFRESH_SECRET;
    if(!(JWT_SECRET && REFRESH_SECRET)) throw new Error("JWT_SECRET is not defined in environment variables.");
    // 2. Xác thực Refresh Token
    jwt.verify(refreshToken, REFRESH_SECRET, (err: any, decoded: any) => {
      if (err) {
        // Token hết hạn hoặc không hợp lệ -> Yêu cầu login lại
        return res.status(403).json({ message: "Refresh Token không hợp lệ hoặc đã hết hạn" });
      }

      const { isSuccess, userId, role, userName, memberName } = decoded

      // 3. Tạo Access Token mới (thời hạn ngắn, ví dụ 15 phút)
      const accessToken = jwt.sign(
        { isSuccess, userId, role, userName, memberName },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      // 4. (Tùy chọn nhưng nên có) Tạo Refresh Token mới - Rotation
      // const newRefreshToken = jwt.sign(
      //   { userId: decoded.userId, role: decoded.role },
      //   REFRESH_SECRET,
      //   { expiresIn: '7d' } // Refresh token dài hạn (7 ngày)
      // );

      // 5. Trả về cho Mobile
      return res.json({
        accessToken,
        // refreshToken: newRefreshToken 
      });
    });

  } catch (error) {
    console.error("Lỗi Refresh Token:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
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
      res.json({status, accessToken: accessToken, refreshToken: refreshToken})
    } else {
      res.status(404).json({status})
    }
  }
  catch(err) {
    console.error("unvalid login request: ",err)
    res.status(500).json({ error: "Internal Server Error" });
  }
})

app.post('/api/login_as_member', async (req,res) => {
  try {
    const { joinCode, memberName } = req.body;
    let status:Status;
    status = await accountHandler.LoginAsMember(joinCode, memberName);

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
      res.json({status, accessToken: accessToken, refreshToken: refreshToken})
    }
  }
  catch(err) {
    console.error("unvalid login request: ",err)
    res.status(500).json({ error: "Internal Server Error" });
  }
})

app.post('/api/logout', async (req,res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
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


app.get('/api/verify_token', JWTAuth, async (req,res) => {
  try {
    const useState = res.locals.userState

    res.json(useState)
  }
  catch(err) {
    console.error("unvalid session state request: ",err)
    res.status(500).json({ error: err });
  }
})

app.get('/api/get_account', JWTAuth, async (req,res) => {
  try {
    const useState = res.locals.userState

    if(useState.role === "member") res.sendStatus(403)

    const userId = res.locals.userState.userId;
    const account = await accountHandler.GetAccount(userId);

    if(!account) return res.status(401).json({ message: "cannot find account" });

    res.json(account)
  }
  catch(err) {
    console.error("unvalid session state request: ",err)
    res.status(500).json({ error: err });
  }
})

app.get("/api/create_new_form", JWTAuth, async (req,res) => {
  const userState = res.locals.userState
  if(userState.role === "admin") {
    try {
      const response = await accountHandler.CreateForm(userState.userId)
      res.json({newForm: response})
    } catch(err) {
      res.status(500).json({message: "international server error"})
    }
  } else {
    res.status(403).json({message: "user must be owner to do this"})
  }
})

app.post("/api/create_form_config/:id", async (req,res) => {
  try {
    const id: string = req.params.id;
    let { header, formId } = req.body as any;
    await accountHandler.CreateFormConfig(header, id, formId)
    res.status(200).json("success")
  } catch(err) {
    res.status(500).json(err)
  }
})


app.post("/api/save_form_config", JWTAuth, async (req,res) => {
  try {
    const userState = res.locals.userState
    if(userState.role === "admin") {
      const { formId,changeData} = req.body
      await accountHandler.SaveFormConfig(userState.userId, formId, changeData)
      res.status(200).json()
    } else {
      res.status(403).json({message: "user must be owner to do this"})
    }
  } catch(err) {
    console.error(err)
    res.status(500).json({message: "internationcal error"})
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
      console.log(`Server running on port ${PORT} \n 127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
})();