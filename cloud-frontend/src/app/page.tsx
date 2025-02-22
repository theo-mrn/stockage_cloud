"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

interface FileData {
    filename: string;
    filepath: string;
}

export default function Home() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const loadFiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get("http://localhost:3001/files", { withCredentials: true });
            setFiles(response.data);
        } catch (err: unknown) {
            const errorMessage = err instanceof AxiosError 
                ? err.response?.data?.message || "Impossible de charger les fichiers."
                : "Impossible de charger les fichiers.";
            setError(errorMessage);
            if (err instanceof AxiosError && err.response?.status === 401) {
                router.push("/login");
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Veuillez sélectionner un fichier.");
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            
            await axios.post("http://localhost:3001/files/upload", formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            
            setSelectedFile(null);
            await loadFiles();
        } catch (err: unknown) {
            const errorMessage = err instanceof AxiosError 
                ? err.response?.data?.message || "Erreur lors de l'upload. Vérifiez votre connexion."
                : "Erreur lors de l'upload. Vérifiez votre connexion.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex flex-col items-center justify-center p-8">
            <h2 className="text-2xl font-bold mb-4">Cloud Personnel</h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <input type="file" onChange={handleFileChange} className="mb-4" />
            <button 
                onClick={handleUpload} 
                className={`bg-blue-500 text-white px-4 py-2 rounded ${loading ? "opacity-50 cursor-not-allowed" : ""}`} 
                disabled={loading}
            >
                {loading ? "Uploading..." : "Uploader"}
            </button>

            {loading ? (
                <p>Chargement...</p>
            ) : (
                <ul className="mt-6 space-y-2">
                    {files.length === 0 ? (
                        <p>Aucun fichier disponible.</p>
                    ) : (
                        files.map((file, index) => (
                            <li key={index}>
                                <a href={`http://localhost:3001${file.filepath}`} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                                    {file.filename}
                                </a>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </main>
    );
}