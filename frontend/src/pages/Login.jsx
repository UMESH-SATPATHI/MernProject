import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import authApi from "../services/authService";

const Login = () => {
    let [formData, setFormData] = useState({ email: "", password: "" });
    let [message, setMessage] = useState("");
    let [error, setError] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    function handleChange(e) {
        let { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            let res = await authApi.post("/login", formData);
            let data = res.data;
            login(data);
            setMessage("");
            setError(false);
            setFormData({ email: "", password: "" });
            navigate("/");
        } catch (error) {
            console.log(error.response);
            setError(true)
            setMessage(error?.response?.data?.message)
        }
    }
    return (
        <>
            <div className="row">
                <div className="col-md-5 mx-auto">
                    <h3>Sign In</h3>
                    <p className={error ? 'text-danger' : 'text-success'}>{message}</p>
                    <form method="post" onSubmit={handleSubmit}>

                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="form-control mb-2"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="form-control mb-2"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <input type="submit" value="Sign In" className="btn btn-primary" />
                    </form>
                </div>
            </div>
        </>
    )
}

export default Login;