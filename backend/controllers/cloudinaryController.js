// import cloudinary from "../config/cloudinaryConfig.js";

// export const getUploadSignature = async (req, res) => {
//     try {
//         const timestamp = Math.round(Date.now() / 1000);

//         const baseFolder = process.env.CLOUDINARY_FOLDER || "p2p-vehicle-rental";
//         const userId = req?.user?.user_id || "anonymous";
//         const folder = `${baseFolder}/users/${userId}`;

//         const paramsToSign = { timestamp, folder };

//         const signature = cloudinary.utils.api_sign_request(
//             paramsToSign,
//             process.env.CLOUDINARY_API_SECRET
//         );

//         return res.json({
//             timestamp,
//             signature,
//             folder,
//             cloudName: process.env.CLOUDINARY_CLOUD_NAME,
//             apiKey: process.env.CLOUDINARY_API_KEY,
//         });
//     } catch (error) {
//         return res.status(500).json({ message: "Failed to create upload signature" });
//     }
// };
