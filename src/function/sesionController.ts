import { FirebaseAdminControler } from "./firebaseAdmin";

export interface SessionState {
    userId:string,
    role:string,
    createTime:string,
}

export class SessionController {
    private static instance: SessionController;

    public static GetInstance(): SessionController {
        if(!SessionController.instance) {
            SessionController.instance = new SessionController();
        }

        return SessionController.instance;
    }

    public async GetSessionState(sessionId: string): Promise<SessionState | null> {
        const firebase = FirebaseAdminControler.getInstance();
        const session = await firebase.getDocument("sessions", sessionId);
        if(!session) return null;
        return session as SessionState;
    }

    // public async CreateSession(userId: string, role: string): Promise<string> {
    //     const firebase = FirebaseAdminControler.getInstance();
    //     const docId = await firebase.createDocument("sessions", {
    //         userId,role,createTime: Date.now(),
    //     })

    //     return docId;
    // }

    public async CheckSession(sessionId: string): Promise<boolean> {
        const firebase = FirebaseAdminControler.getInstance();
        // sessionId = docId
        const session = firebase.getDocument("sessions", sessionId)
        if(!session) return false;
        return true;
    }

    public async DelExpiredSesion() {
        const firebase = FirebaseAdminControler.getInstance();
        const month2MiliSec = 2592000000;
        const expriredTime = Date.now() - month2MiliSec; 

        const expriredSesions = await firebase.queryDocuments("sessions", ref => ref.where("createTime", "<", expriredTime));
        interface Session {
            id: string
        }
        const expriredSesionsId: string[] = (expriredSesions as Session[]).map((data) => data.id)
        await firebase.deleteMultiDocument("sessions", expriredSesionsId)
    }
}