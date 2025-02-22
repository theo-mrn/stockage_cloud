const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

// Route de connexion sécurisée
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) return res.status(401).json({ error: "Utilisateur non trouvé" });

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) return res.status(401).json({ error: "Mot de passe incorrect" });

        // Générer le token JWT
        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Envoyer le token dans un cookie sécurisé
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        }).json({ user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route de déconnexion
router.post("/logout", (req, res) => {
    res.clearCookie("token").json({ message: "Déconnexion réussie" });
});

module.exports = router;