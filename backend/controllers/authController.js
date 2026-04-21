import bcrypt from "bcrypt";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        let emailLower = email.toLowerCase();
        const existingUser = await User.findOne({ email: emailLower });
        if (existingUser) {
            return res.status(400).json({ message: "User already Exists" });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = new User({
            name,
            email: emailLower,
            password: hashedPassword,
            role,
        });
        await user.save();
        res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "server error" });
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        let emailLower = email.toLowerCase();
        //all fields are mandatory
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are mandatory!" });
        }

        const user = await User.findOne({ email: emailLower });
        if (!user) {
            return res.status(400).json({ message: "Invalid user credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid user credentials" });
        }

        const token = jwt.sign(
            {
                user_id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 3600000
        })
        res.status(200).json({ message: "Login Successful", token, user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "server error" });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token');
        return res.status(200).json({ message: "You have been logged out" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "error logging out!" });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.user_id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User details not found" });
        }
        return res.status(200).json({ message: "User details fetched", user });

    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "could not get the profile details" });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.user_id).select("-password");
        if (req.body.newPassword) {
            const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
            if (!isMatch) return res.status(400).json({ message: "Current password is wrong" });
            user.password = await bcrypt.hash(req.body.newPassword, 10);
        }
        if (req.body.email) {
            user.email = req.body.email;
        }
        await user.save();
        return res.status(200).json({ message: "Profile updated", user });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
}

export const deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.user_id);
        res.clearCookie('token');
        return res.status(200).json({ message: "the account has been deleted!" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "error deleting the account!" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        if (users.length ===0) {
            return res.status(400).json({ message: "No users found!" });
        }
        return res.status(200).json({message: "All users fetched", users});
    }
    catch (error) {
        return res.status(400).json({ message: "server error!" });
    }

};

export default loginUser;