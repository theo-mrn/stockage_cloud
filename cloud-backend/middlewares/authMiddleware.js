const jwt = require("jsonwebtoken");
const pool = require("../db");

const authMiddleware = async (req, res, next) => {
    try {
        // Vérifier si le token est présent dans les cookies
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ error: "Accès refusé, token manquant" });
        }

        try {
            // Vérifier et décoder le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Vérifier si l'utilisateur existe toujours en base
            const userResult = await pool.query(
                "SELECT id, username, email FROM users WHERE id = $1",
                [decoded.id]
            );

            if (userResult.rows.length === 0) {
                return res.status(401).json({ error: "Utilisateur non trouvé" });
            }

            // Ajouter les informations de l'utilisateur à la requête
            req.user = userResult.rows[0];
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: "Session expirée" });
            }
            return res.status(401).json({ error: "Token invalide" });
        }
    } catch (err) {
        console.error("Erreur d'authentification:", err);
        res.status(500).json({ error: "Erreur serveur lors de l'authentification" });
    }
};

module.exports = { authMiddleware }; 