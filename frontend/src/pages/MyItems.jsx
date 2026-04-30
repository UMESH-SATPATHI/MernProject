import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { getAllVehicles } from "../services/vehicleService";
import { getRenterBookings } from "../services/bookingService";
import VehicleCard from "../components/VehicleCard";
import "../styles/myItems.css";

const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const MyItems = () => {
    const { user, openAuthModal } = useAuth();
    const location = useLocation();
    const isOwnerView = location.pathname === "/my-vehicles" || user?.role === "owner";
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const title = isOwnerView ? "My Vehicles" : "My Bookings";
    const subtitle = isOwnerView
        ? "Vehicles you added to the platform."
        : "Bookings you have made on the platform.";

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                if (isOwnerView) {
                    const response = await getAllVehicles();
                    const currentUserId = user?._id || user?.user_id || user?.id || "";
                    const ownerVehicles = (response.data?.vehicles || []).filter((vehicle) => {
                        const vehicleOwnerId = vehicle?.owner?._id || vehicle?.owner?.id || vehicle?.ownerId || vehicle?.owner || "";
                        return String(vehicleOwnerId) === String(currentUserId);
                    });
                    if (isMounted) {
                        setVehicles(ownerVehicles);
                    }
                } else {
                    const response = await getRenterBookings();
                    if (isMounted) {
                        setBookings(response.data?.bookings || []);
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || "Failed to load your items");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (!user) {
            openAuthModal(location.pathname);
            setLoading(false);
            return;
        }

        loadData();

        return () => {
            isMounted = false;
        };
    }, [isOwnerView, location.pathname, openAuthModal, user]);

    const emptyMessage = useMemo(() => {
        if (isOwnerView) {
            return "You have not added any vehicles yet.";
        }
        return "You have not booked any vehicles yet.";
    }, [isOwnerView]);

    if (loading) {
        return <div className="my-items-page"><div className="my-items-state">Loading...</div></div>;
    }

    return (
        <div className="my-items-page">
            <div className="my-items-header">
                <div>
                    <p className="my-items-kicker">Account activity</p>
                    <h1>{title}</h1>
                    <p className="my-items-subtitle">{subtitle}</p>
                </div>
                <div className="my-items-summary">
                    <span>{isOwnerView ? "Vehicles" : "Bookings"}</span>
                    <strong>{isOwnerView ? vehicles.length : bookings.length}</strong>
                </div>
            </div>

            {error && <div className="my-items-state error">{error}</div>}
            {!error && ((isOwnerView && vehicles.length === 0) || (!isOwnerView && bookings.length === 0)) && (
                <div className="my-items-state">
                    {emptyMessage} <Link to="/vehicles">Browse vehicles</Link>
                </div>
            )}

            {isOwnerView ? (
                <div className="my-items-grid">
                    {vehicles.map((vehicle) => (
                        <VehicleCard
                            key={vehicle._id}
                            vehicle={vehicle}
                            detailsTo={`/vehicles/${vehicle._id}`}
                            canManageVehicle={true}
                        />
                    ))}
                </div>
            ) : (
                <div className="my-items-list">
                    {bookings.map((booking) => {
                        const vehicle = booking?.vehicle || {};
                        return (
                            <article key={booking._id} className="booking-item-card">
                                <div className="booking-item-head">
                                    <div>
                                        <p className="booking-item-kicker">{booking?.status?.replaceAll("_", " ")}</p>
                                        <h3>{vehicle?.vehicleName || "Vehicle"}</h3>
                                        <p className="booking-item-subtitle">
                                            {vehicle?.vehicleType || ""} {vehicle?.brand ? `• ${vehicle.brand}` : ""} {vehicle?.model ? `• ${vehicle.model}` : ""}
                                        </p>
                                    </div>
                                    <Link className="booking-item-link" to={`/vehicles/${vehicle?._id || vehicle?.id || ""}`}>
                                        View vehicle
                                    </Link>
                                </div>

                                <div className="booking-item-grid">
                                    <div>
                                        <span>Start date</span>
                                        <strong>{formatDate(booking?.startDate)}</strong>
                                    </div>
                                    <div>
                                        <span>End date</span>
                                        <strong>{formatDate(booking?.endDate)}</strong>
                                    </div>
                                    <div>
                                        <span>Total price</span>
                                        <strong>₹{booking?.totalPrice ?? "N/A"}</strong>
                                    </div>
                                    <div>
                                        <span>Owner</span>
                                        <strong>{booking?.owner?.name || "N/A"}</strong>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyItems;
