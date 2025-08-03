import { Subscriber } from "./abstract";
import { FirebaseAdminControler, NotificationPayload } from "./firebaseAdmin";

export class WebNotification extends Subscriber {

    async checkValidNotification(content: any) {
        
    }
    
    async update(content: any, userName: string): Promise<void> {
        let firebase = FirebaseAdminControler.getInstance();
        const tokenCollection = await firebase.queryDocuments("client_token", ref => ref.where("userName", "==", userName));
        console.log("tokenCollection: ")
        console.log(tokenCollection)
        interface TokenItem {
            token: string;
        }
        const list_token: string[] = (tokenCollection as TokenItem[]).map(item => item.token);
        const unreadRequest = await firebase.queryDocuments("form_request", ref => ref.where("userName", "==", userName));
        let payload: NotificationPayload = {
            title: content.title as string,
            body: content.body as string,
            unreadCount: unreadRequest.length
        };
        console.log(unreadRequest.length)
        await firebase.sendNotification(payload, list_token);
    }
}