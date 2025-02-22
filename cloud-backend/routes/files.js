const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const uploadDir = path.join(__dirname, "../uploads");

// Vérifier si le dossier uploads existe
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurer Multer pour l'upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Route pour uploader un fichier (Protégée)
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
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

// Route pour lister les fichiers de l'utilisateur
router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query("SELECT filename, filepath FROM files WHERE user_id = $1", [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;