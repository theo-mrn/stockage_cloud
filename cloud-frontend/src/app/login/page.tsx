"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useAuth } from "@/lib/authContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { login, isLoading, isAuthenticated } = useAuth();

    useEffect(() => {
        // Si l'utilisateur est déjà authentifié, rediriger vers /files
        if (isAuthenticated) {
            router.push('/files');
        }
    }, [isAuthenticated, router]);

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Veuillez remplir tous les champs");
            return;
        }

        setError(null);

        try {
            console.log("Tentative de connexion...");
            await login(email, password);
            // La redirection est maintenant gérée dans le login du contexte
        } catch (err: unknown) {
            console.error("Erreur lors de la connexion:", err);
            if (err instanceof AxiosError) {
                const errorMessage = err.response?.data?.error || 
                    (err.response?.status === 401 ? "Email ou mot de passe incorrect" : "Erreur serveur");
                setError(errorMessage);
            } else {
                setError("Une erreur est survenue lors de la connexion");
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !isLoading) {
            handleLogin();
        }
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-8">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                <div className="space-y-4">
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <input 
                        type="password" 
                        placeholder="Mot de passe" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleLogin} 
                        className={`w-full bg-blue-500 text-white py-2 px-4 rounded transition-colors
                            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Connexion en cours...
                            </span>
                        ) : "Se connecter"}
                    </button>
                </div>
            </div>
        </main>
    );
}
