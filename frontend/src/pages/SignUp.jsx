import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import authApi from "../services/authService";
import visibleIcon from "../assets/visible.svg";
import notVisibleIcon from "../assets/not_visible.svg";
import "../styles/signup.css";

const SignUp = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [error, setError] = useState(false);
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({ "name": "", "email": "", "password": "", "role": "" });
    const [showPassword, setShowPassword] = useState(false);
    //to change button color on click
    const [selectedRole, setSelectedRole] = useState("");

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }
    function handleRoleChange(value) {
        setFormData({ ...formData, role: value });
        setSelectedRole(value);
    }
    function togglePasswordVisibility() {
        setShowPassword(!showPassword);
    }
    async function handleSubmit(e) {
        e.preventDefault();

        setMessage("");
        setError(false);

        try {
            const res = await authApi.post("/register", formData);
            login(res.data.user);
            setMessage("Account created successfullu");
            setError(false);
            setFormData(
                {
                    "name": "",
                    "email": "",
                    "password": "",
                    "role": ""
                }
            );
            navigate("/home");
        } catch (error) {
            setError(true);
            console.log(error.response);
            setMessage(
                error?.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    return (
        <div className="signup-container">
            <p className="title">Welcome to <em>MotoMe</em></p>
            <p className="subtitle">Sign Up to your Account with your email ID</p>
            <div className="login-container">
                <form onSubmit={handleSubmit}>
                    <input
                        name="name"
                        type="text"
                        placeholder="name"
                        className="input-box"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="email"
                        type="text"
                        placeholder="email"
                        className="input-box"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <div className="password-input-container">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="password"
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
                    <div className="button-container">
                        <input
                            name="role"
                            type="button"
                            placeholder="role"
                            value="Renter"
                            className={
                                selectedRole === "renter" ? "role-button focused" : "role-button"
                            }
                            onClick={() => handleRoleChange("renter")}
                            required
                        />
                        <input
                            name="role"
                            type="button"
                            placeholder="role"
                            value="Owner"
                            className={
                                selectedRole === "owner" ? "role-button focused" : "role-button"
                            }
                            onClick={() => handleRoleChange("owner")}
                            required
                        />
                    </div>
                    <button className="signup-button" type="submit">Sign Up</button>
                </form>
            </div>
            <p className="footer">By signing up, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
    );


};

export default SignUp;