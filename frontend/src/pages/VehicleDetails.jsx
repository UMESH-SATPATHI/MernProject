import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { deleteVehicle, getVehicleById } from "../services/vehicleService";
import "../styles/vehicleDetails.css";

const VehicleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const currentUserId = user?._id || user?.user_id || user?.id || "";

    const getVehicleOwnerId = (value) => value?.owner?._id || value?.owner?.id || value?.ownerId || value?.owner || "";

    const canManageVehicle = user?.role === "admin" || String(getVehicleOwnerId(vehicle)) === String(currentUserId);

    useEffect(() => {
        let isMounted = true;

        const fetchVehicle = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await getVehicleById(id);
                if (isMounted) {
                    setVehicle(response.data?.vehicle || null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || "Failed to load vehicle details");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchVehicle();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleBookNow = () => {
        if (!user) {
            window.dispatchEvent(
                new CustomEvent("auth:login-required", {
                    detail: { returnTo: `/vehicles/${id}` },
                })
            );
            return;
        }

        setMessage("Booking flow can be connected from here next.");
    };

    const handleDeleteVehicle = async () => {
        if (!window.confirm("Delete this vehicle? This cannot be undone.")) return;

        try {
            await deleteVehicle(id);
            navigate("/vehicles");
        } catch (err) {
            setMessage(err.response?.data?.message || "Failed to delete vehicle");
        }
    };

    if (loading) {
        return <div className="vehicle-details-page"><div className="vehicle-details-state">Loading vehicle details...</div></div>;
    }

    if (error) {
        return <div className="vehicle-details-page"><div className="vehicle-details-state error">{error}</div></div>;
    }

    if (!vehicle) {
        return <div className="vehicle-details-page"><div className="vehicle-details-state error">Vehicle not found</div></div>;
    }

    const imageList = Array.isArray(vehicle.images) ? vehicle.images : [];
    const carouselId = `vehicle-images-${id}`;
    const fallbackImage = "https://via.placeholder.com/1000x700?text=Vehicle+Image";

    return (
        <div className="vehicle-details-page">
            <button type="button" className="vehicle-back-btn" onClick={() => navigate(-1)}>
                Back
            </button>

            <div className="vehicle-details-card">
                <div className="vehicle-details-hero">
                    {imageList.length > 0 ? (
                        <div id={carouselId} className="carousel slide vehicle-images-carousel" data-bs-ride="carousel">
                            {imageList.length > 1 && (
                                <div className="carousel-indicators vehicle-carousel-indicators">
                                    {imageList.map((image, index) => (
                                        <button
                                            key={image.publicId || index}
                                            type="button"
                                            data-bs-target={`#${carouselId}`}
                                            data-bs-slide-to={index}
                                            className={index === 0 ? "active" : ""}
                                            aria-current={index === 0 ? "true" : undefined}
                                            aria-label={`Slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="carousel-inner vehicle-carousel-inner">
                                {imageList.map((image, index) => (
                                    <div key={image.publicId || index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                                        <img
                                            src={image.url || fallbackImage}
                                            className="d-block w-100 vehicle-carousel-image"
                                            alt={`${vehicle.vehicleName} ${index + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            {imageList.length > 1 && (
                                <>
                                    <button className="carousel-control-prev vehicle-carousel-control" type="button" data-bs-target={`#${carouselId}`} data-bs-slide="prev">
                                        <span className="carousel-control-prev-icon" aria-hidden="true" />
                                        <span className="visually-hidden">Previous</span>
                                    </button>
                                    <button className="carousel-control-next vehicle-carousel-control" type="button" data-bs-target={`#${carouselId}`} data-bs-slide="next">
                                        <span className="carousel-control-next-icon" aria-hidden="true" />
                                        <span className="visually-hidden">Next</span>
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <img src={fallbackImage} alt={vehicle.vehicleName} className="vehicle-carousel-image" />
                    )}
                </div>

                <div className="vehicle-details-content">
                    <div className="vehicle-details-heading">
                        <p className="vehicle-details-kicker">{vehicle.vehicleType}</p>
                        <h1>{vehicle.vehicleName}</h1>
                        <p className="vehicle-details-subtitle">
                            {vehicle.brand} • {vehicle.model}
                        </p>
                    </div>

                    <div className="vehicle-details-price-row">
                        <span>Price per day</span>
                        <strong>₹{vehicle.pricePerDay}</strong>
                    </div>

                    <div className="vehicle-details-grid">
                        <div>
                            <span>Brand</span>
                            <strong>{vehicle.brand}</strong>
                        </div>
                        <div>
                            <span>Model</span>
                            <strong>{vehicle.model}</strong>
                        </div>
                        <div>
                            <span>Location</span>
                            <strong>{vehicle.location}</strong>
                        </div>
                        <div>
                            <span>Availability</span>
                            <strong>{vehicle.isAvailable ? "Available" : "Not available"}</strong>
                        </div>
                    </div>

                    <div className="vehicle-details-description">
                        <span>Description</span>
                        <p>{vehicle.description}</p>
                    </div>

                    {message && <div className="vehicle-details-state success">{message}</div>}

                    <div className="vehicle-details-actions" id="book-section">
                        <button type="button" className="vehicle-details-book-btn" onClick={handleBookNow}>
                            Book Now
                        </button>
                        {canManageVehicle && (
                            <button type="button" className="vehicle-details-delete-btn" onClick={handleDeleteVehicle}>
                                Delete Vehicle
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleDetails;