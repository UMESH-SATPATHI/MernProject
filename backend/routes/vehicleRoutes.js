import express from "express";
import { createVehicle } from "../controllers/vehicleController.js";
import { verifyToken, allowRoles } from "../controllers/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, allowRoles("owner"), createVehicle);

export default router;
