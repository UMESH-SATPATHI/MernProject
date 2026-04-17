import { Link } from "react-router-dom"
import "./Navbar.css"

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <h1>P2P Vehicle Rental</h1>
                </div>
                <ul className="nav-menu">
                    <li className="nav-item">
                        <Link to="/" className="nav-link">
                            Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/signup" className="nav-link">
                            Signup
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    )
}

export default Navbar
