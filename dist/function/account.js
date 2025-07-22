"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountHandler = void 0;
const admin = __importStar(require("firebase-admin"));
const firebaseAdmin_1 = require("./firebaseAdmin");
const sesionController_1 = require("./sesionController");
class AccountHandler {
    async GetAccount(userId) {
        const firebase = firebaseAdmin_1.FirebaseAdminControler.getInstance();
        const account = await firebase.getDocument("User", userId);
        return account;
    }
    async LoginAsMember(joinCode) {
        const firebase = firebaseAdmin_1.FirebaseAdminControler.getInstance();
        const sessionController = sesionController_1.SessionController.GetInstance();
        try {
            const accounts = await firebase.queryDocuments("User", ref => ref.where("joinCode", "==", joinCode));
            // check if account is not exit
            if (accounts.length === 0)
                return { isSuccess: false, userId: "", role: "", userName: "" };
            const account = accounts[0];
            // const sessionId = await sessionController.CreateSession(account.id, "member");
            return { isSuccess: true, userId: account.id, role: "member", userName: account.userName };
        }
        catch (err) {
            console.log("login err: ", err);
            throw err;
        }
    }
    async LoginAsAdmin(email, password) {
        const firebase = firebaseAdmin_1.FirebaseAdminControler.getInstance();
        const sessionController = sesionController_1.SessionController.GetInstance();
        try {
            const accounts = await firebase.queryDocuments("User", ref => ref.where("email", "==", email)
                .where("password", "==", password));
            // check if account is not exit
            if (accounts.length === 0)
                return { isSuccess: false, userId: "", role: "", userName: "" };
            const account = accounts[0];
            console.log(account);
            // const sessionId = await sessionController.CreateSession(account.id, "admin");
            return { isSuccess: true, userId: account.id, role: "admin", userName: account.userName };
        }
        catch (err) {
            console.log("login err: ", err);
            throw err;
        }
    }
    // public async ChangePassword(userName: string, menberPassword: ChangePassFormat, adminPass: ChangePassFormat | null) {
    //     const firebase = FirebaseAdminControler.getInstance();
    //     try {
    //         const accounts = await firebase.queryDocuments("User", ref => ref.where("userName", "==", userName))
    //         let response = {
    //             status: false,
    //             content: ""
    //         }
    //         if(accounts.length === 0) {
    //             response.content = "wrong userId or not exit"
    //         } else {
    //             const account = accounts[0];  
    //         }
    //     } catch(err) {
    //         console.log("login err: ", err);
    //         throw err;
    //     }
    // }
    async CreateAccount(userName, email, password = "") {
        function generateUniqueString() {
            const timePart = Date.now().toString(36); // thời gian hiện tại, dạng base36
            const randomPart = Math.random().toString(36).substring(2, 10); // random base36 (8 ký tự)
            return timePart + randomPart;
        }
        const firebase = firebaseAdmin_1.FirebaseAdminControler.getInstance();
        try {
            const newAccount = {
                id: '',
                userName: userName,
                email: email,
                password: password,
                forms: [],
                joinCode: generateUniqueString()
            };
            await firebase.createDocument("User", newAccount);
        }
        catch (err) {
            console.log("login err: ", err);
            throw err;
        }
    }
    async CreateForm(userId) {
        const fdb = firebaseAdmin_1.FirebaseAdminControler.getInstance();
        try {
            const user = await fdb.getDocument("User", userId);
            if (user) {
                const newForm = {
                    formId: user.userName + `Form_${user.forms.length + 1}`,
                    formName: `Form_${user.forms.length + 1}`,
                    config: {
                        messageType: "message",
                        convertedHeader: {
                            fixedHeader: {},
                            laybelHeader: []
                        },
                        sheetHeader: [],
                        filterKeys: [],
                    }
                };
                await fdb.updateDocument("User", userId, {
                    forms: admin.firestore.FieldValue.arrayUnion(newForm)
                });
                return newForm;
            }
            else {
                throw new Error("cannot create userId");
            }
        }
        catch (err) {
            throw err;
        }
    }
    async SaveFormConfig(userId, formId, changeData) {
        try {
            const firebase = firebaseAdmin_1.FirebaseAdminControler.getInstance();
            const user = await firebase.getDocument("User", userId);
            if (user) {
                const updateForm = user.forms.map(item => {
                    if (item.formId === formId) {
                        return changeData;
                    }
                    return item;
                });
                console.log(JSON.stringify(updateForm, null, 2));
                await firebase.setDocument("User", userId, {
                    forms: updateForm
                });
            }
            else {
                throw new Error("cant find this user");
            }
        }
        catch (err) {
            throw err;
        }
    }
}
exports.AccountHandler = AccountHandler;
