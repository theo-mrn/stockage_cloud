"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async () => {
        setError(null);
        try {
            await axios.post("https://sigrid.site/auth/login", 
                { email, password }, 
                { withCredentials: true }
            );
            router.push("/files");
        } catch (err: unknown) {
            const errorMessage = err instanceof AxiosError 
                ? err.response?.data?.message || "Email ou mot de passe incorrect"
                : "Une erreur est survenue lors de la connexion";
            setError(errorMessage);
        }
    };

    return (
        <main className="flex flex-col items-center justify-center p-8">
            <h2 className="text-2xl font-bold mb-4">Connexion</h2>
            {error && <p className="text-red-500">{error}</p>}
            
            <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="border p-2 mb-2 w-64"
            />
            <input 
                type="password" 
                placeholder="Mot de passe" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="border p-2 mb-2 w-64"
            />
            <button 
                onClick={handleLogin} 
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Se connecter
            </button>
        </main>
    );
}
