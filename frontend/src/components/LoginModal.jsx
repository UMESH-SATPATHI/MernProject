import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import authApi from "../services/authService";
import visibleIcon from "../assets/visible.svg";
import notVisibleIcon from "../assets/not_visible.svg";
import "../styles/signup.css";
import "../styles/loginModal.css";

const LoginModal = () => {
    const navigate = useNavigate();
    const { login, authModalOpen, authModalReturnTo, closeAuthModal } = useAuth();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!authModalOpen) {
            setFormData({ email: "", password: "" });
            setRememberMe(false);
            setShowPassword(false);
            setMessage("");
            setError(false);
        }
    }, [authModalOpen]);

    useEffect(() => {
        if (!authModalOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [authModalOpen]);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    function handleRememberMe(e) {
        setRememberMe(e.target.checked);
    }

    function togglePasswordVisibility() {
        setShowPassword(!showPassword);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage("");
        setError(false);

        try {
            const res = await authApi.post("/login", formData);
            login(res.data.user || res.data);

            if (rememberMe) {
                localStorage.setItem("rememberMe", JSON.stringify({ email: formData.email }));
            } else {
                localStorage.removeItem("rememberMe");
            }

            closeAuthModal();
            navigate(authModalReturnTo || "/home", { replace: true });
        } catch (error) {
            setError(true);
            setMessage(error?.response?.data?.message || "Login failed");
        }
    }

    if (!authModalOpen) {
        return null;
    }

    return (
        <div className="login-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
            <div className="login-modal-card">
                <p className="title" id="login-modal-title">Welcome Back <em>User</em></p>
                <p className="subtitle">Login to your Account with your email ID</p>
                <div className="login-container login-modal-container">
                    <p className={error ? "error-message" : "success-message"}>{message}</p>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="input-box"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                className="input-box password-input"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={togglePasswordVisibility}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                <img
                                    src={showPassword ? visibleIcon : notVisibleIcon}
                                    alt={showPassword ? "Hide password" : "Show password"}
                                    className="password-toggle-icon"
                                />
                            </button>
                        </div>
                        <div className="remember-forgot-container">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={handleRememberMe}
                                />
                                Remember Me
                            </label>
                            <Link to="/forgot-password" className="forgot-password-link">
                                Forgot Password?
                            </Link>
                        </div>
                        <button className="signup-button" type="submit">Login</button>
                    </form>
                </div>
                <p className="footer">Don't have an account? <Link to="/signup" className="signup-link">Sign Up here</Link></p>
            </div>
        </div>
    );
};

export default LoginModal;