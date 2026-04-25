import express from "express";
import { createVehicle, getAllVehicles, updateVehicle, deleteVehicle, getVehicleById} from "../controllers/vehicleController.js";
import { verifyToken, allowRoles } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, allowRoles("owner"), upload.array("images",5), createVehicle);
router.get("/", getAllVehicles);
router.get("/:id", getVehicleById);
router.put("/:id", verifyToken, allowRoles("owner", "admin"), upload.array("images",5), updateVehicle);
router.delete("/:id", verifyToken, allowRoles("owner", "admin"), deleteVehicle);

export default router;
