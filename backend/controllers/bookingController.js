import Vehicle from "../models/vehicle.js";
import Booking from "../models/booking.js";
import Notification from "../models/notification.js";
import mongoose from "mongoose";

export const createBooking = async (req, res) => {
    try {
        const { vehicleId, startDate, endDate } = req.body;
        const userId = req.user.user_id;

        if (!vehicleId || !startDate || !endDate) {
            return res.status(400).json({
                message: "vehicleId, startDate and endDate are required",
            });
        }

        if (!mongoose.isValidObjectId(vehicleId)) {
            return res.status(400).json({ message: "Invalid vehicleId" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return res.status(400).json({
                message: "Invalid date format for startDate or endDate",
            });
        }

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle data not found!" });
        }
        if (!vehicle.isAvailable) {
            return res.status(404).json({ message: "Vehicle not available" });
        }
        if (vehicle.owner.toString() === userId) {
            return res.status(400).json({ message: "Cannot book own vehicle" });
        }

        const existingBooking = await Booking.findOne(
            {
                vehicle: vehicleId,
                status: { $in: ["pending", "owner_approved", "confirmed"] },
                startDate: { $lte: endDate },
                endDate: { $gte: startDate }
            }
        )
        if (existingBooking) {
            return res.status(400).json({ message: "Vehicle not available for selected dates" });
        }

        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (!Number.isFinite(days) || days <= 0) {
            return res.status(400).json({ message: "Invalid date selection" });
        }

        if (!Number.isFinite(vehicle.pricePerDay)) {
            return res.status(400).json({ message: "Invalid vehicle price" });
        }

        const totalPrice = days * vehicle.pricePerDay;
        if (!Number.isFinite(totalPrice)) {
            return res.status(400).json({ message: "Could not calculate booking price" });
        }

        const booking = await Booking.create(
            {
                user: userId,
                owner: vehicle.owner,
                vehicle: vehicleId,
                startDate,
                endDate,
                totalPrice
            }
        );

        const notification = await Notification.create(
            {
                sender: userId,
                recipient: vehicle.owner,
                booking: booking._id,
                vehicle: vehicle._id,
                message: "New booking request received",
                type: "booking_request"
            }
        );
        res.status(201).json({ message: "vehicle booked", booking });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });

    }
};
//this function is used by owner to approve or reject the booking request
export const updateBookingStatus = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { status } = req.body;

        if (!["owner_approved", "owner_rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Invalid Booking" });
        }
        if (booking.owner.toString() !== req.user.user_id) {
            return res.status(403).json({ message: "Unauthorized access" });
        }
        booking.status = status;

        const notification = await Notification.create(
            {
                sender: req.user.user_id,
                recipient: booking.user,
                booking: booking._id,
                vehicle: booking.vehicle,
                message:
                    status === "owner_approved"
                        ? "Your booking has been approved"
                        : "Your booking has been rejected",
                type:
                    status === "owner_approved"
                        ? "booking_approved"
                        : "booking_rejected"
            }
        )

        await booking.save();
        return res.status(200).json({ message: "Booking status updated", booking });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "server error" });
    }
};
// this function can only be used by the renter to mark the booking as completed after the rental period is over
export const markBookingCompleted = async (req, res) => {
    try {
        const { id: bookingId } = req.params;

        if (!mongoose.isValidObjectId(bookingId)) {
            return res.status(400).json({ message: "Invalid booking id" });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found!" });
        }
        if (booking.user.toString() !== req.user.user_id) {
            return res.status(403).json({ message: "Unauthorized access" });
        }
        if (booking.status !== "approved") {
            return res.status(400).json({ message: "Only approved bookings can be marked completed" });
        }
        booking.status = "completed";
        await booking.save();
        await Notification.create({
            sender: req.user.user_id,
            recipient: booking.owner,
            booking: booking._id,
            vehicle: booking.vehicle,
            message: "Booking marked as completed",
            type: "booking_completed"
        });
        return res.status(200).json({ message: "Booking marked as completed", booking });

    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "server error" });
    }
};
//this function can only be used by renter to confirm the booking
export const confirmOwnerApproval = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const bookingId = req.params.id;
        if (!mongoose.isValidObjectId(bookingId)) {
            return res.status(400).json({ message: "Invalid booking id" });
        }
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found!" });
        }
        if (booking.user.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access" });
        }
        if (booking.status !== "owner_approved") {
            return res.status(400).json({ message: "Only owner-approved bookings can be confirmed" });
        }
        booking.status = "confirmed";
        await booking.save();
        await Notification.create({
            sender: userId,
            recipient: booking.owner,
            booking: booking._id,
            vehicle: booking.vehicle,
            message: "Renter has confirmed the booking after owner approval",
            type: "booking_confirmed",
            isRead: false
        });

        return res.status(200).json({ message: "Booking confirmed and approved", booking });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "server error" });
    }
}

export const getRenterBookings = async (req, res) => {
    try {
        const userId = req.user.user_id;
        await Booking.updateMany(
            {
                status: "confirmed",
                endDate: { $lte: new Date() }
            },
            {
                $set: {
                    status: "completed"
                }
            }
        );
        const bookings = await Booking.find({ user: userId }).sort({ createdAt: -1 }).populate("vehicle").populate("owner", "name email");
        res.status(200).json({ message: "bookings available", bookings })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "server error" });
    }
};

export const getOwnerBookings = async (req, res) => {
    try {
        const ownerId = req.user.user_id;
        const bookings = await Booking.find({ owner: ownerId }).populate("user", "name email").populate("vehicle");
        res.status(200).json({ message: "bookings available", bookings });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "server error" });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.user.toString() !== req.user.user_id)
            return res.status(403).json({ message: "Unauthorized" });
        if (booking.status !== "pending")
            return res.status(400).json({ message: "Only pending bookings cancellable" });
        booking.status = "cancelled";
        await booking.save();
        await Notification.create(
            {
                sender: req.user.user_id,
                recipient: booking.owner,
                booking: booking._id,
                vehicle: booking.vehicle,
                message: "Booking has been cancelled by renter",
                type: "booking_cancelled",
                isRead: false
            }
        );
        return res.status(200).json({ message: "Booking cancelled", booking });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "server error" });
    }
}
