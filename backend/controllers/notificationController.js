import Notification from "../models/notification.js";

export const getMyNotification = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const notification = await Notification.find(
            {
                recipient: userId,
            }
        ).populate("sender", "name email").populate("vehicle", "vehicleName pricePerDay").populate("booking");

        if (!notification) {
            return res.status(404).json({ message: "No notification found" });
        }

        return res.status(200).json({ message: "Notifications fetched", notification })
    }catch(error){
        console.log(error);
        return res.status(500).json({ message: "server error" });
    }

};

export const markNotificationAsRead = async (req, res) =>{
    try{
        const notificationId = req.params.id;
        const userId = req.user.user_id;

        const notification = await Notification.findById(notificationId);
        if(!notification){
            return res.status(404).json({ message: "Notification not found" });
        }
        if(notification.recipient.toString() !== userId){
            return res.status(403).json({ message: "Unauthorized" });
        }
        notification.isRead = true;
        await notification.save();
        return res.status(200).json({ message: "Notification marked as read", notification });
    }catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const notifications = await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );

        return res.status(200).json({ message: "All notifications marked as read", notifications });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.user_id;
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        if (notification.recipient.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        await Notification.findByIdAndDelete(notificationId);
        return res.status(200).json({ message: "Notification deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const showNotifications = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const notification = await Notification.find({
            recipient: userId,
            isRead: false,
        }).populate("sender", "name email").populate("vehicle", "vehicleName pricePerDay").populate("booking");

        if(!notification){
            return res.status(404).json({ message: "No unread notifications found" });
        }

        return res.status(200).json({ message: "Unread notifications fetched", notification });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};