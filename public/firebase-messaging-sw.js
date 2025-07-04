importScripts('https://www.gstatic.com/firebasejs/11.7.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.7.3/firebase-messaging-compat.js');
const firebaseConfig = {
    apiKey: "AIzaSyAhL7Gbr1ZqG0j1KOmMUUJtCN7byc669ss",
    authDomain: "csvcnhh.firebaseapp.com",
    projectId: "csvcnhh",
    storageBucket: "csvcnhh.firebasestorage.app",
    messagingSenderId: "682386956230",
    appId: "1:682386956230:web:9e048fd94c8fbbbcb05cc7"
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

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});