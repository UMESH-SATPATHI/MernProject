import axios from "axios";

const vehicleApi = axios.create({
	baseURL: `${import.meta.env.VITE_API_URL}/api/vehicles`,
	withCredentials: true,
});

export const getAllVehicles = () => vehicleApi.get("/");

export const getVehicleById = (vehicleId) => vehicleApi.get(`/${vehicleId}`);

export const searchVehicles = (searchKey) =>
	vehicleApi.post("/search", { searchKey });

export const createVehicle = (formData) =>
	vehicleApi.post("/", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});

export const updateVehicle = (vehicleId, formData) =>
	vehicleApi.put(`/${vehicleId}`, formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});

export const deleteVehicle = (vehicleId) => vehicleApi.delete(`/${vehicleId}`);

export default vehicleApi;

