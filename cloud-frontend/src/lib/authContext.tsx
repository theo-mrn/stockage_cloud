'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from './fileService';
import { useRouter, usePathname } from 'next/navigation';
import { AxiosError } from 'axios';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ['/login', '/register'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isInitialCheck, setIsInitialCheck] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuthentication = async () => {
            // Ne pas vérifier l'authentification sur les pages publiques
            if (PUBLIC_PATHS.includes(pathname)) {
                setIsLoading(false);
                return;
            }

            try {
                console.log("Vérification de l'authentification...");
                const response = await authService.checkAuth();
                console.log("Utilisateur authentifié:", response.data);
                setUser(response.data.user);
                setIsAuthenticated(true);
                setError(null);

                // Si on est sur login et qu'on est authentifié, rediriger vers files
                if (pathname === '/login') {
                    router.push('/files');
                }
            } catch (error) {
                if (error instanceof AxiosError) {
                    if (error.response?.status === 401) {
                        console.log("Non authentifié");
                        // Rediriger vers login seulement si on n'y est pas déjà
                        if (!PUBLIC_PATHS.includes(pathname)) {
                            router.push('/login');
                        }
                    } else {
                        console.error("Erreur serveur:", error.response?.data);
                        setError("Erreur de connexion au serveur");
                    }
                } else {
                    console.error("Erreur inattendue:", error);
                    setError("Erreur inattendue");
                }
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
                setIsInitialCheck(false);
            }
        };

        if (isInitialCheck || !PUBLIC_PATHS.includes(pathname)) {
            checkAuthentication();
        }
    }, [router, pathname, isInitialCheck]);

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);
            console.log("Tentative de login...");
            const response = await authService.login(email, password);
            console.log("Réponse du login:", response.data);
            setUser(response.data.user);
            setIsAuthenticated(true);
            router.push('/files');
        } catch (error) {
            console.error("Erreur de login:", error);
            setUser(null);
            setIsAuthenticated(false);
            if (error instanceof AxiosError) {
                setError(error.response?.data?.error || "Erreur de connexion");
            } else {
                setError("Une erreur inattendue est survenue");
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await authService.logout();
            setUser(null);
            setIsAuthenticated(false);
            router.push('/login');
        } catch (error) {
            console.error("Erreur de logout:", error);
            setError("Erreur lors de la déconnexion");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Afficher le spinner de chargement uniquement lors du chargement initial
    // et sur les pages protégées
    if (isLoading && isInitialCheck && !PUBLIC_PATHS.includes(pathname)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            user, 
            login, 
            logout, 
            isLoading,
            error 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 