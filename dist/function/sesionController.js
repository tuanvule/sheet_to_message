"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const firebaseAdmin_1 = require("./firebaseAdmin");
class SessionController {
    static instance;
    static GetInstance() {
        if (!SessionController.instance) {
            SessionController.instance = new SessionController();
        }
        return SessionController.instance;
    }
    async GetSessionState(sessionId) {
        const firebase = firebaseAdmin_1.FirebaseAdminControler.getInstance();
        const session = await firebase.getDocument("sessions", sessionId);
        if (!session)
            return null;
        return session;
    }
    // public async CreateSession(userId: string, role: string): Promise<string> {
    //     const firebase = FirebaseAdminControler.getInstance();
    //     const docId = await firebase.createDocument("sessions", {
    //         userId,role,createTime: Date.now(),
    //     })
    //     return docId;
    // }
    async CheckSession(sessionId) {
        const firebase = firebaseAdmin_1.FirebaseAdminControler.getInstance();
        // sessionId = docId
        const session = firebase.getDocument("sessions", sessionId);
        if (!session)
            return false;
        return true;
    }
    async DelExpiredSesion() {
        const firebase = firebaseAdmin_1.FirebaseAdminControler.getInstance();
        const month2MiliSec = 2592000000;
        const expriredTime = Date.now() - month2MiliSec;
        const expriredSesions = await firebase.queryDocuments("sessions", ref => ref.where("createTime", "<", expriredTime));
        const expriredSesionsId = expriredSesions.map((data) => data.id);
        await firebase.deleteMultiDocument("sessions", expriredSesionsId);
    }
}
exports.SessionController = SessionController;
