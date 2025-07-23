const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
dotenv.config();

const authorizeUser = (req, res, next) => {
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
                req.userId = user.id;
                req.email = user.email;
                next();
            });
        }
    }
    else{
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

module.exports = {authorizeUser};