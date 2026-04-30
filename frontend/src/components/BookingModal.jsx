import { useState, useEffect } from "react";
import { createBooking } from "../services/bookingService";
import "../styles/booking.css";

const BookingModal = ({ vehicle, onClose, onSuccess }) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
    const [numberOfDays, setNumberOfDays] = useState(0);


    // Calculate total price and days
    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (end > start) {
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                const price = days * (vehicle?.pricePerDay || 0);
                setNumberOfDays(days);
                setTotalPrice(price);
            } else {
                setNumberOfDays(0);
                setTotalPrice(0);
            }
        }
    }, [startDate, endDate, vehicle?.pricePerDay]);

    // Handle ESC key press
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === "Escape" && !loading) {
                handleClose();
            }
        };
        window.addEventListener("keydown", handleEscKey);
        return () => window.removeEventListener("keydown", handleEscKey);
    }, [loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");


        // Validation
        if (!startDate || !endDate) {
            setError("Please select both start and end dates");
            return;
        }

        // Check if start date is before today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedStart = new Date(startDate);
        
        if (selectedStart < today) {
            setError("Start date cannot be in the past");
            return;
        }

        if (new Date(endDate) <= new Date(startDate)) {
            setError("End date must be after start date");
            return;
        }

        try {
            setLoading(true);
            const bookingData = {
                vehicleId: vehicle._id,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
            };

            const response = await createBooking(bookingData);
            setMessage("Booking request sent to owner!");
            setError("");
            
            // Reset form
            setStartDate("");
            setEndDate("");
            setTotalPrice(0);
            setNumberOfDays(0);

            // Close modal after success
            setTimeout(() => {
                onClose();
                if (onSuccess) {
                    onSuccess(response.data.booking);
                }
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create booking");
            setMessage("");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="booking-modal-overlay" onClick={handleClose}>
            <div className="booking-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="booking-container">
                    <div className="booking-header">
                        <h2 className="booking-title">Book Vehicle</h2>
                        <p className="booking-subtitle">Complete your booking details</p>
                    </div>

                    {/* Vehicle Info */}
                    <div className="booking-vehicle-info">
                        <div className="vehicle-info-row">
                            <span className="vehicle-info-label">Vehicle</span>
                            <span className="vehicle-info-value">
                                {vehicle?.vehicleName || "N/A"}
                            </span>
                        </div>
                        <div className="vehicle-info-row">
                            <span className="vehicle-info-label">Type</span>
                            <span className="vehicle-info-value">
                                {vehicle?.vehicleType || "N/A"}
                            </span>
                        </div>
                        <div className="vehicle-info-row">
                            <span className="vehicle-info-label">Price per Day</span>
                            <span className="vehicle-info-value vehicle-price-highlight">
                                ₹{vehicle?.pricePerDay || 0}
                            </span>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <form className="booking-form" onSubmit={handleSubmit}>
                        <div className="date-input-group">
                            <div className="form-group">
                                <label className="form-label">Start Date</label>
                                <input
                                    type="date"
                                    className="form-input booking-date-input"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">End Date</label>
                                <input
                                    type="date"
                                    className="form-input booking-date-input"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || today}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Price Summary */}
                        {numberOfDays > 0 && (
                            <div className="booking-price-summary">
                                <div className="price-row">
                                    <span className="price-label">Number of Days</span>
                                    <span className="price-value">{numberOfDays}</span>
                                </div>
                                <div className="price-row">
                                    <span className="price-label">Price per Day</span>
                                    <span className="price-value">₹{vehicle?.pricePerDay}</span>
                                </div>
                                <div className="price-divider"></div>
                                <div className="price-row">
                                    <span className="price-label">Total Price</span>
                                    <span className="price-value price-total">₹{totalPrice}</span>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        {error && <div className="booking-message error">{error}</div>}
                        {message && <div className="booking-message success">{message}</div>}
                        {loading && (
                            <div className="booking-message loading">
                                <span className="spinner"></span> Processing your booking...
                            </div>
                        )}

                        {/* Actions */}
                        <div className="booking-actions">
                            <button
                                type="submit"
                                className="booking-btn submit"
                                disabled={loading}
                            >
                                {loading ? "Booking..." : "Confirm Booking"}
                            </button>
                            <button
                                type="button"
                                className="booking-btn cancel"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
