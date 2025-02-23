const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: "Non authentifié" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ error: "Utilisateur non trouvé" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Erreur d'authentification:", err);
        res.status(401).json({ error: "Token invalide" });
    }
};

module.exports = { authMiddleware };
