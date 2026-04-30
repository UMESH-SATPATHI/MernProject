import axios from "axios";

const notificationApi = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/notifications`,
    withCredentials: true,
});

export const getMyNotifications = () => notificationApi.get("/");

export const getUnreadNotifications = () => notificationApi.get("/all");

export const markNotificationAsRead = (notificationId) =>
    notificationApi.put(`/${notificationId}/read`);

export const markAllNotificationsAsRead = () =>
    notificationApi.put("/read-all");

export const deleteNotification = (notificationId) =>
    notificationApi.delete(`/${notificationId}`);

export default notificationApi;
