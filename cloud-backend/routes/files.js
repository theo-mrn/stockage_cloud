const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { File, User } = require("../models");
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

// Route pour lister les fichiers
router.get("/", authMiddleware, async (req, res) => {
    try {
        const files = await File.findAll({
            where: { userId: req.user.id },
            order: [['createdat', 'DESC']]
        });
        res.json(files);
    } catch (err) {
        console.error("Erreur lors de la récupération des fichiers:", err);
        res.status(500).json({ error: "Erreur lors de la récupération des fichiers" });
    }
});

// Route pour uploader un fichier
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Aucun fichier n'a été uploadé" });
        }

        const { filename, size: fileSize } = req.file;
        const filepath = `/uploads/${filename}`;
        const type = getFileType(filename);
        const size = `${(fileSize / 1024 / 1024).toFixed(2)} MB`;

        const file = await File.create({
            userId: req.user.id,
            filename,
            filepath,
            type,
            size,
            parentId: req.body.parentId || null
        });

        res.json(file);
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

        const file = await File.findOne({
            where: { id, userId: req.user.id }
        });

        if (!file) {
            return res.status(404).json({ error: "Fichier non trouvé" });
        }

        await file.update({
            favorite: favorite !== undefined ? favorite : file.favorite,
            parentId: parentId !== undefined ? parentId : file.parentId
        });

        res.json(file);
    } catch (err) {
        console.error("Erreur lors de la mise à jour du fichier:", err);
        res.status(500).json({ error: "Erreur lors de la mise à jour du fichier" });
    }
});

// Route pour supprimer un fichier
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const file = await File.findOne({
            where: { id, userId: req.user.id }
        });

        if (!file) {
            return res.status(404).json({ error: "Fichier non trouvé" });
        }

        // Supprimer le fichier physique
        const filePath = path.join(__dirname, "..", file.filepath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await file.destroy();

        res.json({ message: "Fichier supprimé avec succès" });
    } catch (err) {
        console.error("Erreur lors de la suppression du fichier:", err);
        res.status(500).json({ error: "Erreur lors de la suppression du fichier" });
    }
});

module.exports = router;
