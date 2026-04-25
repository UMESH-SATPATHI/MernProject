import express from "express";
import {
    createBooking,
    updateBookingStatus,
    markBookingCompleted,
    getRenterBookings,
    getOwnerBookings,
    cancelBooking
} from "../controllers/bookingController.js";
import { verifyToken, allowRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, allowRoles("renter"), createBooking);
router.put("/:id/update", verifyToken, allowRoles("owner"), updateBookingStatus);
router.get("/renter", verifyToken, allowRoles("renter"), getRenterBookings);
router.get("/owner", verifyToken, allowRoles("owner"), getOwnerBookings);
router.put("/:id/cancel", verifyToken, allowRoles("renter"), cancelBooking);
router.put("/:id/markCompleted", verifyToken, allowRoles("renter"), markBookingCompleted);

export default router;