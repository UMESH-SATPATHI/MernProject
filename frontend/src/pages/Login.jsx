import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate, Link } from "react-router-dom";
import authApi from "../services/authService";
import visibleIcon from "../assets/visible.svg";
import notVisibleIcon from "../assets/not_visible.svg";
import "../styles/signup.css";

const Login = () => {
    let [formData, setFormData] = useState({ email: "", password: "" });
    let [rememberMe, setRememberMe] = useState(false);
    let [showPassword, setShowPassword] = useState(false);
    let [message, setMessage] = useState("");
    let [error, setError] = useState(false);
    let [loading, setLoading] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    function handleChange(e) {
        let { name, value } = e.target;
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
        setError("");
        setLoading(true);

        try {
            let res = await authApi.post("/login", formData);
            let data = res.data;
            login(data);
            
            if (rememberMe) {
                localStorage.setItem("rememberMe", JSON.stringify({ email: formData.email }));
            } else {
                localStorage.removeItem("rememberMe");
            }
            
            setMessage("");
            setError(false);
            // setFormData({ email: "", password: "" });
            navigate("/home");
        } catch (error) {
            console.log(error.response);
            setError(true);
            setMessage(error?.response?.data?.message);
        }
        finally{
            setLoading(false);
        }
    }

    return (
        <div className="signup-container">
            <p className="title">Welcome Back <em>User</em></p>
            <p className="subtitle">Login to your Account with your email ID</p>
            <div className="login-container">
                <p className={error ? 'error-message' : 'success-message'}>{message}</p>
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
                    <button className="signup-button" type="submit">{loading?"loading...":"login"}</button>
                </form>
            </div>
            <p className="footer">Don't have an account? <Link to="/signup" className="signup-link">Sign Up here</Link></p>
        </div>
    );
}

export default Login;