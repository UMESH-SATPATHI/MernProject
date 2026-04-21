import express from "express";
import { getUploadSignature } from "../controllers/cloudinaryController.js";
import { verifyToken } from "../controllers/authMiddleware.js";

const router = express.Router();

router.get("/signature", verifyToken, getUploadSignature);

export default router;
