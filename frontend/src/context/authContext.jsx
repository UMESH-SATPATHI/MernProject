import { createContext, useContext, useState, useEffect } from "react";
import authApi from "../services/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalReturnTo, setAuthModalReturnTo] = useState("/home");

    const login = (userData) => {
        const normalizedUser = userData?.user || userData;
        setUser(normalizedUser);
        setAuthModalOpen(false);
    };
    const logout = () => { setUser(null) };

    const openAuthModal = (returnTo = "/home") => {
        setAuthModalReturnTo(returnTo || "/home");
        setAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setAuthModalOpen(false);
    };

    async function getCurrentUser(options = {}) {
        try {
            let res = await authApi.get("/profile", {
                skipAuthModal: options.skipAuthModal || false,
            });
            let data = res.data.user;
            setUser(data);
        } catch (error) {
            console.log(error.response);
            setUser(null);
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        getCurrentUser({ skipAuthModal: true });
    }, []);

    useEffect(() => {
        const handleLoginRequired = (event) => {
            const returnTo = event.detail?.returnTo || window.location.pathname || "/home";
            openAuthModal(returnTo);
        };

        window.addEventListener("auth:login-required", handleLoginRequired);
        return () => window.removeEventListener("auth:login-required", handleLoginRequired);
    }, []);
    
    return (
        <AuthContext.Provider value={{ user, login, logout, getCurrentUser, loading, authModalOpen, authModalReturnTo, openAuthModal, closeAuthModal }}>
            {children}
        </AuthContext.Provider>
    );

}
export function useAuth() {
    return useContext(AuthContext);
}