import "../styles/home.css";
import { Link } from "react-router-dom";
import heroImage from "../assets/p2p.png";

const dummyVehicles = [
    {
        id: 1,
        name: "Hyundai i20",
        type: "Hatchback",
        location: "Bhubaneswar",
        price: "Rs 1,499/day",
    },
    {
        id: 2,
        name: "Kia Seltos",
        type: "SUV",
        location: "Cuttack",
        price: "Rs 2,699/day",
    },
    {
        id: 3,
        name: "Honda City",
        type: "Sedan",
        location: "Puri",
        price: "Rs 1,999/day",
    },
    {
        id: 4,
        name: "Royal Enfield Classic 350",
        type: "Bike",
        location: "Bhubaneswar",
        price: "Rs 899/day",
    },
    {
        id: 5,
        name: "Mahindra Thar",
        type: "SUV",
        location: "Konark",
        price: "Rs 3,199/day",
    },
    {
        id: 6,
        name: "TVS Ntorq",
        type: "Scooter",
        location: "Cuttack",
        price: "Rs 599/day",
    },
];

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

            <section className="home-listing-section" aria-label="Popular vehicles">
                <div className="home-listing-header">
                    <h2>Popular Vehicles</h2>
                    <p>Temporary sample listings to fill this page.</p>
                </div>

                <div className="home-card-grid">
                    {dummyVehicles.map((vehicle) => (
                        <article className="home-vehicle-card" key={vehicle.id}>
                            <div className="home-vehicle-card-top">
                                <span className="home-vehicle-type">{vehicle.type}</span>
                                <span className="home-vehicle-location">{vehicle.location}</span>
                            </div>
                            <h3>{vehicle.name}</h3>
                            <p className="home-vehicle-price">{vehicle.price}</p>
                            <button type="button" className="home-vehicle-btn">View Details</button>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
};

export default Home;
