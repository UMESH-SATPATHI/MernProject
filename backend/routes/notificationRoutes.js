import express from "express";
import {getMyNotification, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, showNotifications} from "../controllers/notificationController.js";

import {verifyToken, allowRoles} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/",verifyToken, getMyNotification);
router.put("/:id/read", verifyToken, markNotificationAsRead);
router.put("/read-all", verifyToken, markAllNotificationsAsRead);
router.delete("/:id", verifyToken, deleteNotification);
router.get("/all", verifyToken, showNotifications);
export default router;
