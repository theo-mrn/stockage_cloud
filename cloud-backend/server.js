require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors({
    origin: "http://localhost:3000", // 🔹 Autoriser le frontend Next.js
    credentials: true // 🔹 Autoriser l'envoi des cookies
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/files", require("./routes/files"));
app.use("/uploads", express.static("uploads"));

// Lancer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));