import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoutes";
import Layout from "./layout/Layout";
import LoginPage from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Vehicles from "./pages/Vehicles";
import VehicleDetails from "./pages/VehicleDetails";
import Notifications from "./pages/Notifications";
import MyItems from "./pages/MyItems";
// import AddVehicle from "./pages/AddVehicle";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, path: "/home", element: <Home /> },
            { path: "/vehicles", element: <Vehicles /> },
            { path: "/vehicles/:id", element: <VehicleDetails /> },
            { path: "/signup", element: <SignUp /> },
            { path: "/login", element: <LoginPage /> },
            { path: "/profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
            { path: "/notifications", element: <ProtectedRoute><Notifications /></ProtectedRoute> },
            { path: "/my-bookings", element: <ProtectedRoute><MyItems /></ProtectedRoute> },
            { path: "/my-vehicles", element: <ProtectedRoute><MyItems /></ProtectedRoute> },
            // { path: "/AddVehicle", element: <AddVehicle /> },
        ]
    }
]);

export default router;