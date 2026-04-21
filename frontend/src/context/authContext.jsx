import { createContext, useContext, useState, useEffect } from "react";
import authApi from "../services/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(false);

    const login = (userData) => { setUser(userData) };
    const logout = () => { setUser(false) };

    async function getCurrentUser() {
        try {
            let res = await authApi.get("/profile");
            let data = res.data.user;
            setUser(data);
        } catch (error) {
            console.log(error.response);
            setUser(false);
        }
    }
    useEffect(() => {
        getCurrentUser()
    }, []);
    
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );

}
export function useAuth() {
    return useContext(AuthContext);
}