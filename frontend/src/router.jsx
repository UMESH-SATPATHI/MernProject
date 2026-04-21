import { createBrowserRouter } from "react-router-dom";

import Layout from "./layout/Layout";
import LoginPage from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/home";
import AddVehicle from "./pages/AddVehicle";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: "/signup", element: <SignUp /> },
            { path: "/login", element: <LoginPage /> },
            { path: "/AddVehicle", element: <AddVehicle /> },
        ]
    }
]);

export default router;