import express from "express";
import { createVehicle, getAllVehicles, updateVehicle, deleteVehicle, getVehicleById} from "../controllers/vehicleController.js";
import { verifyToken, allowRoles } from "../controllers/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, allowRoles("owner"), createVehicle);
router.get("/", getAllVehicles);
router.get("/:id", getVehicleById);
router.put("/:id", verifyToken, allowRoles("owner", "admin"), updateVehicle);
router.delete("/:id", verifyToken, allowRoles("owner", "admin"), deleteVehicle);

export default router;
