import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../context/authContext";
import updateIcon from "../assets/update-icon.png";
import "../styles/vehicleCard.css";

const VehicleCard = ({
    vehicle,
    onBook,
    onDetails,
    onUpdate,
    bookTo,
    detailsTo,
    canManageVehicle = false,
    className = "",
}) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const cardRef = useRef(null);
    const imageRef = useRef(null);
    const imageSrc =
        vehicle?.images?.[0]?.url ||
        vehicle?.image ||
        vehicle?.imageUrl || "";

    const vehicleName = vehicle?.vehicleName || "Vehicle";
    const pricePerDay = vehicle?.pricePerDay;
    const vehicleType = vehicle?.vehicleType || "";
    const brand = vehicle?.brand || "";
    const model = vehicle?.model || "";
    const location = vehicle?.location || "";

    const renderAction = (label, to, onClick, variant = "primary") => {
        const classNameName = `vehicle-card-btn ${variant}`;

        if (to) {
            return (
                <Link to={to} className={classNameName} onClick={(e) => { e.stopPropagation() }}>
                    {label}
                </Link>
            );
        }

        return (
            <button type="button" className={classNameName} onClick={
                (e) => {
                    e.stopPropagation();
                }}>
                {label}
            </button>
        );
    };

    // Determine which buttons to show based on user role
    const isRenter = user?.role === "renter";
    const isOwner = user?.role === "owner";
    const isAdmin = user?.role === "admin";
    const isVehicleOwner = user?._id === vehicle?.owner;

    const showBookButton = isRenter && !isVehicleOwner;
    const showDetailsButton = true; // Everyone can see details
    const showUpdateButton = canManageVehicle && (isOwner || isAdmin);

    const availabilityClass = vehicle?.isAvailable ? "Available" : "Unavailable";

    const handleMouseEnter = () => {
        gsap.to(cardRef.current, {
            y: -6,
            scale: 1.02,
            boxShadow: "0 16px 32px rgba(0, 0, 0, 0.12)",
            duration: 0.35,
            ease: "back.out(1.7)",
            overwrite: "auto",
        });
        gsap.to(imageRef.current, {
            scale: 1.05,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
        });
    };

    const handleMouseLeave = () => {
        gsap.to(cardRef.current, {
            y: 0,
            scale: 1,
            boxShadow: "0 10px 24px rgba(0, 0, 0, 0.05)",
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
        });
        gsap.to(imageRef.current, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
        });
    };

    return (
        <article
            ref={cardRef}
            className={`vehicle-card ${className}`.trim()}
            onClick={() => navigate(detailsTo)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: "pointer" }}
        >
            <div className="vehicle-card-image-wrap">
                {canManageVehicle && (
                    <button
                        type="button"
                        className="vehicle-card-update-overlay"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent the card click event
                            onUpdate();
                        }}
                        aria-label={`Update ${vehicleName}`}
                    >
                        <img src={updateIcon} alt="" className="vehicle-card-update-icon" />
                    </button>
                )}
                <img ref={imageRef} src={imageSrc} alt={vehicleName} className="vehicle-card-image" />
            </div>

            <div className="vehicle-card-body">
                <div className="vehicle-card-header">
                    <h3 className="vehicle-card-title">{vehicleName}</h3>
                    <span className={`vehicle-card-boolean ${vehicle.availabilityClass}`}>{availabilityClass}</span>
                    <p className="vehicle-card-meta">
                        {[vehicleType, location].filter(Boolean).join(" • ")}
                    </p>
                </div>
                <div className="vehicle-card-price-row">
                    <span className="vehicle-card-price-label">Price</span>
                    <span className="vehicle-card-price">
                        {pricePerDay !== undefined && pricePerDay !== null ? `₹${pricePerDay}` : "N/A"}
                        <small>/day</small>
                    </span>
                </div>

                <div className="vehicle-card-actions">
                    {showBookButton && renderAction("Book", bookTo, onBook, "primary")}
                    {showDetailsButton && renderAction("Details", detailsTo, onDetails, "secondary")}
                </div>
            </div>
        </article>
    );
};

export default VehicleCard;