"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async () => {
        setError(null);
        try {
            // ✅ Envoyer la requête avec `withCredentials` pour gérer les cookies
            await axios.post("http://localhost:3001/auth/login", { email, password }, { withCredentials: true });

            // ✅ Plus besoin de stocker le token, le cookie est automatiquement géré
            router.push("/files"); // Rediriger vers la page des fichiers
        } catch (err) {
            setError("Email ou mot de passe incorrect");
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