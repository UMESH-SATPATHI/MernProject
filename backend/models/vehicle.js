import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        // ownerName:{
        //     type: String,
        //     required: true
        // },
        vehicleName: {
            type: String,
            required: true,
            trim: true
        },
        vehicleType: {
            type: String,
            enum: ['bike', 'car', 'scooter'],
            required: true
        },
        brand: {
            type: String,
            required: true
        },
        model: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        pricePerDay: {
            type: Number,
            required: true
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        images: [
            {
                url: {
                    type: String,
                    required: true,
                },
                publicId: {
                    type: String,
                    required: true,
                },
            },
        ],
        isAvailable: {
            type: Boolean,
            required: true
        },
    },
    { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
