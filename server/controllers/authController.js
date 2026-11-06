const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req,res) =>{
    try{
        const {username,email,password} = req.body;

        if(!username || !email || !password){
            return res.status(400).json({message: 'Please fill up every fields.'});
        }

        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0){
            return res.status(409).json({message : 'Username or email already used'});
        }

        const saltRound = 10;
        const hashePassword = await bcrypt.hash(password, saltRound);

        const [result] = await db.query(
            'INSERT INTO users (username, email, password, role) VALUES ( ?, ?, ?, ?)',[username,email,hashePassword, 'player']
        );

        res.status.json({
            message : 'Account created succesfully',
            userId : result.insertId
        });
    } catch(error){
        console.error('Registering error : ', error);
        res.status(500).json({message: 'Registering error.'});
    }
};


exports.login = async (req,res) =>{
    try{
        const {email,password} = req.body;
        if (!email || !password){
            return res.status(400).json({message: 'Please fill up email and password'})
        }

        const [users] = await db.query('SELECT * FROM users WHERE email = ?',[email]);
        if(users.length === 0){
            return res.status(401).json({message: 'Incorrect credentials'})
        }

        const user = users;

        const token = jwt.sign(
            {id: user.id, username: user.username, role: user.role},
            process.env.JWT_SECRET || 'defaul_secret_key',
            {expiresIn: '24h'}
        );

        res.json({
            message: 'Connexion successfull',
            token,
            user:{
                id:user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                daily_streak: user.daily_streak
            }
        });
    }catch(error){
        console.error('Error while trying to connect : ', error);
        res.status(500).json({message: 'Server error while trying to connect.'});
    }
};

exports.getMe = async (req,res) =>{
    try {
        const [users] = await db.query(
            'SELECT id, username, email, role, daily_streak, last_played_date, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (user.length === 0){
            return res.status(404).json({message: 'User not found.'})
        }

        res.json(users);
    }catch(error){
        console.error('Profil error : ',error);
        res.status(500).json({message:'Server error.'})
    }
};