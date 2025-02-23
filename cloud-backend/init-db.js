const pool = require("./db");

async function initializeDatabase() {
    try {
        // Création de la table users si elle n'existe pas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log("✅ Table 'users' initialisée avec succès");
        
        // Création de la table files si elle n'existe pas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS files (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                filename VARCHAR(255) NOT NULL,
                filepath VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                size VARCHAR(50),
                modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                favorite BOOLEAN DEFAULT false,
                color VARCHAR(50),
                parent_id INTEGER REFERENCES files(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log("✅ Table 'files' initialisée avec succès");
        
        console.log("✅ Base de données initialisée avec succès");
    } catch (err) {
        console.error("❌ Erreur lors de l'initialisation de la base de données:", err);
    } finally {
        // Fermer la connexion
        await pool.end();
    }
}

// Exécuter l'initialisation
initializeDatabase(); 