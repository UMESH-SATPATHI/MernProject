import express from "express";
import { createReview, getVehicleReviews, updateReview, deleteReview, getAllReviews } from "../controllers/reviewController.js";
import { verifyToken, allowRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, allowRoles("renter"), createReview);
router.get("/vehicle/:vehicleId", getVehicleReviews);
router.put("/:id", verifyToken, allowRoles("renter"), updateReview);
router.get("/admin/all", verifyToken, allowRoles("admin"), getAllReviews);
router.delete("/:id", verifyToken, allowRoles("renter"), deleteReview);

export default router;