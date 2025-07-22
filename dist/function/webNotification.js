"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebNotification = void 0;
const abstract_1 = require("./abstract");
const firebaseAdmin_1 = require("./firebaseAdmin");
class WebNotification extends abstract_1.Subscriber {
    async checkValidNotification(content) {
    }
    async update(content, userName) {
        let firebase = firebaseAdmin_1.FirebaseAdminControler.getInstance();
        const tokenCollection = await firebase.queryDocuments("client_token", ref => ref.where("userName", "==", userName));
        console.log("tokenCollection: ");
        console.log(tokenCollection);
        const list_token = tokenCollection.map(item => item.token);
        let payload = {
            title: content.title,
            body: content.body,
        };
        await firebase.sendNotification(payload, list_token);
    }
}
exports.WebNotification = WebNotification;
