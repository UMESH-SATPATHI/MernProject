import mongoose from "mongoose";
import Vehicle from "../models/vehicle.js";
import cloudinary from "../config/cloudinaryConfig.js";
import fs from "fs";
import User from "../models/user.js";

const canManageVehicle = (reqUser, vehicle) => {
    if (!reqUser) {
        return false;
    }
    //if the requesting user is an admin then they can change the vehicle data
    if (reqUser.role === "admin") return true;
    //if the requesting user is the owner who has added the vehicle then they can update the vehicle data
    return String(vehicle.owner) === String(reqUser.user_id);
}

export const createVehicle = async (req, res) => {
    try {
        const owner = req.user.user_id;
        // const ownerDoc = await User.findById(owner).select("name");
        // if (!ownerDoc) {
        //     return res.status(404).json({ message: "Owner not found" });
        // }
        const {
            vehicleName,
            vehicleType,
            brand,
            model,
            description,
            pricePerDay,
            location,
            isAvailable
        } = req.body;

        if (
            !vehicleName ||
            !vehicleType ||
            !brand ||
            !model ||
            !description ||
            pricePerDay === undefined ||
            !location ||
            isAvailable === undefined
        ) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        if (!Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ message: "At least upload 1 image of the vehicle" });
        }
        const normalizedImages = [];
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "vehicle_images",
            });
            normalizedImages.push({
                url: result.secure_url,
                publicId: result.public_id,
            });
        }

        for (const file of req.files) {
            if (file?.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        }

        const vehicle = await Vehicle.create({
            owner,
            // ownerName: ownerDoc.name,
            vehicleName,
            vehicleType,
            brand,
            model,
            description,
            pricePerDay,
            location,
            images: normalizedImages,
            isAvailable,
        });

        return res.status(201).json({ message: "Vehicle created", vehicle });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
}

export const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find()
            .populate("owner", "name")
            .sort({ createdAt: -1 });
        if (!vehicles || vehicles.length === 0) {
            return res.status(400).json({ message: "Vehicle data not found!" });
        }
        return res.status(200).json({ message: "fetched vehicle data", vehicles });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id))
            return res.status(400).json({ message: "Invalid vehicle id" });

        const vehicle = await Vehicle.findById(id).populate("owner", "name");
        if (!vehicle)
            return res.status(404).json({ message: "Vehicle not found" });

        return res.status(200).json({ message: "Vehicle fetched", vehicle });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id))
            return res.status(400).json({ message: "Invalid vehicle id" });

        const vehicle = await Vehicle.findById(id);
        if (!vehicle)
            return res.status(404).json({ message: "Vehicle not found" });

        if (!canManageVehicle(req.user, vehicle))
            return res.status(403).json({ message: "Access denied" });

        // update text fields
        const allowedFields = [
            "vehicleName", "vehicleType", "brand", "model",
            "description", "pricePerDay", "location", "isAvailable"
        ];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) vehicle[field] = req.body[field];
        }

        if (Array.isArray(req.files) && req.files.length > 0) {
            const uploadedImages = [];

            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "vehicle_images",
                });
                uploadedImages.push({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }

            vehicle.images = uploadedImages;

            for (const file of req.files) {
                if (file?.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }
        await vehicle.save();
        return res.status(200).json({ message: "Vehicle updated", vehicle });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id))
            return res.status(400).json({ message: "Invalid vehicle id" });

        const vehicle = await Vehicle.findById(id);
        if (!vehicle)
            return res.status(404).json({ message: "Vehicle not found" });

        if (!canManageVehicle(req.user, vehicle))
            return res.status(403).json({ message: "Access denied" });

        await vehicle.deleteOne();
        return res.status(200).json({ message: "Vehicle deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};



