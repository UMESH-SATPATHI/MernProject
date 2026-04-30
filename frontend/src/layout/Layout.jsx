import { Outlet } from "react-router-dom";
// import Footer from "./Footer";
import Navbar from "./Navbar";
import LoginModal from "../components/LoginModal";

function Layout() {
    return (
        <>
            <Navbar />
            <main className="app-main">
                <Outlet />
            </main>
            <LoginModal />
            {/* <Footer /> */}
        </>
    )
}
export default Layout;