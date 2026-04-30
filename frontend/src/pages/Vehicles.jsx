import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createVehicle, getAllVehicles, searchVehicles, updateVehicle } from "../services/vehicleService";
import VehicleCard from "../components/VehicleCard";
import SearchCard from "../components/SearchCard";
import { useAuth } from "../context/authContext";
import "../styles/signup.css";
import "../styles/vehicles.css";

const emptyVehicleForm = {
    vehicleName: "",
    vehicleType: "",
    brand: "",
    model: "",
    description: "",
    pricePerDay: "",
    location: "",
    isAvailable: "true",
};

const Vehicles = () => {
    const { user, openAuthModal } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [vehicleModalMode, setVehicleModalMode] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [vehicleModalLoading, setVehicleModalLoading] = useState(false);
    const [vehicleModalMessage, setVehicleModalMessage] = useState({ type: "", text: "" });
    const [vehicleForm, setVehicleForm] = useState(emptyVehicleForm);
    const [vehicleImages, setVehicleImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [locationSearch, setLocationSearch] = useState("");

    const currentUserId = user?._id || user?.user_id || user?.id || "";

    const getVehicleOwnerId = (vehicle) => vehicle?.owner?._id || vehicle?.owner?.id || vehicle?.ownerId || vehicle?.owner || "";

    const canManageVehicle = (vehicle) => user?.role === "admin" || String(getVehicleOwnerId(vehicle)) === String(currentUserId);

    const clearBlobPreviews = (previews = []) => {
        previews.forEach((preview) => {
            if (typeof preview === "string" && preview.startsWith("blob:")) {
                URL.revokeObjectURL(preview);
            }
        });
    };

    const resetVehicleModalState = () => {
        setVehicleForm(emptyVehicleForm);
        setVehicleImages([]);
        setImagePreviews((previous) => {
            clearBlobPreviews(previous);
            return [];
        });
        setVehicleModalMessage({ type: "", text: "" });
        setSelectedVehicle(null);
    };

    useEffect(() => {
        let isMounted = true;

        const fetchVehicles = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await getAllVehicles();
                if (isMounted) {
                    setVehicles(response.data?.vehicles || []);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || "Failed to load vehicles");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchVehicles();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleLocationChange = (event) => {
        setLocationSearch(event.target.value);
    };

    const handleLocationSearch = async () => {
        const trimmedLocation = locationSearch.trim();

        if (!trimmedLocation) {
            const response = await getAllVehicles();
            setVehicles(response.data?.vehicles || []);
            return;
        }

        try {
            setLoading(true);
            setError("");
            const response = await searchVehicles(trimmedLocation);
            setVehicles(response.data?.vehicles || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to search vehicles");
        } finally {
            setLoading(false);
        }
    };

    const handleClearLocationSearch = async () => {
        setLocationSearch("");
        setLoading(true);
        setError("");

        try {
            const response = await getAllVehicles();
            setVehicles(response.data?.vehicles || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load vehicles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!vehicleModalMode) {
            resetVehicleModalState();
        }
    }, [vehicleModalMode]);

    const handleOpenAddVehicle = () => {
        if (!user) {
            openAuthModal("/vehicles");
            return;
        }

        if (user?.role !== "owner" && user?.role !== "admin") {
            setVehicleModalMessage({ type: "error", text: "Only owners and admins can add vehicles." });
            return;
        }

        resetVehicleModalState();
        setVehicleModalMode("add");
    };

    const handleOpenEditVehicle = (vehicle) => {
        if (!user) {
            openAuthModal("/vehicles");
            return;
        }

        if (!canManageVehicle(vehicle)) {
            setVehicleModalMessage({ type: "error", text: "Only owners and admins can update vehicles." });
            return;
        }

        setSelectedVehicle(vehicle);
        setVehicleForm({
            vehicleName: vehicle?.vehicleName || "",
            vehicleType: vehicle?.vehicleType || "",
            brand: vehicle?.brand || "",
            model: vehicle?.model || "",
            description: vehicle?.description || "",
            pricePerDay: vehicle?.pricePerDay !== undefined && vehicle?.pricePerDay !== null ? String(vehicle.pricePerDay) : "",
            location: vehicle?.location || "",
            isAvailable: String(Boolean(vehicle?.isAvailable)),
        });
        setVehicleImages([]);
        setImagePreviews(Array.isArray(vehicle?.images) ? vehicle.images.map((image) => image?.url).filter(Boolean) : []);
        setVehicleModalMessage({ type: "", text: "" });
        setVehicleModalMode("edit");
    };

    const handleVehicleInputChange = (event) => {
        const { name, value } = event.target;
        setVehicleForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        setVehicleImages(files);
        setImagePreviews((previous) => {
            clearBlobPreviews(previous);
            return files.map((file) => URL.createObjectURL(file));
        });
    };

    const handleCloseAddModal = () => {
        setVehicleModalMode(null);
        setSelectedVehicle(null);
    };

    useEffect(() => {
        if (!vehicleModalMode) return;

        const handleEscClose = (event) => {
            if (event.key === "Escape") {
                handleCloseAddModal();
            }
        };

        window.addEventListener("keydown", handleEscClose);
        return () => window.removeEventListener("keydown", handleEscClose);
    }, [vehicleModalMode]);

    const handleSubmitVehicle = async (event) => {
        event.preventDefault();

        if (vehicleModalMode === "add" && !vehicleImages.length) {
            setVehicleModalMessage({ type: "error", text: "Please upload at least one vehicle image." });
            return;
        }

        if (vehicleModalMode === "edit" && !selectedVehicle?._id) {
            setVehicleModalMessage({ type: "error", text: "Please select a vehicle to update." });
            return;
        }

        try {
            setVehicleModalLoading(true);
            setVehicleModalMessage({ type: "", text: "" });

            const formData = new FormData();
            formData.append("vehicleName", vehicleForm.vehicleName);
            formData.append("vehicleType", vehicleForm.vehicleType);
            formData.append("brand", vehicleForm.brand);
            formData.append("model", vehicleForm.model);
            formData.append("description", vehicleForm.description);
            formData.append("pricePerDay", vehicleForm.pricePerDay);
            formData.append("location", vehicleForm.location);
            formData.append("isAvailable", vehicleForm.isAvailable);
            vehicleImages.forEach((file) => formData.append("images", file));

            if (vehicleModalMode === "edit") {
                await updateVehicle(selectedVehicle._id, formData);
                setVehicleModalMessage({ type: "success", text: "Vehicle updated successfully." });
            } else {
                await createVehicle(formData);
                setVehicleModalMessage({ type: "success", text: "Vehicle added successfully." });
            }

            const response = await getAllVehicles();
            setVehicles(response.data?.vehicles || []);
            setVehicleModalMode(null);
            setSelectedVehicle(null);
        } catch (err) {
            setVehicleModalMessage({ type: "error", text: err.response?.data?.message || "Failed to save vehicle." });
        } finally {
            setVehicleModalLoading(false);
        }
    };

    // const vehicleModalTitle = vehicleModalMode === "edit" ? "Update vehicle" : "List a new vehicle";
    const vehicleModalKicker = vehicleModalMode === "edit" ? "Update Vehicle" : "Add Vehicle";
    const vehicleSubmitLabel = vehicleModalMode === "edit" ? "Save Changes" : "Save Vehicle";

    return (
        <div className="vehicles-page">
            <div className="vehicles-topbar">
                {(user?.role === "owner" || user?.role === "admin") && (
                    <button type="button" className="vehicle-add-fab" onClick={handleOpenAddVehicle} aria-label="Add vehicle">
                        <span>+</span>
                    </button>
                )}
            </div>

            <div className="vehicles-hero">
                <h1>Find the right vehicle for your next trip</h1>
                <p>
                    Explore all available vehicles, compare prices, and open the details you need before booking.
                </p>
            </div>

            <SearchCard
                location={locationSearch}
                onLocationChange={handleLocationChange}
                onSearch={handleLocationSearch}
                onClear={handleClearLocationSearch}
                loading={loading}
            />

            {vehicleModalMessage.text && <div className={`vehicles-state ${vehicleModalMessage.type}`}>{vehicleModalMessage.text}</div>}

            {loading && <div className="vehicles-state">Loading vehicles...</div>}
            {!loading && error && <div className="vehicles-state error">{error}</div>}

            {!loading && !error && vehicles.length === 0 && (
                <div className="vehicles-state">
                    No vehicles found. <Link to="/signup">Become an owner</Link> to add one.
                </div>
            )}

            <div className="vehicles-grid">
                {vehicles.map((vehicle) => (
                    <VehicleCard
                        key={vehicle._id}
                        vehicle={vehicle}
                        bookTo={`/vehicles/${vehicle._id}#book-section`}
                        detailsTo={`/vehicles/${vehicle._id}`}
                        canManageVehicle={canManageVehicle(vehicle)}
                        onUpdate={() => handleOpenEditVehicle(vehicle)}
                    />
                ))}
            </div>

            {vehicleModalMode && (
                <div className="vehicle-modal-overlay" role="dialog" aria-modal="true" aria-label="Vehicle form modal" onClick={handleCloseAddModal}>
                    <div className="vehicle-modal-card" onClick={(event) => event.stopPropagation()}>
                        <div className="vehicle-modal-header">
                            <div>
                                <p className="vehicle-modal-kicker">{vehicleModalKicker}</p>
                            </div>
                            <button type="button" className="vehicle-modal-close" onClick={handleCloseAddModal} aria-label="Close modal">
                                ×
                            </button>
                        </div>

                        {vehicleModalMessage.text && <div className={`vehicles-state ${vehicleModalMessage.type}`}>{vehicleModalMessage.text}</div>}

                        <form className="vehicle-modal-form" onSubmit={handleSubmitVehicle}>
                            <input
                                type="text"
                                name="vehicleName"
                                className="input-box"
                                placeholder="Vehicle Name"
                                value={vehicleForm.vehicleName}
                                onChange={handleVehicleInputChange}
                                required
                            />

                            <div className="vehicle-modal-row">
                                <input
                                    type="text"
                                    name="vehicleType"
                                    className="input-box"
                                    placeholder="Vehicle Type"
                                    value={vehicleForm.vehicleType}
                                    onChange={handleVehicleInputChange}
                                    required
                                />
                                <input
                                    type="text"
                                    name="brand"
                                    className="input-box"
                                    placeholder="Brand"
                                    value={vehicleForm.brand}
                                    onChange={handleVehicleInputChange}
                                    required
                                />
                            </div>

                            <div className="vehicle-modal-row">
                                <input
                                    type="text"
                                    name="model"
                                    className="input-box"
                                    placeholder="Model"
                                    value={vehicleForm.model}
                                    onChange={handleVehicleInputChange}
                                    required
                                />
                                <input
                                    type="number"
                                    name="pricePerDay"
                                    className="input-box"
                                    placeholder="Price per day"
                                    value={vehicleForm.pricePerDay}
                                    onChange={handleVehicleInputChange}
                                    required
                                    min="0"
                                />
                            </div>

                            <input
                                type="text"
                                name="location"
                                className="input-box"
                                placeholder="Location"
                                value={vehicleForm.location}
                                onChange={handleVehicleInputChange}
                                required
                            />

                            <textarea
                                name="description"
                                className="vehicle-modal-textarea"
                                placeholder="Description"
                                value={vehicleForm.description}
                                onChange={handleVehicleInputChange}
                                required
                            />

                            <div className="vehicle-modal-row">
                                <div className="vehicle-availability-wrap">
                                    <label className="vehicle-select-label" htmlFor="vehicleAvailability">
                                        Availability
                                    </label>
                                    <select
                                        id="vehicleAvailability"
                                        name="isAvailable"
                                        className="vehicle-select"
                                        value={vehicleForm.isAvailable}
                                        onChange={handleVehicleInputChange}
                                    >
                                        <option value="true">Available</option>
                                        <option value="false">Unavailable</option>
                                    </select>
                                </div>

                                <label className="vehicle-upload-label">
                                    Upload Images
                                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
                                </label>
                            </div>

                            {imagePreviews.length > 0 && (
                                <div className="vehicle-image-previews">
                                    {imagePreviews.map((preview, index) => (
                                        <img key={`${preview}-${index}`} src={preview} alt={`Vehicle preview ${index + 1}`} />
                                    ))}
                                </div>
                            )}

                            <button className="signup-button" type="submit" disabled={vehicleModalLoading}>
                                {vehicleModalLoading ? "Saving..." : vehicleSubmitLabel}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vehicles;