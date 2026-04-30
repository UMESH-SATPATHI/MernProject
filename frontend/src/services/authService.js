import axios from "axios";

const authApi = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/auth`,
    withCredentials: true,
});

authApi.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || "";
        const isAuthRequest = requestUrl.includes("/login") || requestUrl.includes("/register");
        const skipAuthModal = error.config?.skipAuthModal;

        if (status === 401 && !isAuthRequest && !skipAuthModal) {
            const returnTo = `${window.location.pathname}${window.location.search}`;
            window.dispatchEvent(
                new CustomEvent("auth:login-required", {
                    detail: { returnTo },
                })
            );
        }

        return Promise.reject(error);
    }
);

export default authApi;