import { FirebaseAdminControler } from "./firebaseAdmin"
import { Publisher } from "./abstract"
import { WebNotification } from "./webNotification";
import { EmailServices } from "./email";
import * as admin from 'firebase-admin';

const reportListener = new Publisher();
const webNotificationInstance = new WebNotification();
reportListener.addSubscriber(webNotificationInstance)

export class FormRequestHandler {    

    public async handleSubmit(payload: any, userName: string, formId: string) {
        // const request_data: csvcRequest = { time,type,place,describe,requester, isHandled:false }

        let firebase = FirebaseAdminControler.getInstance()
        await firebase.createDocument("form_request", {submitData: payload, userName, formId, is_handled: false, is_deleting: false, history: []})

        await reportListener.notifySubscribers({title:`Có báo cáo từ học sinh`,body:``}, userName)
    }

    public async Delete(id_list: string[]) {
        let firebase = FirebaseAdminControler.getInstance()
        firebase.deleteMultiDocument("form_request", id_list)
    }

    public async ConsiderDeleting(id_list: string[], executor: string, note: string) {
        let firebase = FirebaseAdminControler.getInstance()
        const newHistory = {
            time: new Date(),
            type: "consider_deleting",
            executor: executor,
            note: note
        }
        firebase.updateMultiDocument("form_request", id_list, {is_deleting: true, executor: executor})
    }

    public async Processing(id_list: string[], executor: string, note: string) {
        let firebase = FirebaseAdminControler.getInstance()
        const newHistory = {
            time: new Date(),
            type: "handled",
            executor: executor,
            note: note
        }
        firebase.updateMultiDocument("form_request", id_list, {is_handled: true, executor: executor, history: admin.firestore.FieldValue.arrayUnion(newHistory) })
        // firebase.update("form_request", id_list)
    }
}