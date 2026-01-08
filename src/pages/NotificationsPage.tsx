import React, { useState, useEffect } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonText,
    IonSpinner,
    IonButton,
    RefresherEventDetail,
} from "@ionic/react";
import {
    notificationsOutline,
    checkmarkCircleOutline,
    informationCircleOutline,
    warningOutline,
    alertCircleOutline,
    checkmarkDoneOutline
} from "ionicons/icons";
import {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    Notification,
} from "../Services/NotificationService";
import "./NotificationsPage.css";

const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        const data = await fetchNotifications();
        setNotifications(data);
        setLoading(false);
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
        await loadNotifications();
        event.detail.complete();
    };

    const handleMarkAsRead = async (id: string, isRead: boolean) => {
        if (isRead) return;

        // Optimistic update
        setNotifications(prev =>
            prev.map((n) => (n.id === id || n._id === id) ? { ...n, isRead: true } : n)
        );

        await markAsRead(id);
    };

    const handleMarkAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map((n) => ({ ...n, isRead: true })));
        await markAllAsRead();
    };

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "success": return checkmarkCircleOutline;
            case "warning": return warningOutline;
            case "error": return alertCircleOutline;
            default: return informationCircleOutline;
        }
    };

    const getIconColor = (type: Notification["type"]) => {
        switch (type) {
            case "success": return "success";
            case "warning": return "warning";
            case "error": return "danger";
            default: return "primary";
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" />
                    </IonButtons>
                    <IonTitle>Notifications</IonTitle>
                    <IonButtons slot="end">
                        {notifications.some(n => !n.isRead) && (
                            <IonButton onClick={handleMarkAllAsRead}>
                                <IonIcon slot="icon-only" icon={checkmarkDoneOutline} />
                            </IonButton>
                        )}

                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="notifications-page-content">
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                {loading ? (
                    <div className="page-center">
                        <IonSpinner name="crescent" />
                    </div>
                ) : (
                    <IonList className="notification-list">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <IonItem
                                    key={notification.id || notification._id}
                                    className={`notification-item ${!notification.isRead ? "unread" : ""}`}
                                    onClick={() => handleMarkAsRead(notification.id || notification._id, notification.isRead)}
                                    lines="full"
                                    button
                                >
                                    <IonIcon
                                        icon={getIcon(notification.type)}
                                        color={getIconColor(notification.type)}
                                        slot="start"
                                        className="notification-icon"
                                    />
                                    <IonLabel className="ion-text-wrap">
                                        <h3 className="notification-title">{notification.title}</h3>
                                        <p className="notification-message">{notification.message}</p>
                                        <p className="notification-time">{notification.time}</p>
                                    </IonLabel>
                                    {!notification.isRead && <div className="unread-dot" slot="end"></div>}
                                </IonItem>
                            ))
                        ) : (
                            <div className="empty-state">
                                <IonIcon icon={notificationsOutline} />
                                <IonText>No notifications yet</IonText>
                            </div>
                        )}
                    </IonList>
                )}
            </IonContent>
        </IonPage>
    );
};

export default NotificationsPage;
