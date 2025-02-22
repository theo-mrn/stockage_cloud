const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
        return res.status(401).json({ error: "Accès refusé, token manquant" });
    }

    // Extraire le token de "Bearer ..."
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Accès refusé, token invalide" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Stocker l'ID utilisateur dans req.user
        next();
    } catch (err) {
        return res.status(403).json({ error: "Token invalide" });
    }
};
