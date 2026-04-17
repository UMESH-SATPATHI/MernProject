import { createBrowserRouter } from "react-router-dom";

import Layout from "./components/Layout";
import LoginPage from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/home";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { path: "/signup", element: <SignUp /> },
            { path: "/login", element: <LoginPage /> }
        ]
    }
]);

export default router;