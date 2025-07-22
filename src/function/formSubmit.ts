import { FirebaseAdminControler } from "./firebaseAdmin"
import { Publisher } from "./abstract"
import { WebNotification } from "./webNotification";
import { EmailServices } from "./email";

const reportListener = new Publisher();
const webNotificationInstance = new WebNotification();
reportListener.addSubscriber(webNotificationInstance)

export class FormSubmitHandler {    

    public async handleSubmit(payload: any, userName: string, formId: string) {
        // const request_data: csvcRequest = { time,type,place,describe,requester, isHandled:false }

        let firebase = FirebaseAdminControler.getInstance()
        await firebase.createDocument("form_request", {submitData: payload, userName, formId, is_handled: false})

        reportListener.notifySubscribers({title:`Có báo cáo từ học sinh`,body:``}, userName)
    }
}