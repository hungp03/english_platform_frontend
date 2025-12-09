"use client";

import { useEffect } from "react";
import { requestNotificationPermission, onMessageListener } from "@/lib/firebase";
import { registerFcmToken } from "@/lib/api/notification";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export default function FCMProvider({ children }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) return;

    const initFCM = async () => {
      const fcmToken = await requestNotificationPermission();
      if (fcmToken) {
        await registerFcmToken(fcmToken);
        console.log("FCM token registered:", fcmToken);
      }
    };

    initFCM();
  }, [isLoggedIn]);

  useEffect(() => {
    onMessageListener()
      .then((payload) => {
        toast.info(payload?.notification?.title || "New notification", {
          description: payload?.notification?.body,
        });
      })
      .catch((err) => console.error("Failed to receive message:", err));
  }, []);

  return <>{children}</>;
}
