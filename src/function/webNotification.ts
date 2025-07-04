import { Subscriber } from "./abstract";
import { FirebaseAdminControler, NotificationPayload } from "./firebaseAdmin";

export class WebNotification extends Subscriber {

    async checkValidNotification(content: any) {
        
    }

    async update(content: any): Promise<void> {
        let firebase = FirebaseAdminControler.getInstance();
        const tokenCollection = await firebase.getCollection("client_token");
        interface TokenItem {
            token: string;
        }
        const list_token: string[] = (tokenCollection as TokenItem[]).map(item => item.token);
        let payload: NotificationPayload = {
            title: content.title as string,
            body: content.body as string,
        };
        await firebase.sendNotification(payload, list_token);
    }
}