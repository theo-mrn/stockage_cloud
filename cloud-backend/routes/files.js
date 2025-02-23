const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../db");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Configuration de Multer
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    }
});

// Fonction pour déterminer le type de fichier
const getFileType = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const videoExts = ['.mp4', '.avi', '.mov', '.webm'];
    const audioExts = ['.mp3', '.wav', '.ogg'];
    const documentExts = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx'];

    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    if (audioExts.includes(ext)) return 'audio';
    if (documentExts.includes(ext)) return 'document';
    return 'file';
};

// Middleware pour gérer les erreurs de multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: "Le fichier est trop volumineux (max 5MB)" });
        }
        return res.status(400).json({ error: "Erreur lors de l'upload du fichier" });
    }
    next(err);
};

// Vérifier et créer la table files si nécessaire
const initializeFilesTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS files (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                filename VARCHAR(255) NOT NULL,
                filepath VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                size VARCHAR(50),
                modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                favorite BOOLEAN DEFAULT false,
                color VARCHAR(50),
                parent_id INTEGER REFERENCES files(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Table 'files' initialisée avec succès");
    } catch (err) {
        console.error("Erreur lors de l'initialisation de la table 'files':", err);
    }
};

// Initialiser la table au démarrage
initializeFilesTable();

// Route pour lister les fichiers
router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                id, filename, filepath, type, size,
                modified::text, favorite, color, parent_id as "parentId",
                user_id
            FROM files 
            WHERE user_id = $1 
            ORDER BY modified DESC`,
            [req.user.id]
        );

        console.log("Fichiers trouvés:", result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error("Erreur lors de la récupération des fichiers:", err);
        res.status(500).json({ error: "Erreur lors de la récupération des fichiers" });
    }
});

// Route pour uploader un fichier
router.post("/upload", authMiddleware, upload.single("file"), handleMulterError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Aucun fichier n'a été uploadé" });
        }

        const { filename, size: fileSize } = req.file;
        const filepath = `/uploads/${filename}`;
        const type = getFileType(filename);
        const size = `${(fileSize / 1024 / 1024).toFixed(2)} MB`;

        const result = await pool.query(
            `INSERT INTO files 
            (user_id, filename, filepath, type, size, modified, favorite, parent_id) 
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, false, $6) 
            RETURNING id, filename, filepath, type, size, modified::text, favorite, color, parent_id as "parentId", user_id`,
            [req.user.id, filename, filepath, type, size, req.body.parentId || null]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erreur lors de l'upload:", err);
        res.status(500).json({ error: "Erreur lors de l'enregistrement du fichier" });
    }
});

// Route pour mettre à jour un fichier
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { favorite, parentId } = req.body;

        const result = await pool.query(
            `UPDATE files 
            SET favorite = COALESCE($1, favorite),
                parent_id = COALESCE($2, parent_id),
                modified = CURRENT_TIMESTAMP
            WHERE id = $3 AND user_id = $4
            RETURNING id, filename, filepath, type, size, modified::text, favorite, color, parent_id as "parentId", user_id`,
            [favorite, parentId, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Fichier non trouvé" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erreur lors de la mise à jour du fichier:", err);
        res.status(500).json({ error: "Erreur lors de la mise à jour du fichier" });
    }
});

// Route pour supprimer un fichier
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Récupérer le fichier pour avoir le chemin du fichier
        const fileResult = await pool.query(
            "SELECT filepath FROM files WHERE id = $1 AND user_id = $2",
            [id, req.user.id]
        );

        if (fileResult.rows.length === 0) {
            return res.status(404).json({ error: "Fichier non trouvé" });
        }

        // Supprimer le fichier physique
        const filePath = path.join(__dirname, "..", fileResult.rows[0].filepath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Supprimer l'entrée de la base de données
        await pool.query(
            "DELETE FROM files WHERE id = $1 AND user_id = $2",
            [id, req.user.id]
        );

        res.json({ message: "Fichier supprimé avec succès" });
    } catch (err) {
        console.error("Erreur lors de la suppression du fichier:", err);
        res.status(500).json({ error: "Erreur lors de la suppression du fichier" });
    }
});

module.exports = router;
