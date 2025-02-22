const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const token = req.cookies.token; // 🔹 Lire le token depuis le cookie

    if (!token) return res.status(403).json({ error: "Accès refusé, token manquant" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Ajouter l'ID utilisateur à req.user
        next();
    } catch (err) {
        res.status(403).json({ error: "Token invalide" });
    }
};