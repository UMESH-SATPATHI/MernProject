import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import authApi from "../services/authService";
import "../styles/profile.css";

const Profile = () => {
    const { user, logout, getCurrentUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        currentPassword: "",
        newPassword: "",
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    useEffect(() => {
        getCurrentUser();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                currentPassword: "",
                newPassword: "",
            });
            setImagePreview(user.profileImage?.url || "");
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = async () => {
        try {
            setLoading(true);
            await authApi.delete("/removeProfileImage");
            setMessage({ type: "success", text: "Image removed successfully." });
            setImageFile(null);
            setImagePreview("");
            await getCurrentUser();
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to remove image" });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveChanges = async () => {
        try {
            setLoading(true);
            const hasNameChange = formData.name !== (user?.name || "");
            const hasEmailChange = formData.email !== (user?.email || "");
            const hasPasswordChange = Boolean(formData.newPassword);
            const hasImageChange = Boolean(imageFile);
            const hasAnyChange = hasNameChange || hasEmailChange || hasPasswordChange || hasImageChange;

            if (hasPasswordChange && !formData.currentPassword) {
                setMessage({ type: "error", text: "Current password is required to change password" });
                return;
            }

            if (!hasAnyChange) {
                setMessage({ type: "error", text: "No changes to save" });
                return;
            }

            const payload = hasImageChange ? new FormData() : {};

            if (hasImageChange) {
                if (hasNameChange) payload.append("name", formData.name);
                if (hasEmailChange) payload.append("email", formData.email);
                if (hasPasswordChange) {
                    payload.append("currentPassword", formData.currentPassword);
                    payload.append("newPassword", formData.newPassword);
                }
                payload.append("profileImage", imageFile);
            } else {
                if (hasNameChange) payload.name = formData.name;
                if (hasEmailChange) payload.email = formData.email;
                if (hasPasswordChange) {
                    payload.currentPassword = formData.currentPassword;
                    payload.newPassword = formData.newPassword;
                }
            }

            const response = await authApi.put("/profile", payload, hasImageChange
                ? { headers: { "Content-Type": "multipart/form-data" } }
                : undefined
            );

            setMessage({ type: "success", text: "Profile updated successfully." });
            setIsEditing(false);
            setImageFile(null);
            setFormData(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: ""
            }));
            setImagePreview(response.data?.user?.profileImage?.url || imagePreview);
            await getCurrentUser();
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile" });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure? This action cannot be undone!")) return;

        try {
            setLoading(true);
            await authApi.delete("/delete");
            setMessage({ type: "success", text: "Account deleted successfully" });
            logout();
            navigate("/home");
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to delete account" });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setImageFile(null);
        setFormData({
            name: user?.name || "",
            email: user?.email || "",
            currentPassword: "",
            newPassword: "",
        });
        setImagePreview(user?.profileImage?.thumbnailUrl || user?.profileImage?.url || "");
        setMessage({ type: "", text: "" });
    };

    const profileSrc = imagePreview ||user?.profileImage?.url || "";

    return (
        <div className="profile-container">
            <h2>My Profile</h2>
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            <div className="profile-image-section">
                <div className="profile-image-panel">
                    <div className="image-preview">
                        {profileSrc ? (
                            <img src={profileSrc} alt="Profile" className="profile-image" />
                        ) : (
                            <div className="placeholder-image">No Image</div>
                        )}
                    </div>

                    {isEditing && (
                        <div className="image-actions">
                            <input
                                type="file"
                                id="imageUpload"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: "none" }}
                            />
                            <button type="button" onClick={() => document.getElementById("imageUpload").click()} disabled={loading}>
                                {profileSrc ? "Change Image" : "Upload Image"}
                            </button>
                            {profileSrc && (
                                <button type="button" onClick={handleRemoveImage} disabled={loading}>
                                    Remove Image
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="profile-details">
                    <div className="profile-field">
                        <label>Name:</label>
                        {isEditing ? (
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                        ) : (
                            <span>{user?.name}</span>
                        )}
                    </div>

                    <div className="profile-field">
                        <label>Email:</label>
                        {isEditing ? (
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                        ) : (
                            <span>{user?.email}</span>
                        )}
                    </div>

                    <div className="profile-field">
                        <label>Role:</label>
                        <span>{user?.role}</span>
                    </div>

                    {isEditing && (
                        <>
                            <div className="profile-field">
                                <label>Current Password:</label>
                                <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} />
                            </div>
                            <div className="profile-field">
                                <label>New Password:</label>
                                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} />
                            </div>
                        </>
                    )}

                    <div className="profile-actions">
                        {isEditing ? (
                            <>
                                <button type="button" onClick={handleSaveChanges} disabled={loading}>
                                    Save Profile
                                </button>
                                <button type="button" onClick={handleCancel} disabled={loading}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button type="button" onClick={() => setIsEditing(true)} disabled={loading}>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="delete-account">
                        <button type="button" onClick={handleDeleteAccount} disabled={loading} className="delete-btn">
                            Delete Account
                        </button>
                    </div>

                    <div className="logout-section">
                        <button type="button" onClick={logout} disabled={loading} className="logout-btn">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;