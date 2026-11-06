const mysql = require('mysql2'); 
require('dotenv').config();

const pool = mysql.createPool({ 
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME || 'Griddle', 
    waitForConnections: true, 
    connectionLimit: 10, 
    queueLimit: 0 
});

pool.getConnection((err,connection) =>{
    if(err){
        console.error('Error while connecting to the db : ', err.message);
    }else{
        console.log('Connected succesfully')
        connection.release();
    }
});

module.exports = pool.promise();