import { useState } from "react";
import authApi from "../services/authService";

const signUp = () => {
    let [formData, setFormData] = useState({ name: "", email: "", password: "", role: "" });
    let [message, setMessage] = useState("");
    let [error, setError] = useState(false);

    function handleChange(e) {
        let { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            let res = await authApi.post("/register", formData);
            setError("false");
            setMessage("Account created");
            setFormData({ name: "", email: "", password: "", role: "" });
        } catch (error) {
            setError(true);
            console.log(error.response);
            setMessage(error?.response?.data?.message);
        }
    }
    console.log(formData);

    return (
        <>
            <div className="row">
                <div className="col-md-5 mx-auto">
                    <h3>Sign Up</h3>
                    <p className={error ? 'text-danger' : 'text-success'}>{message}</p>
                    <form method="post" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            className="form-control mb-2"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="email"
                            placeholder="email"
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
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="">Select Role</option>
                            <option value="owner">Owner</option>
                            <option value="renter">Renter</option>
                        </select>
                        <input type="submit" value="Sign Up" className="btn btn-primary" />
                    </form>
                </div>
            </div>
        </>
    );

};

export default signUp;