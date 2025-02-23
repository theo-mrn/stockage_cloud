const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route d'inscription
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Cet email est déjà utilisé" });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // Créer le token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Envoyer le token dans un cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 24 heures
        });

        res.json({
            message: "Inscription réussie",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Erreur lors de l'inscription:", err);
        res.status(500).json({ error: "Erreur lors de l'inscription" });
    }
});

// Route de connexion
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trouver l'utilisateur
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        // Créer le token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Envoyer le token dans un cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 24 heures
        });

        res.json({
            message: "Connexion réussie",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Erreur lors de la connexion:", err);
        res.status(500).json({ error: "Erreur lors de la connexion" });
    }
});

// Route de déconnexion
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Déconnexion réussie" });
});

// Route de vérification du token
router.get("/check", authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'email']
        });
        
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        res.json({
            authenticated: true,
            user
        });
    } catch (err) {
        console.error("Erreur lors de la vérification du token:", err);
        res.status(500).json({ error: "Erreur lors de la vérification du token" });
    }
});

module.exports = router;
