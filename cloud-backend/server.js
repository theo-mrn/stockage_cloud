require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pool = require("./db");

const app = express();

// Configuration de Multer pour l'upload
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Middleware d'authentification
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Token manquant" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userResult = await pool.query("SELECT id, username, email FROM users WHERE id = $1", [decoded.id]);
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Utilisateur non trouvé" });
        }

        req.user = userResult.rows[0];
        next();
    } catch (err) {
        res.status(401).json({ error: "Token invalide" });
    }
};

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

// Routes d'authentification
app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Utilisateur non trouvé" });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ error: "Mot de passe incorrect" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/auth/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Cet email est déjà utilisé" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            "INSERT INTO users (username, email, password, createdat, updatedat) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, username, email",
            [username, email, hashedPassword]
        );

        const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({
            user: newUser.rows[0],
            token
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/auth/logout", (req, res) => {
    res.clearCookie("token").json({ message: "Déconnexion réussie" });
});

// Routes des fichiers
app.post("/files/upload", authMiddleware, upload.single("file"), async (req, res) => {
    try {
        const { filename } = req.file;
        const filepath = `/uploads/${filename}`;
        await pool.query("INSERT INTO files (user_id, filename, filepath) VALUES ($1, $2, $3)", 
            [req.user.id, filename, filepath]);

        res.json({ filename, filepath });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/files", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query("SELECT filename, filepath FROM files WHERE user_id = $1", [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(`📌 Route enregistrée: ${r.route.path}`);
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));


