import {
    PushNotifications,
    Token,
    ActionPerformed,
} from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { registerFcmToken } from "./NotificationService";

export const initPushNotifications = async () => {
    if (Capacitor.getPlatform() === "web") {
        console.log("Push notifications not supported on web");
        return;
    }

    try {
        const permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === "prompt") {
            const newPermStatus = await PushNotifications.requestPermissions();
            if (newPermStatus.receive !== "granted") {
                console.error("User denied push notification permissions");
                return;
            }
        }

        if (permStatus.receive !== "granted") {
            console.error("Push notification permissions not granted");
            return;
        }

        await PushNotifications.register();

        // Remove existing listeners to avoid duplicates if called multiple times
        await PushNotifications.removeAllListeners();

        await PushNotifications.addListener("registration", async (token: Token) => {
            console.log("Push registration success, token: " + token.value);
            await registerFcmToken(token.value);
        });

        await PushNotifications.addListener("registrationError", (error: any) => {
            console.error("Error on registration: " + JSON.stringify(error));
        });

        await PushNotifications.addListener(
            "pushNotificationReceived",
            (notification: any) => {
                console.log("Push received: " + JSON.stringify(notification));
                // Optionally update global state or trigger a UI refresh
            }
        );

        await PushNotifications.addListener(
            "pushNotificationActionPerformed",
            (notification: ActionPerformed) => {
                console.log("Push action performed: " + JSON.stringify(notification));
                const data = notification.notification.data;
                if (data && data.link) {
                    window.location.href = data.link;
                } else {
                    // Navigate to notifications screen
                    window.location.href = "/notifications";
                }
            }
        );
    } catch (e) {
        console.error("Error initializing push notifications", e);
    }
};
