import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true
        },
        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
            required: true
        },
        message: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: [
                "booking_request",
                "booking_approved",
                "booking_confirmed",
                "booking_rejected",
                "booking_completed",
                "booking_cancelled"
            ],
            required: true
        },
        isRead: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true }
);
const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;