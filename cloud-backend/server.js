require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

// Import des routes
const authRoutes = require("./routes/auth");
const filesRoutes = require("./routes/files");

app.use(cors({
    origin: ["https://sigrid.site", "http://localhost:3000"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Route racine
app.get("/", (req, res) => {
    res.json({ 
        message: "Bienvenue sur l'API du projet Cloud!",
        routes: {
            auth: {
                "POST /auth/login": "Connexion (email, password)",
                "POST /auth/register": "Inscription (username, email, password)",
                "POST /auth/logout": "Déconnexion"
            },
            files: {
                "POST /files/upload": "Upload un fichier (Authentification requise)",
                "GET /files": "Liste les fichiers de l'utilisateur (Authentification requise)"
            }
        }
    });
});

// Utilisation des routes
app.use("/auth", authRoutes);
app.use("/files", filesRoutes);

// Log des routes enregistrées
app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(`📌 Route enregistrée: ${r.route.path}`);
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));


