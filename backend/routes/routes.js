import express from "express";
import {registerUser, loginUser, logout, getUserProfile, updateProfile, deleteAccount, getAllUsers} from "../controllers/authController.js";
import { verifyToken, allowRoles } from "../controllers/authMiddleware.js";
import User from "../models/user.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateProfile);
router.delete("/delete", verifyToken, deleteAccount);
router.get("/getUsers", verifyToken, allowRoles("admin"), getAllUsers);
router.get("/protected", verifyToken, (req, res)=>{res.json({message: "Access granted", user:req.user,});});

export default router;

