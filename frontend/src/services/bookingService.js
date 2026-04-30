import axios from "axios";

const bookingApi = axios.create({
	baseURL: `${import.meta.env.VITE_API_URL}/api/bookings`,
	withCredentials: true,
});

export const createBooking = (bookingData) => 
	bookingApi.post("/", bookingData);

export const getRenterBookings = () => 
	bookingApi.get("/renter");

export const getOwnerBookings = () => 
	bookingApi.get("/owner");

export const updateBookingStatus = (bookingId, status) => 
	bookingApi.put(`/${bookingId}/update`, { status });

export const confirmOwnerApproval = (bookingId) => 
	bookingApi.put(`/${bookingId}/confirm`, {});

export const cancelBooking = (bookingId) => 
	bookingApi.put(`/${bookingId}/cancel`, {});

export const markBookingCompleted = (bookingId) => 
	bookingApi.put(`/${bookingId}/markCompleted`, {});

export default bookingApi;
