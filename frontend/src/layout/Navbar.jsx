import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import authApi from "../services/authService";
import logoImg from "../assets/logo.jpg";
import "../styles/navbar.css";


const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const profileImageSrc =
        user?.profileImage?.thumbnailUrl ||
        user?.user?.profileImage?.thumbnailUrl ||
        "";

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
                <NavLink to="/">My Bookings</NavLink>
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
                    <span className="profile-name">Welcome, <em>{user?.name || user?.user?.name || "User"}</em></span>
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
                    <span className="notification-count"></span>
                </Link>
            </div>
        </nav >
    )
};
export default Navbar;