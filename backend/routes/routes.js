import express from "express";
import { registerUser, loginUser, logout, getUserProfile, updateProfile, deleteAccount, getAllUsers, removeProfileImage } from "../controllers/authController.js";
import { verifyToken, allowRoles } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import User from "../models/user.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, upload.single("profileImage"), updateProfile);
router.delete("/delete", verifyToken, deleteAccount);
router.get("/getUsers", verifyToken, allowRoles("admin"), getAllUsers);
router.delete("/removeProfileImage", verifyToken, removeProfileImage);
router.get("/protected", verifyToken, (req, res) => { res.json({ message: "Access granted", user: req.user, }); });

export default router;

