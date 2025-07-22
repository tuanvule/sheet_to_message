"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormSubmitHandler = void 0;
const firebaseAdmin_1 = require("./firebaseAdmin");
const abstract_1 = require("./abstract");
const webNotification_1 = require("./webNotification");
const reportListener = new abstract_1.Publisher();
const webNotificationInstance = new webNotification_1.WebNotification();
reportListener.addSubscriber(webNotificationInstance);
class FormSubmitHandler {
    async handleSubmit(payload, userName, formId) {
        // const request_data: csvcRequest = { time,type,place,describe,requester, isHandled:false }
        let firebase = firebaseAdmin_1.FirebaseAdminControler.getInstance();
        await firebase.createDocument("form_request", { submitData: payload, userName, formId, is_handled: false });
        reportListener.notifySubscribers({ title: `Có báo cáo từ học sinh`, body: `` }, userName);
    }
}
exports.FormSubmitHandler = FormSubmitHandler;
