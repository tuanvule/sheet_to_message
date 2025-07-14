import { FirebaseAdminControler } from "./firebaseAdmin";
import { SessionController } from "./sesionController";

export interface Status {
    isSuccess: boolean,
    userId: string,
    role: string,
}

interface StoredForm {
    formId: string,
    formName: string,
    config: {
        messageType: string,
        convertedHeader: {
            fixedHeader: {},
            laybelHeader: {}
        },
        sheetHeader: Array<string>,
        filterKeys: Array<string>,
    }
}

export interface StoredAccount {
    id: string,
    userName: string,
    email: string,
    password: string,
    forms: Array<StoredForm>,
}

export interface ChangePassFormat {
    old: string,
    new: string
}

export class AccountHandler {
    public async GetAccount(userId: string): Promise<StoredAccount| null > {
        const firebase = FirebaseAdminControler.getInstance();
        const account: StoredAccount | null = await firebase.getDocument("User",userId)

        return account
    }

    public async LoginAsMember(userName: string, menberPassword: string): Promise<Status> {
        const firebase = FirebaseAdminControler.getInstance();
        const sessionController = SessionController.GetInstance();
        try {
            const accounts: StoredAccount[] = await firebase.queryDocuments("User", 
                ref => ref.where("userName", "==", userName)
                          .where("menberPassword", "==", menberPassword)
            );
            
            // check if account is not exit
            if(accounts.length === 0) return { isSuccess: false, userId: "", role: ""}

            const account: StoredAccount = accounts[0];
            // const sessionId = await sessionController.CreateSession(account.id, "member");

            return { isSuccess: true, userId: account.id, role: "admin" };

        } catch(err) {
            console.log("login err: ", err);
            throw err;
        }
    }

    public async LoginAsAdmin(email: string, password: string): Promise<Status> {
        const firebase = FirebaseAdminControler.getInstance();
        const sessionController = SessionController.GetInstance();
        try {
            const accounts: StoredAccount[] = await firebase.queryDocuments("User", 
                ref => ref.where("email", "==", email)
                          .where("password", "==", password)
            );
            
            // check if account is not exit
            if(accounts.length === 0) return { isSuccess: false, userId: "", role: ""}

            const account: StoredAccount = accounts[0];
            // const sessionId = await sessionController.CreateSession(account.id, "admin");

            return { isSuccess: true, userId: account.id, role: "admin" };
        } catch(err) {
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

    public async CreateAccount(userName: string, email: string, password: string = "") {
        const firebase = FirebaseAdminControler.getInstance();
        try {
            const newAccount: StoredAccount = {
                id: '',
                userName: userName,
                email: email,
                password: password,
                forms: [],
            }

            await firebase.createDocument("User", newAccount)
        } catch(err) {
            console.log("login err: ", err);
            throw err
        }
    }
}