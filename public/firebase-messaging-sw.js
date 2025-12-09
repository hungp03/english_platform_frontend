importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBfYBJHjSDTU8u7y0KkySsSivY_r1NiJZ8",
  authDomain: "toeic-cloud.firebaseapp.com",
  projectId: "toeic-cloud",
  storageBucket: "toeic-cloud.firebasestorage.app",
  messagingSenderId: "802399618331",
  appId: "1:802399618331:web:ea7469300f630df4c3ffbe",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);
  
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/default-avatar.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
