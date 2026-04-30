import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import NotificationCard from "../components/NotificationCard";
import {
    deleteNotification,
    getMyNotifications,
    getUnreadNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "../services/notificationService";
import { cancelBooking, confirmOwnerApproval, updateBookingStatus } from "../services/bookingService";
import "../styles/notification.css";

const Notifications = () => {
    const { user, openAuthModal } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [busyNotificationId, setBusyNotificationId] = useState("");

    const emitNotificationChange = () => {
        window.dispatchEvent(new Event("notifications:changed"));
    };

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getMyNotifications();
            setNotifications(response.data?.notifications || []);
        } catch (err) {
            if (err.response?.status === 404) {
                setNotifications([]);
            } else if (err.response?.status === 401) {
                openAuthModal("/notifications");
            } else {
                setError(err.response?.data?.message || "Failed to load notifications");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleToggle = async (notification) => {
        const nextExpandedId = expandedId === notification._id ? null : notification._id;
        setExpandedId(nextExpandedId);

        if (!notification.isRead) {
            try {
                await markNotificationAsRead(notification._id);
                setNotifications((currentNotifications) =>
                    currentNotifications.map((item) =>
                        item._id === notification._id ? { ...item, isRead: true } : item
                    )
                );
                emitNotificationChange();
            } catch (err) {
                console.log(err);
            }
        }
    };

    const refreshAfterAction = async () => {
        await loadNotifications();
        emitNotificationChange();
    };

    const handleOwnerAction = async (notification, status) => {
        const bookingId = notification?.booking?._id || notification?.booking;
        if (!bookingId) return;

        try {
            setBusyNotificationId(notification._id);
            await updateBookingStatus(bookingId, status);
            await markNotificationAsRead(notification._id);
            await refreshAfterAction();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update booking status");
        } finally {
            setBusyNotificationId("");
        }
    };

    const handleRenterAction = async (notification, action) => {
        const bookingId = notification?.booking?._id || notification?.booking;
        if (!bookingId) return;

        try {
            setBusyNotificationId(notification._id);
            if (action === "confirm") {
                await confirmOwnerApproval(bookingId);
            } else if (action === "cancel") {
                await cancelBooking(bookingId);
            }
            await markNotificationAsRead(notification._id);
            await refreshAfterAction();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update booking");
        } finally {
            setBusyNotificationId("");
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            setBusyNotificationId(notificationId);
            await deleteNotification(notificationId);
            await refreshAfterAction();
            if (expandedId === notificationId) {
                setExpandedId(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete notification");
        } finally {
            setBusyNotificationId("");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsAsRead();
            await loadNotifications();
            emitNotificationChange();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to mark notifications as read");
        }
    };

    const getActionsForNotification = (notification) => {
        const bookingStatus = notification?.booking?.status;

        if (user?.role === "owner" && notification?.type === "booking_request" && bookingStatus === "pending") {
            return [
                {
                    label: "Accept",
                    loadingLabel: "Accepting...",
                    variant: "primary",
                    onClick: (item) => handleOwnerAction(item, "owner_approved"),
                },
                {
                    label: "Decline",
                    loadingLabel: "Declining...",
                    variant: "secondary",
                    onClick: (item) => handleOwnerAction(item, "owner_rejected"),
                },
            ];
        }

        if (user?.role === "renter" && notification?.type === "booking_approved" && bookingStatus === "owner_approved") {
            return [
                {
                    label: "Accept",
                    loadingLabel: "Accepting...",
                    variant: "primary",
                    onClick: (item) => handleRenterAction(item, "confirm"),
                },
                {
                    label: "Cancel",
                    loadingLabel: "Cancelling...",
                    variant: "secondary",
                    onClick: (item) => handleRenterAction(item, "cancel"),
                },
            ];
        }

        return [];
    };

    const unreadCount = notifications.filter((notification) => !notification.isRead).length;

    return (
        <div className="notifications-page">
            <div className="notifications-header">
                <div>
                    <p className="notifications-kicker">Notifications</p>
                    <h1>Your booking updates</h1>
                    <p className="notifications-subtitle">
                        Click a card to view the booking details, including the user name and date range.
                    </p>
                </div>
                <div className="notifications-summary">
                    <span className="notifications-summary-label">Unread</span>
                    <strong>{unreadCount}</strong>
                </div>
            </div>

            <div className="notifications-toolbar">
                <button type="button" className="notification-toolbar-btn" onClick={handleMarkAllRead} disabled={!unreadCount}>
                    Mark all as read
                </button>
            </div>

            {loading && <div className="notifications-state">Loading notifications...</div>}
            {!loading && error && <div className="notifications-state error">{error}</div>}
            {!loading && !error && notifications.length === 0 && (
                <div className="notifications-state">No notifications yet.</div>
            )}

            <div className="notifications-list">
                {notifications.map((notification) => (
                    <div key={notification._id} className="notification-row-actions">
                        <NotificationCard
                            notification={notification}
                            expanded={expandedId === notification._id}
                            onToggle={handleToggle}
                            actions={getActionsForNotification(notification)}
                            busy={busyNotificationId === notification._id}
                        />
                        {(user?.role === "owner" || user?.role === "renter") && (
                            <button
                                type="button"
                                className="notification-delete-btn"
                                onClick={() => handleDelete(notification._id)}
                                disabled={busyNotificationId === notification._id}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
