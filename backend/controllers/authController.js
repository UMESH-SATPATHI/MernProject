import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinaryConfig.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import fs from "fs";

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
            role
        });

        await user.save();

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
        });
        const userWithoutPassword = await User.findById(user._id).select("-password");
        res.status(200).json({ message: "User registered and logged in successfully", token, user: userWithoutPassword });
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
        const existingUser = await User.findById(req.user.user_id);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const updates = {};

        if (req.body.name) {
            updates.name = req.body.name;
        }

        if (req.body.email) {
            updates.email = req.body.email.toLowerCase();
        }

        if (req.body.newPassword) {
            if (!req.body.currentPassword) {
                return res.status(400).json({ message: "Current password is required" });
            }
            const isMatch = await bcrypt.compare(req.body.currentPassword, existingUser.password);
            if (!isMatch) return res.status(400).json({ message: "Current password is wrong" });
            updates.password = await bcrypt.hash(req.body.newPassword, 10);
        }

        if (req.file) {
            if (existingUser.profileImage?.publicId) {
                await cloudinary.uploader.destroy(existingUser.profileImage.publicId);
            }
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "profile_images"
            });
            updates.profileImage = {
                url: result.secure_url,
                publicId: result.public_id
            };
            fs.unlinkSync(req.file.path);
        }

        const user = await User.findByIdAndUpdate(
            req.user.user_id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

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
        if (users.length === 0) {
            return res.status(400).json({ message: "No users found!" });
        }
        return res.status(200).json({ message: "All users fetched", users });
    }
    catch (error) {
        return res.status(400).json({ message: "server error!" });
    }

};
export const removeProfileImage = async (req, res) => {
    try{
        const user = await User.findById(req.user.user_id);
        if (!user){
            return res.status(404).json({message: "user not found!"});
        }
        if (!user.profileImage || !user.profileImage.publicId){
            return res.status(400).json({message: "No profile image to remove!"});
        }
        await cloudinary.uploader.destroy(user.profileImage.publicId);
        user.profileImage = undefined;
        await user.save();
        return res.status(200).json({message: "Profile image removed", user});
    }catch(error){
        console.log(error);
        return res.status(500).json({message: "server error!"});
    }

}
export default loginUser;