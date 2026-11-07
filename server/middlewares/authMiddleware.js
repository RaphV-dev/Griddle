const jwt = require('jsonwebtoken');

const verifyToken =  (req,res,next) =>{
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({message:'Access denied Token missing or wrong.'})
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token,process.env.JWT_SECRET || 'defaul_secret_key');

        req.user = decoded;
        next();
    }catch (error){
        return res.status(403).json({message:'Token invalid or expired'});
    }
};

const optionalAuth = (req, res, next) =>{
    try{
        const authHeader = req.headers.authorizarion;
        if(authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaul_secret_key');
            req.user = decoded;
        }
    }catch(error){
    }
    next();
}

module.exports = {
    verifyToken,
    optionalAuth
}