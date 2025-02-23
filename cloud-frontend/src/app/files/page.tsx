"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

interface FileData {
    filename: string;
    filepath: string;
}

export default function FilesPage() {
    const [files, setFiles] = useState<FileData[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const loadFiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get("https://sigrid.site/files", { withCredentials: true });
            setFiles(response.data);
        } catch (err: unknown) {
            const errorMessage = err instanceof AxiosError 
                ? err.response?.data?.message || "Non connecté !"
                : "Non connecté !";
            setError(errorMessage);
            router.push("/login"); // Redirection vers /login
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Veuillez sélectionner un fichier.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            await axios.post("https://sigrid.site/files/upload", formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            setSelectedFile(null);
            await loadFiles(); // Recharge la liste des fichiers après upload
        } catch (err: unknown) {
            const errorMessage = err instanceof AxiosError 
                ? err.response?.data?.message || "Erreur lors de l'upload. Vérifiez votre connexion."
                : "Erreur lors de l'upload. Vérifiez votre connexion.";
            setError(errorMessage);
        }
    };

    const handleLogout = async () => {
        await axios.post("https://sigrid.site/auth/logout", {}, { withCredentials: true });
        router.push("/login");
    };

    return (
        <main className="flex flex-col items-center justify-center p-8">
            <h2 className="text-2xl font-bold mb-4">Mes fichiers</h2>

            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded mb-4">
                Déconnexion
            </button>

            {error && <p className="text-red-500">{error}</p>}

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
                                <a href={`https://sigrid.site${file.filepath}`} target="_blank" rel="noopener noreferrer" className="text-blue-600">
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
