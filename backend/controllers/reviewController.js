import Review from "../models/review.js";
import Booking from "../models/booking.js";

export const createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;
        const userId = req.user.user_id;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: "No booking found" });
        }
        if (booking.user.toString() !== userId) {
            return res.status(403).json({ message: "Not your booking" });
        }
        if (booking.status !== "completed") {
            return res.status(400).json({ message: "Only completed bookings can be reviewed" });
        }

        const exisitingReview = await Review.findOne({ booking: bookingId });
        if (exisitingReview) {
            return res.status(400).json({ message: "This booking has already been reviewed!" });
        }

        const review = await Review.create({
            reviewer: userId,
            vehicle: booking.vehicle,
            booking: bookingId,
            rating,
            comment
        })
        return res.status(201).json({ message: "review created", review });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getVehicleReviews = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        const reviews = await Review.find({ vehicle: vehicleId })
            .populate("reviewer", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Reviews fetched",
            reviews
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.user_id;

        const review = await Review.findById(id);
        if (!review)
            return res.status(404).json({ message: "Review not found" });

        // only reviewer can edit
        if (review.reviewer.toString() !== userId)
            return res.status(403).json({ message: "Unauthorized" });

        if (rating !== undefined) review.rating = rating;
        if (comment !== undefined) review.comment = comment;

        await review.save();
        return res.status(200).json({ message: "Review updated", review });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("reviewer", "name email")
            .populate("vehicle", "vehicleName")
            .populate("booking")
            .sort({ createdAt: -1 });

        return res.status(200).json({ 
            message: "All reviews fetched", 
            reviews 
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;
        const review = await Review.findByIdAndDelete(id);

        if (!review) return res.status(404).json({ message: "Review not found!" });
        if (review.reviewer.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });

        await review.deleteOne();
        return res.status(200).json({ message: "Review deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
}