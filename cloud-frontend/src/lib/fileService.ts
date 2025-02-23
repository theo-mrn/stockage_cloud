import axios, { AxiosResponse } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Configuration globale d'axios
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Création d'une instance axios avec la configuration par défaut
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Log des requêtes et réponses
axiosInstance.interceptors.request.use(
    request => {
        console.log('Requête sortante:', {
            url: request.url,
            method: request.method,
            data: request.data,
            headers: request.headers
        });
        return request;
    },
    error => {
        console.error('Erreur de requête:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    response => {
        console.log('Réponse reçue:', {
            status: response.status,
            data: response.data,
            headers: response.headers
        });
        return response;
    },
    error => {
        if (error.response) {
            console.error('Erreur de réponse:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        }
        return Promise.reject(error);
    }
);

export interface User {
    id: number;
    username: string;
    email: string;
}

export interface FileInfo {
    id: string;
    filename: string;
    filepath: string;
    type: 'folder' | 'file' | 'image' | 'video' | 'audio' | 'document';
    size?: string;
    modified: string;
    user_id: number;
    favorite?: boolean;
    color?: string;
    parentId?: string | null;
    name?: string;
    preview?: string;
}

export interface AuthResponse {
    user: User;
}

// Services d'authentification
export const authService = {
    login: async (email: string, password: string): Promise<AxiosResponse<AuthResponse>> => {
        try {
            return await axiosInstance.post('/auth/login', { email, password });
        } catch (error) {
            console.error('Erreur lors du login:', error);
            throw error;
        }
    },

    logout: async (): Promise<AxiosResponse<void>> => {
        try {
            return await axiosInstance.post('/auth/logout');
        } catch (error) {
            console.error('Erreur lors du logout:', error);
            throw error;
        }
    },

    register: async (username: string, email: string, password: string): Promise<AxiosResponse<AuthResponse>> => {
        try {
            return await axiosInstance.post('/auth/register', { username, email, password });
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            throw error;
        }
    },

    checkAuth: async (): Promise<AxiosResponse<AuthResponse>> => {
        try {
            return await axiosInstance.get('/auth/check');
        } catch (error) {
            console.error('Erreur lors de la vérification d\'authentification:', error);
            throw error;
        }
    }
};

// Services de gestion des fichiers
export const fileService = {
    getFiles: async (): Promise<AxiosResponse<FileInfo[]>> => {
        try {
            return await axiosInstance.get('/files');
        } catch (error) {
            console.error('Erreur lors de la récupération des fichiers:', error);
            throw error;
        }
    },

    uploadFile: async (formData: FormData): Promise<AxiosResponse<FileInfo>> => {
        try {
            return await axiosInstance.post('/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'upload du fichier:', error);
            throw error;
        }
    },

    deleteFile: async (fileId: string): Promise<AxiosResponse<void>> => {
        try {
            return await axiosInstance.delete(`/files/${fileId}`);
        } catch (error) {
            console.error('Erreur lors de la suppression du fichier:', error);
            throw error;
        }
    },

    updateFile: async (fileId: string, data: Partial<FileInfo>): Promise<AxiosResponse<FileInfo>> => {
        try {
            return await axiosInstance.put(`/files/${fileId}`, data);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du fichier:', error);
            throw error;
        }
    },

    downloadFile: async (filepath: string): Promise<Blob> => {
        try {
            const response = await axiosInstance.get(filepath, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors du téléchargement du fichier:', error);
            throw error;
        }
    }
};
