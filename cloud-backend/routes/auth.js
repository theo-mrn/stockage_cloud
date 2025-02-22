const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

// Route de connexion sécurisée
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Utilisateur non trouvé" });
        }

        const user = userResult.rows[0];

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Mot de passe incorrect" });
        }

        // Générer un token JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token // 🔥 On ajoute le token à la réponse
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe déjà
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Cet email est déjà utilisé" });
        }

        // Hacher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insérer l'utilisateur en base
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password, createdat, updatedat) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, username, email",
            [username, email, hashedPassword]
        );

        // Générer un token JWT
        const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({
            user: newUser.rows[0],
            token
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Route de déconnexion
router.post("/logout", (req, res) => {
    res.clearCookie("token").json({ message: "Déconnexion réussie" });
});

module.exports = router;
