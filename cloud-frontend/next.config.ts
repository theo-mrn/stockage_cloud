import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 🔥 Active la génération statique (Next.js 15)
  distDir: "out",   // 🔥 Définit le dossier de sortie pour le build
  trailingSlash: true, // ✅ Important pour éviter des erreurs de navigation
};

export default nextConfig;