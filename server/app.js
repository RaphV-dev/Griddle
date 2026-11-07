require('dotenv').config();

const express = require('express'); 
const cors = require('cors'); 
const bodyParser = require('body-parser'); 
const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');

const app = express(); 
const PORT = process.env.PORT || 3000; 




// Middlewares 
app.use(cors()); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
//Auth
app.use('/api/auth', authRoutes)
//Game
app.use('/api/game',gameRoutes);


app.get('/api/health', (req, res) => { 
    res.json({ status: 'OK', message: 'API Griddle opérationnelle' }); 
}); 
app.listen(PORT, () => { 
    console.log(`Serveur Backend exécuté sur http://localhost:${PORT}`); 
});