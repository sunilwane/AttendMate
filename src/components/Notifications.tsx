import React, { useState, useEffect } from "react";
import {
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonText,
    IonSpinner,
} from "@ionic/react";
import {
    notificationsOutline,
    checkmarkCircleOutline,
    informationCircleOutline,
    warningOutline,
    alertCircleOutline,
} from "ionicons/icons";
import {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    Notification,
} from "../Services/NotificationService";
import "../theme/components/Notifications.css";

interface NotificationsProps {
    onUnreadCountChange: (count: number) => void;
    onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({
    onUnreadCountChange,
    onClose,
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        setLoading(true);
        const data = await fetchNotifications();
        setNotifications(data);
        onUnreadCountChange(data.filter((n) => !n.isRead).length);
        setLoading(false);
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
        const updated = notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
        );
        setNotifications(updated);
        onUnreadCountChange(updated.filter((n) => !n.isRead).length);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        const updated = notifications.map((n) => ({ ...n, isRead: true }));
        setNotifications(updated);
        onUnreadCountChange(0);
    };

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "success":
                return checkmarkCircleOutline;
            case "warning":
                return warningOutline;
            case "error":
                return alertCircleOutline;
            default:
                return informationCircleOutline;
        }
    };

    const getIconColor = (type: Notification["type"]) => {
        switch (type) {
            case "success":
                return "success";
            case "warning":
                return "warning";
            case "error":
                return "danger";
            default:
                return "primary";
        }
    };

    if (loading) {
        return (
            <div className="empty-notifications">
                <IonSpinner name="dots" />
            </div>
        );
    }

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <h2>Notifications</h2>
                {notifications.some((n) => !n.isRead) && (
                    <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                        Mark all as read
                    </button>
                )}
            </div>

            <IonList lines="full">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <IonItem
                            key={notification.id}
                            className={`notification-item ${!notification.isRead ? "unread" : ""}`}
                            onClick={() => handleMarkAsRead(notification.id)}
                        >
                            <IonIcon
                                icon={getIcon(notification.type)}
                                color={getIconColor(notification.type)}
                                slot="start"
                                className="notification-icon"
                            />
                            <IonLabel className="ion-text-wrap">
                                <div className="notification-content">
                                    <span className="notification-title">{notification.title}</span>
                                    <span className="notification-message">
                                        {notification.message}
                                    </span>
                                    <span className="notification-time">{notification.time}</span>
                                </div>
                            </IonLabel>
                        </IonItem>
                    ))
                ) : (
                    <div className="empty-notifications">
                        <IonIcon icon={notificationsOutline} />
                        <IonText>No notifications yet</IonText>
                    </div>
                )}
            </IonList>
        </div>
    );
};

export default Notifications;
