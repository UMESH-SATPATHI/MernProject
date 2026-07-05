import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import authApi from "../services/authService";
import { getUnreadNotifications } from "../services/notificationService";
import logoImg from "../assets/logo.jpg";
import "../styles/navbar.css";


const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notificationCount, setNotificationCount] = useState(0);
    const myItemsLabel = user?.role === "owner" ? "My Vehicles" : "My Bookings";
    const myItemsPath = user?.role === "owner" ? "/my-vehicles" : "/my-bookings";
    const profileImageSrc =
        user?.profileImage?.thumbnailUrl ||
        user?.user?.profileImage?.thumbnailUrl ||
        "";

    const loadUnreadCount = async () => {
        if (!user) {
            setNotificationCount(0);
            return;
        }

        try {
            const response = await getUnreadNotifications();
            setNotificationCount(response.data?.notifications?.length || 0);
        } catch (error) {
            if (error.response?.status === 404) {
                setNotificationCount(0);
            }
        }
    };

    useEffect(() => {
        loadUnreadCount();
    }, [user]);

    useEffect(() => {
        const handleNotificationChange = () => {
            loadUnreadCount();
        };

        window.addEventListener("notifications:changed", handleNotificationChange);
        return () => window.removeEventListener("notifications:changed", handleNotificationChange);
    }, [user]);

    async function handleLogout() {
        try {
            await authApi.post("/logout");
            logout();
            navigate("/home");
        } catch (error) {
            console.log(error.response);
        }
    };
    return (
        <nav className="nav-container">
            <div className="nav-logo-container">
                <Link to="/home" className="nav-logo">
                    <img src={logoImg} alt="MotoMe Logo" className="logo-image" />
                </Link>
                <Link to="/home">MotoMe</Link>
            </div>
            <div className="nav-links">
                <NavLink to="/home">Home</NavLink>
                <NavLink to="/vehicles">Browse Vehicles</NavLink>
                <NavLink to={myItemsPath}>{myItemsLabel}</NavLink>
                {user ? (
                    <>
                        <NavLink to="/profile">Profile</NavLink>
                        <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
                    </>
                ) : (
                    <>
                        <NavLink to="/login">Login</NavLink>
                        <NavLink to="/signup">Sign Up</NavLink>
                    </>
                )}
            </div>
            <div className="nav-profile">
                <div className="profile-info">
                    <span className="profile-name">Welcome, <em>{user?.name.split(" ")[0] || user?.user?.name.split(" ")[0] || "User"}</em></span>
                    <Link to="/profile">
                        {profileImageSrc ? (
                            <img src={profileImageSrc} alt="Profile" className="profile-image" />
                        ) : (
                            <div className="profile-placeholder">{(user?.name || user?.user?.name)?.[0]?.toUpperCase() || "U"}</div>
                        )}
                    </Link>
                </div>
            </div>
            <div className="nav-notification">
                <Link to="/notifications">
                    <span className="notification-icon">🔔</span>
                    {notificationCount > 0 && <span className="notification-count">{notificationCount}</span>}
                </Link>
            </div>
        </nav >
    )
};
export default Navbar;