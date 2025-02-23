"use client";
import { useState, useEffect, useCallback } from "react";
import { AxiosError } from "axios";
import { fileService, FileInfo } from '@/lib/fileService';
import { useAuth } from '@/lib/authContext';

export default function FilesPage() {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, isLoading: authLoading, logout } = useAuth();

    const loadFiles = useCallback(async () => {
        if (!isAuthenticated) return;
        
        try {
            setIsLoading(true);
            setError(null);
            const response = await fileService.getFiles();
            setFiles(response.data);
        } catch (err) {
            console.error('Erreur lors du chargement des fichiers:', err);
            if (err instanceof AxiosError) {
                setError(err.response?.data?.error || "Erreur lors du chargement des fichiers");
            } else {
                setError("Une erreur inattendue est survenue");
            }
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            loadFiles();
        }
    }, [isAuthenticated, authLoading, loadFiles]);

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

        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("file", selectedFile);
            await fileService.uploadFile(formData);
            setSelectedFile(null);
            await loadFiles();
            setError(null);
        } catch (err) {
            console.error('Erreur lors de l\'upload:', err);
            if (err instanceof AxiosError) {
                setError(err.response?.data?.error || "Erreur lors de l'upload du fichier");
            } else {
                setError("Une erreur inattendue est survenue lors de l'upload");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Mes fichiers</h1>
                <button 
                    onClick={logout} 
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
                >
                    Déconnexion
                </button>
            </div>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="flex gap-4 mb-6">
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button 
                    onClick={handleUpload} 
                    className={`bg-blue-500 text-white px-4 py-2 rounded transition-colors
                        ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}`} 
                    disabled={isLoading || !selectedFile}
                >
                    {isLoading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Upload en cours...
                        </span>
                    ) : "Uploader"}
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : files.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    Aucun fichier trouvé
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.map((file, index) => (
                        <div key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-medium mb-2 truncate">{file.filename}</h3>
                            <a 
                                href={`${process.env.NEXT_PUBLIC_API_URL}${file.filepath}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600 inline-flex items-center"
                            >
                                <span>Télécharger</span>
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                </svg>
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
