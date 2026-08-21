import "../styles/vehicles.css";

const SearchCard = ({ location, onLocationChange, onSearch, onClear, loading}) => {
    const handleSubmit = (event) => {
        event.preventDefault();
        onSearch();
    };

    return (
        <section className="vehicle-search-card" aria-label="Search vehicles by location">
            <div className="vehicle-search-card-header">
                <p className="vehicle-search-kicker">Search Vehicles</p>
                <h2>Find vehicles near a location</h2>
                <p>Use location only to filter the browse page results.</p>
            </div>

            <form className="vehicle-search-form" onSubmit={handleSubmit}>
                <div className="vehicle-search-row">
                    <div className="vehicle-search-input-wrap">
                        <input
                            type="text"
                            className="input-box vehicle-search-input"
                            placeholder="Enter location"
                            value={location}
                            onChange={onLocationChange}
                        />
                        {location && (
                            <button
                                type="button"
                                className="vehicle-search-input-clear"
                                onClick={onClear}
                                disabled={loading}
                                aria-label="Clear location search"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <button className="signup-button vehicle-search-submit-btn" type="submit" disabled={loading}>
                        Search
                    </button>
                </div>
            </form>
        </section>
    );
};

export default SearchCard;