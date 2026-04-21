import Vehicle from "../models/vehicle.js";

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

        const {
            vehicleName,
            vehicleType,
            brand,
            model,
            description,
            price,
            location,
            images,
            isAvailable
        } = req.body;

        if (
            !vehicleName ||
            !vehicleType ||
            !brand ||
            !model ||
            !description ||
            price === undefined ||
            !location ||
            !images ||
            isAvailable === undefined
        ) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        if (!Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ message: "At least upload 1 image of the vehicle" });
        }

        const normalizedImages = images.map((img) => ({
            url: img?.url,
            publicId: img?.publicId,
        }));

        const hasInvalidImage = normalizedImages.some((img) => !img.url || !img.publicId);
        if (hasInvalidImage) {
            return res.status(400).json({
                message: "Each image must include { url, publicId }",
            });
        }

        const vehicle = await Vehicle.create({
            owner,
            vehicleName,
            vehicleType,
            brand,
            model,
            description,
            price,
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

export const getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find().sort({ createdAt: -1 });
        if (!vehicles){
            return res.status(400).json({message: "Vehicle data not found!"});
        }
        return res.status(200).json({message: "fetched vehicle data", vehicles});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
}

