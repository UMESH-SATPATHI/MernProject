import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import authApi from "../services/authService";


const Navbar = () => {
    let navigate = useNavigate();
    const { user, logout } = useAuth();

    async function handleLogOut() {
        try {
            let res = await authApi.post("/logout");
            logout();
        } catch (error) {
            console.log(error.response);
        }
    }

    return (
        <nav className="navbar bg-body-tertiary">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    <img src="null" alt="Logo" width="30" height="24" className="d-inline-block align-text-top" />
                    Bootstrap
                </Link>
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <Link to="/">Home</Link>
                    </li>
                    {
                        user ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/" onClick={handleLogOut}>Log Out</Link>
                                </li>
                                <span className="nav-link" >Welcome, {user?.user?.name || user?.name || "User"}</span>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/signup">SignUp</Link>
                                </li>
                            </>
                        )
                    }
                </ul>
            </div>
        </nav>
    )
}

export default Navbar
