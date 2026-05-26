import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markNotificationRead, sendNotification } from "../redux/slices/notificationSlice";

export const useNotifications = () => {
    const dispatch = useDispatch();
    const { notifications } = useSelector((state) => state.notifications);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const mappedNotifications = notifications.map(n => ({
        ...n,
        id: n._id || n.id,
        date: n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : (n.date || "—"),
        type: n.type || "info"
    }));

    const unreadCount = mappedNotifications.filter((n) => !n.isRead).length;

    const markAsRead = (id) => {
        dispatch(markNotificationRead(id));
    };

    const markAllAsRead = () => {
        mappedNotifications.forEach((n) => {
            if (!n.isRead) {
                dispatch(markNotificationRead(n.id));
            }
        });
    };

    const deleteNotification = (id) => {
        // No delete endpoint currently in backend, mock locally or no-op
        console.warn("Delete notification not supported in backend.");
    };

    const addNotification = (title, message, type = "info") => {
        dispatch(sendNotification({
            userId: "all",
            title,
            message
        }));
    };

    return {
        notifications: mappedNotifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
    };
};
