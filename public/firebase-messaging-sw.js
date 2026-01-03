importScripts('https://www.gstatic.com/firebasejs/11.7.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.7.3/firebase-messaging-compat.js');
const firebaseConfig = {
  apiKey: "AIzaSyDBUhr66RBBDVWGKJtf5jUbsdWAFCKb_Vo",
  authDomain: "sheet-2-message.firebaseapp.com",
  projectId: "sheet-2-message",
  storageBucket: "sheet-2-message.firebasestorage.app",
  messagingSenderId: "704218268146",
  appId: "1:704218268146:web:02f103d9d716e8b9ba6b6b",
  measurementId: "G-H2C489G50C"
};
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);

// console.log("from sw")
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // If notification is already part of the payload, don't show a duplicate
  if (!payload.notification) {
    const notificationTitle = payload.data.title;
    const notificationOptions = {
      body: payload.data.body,
      icon: '/nhh512.png' // Use your icon
    };

     if (navigator.setAppBadge) {
      // Lấy số lượng tin nhắn chưa đọc từ payload hoặc bộ nhớ cục bộ
      const numberOfUnreadMessages = payload.data.unreadCount;
      
      // Cập nhật badge
      navigator.setAppBadge(numberOfUnreadMessages)
          .then(() => {
              console.log('Badge updated successfully.');
          })
          .catch((error) => {
              console.error('Failed to set app badge:', error);
          });
    }

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});