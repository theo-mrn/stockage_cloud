"use client";
import { useState, useEffect } from "react";
import { uploadFile, getFiles } from "../lib/fileService";

interface FileData {
    filename: string;
    filepath: string;
}

export default function Home() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadFiles();
    }, []);

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
            await uploadFile(selectedFile);
            setSelectedFile(null);
            await loadFiles();
        } catch (err) {
            setError("Erreur lors de l'upload. Vérifiez votre connexion.");
        } finally {
            setLoading(false);
        }
    };

    const loadFiles = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await getFiles();
            setFiles(response.data);
        } catch (err) {
            setError("Impossible de charger les fichiers.");
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

            <ul className="mt-6 space-y-2">
                {files.map((file, index) => (
                    <li key={index}>
                        <a href={`http://localhost:3001${file.filepath}`} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                            {file.filename}
                        </a>
                    </li>
                ))}
            </ul>
        </main>
    );
}