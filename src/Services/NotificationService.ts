export interface Notification {
    _id: string; // The backend usually returns _id for MongoDB
    id: string; // For frontend compatibility if needed
    title: string;
    message: string;
    createdAt: string; // Backend likely returns this or similar
    time: string; // Computed for display
    isRead: boolean;
    type: "info" | "success" | "warning" | "error";
    link?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "https://attendmate-backend-femy.onrender.com/api";

const getAuthHeaders = () => {
    const token = localStorage.getItem("employeeToken");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

export const registerFcmToken = async (fcmToken: string): Promise<void> => {
    try {
        await fetch(`${API_URL}/employees/register-fcm-token`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ fcmToken }),
        });
    } catch (error) {
        console.error("Error registering FCM token:", error);
    }
};

export const fetchNotifications = async (): Promise<Notification[]> => {
    try {
        const response = await fetch(`${API_URL}/notifications`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) throw new Error("Failed to fetch notifications");

        const data = await response.json();
        console.log("Fetched notifications raw data:", data);

        let notificationsArray: any[] = [];
        if (Array.isArray(data)) {
            notificationsArray = data;
        } else if (data.data && Array.isArray(data.data)) {
            notificationsArray = data.data;
        } else if (data.notifications && Array.isArray(data.notifications)) {
            notificationsArray = data.notifications;
        } else {
            console.warn("Unexpected notifications API response structure:", data);
            return [];
        }

        // Map backend data to frontend interface if needed
        return notificationsArray.map((n: any): Notification => ({
            ...n,
            id: n._id,
            time: new Date(n.createdAt).toLocaleString(), // Simple formatting
            type: n.type || "info"
        }));
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
};

export const markAsRead = async (id: string): Promise<void> => {
    try {
        await fetch(`${API_URL}/notifications/${id}/read`, {
            method: "PUT",
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
};

export const markAllAsRead = async (): Promise<void> => {
    try {
        await fetch(`${API_URL}/notifications/read-all`, {
            method: "PUT",
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
    }
};

export const fetchUnreadCount = async (): Promise<number> => {
    try {
        const response = await fetch(`${API_URL}/notifications/unread-count`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) return 0;

        const data = await response.json();
        return data.count || 0;
    } catch (error) {
        console.error("Error fetching unread count:", error);
        return 0;
    }
};

export const getUnreadCount = (notifications: Notification[]): number => {
    return notifications.filter((n) => !n.isRead).length;
};
