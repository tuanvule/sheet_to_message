import { FirebaseAdminControler } from "./firebaseAdmin"
import { Publisher } from "./abstract"
import { WebNotification } from "./webNotification";
import { EmailServices } from "./email";

export interface csvcRequest {
    time: string,
    type: string,
    place: string,
    describe: string,
    requester: string,
    isHandled: boolean,
}

export interface studentRequest {
    time: string,
    describe: string,
    requester: string,
    isHandled: boolean,
}

const reportListener = new Publisher();
const webNotificationInstance = new WebNotification();
reportListener.addSubscriber(webNotificationInstance)

export class FormSubmitHandler {    

    public async handleSubmit(payload: any, userName: string, formId: string) {
        // const request_data: csvcRequest = { time,type,place,describe,requester, isHandled:false }

        let firebase = FirebaseAdminControler.getInstance()
        await firebase.createDocument("form_request", {submitData: payload, userName, formId, is_handle: false})

        reportListener.notifySubscribers({title:`Có báo cáo từ học sinh`,body:``}, userName)
    }


    public handleCSVCSubmit(payload: any, id: string) {
        const [ time,type,place,describe,requester ] = payload
        const request_data: csvcRequest = { time,type,place,describe,requester, isHandled: false }

        let firebase = FirebaseAdminControler.getInstance()
        firebase.createDocument("csvc_request", request_data)

        reportListener.notifySubscribers({title:`Có thông báo CSVC tại: ${request_data.place}`,body:`Hạng muc: ${request_data.type}`}, id)
    }

    public handleStudentSubmit(payload: any, id: string) {
        const [ time,describe,requester ] = payload
        const request_data: studentRequest = { time,describe,requester, isHandled:false }

        let firebase = FirebaseAdminControler.getInstance()
        firebase.createDocument("csvc_request", request_data)

        reportListener.notifySubscribers({title:`Có thông báo / khiếu nại của học sinh ${request_data.requester}`,body:`${request_data.describe}`}, id)
    }
}