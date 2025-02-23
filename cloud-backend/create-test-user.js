const pool = require("./db");
const bcrypt = require("bcryptjs");

async function createTestUser() {
    try {
        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("test123", salt);

        // Vérifier si l'utilisateur existe déjà
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", ["test@test.com"]);
        
        if (userExists.rows.length > 0) {
            console.log("✅ L'utilisateur de test existe déjà");
            return;
        }

        // Créer l'utilisateur de test
        await pool.query(
            "INSERT INTO users (username, email, password, createdat, updatedat) VALUES ($1, $2, $3, NOW(), NOW())",
            ["Test User", "test@test.com", hashedPassword]
        );
        
        console.log("✅ Utilisateur de test créé avec succès");
        console.log("Email: test@test.com");
        console.log("Mot de passe: test123");
    } catch (err) {
        console.error("❌ Erreur lors de la création de l'utilisateur de test:", err);
    } finally {
        await pool.end();
    }
}

createTestUser(); 