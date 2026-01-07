export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    type: "info" | "success" | "warning" | "error";
}

let mockNotifications: Notification[] = [
    {
        id: "1",
        title: "Welcome to AttendMate!",
        message: "Thank you for joining our team. We're excited to have you!",
        time: "2 hours ago",
        isRead: false,
        type: "success",
    },
    {
        id: "2",
        title: "Attendance Record Updated",
        message: "Your attendance record for yesterday was updated by your manager.",
        time: "5 hours ago",
        isRead: false,
        type: "info",
    },
    {
        id: "3",
        title: "Upcoming Holiday",
        message: "A quick reminder that next Monday is a public holiday.",
        time: "1 day ago",
        isRead: true,
        type: "info",
    },
      {
        id: "4",
        title: "Upcoming Holiday",
        message: "A quick reminder that next Monday is a public holiday.",
        time: "2 days ago",
        isRead: true,
        type: "info",
    },
];

export const fetchNotifications = async (): Promise<Notification[]> => {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...mockNotifications]);
        }, 500);
    });
};

export const markAsRead = async (id: string): Promise<void> => {
    mockNotifications = mockNotifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
    );
};

export const markAllAsRead = async (): Promise<void> => {
    mockNotifications = mockNotifications.map((n) => ({ ...n, isRead: true }));
};

export const getUnreadCount = (notifications: Notification[]): number => {
    return notifications.filter((n) => !n.isRead).length;
};
