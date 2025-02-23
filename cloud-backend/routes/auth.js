const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Configuration des cookies
const cookieConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
};

// ✅ Debugging log pour voir si le fichier est chargé
console.log("🛠️ auth.js chargé !");

// Route de connexion
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation des champs
        if (!email || !password) {
            return res.status(400).json({ error: "Email et mot de passe requis" });
        }

        // Vérifier l'utilisateur
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        const user = userResult.rows[0];

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        // Générer le token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Envoyer le cookie et la réponse
        res.cookie("token", token, cookieConfig)
           .json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
    } catch (err) {
        console.error("Erreur de connexion:", err);
        res.status(500).json({ error: "Erreur lors de la connexion" });
    }
});

// Route d'inscription
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation des champs
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Tous les champs sont requis" });
        }

        // Vérifier si l'email existe déjà
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Cet email est déjà utilisé" });
        }

        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Créer l'utilisateur
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password, createdat, updatedat) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, username, email",
            [username, email, hashedPassword]
        );

        // Générer le token
        const token = jwt.sign(
            { id: newUser.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Envoyer le cookie et la réponse
        res.cookie("token", token, cookieConfig)
           .json({
                user: newUser.rows[0]
            });
    } catch (err) {
        console.error("Erreur d'inscription:", err);
        res.status(500).json({ error: "Erreur lors de l'inscription" });
    }
});

// Route de déconnexion
router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        ...cookieConfig,
        maxAge: 0
    }).json({ message: "Déconnexion réussie" });
});

// Route de vérification d'authentification
router.get("/check", authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

// ✅ Debugging log pour voir si le fichier exporte bien le routeur
console.log("🛠️ auth.js exporte :", router);

module.exports = router;
