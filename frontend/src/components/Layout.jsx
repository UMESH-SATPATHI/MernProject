import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

function Layout() {
    return (
        <>
            <Navbar />
            <Main>
                <Outlet />
            </Main>
            <Footer />
        </>
    )
}
export default Layout;