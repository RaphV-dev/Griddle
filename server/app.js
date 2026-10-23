const express = require('express'); 
const cors = require('cors'); 
const bodyParser = require('body-parser'); 
const mysql = require('mysql2'); 
require('dotenv').config(); const app = express(); 
const PORT = process.env.PORT || 3000; 
// Middlewares 
app.use(cors()); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
// Connexion Base de Données MySQL 
const db = mysql.createConnection({ 
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || '', 
    database: process.env.DB_NAME || 'Griddle'
}); 
db.connect((err) => { 
    if (err) { console.error('Erreur de connexion à la BDD MySQL :', err); } 
    else { console.log('Connecté à la base de données MySQL Griddle'); } 
}); 
// Route de test [28] 
app.get('/api/health', (req, res) => { 
    res.json({ status: 'OK', message: 'API Griddle opérationnelle' }); 
}); 
app.listen(PORT, () => { 
    console.log(`Serveur Backend exécuté sur http://localhost:${PORT}`); 
});