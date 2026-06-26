import "../styles/footer.css";

function Footer() {
    return (
        <footer className="app-footer">
            <div className="app-footer-inner">
                <p>Copyright 2026. All rights reserved.</p>
                <div className="app-footer-links">
                    <a href="/home">Home</a>
                    <a href="/vehicles">Vehicles</a>
                    <a href="/profile">Profile</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer