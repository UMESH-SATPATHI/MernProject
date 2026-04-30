import "../styles/home.css";
import { Link } from "react-router-dom";
import heroImage from "../assets/p2p.png";
function Home() {
    return (
        <>
            <nav className="home-nav">
                <p>Vehicle Rental</p>
                <div className="home-nav-links">
                    <Link to="/home">Find Vehicles</Link>
                    <Link to="/about">Reserve Vehicle</Link>
                    <Link to="/contact">See Pricing</Link>
                    <Link to="/contact">Explore Categories</Link>
                    <Link to="/signup">Become an Owner</Link>
                </div>
            </nav>
            <div className="home-hero">
                <div className="home-hero-content">
                    <div className="location-container">
                        <span className="location-icon" aria-hidden="true"></span>
                        <p className="location">Bhubaneswar IN</p>
                        <button className="change-location-btn">Change Location</button>
                    </div>
                    
                    <div className="search-container">
                        <h1 className="home-hero-title">Find Your Perfect Ride</h1>
                        <p className="home-hero-description">Discover a wide range of vehicles for rent, from cars to bikes, and book your next adventure with ease.</p>
                        <div className="home-search">
                            <input type="text" placeholder="Search Location" className="home-search-input" />
                            <input type="text" placeholder="Vehicle Type" className="home-search-input" />
                            <input type="date" aria-label="From date" className="home-search-input" />
                            <input type="date" aria-label="To date" className="home-search-input" />
                            <button className="home-search-button">See Vehicles</button>
                        </div>
                    </div>
                </div>
                <div className="hero-image-container">
                    <img src={heroImage} alt="Hero" className="hero-img" />
                </div>
            </div>
        </>
    );
};

export default Home;
