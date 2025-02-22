import axios from "axios";

const API_URL = "http://localhost:3001";

// ✅ Toujours envoyer les cookies avec les requêtes
axios.defaults.withCredentials = true;

export const login = async (email, password) => {
    return await axios.post(`${API_URL}/auth/login`, { email, password });
};

export const logout = async () => {
    return await axios.post(`${API_URL}/auth/logout`);
};

export const getFiles = async () => {
    return await axios.get(`${API_URL}/files`);
};