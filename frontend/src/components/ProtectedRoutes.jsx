import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

function ProtectedRoute({children}){
    const {user, loading} = useAuth();

    if(loading){
        return <h2>Loading...</h2>
    }

    if (!user){
        return <Navigate to="/home" replace/>;
    }

    return children;
};

export default ProtectedRoute;  