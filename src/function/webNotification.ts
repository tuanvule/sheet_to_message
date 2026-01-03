import { Subscriber } from "./abstract";
import { FirebaseAdminControler, NotificationPayload } from "./firebaseAdmin";
// import * as admin from 'firebase-admin';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
});

export class WebNotification extends Subscriber {

    async checkValidNotification(content: any) {
        
    }
    
    async update(content: any, userName: string): Promise<void> {
        interface TokenItem {
            token: string;
            type: 'expo' | 'firebase'
            id: string;
        }
        let firebase = FirebaseAdminControler.getInstance();
    
        // 1. Lấy token một lần và phân loại
        const tokenDocs = await firebase.queryDocuments("client_token", ref => ref.where("userName", "==", userName));
        const tokenCollection = tokenDocs as TokenItem[];

        // SỬA LỖI: Filter đúng loại token
        const firebase_token = tokenCollection.filter(item => item.type === "firebase").map(item => item.token);
        const expo_token = tokenCollection.filter(item => item.type === "expo").map(item => item.token);

        // 2. Lấy số lượng tin chưa đọc (Nên dùng count() nếu có thể)
        const unreadDocs = await firebase.queryDocuments("form_request", ref => ref.where("userName", "==", userName));
        const unreadCount = unreadDocs?.length || 0;

        // 3. Chuẩn bị tin nhắn cho Expo
        const messages: ExpoPushMessage[] = expo_token
            .filter(token => Expo.isExpoPushToken(token))
            .map(token => ({
                to: token,
                sound: 'default',
                title: content.title,
                body: content.body,
                data: { unreadCount }, 
                priority: 'high',
                channelId: 'default',
            }));

        // 4. Gửi qua Expo SDK
        if (messages.length > 0) {
            const chunks = expo.chunkPushNotifications(messages);
            for (let chunk of chunks) {
                try {
                    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    
                    // Tạo một mảng chứa các Promise xóa token để chạy song song
                    const deletePromises = [];

                    for (let i = 0; i < ticketChunk.length; i++) {
                        const ticket = ticketChunk[i];

                        // Kiểm tra nếu ticket báo lỗi
                        if (ticket.status === 'error') {
                            console.error(`Lỗi gửi đến token: ${chunk[i].to}. Lỗi: ${ticket.message}`);
                            
                            // Nếu lỗi là do thiết bị không còn đăng ký (DeviceNotRegistered)
                            if (ticket.details?.error === 'DeviceNotRegistered') {
                                const invalidToken = chunk[i].to;
                                const invalidClientToken = tokenCollection.find(item => item.token === invalidToken)
                                if(invalidClientToken) {
                                    deletePromises.push(invalidClientToken.id)
                                }

                                console.log(`🧹 Đang xóa token chết: ${invalidToken}`);

                                // Xóa khỏi collection client_token trong Firebase
                            }
                        }
                    }
                    firebase.deleteMultiDocument("client_token", deletePromises)
                } catch (error) {
                    console.error("Lỗi hệ thống khi gửi/xóa token:", error);
                }
            }
        }

        // 5. Gửi qua Firebase (FCM)
        if (firebase_token.length > 0) {
            let payload: NotificationPayload = {
                title: content.title,
                body: content.body,
                unreadCount: unreadCount
            };
            await firebase.sendNotification(payload, firebase_token);
        }
    }
}