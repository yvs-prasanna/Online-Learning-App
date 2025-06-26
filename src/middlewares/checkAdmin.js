const database = require('../config/database'); 
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

//Check Admin or not 
const isAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
        if(authHeader !== undefined){
            const jwtToken = authHeader.split(" ")[1];
            if(jwtToken === undefined || jwtToken === null){
                return res.status(401).json({ error: 'Unauthorized' });
            }
            else{
                jwt.verify(jwtToken, process.env.JWT_SECRET, (err, user) => {
                    if(err){
                        return res.status(401).json({ error: 'Invalid JWT Token' });
                    }
                    const email = user.email
                    if(email === process.env.ADMIN_EMAIL) {
                        next();
                    }
                    else{
                        return res.status(403).json({ error: 'Forbidden: Admin access required' });
                    }
                });
            }
        }
        else{
            return res.status(401).json({ error: 'Unauthorized' });
        }
}

module.exports = { isAdmin };